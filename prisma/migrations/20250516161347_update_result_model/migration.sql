/*
  Warnings:

  - You are about to drop the column `score` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Result` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Result` DROP COLUMN `score`,
    DROP COLUMN `type`,
    ADD COLUMN `final` VARCHAR(191) NULL,
    ADD COLUMN `homework` VARCHAR(191) NULL,
    ADD COLUMN `oral` VARCHAR(191) NULL,
    ADD COLUMN `quiz1` VARCHAR(191) NULL,
    ADD COLUMN `quiz2` VARCHAR(191) NULL,
    ADD COLUMN `total` VARCHAR(191) NULL;

-- RenameIndex
ALTER TABLE `Result` RENAME INDEX `Result_lessonId_fkey` TO `Result_lessonId_idx`;
