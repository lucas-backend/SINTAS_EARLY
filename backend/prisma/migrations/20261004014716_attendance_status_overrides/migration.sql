-- AlterTable
ALTER TABLE `attendance_records` MODIFY `status` ENUM('HADIR', 'TERLAMBAT', 'TIDAK_HADIR', 'IZIN', 'SAKIT', 'ALFA', 'DISPEN') NOT NULL;

-- CreateTable
CREATE TABLE `attendance_status_overrides` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `session_id` INTEGER NOT NULL,
    `student_id` INTEGER NOT NULL,
    `status` ENUM('HADIR', 'TERLAMBAT', 'TIDAK_HADIR', 'IZIN', 'SAKIT', 'ALFA', 'DISPEN') NOT NULL,
    `created_by` INTEGER NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL,

    INDEX `attendance_status_overrides_student_id_idx`(`student_id`),
    INDEX `attendance_status_overrides_session_id_status_idx`(`session_id`, `status`),
    UNIQUE INDEX `attendance_status_overrides_session_id_student_id_key`(`session_id`, `student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `attendance_status_overrides` ADD CONSTRAINT `attendance_status_overrides_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `attendance_sessions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_status_overrides` ADD CONSTRAINT `attendance_status_overrides_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_status_overrides` ADD CONSTRAINT `attendance_status_overrides_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
