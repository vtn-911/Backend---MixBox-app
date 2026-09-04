-- CreateTable
CREATE TABLE `DocumentPage` (
    `id` VARCHAR(191) NOT NULL,
    `document_id` VARCHAR(191) NOT NULL,
    `page_number` INTEGER NOT NULL,
    `image_url` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `DocumentPage_document_id_page_number_key`(`document_id`, `page_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DocumentPage` ADD CONSTRAINT `DocumentPage_document_id_fkey` FOREIGN KEY (`document_id`) REFERENCES `Document`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
