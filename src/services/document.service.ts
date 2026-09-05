import prisma from '../prisma/prisma.service';
import { AppError } from '../middlewares/error.middleware';
import { saveLocalFile, deleteLocalFile } from '../utils/storage';
import { Visibility } from '@prisma/client';

export class DocumentService {
  static async getListDocuments() {
    const documents = await prisma.document.findMany({
      where: {
        visibility: Visibility.PUBLIC,
      },

      select: {
        id: true,
        title: true,
        thumbnail_url: true,
        page_count: true,

        category: {
          select: {
            name: true,
          },
        },

        owner: {
          select: {
            full_name: true,
          },
        },

        // saved_by: {
        //   where: {
        //     user_id: userId,
        //   },
        //   select: {
        //     id: true,
        //   },
        // },
      },
    });

    return documents.map((document) => ({
      id: document.id,
      title: document.title,
      thumbnail_url: document.thumbnail_url,
      page_count: document.page_count,

      category: document.category.name,
      owner: document.owner.full_name,

      // is_saved: document.saved_by.length > 0,
    }));
  }

  static async createDocument(
    userId: string,
    data: {
      title: string;
      description?: string;
      category_id: string;
      folder_id?: string | null;
      visibility: Visibility;
      file_type: string;
      file_size: number;
      page_count?: number | null;
    },
    documentFile: Express.Multer.File,
    thumbnailFile?: Express.Multer.File
  ) {
    // Save document file
    const storedDoc = await saveLocalFile(documentFile);

    let storedThumbUrl: string | null = null;

    // Save thumbnail if provided
    if (thumbnailFile) {
      const storedThumb = await saveLocalFile(thumbnailFile);
      storedThumbUrl = storedThumb.fileUrl;
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: {
        id: data.category_id,
      },
    });

    if (!category) {
      // Clean up uploaded files
      await deleteLocalFile(storedDoc.fileUrl);

      if (storedThumbUrl) {
        await deleteLocalFile(storedThumbUrl);
      }

      throw new AppError('Category not found', 400);
    }

    // Verify folder exists and belongs to current user
    if (data.folder_id) {
      const folder = await prisma.folder.findFirst({
        where: {
          id: data.folder_id,
          user_id: userId,
        },
      });

      if (!folder) {
        await deleteLocalFile(storedDoc.fileUrl);

        if (storedThumbUrl) {
          await deleteLocalFile(storedThumbUrl);
        }

        throw new AppError(
          'Folder not found or unauthorized',
          400
        );
      }
    }

    // Create document
    const document = await prisma.document.create({
      data: {
        owner_id: userId,
        category_id: data.category_id,
        title: data.title,
        description: data.description,
        file_url: storedDoc.fileUrl,
        thumbnail_url: storedThumbUrl,
        file_type: data.file_type,
        file_size: data.file_size,
        page_count: data.page_count ?? null,
        visibility: data.visibility,
      },
      include: {
        category: true,
      },
    });

    // N-N relationship:
    // Document <-> Folder through DocumentFolder
    if (data.folder_id) {
      await prisma.documentFolder.create({
        data: {
          document_id: document.id,
          folder_id: data.folder_id,
        },
      });
    }

    return document;
  }

  static async searchDocuments(
    userId: string,
    filters: {
      query?: string;
      category_id?: string;
      folder_id?: string;
      visibility?: Visibility;
      page?: number;
      limit?: number;
    }
  ) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      OR: [
        {
          visibility: Visibility.PUBLIC,
        },
        {
          owner_id: userId,
        },
      ],
    };

    // Search by title / description
    if (filters.query) {
      where.AND = where.AND || [];

      where.AND.push({
        OR: [
          {
            title: {
              contains: filters.query,
            },
          },
          {
            description: {
              contains: filters.query,
            },
          },
        ],
      });
    }

    // Filter by category
    if (filters.category_id) {
      where.category_id = filters.category_id;
    }

    // Filter by folder
    //
    // Document and Folder are N-N,
    // so we must go through DocumentFolder.
    if (filters.folder_id) {
      where.folder_links = {
        some: {
          folder_id: filters.folder_id,
          folder: {
            user_id: userId,
          },
        },
      };
    }

    // Filter by visibility
    if (filters.visibility) {
      if (filters.visibility === Visibility.PRIVATE) {
        // User can only see their own private documents
        where.visibility = Visibility.PRIVATE;
        where.owner_id = userId;
      } else {
        // PUBLIC documents
        where.visibility = Visibility.PUBLIC;
      }
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc',
        },
        include: {
          owner: {
            select: {
              id: true,
              full_name: true,
              avatar_url: true,
            },
          },
          category: true,
          folder_links: {
            include: {
              folder: true,
            },
          },
        },
      }),

      prisma.document.count({
        where,
      }),
    ]);

    return {
      documents,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async getDocumentById(
    userId: string,
    documentId: string
  ) {
    const document = await prisma.document.findUnique({
      where: {
        id: documentId,
      },

      include: {
        owner: {
          select: {
            id: true,
            full_name: true,
            avatar_url: true,
          },
        },

        category: true,

        // Get all folders containing this document
        folder_links: {
          include: {
            folder: true,
          },
        },
      },
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    // Private document can only be accessed by owner
    if (
      document.visibility === Visibility.PRIVATE &&
      document.owner_id !== userId
    ) {
      throw new AppError(
        'Access denied. Private document.',
        403
      );
    }

    return document;
  }

  static async updateDocument(
    userId: string,
    documentId: string,
    data: {
      title?: string;
      description?: string;
      category_id?: string;
      folder_id?: string | null;
      visibility?: Visibility;
    }
  ) {
    // Find document
    const document = await prisma.document.findUnique({
      where: {
        id: documentId,
      },
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    // Only document owner can update document
    if (document.owner_id !== userId) {
      throw new AppError(
        'Unauthorized to update this document',
        403
      );
    }

    // Verify category if updating
    if (data.category_id) {
      const category = await prisma.category.findUnique({
        where: {
          id: data.category_id,
        },
      });

      if (!category) {
        throw new AppError(
          'Category not found',
          400
        );
      }
    }

    // Verify folder if updating
    if (data.folder_id) {
      const folder = await prisma.folder.findFirst({
        where: {
          id: data.folder_id,
          user_id: userId,
        },
      });

      if (!folder) {
        throw new AppError(
          'Folder not found or unauthorized',
          400
        );
      }
    }

    // Update document information
    await prisma.document.update({
      where: {
        id: documentId,
      },
      data: {
        title: data.title,
        description: data.description,
        category_id: data.category_id,
        visibility: data.visibility,
      },
    });

    /*
     * Handle Folder relationship separately
     *
     * undefined:
     *   -> do nothing, keep current folders
     *
     * null:
     *   -> remove document from all folders
     *
     * folder_id:
     *   -> remove current folder links
     *   -> add document to the selected folder
     */
    if (data.folder_id !== undefined) {
      // Remove existing folder relationships
      await prisma.documentFolder.deleteMany({
        where: {
          document_id: documentId,
        },
      });

      // Add new folder relationship
      if (data.folder_id) {
        await prisma.documentFolder.create({
          data: {
            document_id: documentId,
            folder_id: data.folder_id,
          },
        });
      }
    }

    // Return updated document with current folders
    return prisma.document.findUnique({
      where: {
        id: documentId,
      },

      include: {
        category: true,

        folder_links: {
          include: {
            folder: true,
          },
        },
      },
    });
  }

  static async deleteDocument(
    userId: string,
    documentId: string
  ) {
    // Find document
    const document = await prisma.document.findUnique({
      where: {
        id: documentId,
      },
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    // Only owner can delete document
    if (document.owner_id !== userId) {
      throw new AppError(
        'Unauthorized to delete this document',
        403
      );
    }

    // Delete actual document file
    await deleteLocalFile(document.file_url);

    // Delete thumbnail if exists
    if (document.thumbnail_url) {
      await deleteLocalFile(document.thumbnail_url);
    }

    /*
     * DocumentFolder records will be automatically deleted
     * because DocumentFolder.document has onDelete: Cascade.
     */
    await prisma.document.delete({
      where: {
        id: documentId,
      },
    });

    return {
      success: true,
    };
  }
}