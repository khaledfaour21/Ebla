-- DropForeignKey
ALTER TABLE `Class` DROP FOREIGN KEY `Class_supervisorId_fkey`;

-- DropIndex
DROP INDEX `Class_supervisorId_fkey` ON `Class`;

-- AlterTable
ALTER TABLE `Class` MODIFY `supervisorId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Class` ADD CONSTRAINT `Class_supervisorId_fkey` FOREIGN KEY (`supervisorId`) REFERENCES `Teacher`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
