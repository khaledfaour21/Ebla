-- DropForeignKey
ALTER TABLE `Student` DROP FOREIGN KEY `Student_classId_fkey`;

-- AlterTable
ALTER TABLE `Student` MODIFY `classId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_classId_fkey` FOREIGN KEY (`classId`) REFERENCES `Class`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
