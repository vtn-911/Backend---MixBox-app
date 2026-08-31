import fs from 'fs';
import path from 'path';
import { env } from '../config/env';

// Ensure upload directory exists
const uploadDir = path.resolve(env.UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export interface StoredFile {
  fileUrl: string;
  fileName: string;
}

/**
 * Saves a file to local storage and returns its relative path/URL representation.
 * Can be swapped with S3 / Cloud storage implementation later.
 */
export async function saveLocalFile(file: Express.Multer.File): Promise<StoredFile> {
  // Returns a relative URL path that Express can serve statically
  // e.g. /uploads/162837482-document.pdf
  const fileUrl = `/uploads/${file.filename}`;
  return {
    fileUrl,
    fileName: file.filename,
  };
}

/**
 * Deletes a file from local storage.
 * Can be swapped with S3 / Cloud storage implementation later.
 */
export async function deleteLocalFile(fileUrl: string): Promise<void> {
  try {
    if (!fileUrl.startsWith('/uploads/')) return;
    const fileName = fileUrl.replace('/uploads/', '');
    const filePath = path.join(uploadDir, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error(`Failed to delete file ${fileUrl}:`, error);
  }
}
