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