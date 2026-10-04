import { z } from 'zod'
import { SCHOOL_TIMEZONE, schoolDateTimeIso } from '../lib/dateTime'

// Validasi form awal saja; backend tetap memvalidasi assignment, timezone,
// rentang waktu, dan duplikasi (frontend/GUIDE.md section 2).
export const sessionFormSchema = z
  .object({
    classId: z.string().min(1, 'Pilih kelas.'),
    subjectId: z.string().min(1, 'Pilih mata pelajaran.'),
    teacherId: z.string().min(1, 'Pilih guru.'),
    sessionDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Gunakan format tanggal YYYY-MM-DD.'),
    start: z.string().regex(/^\d{2}:\d{2}$/, 'Jam mulai wajib diisi.'),
    end: z.string().regex(/^\d{2}:\d{2}$/, 'Jam selesai wajib diisi.'),
  })
  .refine((value) => value.end > value.start, {
    path: ['end'],
    message: 'Waktu selesai harus setelah waktu mulai.',
  })

// Payload mengikuti kontrak POST /attendance-sessions: kelas + mata pelajaran +
// guru dipilih admin, penugasan di-resolve server dalam satu transaksi.
export function toSessionPayload(values) {
  return {
    classId: Number(values.classId),
    subjectId: Number(values.subjectId),
    teacherId: Number(values.teacherId),
    sessionDate: values.sessionDate,
    startAt: schoolDateTimeIso(values.sessionDate, values.start),
    endAt: schoolDateTimeIso(values.sessionDate, values.end),
    timezone: SCHOOL_TIMEZONE,
  }
}
