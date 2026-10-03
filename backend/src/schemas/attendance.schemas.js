import { z } from 'zod'

const id = z.coerce.number().int().positive()
const isoDateTime = z.string().datetime({ offset: true })

export const attendanceSessionSchema = z.object({
  assignmentId: id,
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Gunakan format tanggal YYYY-MM-DD.'),
  startAt: isoDateTime,
  endAt: isoDateTime,
  timezone: z.string().trim().min(1).max(100),
}).strict()

export const attendanceScanSchema = z.object({
  qrPayload: z.string().trim().min(1).max(255),
}).strict()

export const attendanceSessionPatchSchema = z.object({
  assignmentId: id.optional(),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Gunakan format tanggal YYYY-MM-DD.').optional(),
  startAt: isoDateTime.optional(),
  endAt: isoDateTime.optional(),
  timezone: z.string().trim().min(1).max(100).optional(),
}).strict().superRefine((value, context) => {
  const scheduleFields = ['sessionDate', 'startAt', 'endAt', 'timezone'].filter((field) => value[field] !== undefined)
  if (scheduleFields.length > 0 && scheduleFields.length < 4) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Sertakan sessionDate, startAt, endAt, dan timezone sekaligus.' })
  }
  if (value.assignmentId === undefined && scheduleFields.length === 0) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Tidak ada perubahan yang dikirim.' })
  }
})

export const attendanceReportQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  status: z.enum(['HADIR', 'TERLAMBAT', 'TIDAK_HADIR']).optional(),
  classId: id.optional(),
  assignmentId: id.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['sessionDate', 'scannedAt', 'status']).default('sessionDate'),
  order: z.enum(['asc', 'desc']).default('desc'),
}).strict().superRefine((value, context) => {
  if (value.from && value.to && value.from > value.to) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['to'], message: 'Tanggal akhir harus setelah tanggal mulai.' })
  }
})