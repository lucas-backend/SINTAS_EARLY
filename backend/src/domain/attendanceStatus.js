import { z } from "zod";

const SCAN_WINDOW_MINUTES = 15;
const MINUTE_IN_MS = 60 * 1000;

export const AttendanceStatus = Object.freeze({
  HADIR: "HADIR",
  TERLAMBAT: "TERLAMBAT",
  TIDAK_HADIR: "TIDAK_HADIR",
});

export const attendanceSessionSchema = z
  .object({
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
  })
  .superRefine(({ startAt, endAt }, context) => {
    if (endAt <= startAt) {
      context.addIssue({
        code: "custom",
        path: ["endAt"],
        message: "endAt harus setelah startAt.",
      });
    }
  });

export function validateAttendanceSession(session) {
  return attendanceSessionSchema.parse(session);
}

export function classifyAttendanceScan({ startAt, endAt, scanAt }) {
  const session = validateAttendanceSession({ startAt, endAt });
  const scannedAt = z.coerce.date().parse(scanAt);
  const windowStart = new Date(
    session.startAt.getTime() - SCAN_WINDOW_MINUTES * MINUTE_IN_MS,
  );
  const presentUntil = new Date(
    session.startAt.getTime() + SCAN_WINDOW_MINUTES * MINUTE_IN_MS,
  );

  if (scannedAt < windowStart || scannedAt > session.endAt) {
    throw new RangeError("Waktu scan berada di luar jendela absensi.");
  }

  if (scannedAt <= presentUntil) {
    return { status: AttendanceStatus.HADIR, lateMinutes: 0 };
  }

  return {
    status: AttendanceStatus.TERLAMBAT,
    lateMinutes: Math.floor(
      (scannedAt.getTime() - session.startAt.getTime()) / MINUTE_IN_MS,
    ),
  };
}
