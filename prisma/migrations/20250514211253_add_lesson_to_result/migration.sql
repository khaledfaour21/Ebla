-- AlterTable
ALTER TABLE `Result` ADD COLUMN `lessonId` INTEGER NULL,
    ADD COLUMN `note` VARCHAR(191) NULL,
    ADD COLUMN `term` ENUM('FIRST', 'SECOND') NULL,
    ADD COLUMN `type` ENUM('QUIZ1', 'QUIZ2', 'FINAL', 'ORAL', 'HOMEWORK') NULL;

-- AddForeignKey
ALTER TABLE `Result` ADD CONSTRAINT `Result_lessonId_fkey` FOREIGN KEY (`lessonId`) REFERENCES `Lesson`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `Announcement` RENAME INDEX `Announcement_classId_fkey` TO `Announcement_classId_idx`;

-- RenameIndex
ALTER TABLE `Assignment` RENAME INDEX `Assignment_lessonId_fkey` TO `Assignment_lessonId_idx`;

-- RenameIndex
ALTER TABLE `Attendance` RENAME INDEX `Attendance_lessonId_fkey` TO `Attendance_lessonId_idx`;

-- RenameIndex
ALTER TABLE `Attendance` RENAME INDEX `Attendance_studentId_fkey` TO `Attendance_studentId_idx`;

-- RenameIndex
ALTER TABLE `Class` RENAME INDEX `Class_gradeId_fkey` TO `Class_gradeId_idx`;

-- RenameIndex
ALTER TABLE `Class` RENAME INDEX `Class_supervisorId_fkey` TO `Class_supervisorId_idx`;

-- RenameIndex
ALTER TABLE `Event` RENAME INDEX `Event_classId_fkey` TO `Event_classId_idx`;

-- RenameIndex
ALTER TABLE `Exam` RENAME INDEX `Exam_lessonId_fkey` TO `Exam_lessonId_idx`;

-- RenameIndex
ALTER TABLE `Lesson` RENAME INDEX `Lesson_classId_fkey` TO `Lesson_classId_idx`;

-- RenameIndex
ALTER TABLE `Lesson` RENAME INDEX `Lesson_subjectId_fkey` TO `Lesson_subjectId_idx`;

-- RenameIndex
ALTER TABLE `Lesson` RENAME INDEX `Lesson_teacherId_fkey` TO `Lesson_teacherId_idx`;

-- RenameIndex
ALTER TABLE `Result` RENAME INDEX `Result_assignmentId_fkey` TO `Result_assignmentId_idx`;

-- RenameIndex
ALTER TABLE `Result` RENAME INDEX `Result_examId_fkey` TO `Result_examId_idx`;

-- RenameIndex
ALTER TABLE `Result` RENAME INDEX `Result_studentId_fkey` TO `Result_studentId_idx`;

-- RenameIndex
ALTER TABLE `Student` RENAME INDEX `Student_classId_fkey` TO `Student_classId_idx`;

-- RenameIndex
ALTER TABLE `Student` RENAME INDEX `Student_gradeId_fkey` TO `Student_gradeId_idx`;

-- RenameIndex
ALTER TABLE `Student` RENAME INDEX `Student_parentId_fkey` TO `Student_parentId_idx`;
