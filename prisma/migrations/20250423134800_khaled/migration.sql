/*
  Warnings:

  - The values [Monday,Tuesday,Wednesday,Thursday,Friday] on the enum `Lesson_day` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `createdAT` on the `Parent` table. All the data in the column will be lost.
  - You are about to drop the column `createdAT` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `createdAT` on the `Teacher` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Lesson` MODIFY `day` ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY') NOT NULL;

-- AlterTable
ALTER TABLE `Parent` DROP COLUMN `createdAT`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `Student` DROP COLUMN `createdAT`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `Teacher` DROP COLUMN `createdAT`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
