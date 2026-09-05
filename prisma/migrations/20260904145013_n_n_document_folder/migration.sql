/*
  Warnings:

  - You are about to drop the column `folder_id` on the `document` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `document` DROP FOREIGN KEY `Document_folder_id_fkey`;

-- DropIndex
DROP INDEX `Document_folder_id_fkey` ON `document`;

-- AlterTable
ALTER TABLE `document` DROP COLUMN `folder_id`;

-- CreateTable
CREATE TABLE `DocumentFolder` (
    `id` VARCHAR(191) NOT NULL,
    `document_id` VARCHAR(191) NOT NULL,
    `folder_id` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `DocumentFolder_document_id_folder_id_key`(`document_id`, `folder_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DocumentFolder` ADD CONSTRAINT `DocumentFolder_document_id_fkey` FOREIGN KEY (`document_id`) REFERENCES `Document`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DocumentFolder` ADD CONSTRAINT `DocumentFolder_folder_id_fkey` FOREIGN KEY (`folder_id`) REFERENCES `Folder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
