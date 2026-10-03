-- AlterTable
ALTER TABLE `attendance_sessions` ADD COLUMN `deleted_at` TIMESTAMP(6) NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `deleted_at` TIMESTAMP(6) NULL;

-- CreateIndex
CREATE INDEX `attendance_sessions_deleted_at_idx` ON `attendance_sessions`(`deleted_at`);

-- CreateIndex
CREATE INDEX `users_deleted_at_idx` ON `users`(`deleted_at`);
