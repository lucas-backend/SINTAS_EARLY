import { z } from 'zod'

const SCAN_WINDOW_MINUTES = 15
const MINUTE_IN_MS = 60 * 1000

export const AttendanceStatus = Object.freeze({
  HADIR: 'HADIR',
  TERLAMBAT: 'TERLAMBAT',
  TIDAK_HADIR: 'TIDAK_HADIR',
  IZIN: 'IZIN',
  SAKIT: 'SAKIT',
  ALFA: 'ALFA',
  DISPEN: 'DISPEN',
})

// Status yang hanya dapat diisi manual oleh guru (R1: HADIR/TERLAMBAT dari
// scan, TIDAK_HADIR computed on read).
export const MANUAL_ATTENDANCE_STATUSES = Object.freeze([
  AttendanceStatus.IZIN,
  AttendanceStatus.SAKIT,
  AttendanceStatus.ALFA,
  AttendanceStatus.DISPEN,
])

// Status yang dianggap "masuk" (R2: kolom H = HADIR + TERLAMBAT).
export const PRESENT_STATUSES = Object.freeze([
  AttendanceStatus.HADIR,
  AttendanceStatus.TERLAMBAT,
])

export function isManualAttendanceStatus(status) {
  return MANUAL_ATTENDANCE_STATUSES.includes(status)
}

export function isPresentStatus(status) {
  return PRESENT_STATUSES.includes(status)
}

// Prioritas: hasil scan guru menang atas override manual — begitu siswa scan,
// statusnya pasti "masuk" (HADIR/TERLAMBAT) walau guru sebelumnya mengisi
// IZIN/SAKIT/ALFA/DISPEN. Tanpa scan, override manual dipakai; sesi yang sudah
// berakhir tanpa record/override dihitung TIDAK_HADIR; sebelum sesi berakhir
// tanpa keduanya = null.
export function resolveAttendanceStatus({ record = null, override = null, sessionEnded = false }) {
  if (record?.status) return record.status
  if (override?.status) return override.status
  return sessionEnded ? AttendanceStatus.TIDAK_HADIR : null
}

export function attendanceSource({ record = null, override = null, status = null }) {
  if (record?.status) return 'SCAN'
  if (override?.status) return 'OVERRIDE'
  return status === AttendanceStatus.TIDAK_HADIR ? 'COMPUTED' : 'NONE'
}


export const ScheduleWindowStatus = Object.freeze({
  BELUM_DIBUKA: 'BELUM_DIBUKA',
  BISA_ABSEN: 'BISA_ABSEN',
  SELESAI: 'SELESAI',
})

export const attendanceSessionSchema = z.object({
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
}).superRefine(({ startAt, endAt }, context) => {
  if (endAt <= startAt) {
    context.addIssue({
      code: 'custom',
      path: ['endAt'],
      message: 'endAt harus setelah startAt.',
    })
  }
})

export function validateAttendanceSession(session) {
  return attendanceSessionSchema.parse(session)
}

export function classifyAttendanceScan({ startAt, endAt, scanAt }) {
  const session = validateAttendanceSession({ startAt, endAt })
  const scannedAt = z.coerce.date().parse(scanAt)
  const windowStart = new Date(session.startAt.getTime() - SCAN_WINDOW_MINUTES * MINUTE_IN_MS)
  const presentUntil = new Date(session.startAt.getTime() + SCAN_WINDOW_MINUTES * MINUTE_IN_MS)

  if (scannedAt < windowStart || scannedAt > session.endAt) {
    throw new RangeError('Waktu scan berada di luar jendela absensi.')
  }

  if (scannedAt <= presentUntil) {
    return { status: AttendanceStatus.HADIR, lateMinutes: 0 }
  }

  return {
    status: AttendanceStatus.TERLAMBAT,
    lateMinutes: Math.floor((scannedAt.getTime() - session.startAt.getTime()) / MINUTE_IN_MS),
  }
}

export function classifyScheduleItem({ startAt, endAt, now, record = null }) {
  const session = validateAttendanceSession({ startAt, endAt })
  const timestamp = z.coerce.date().parse(now)
  const windowStart = new Date(session.startAt.getTime() - SCAN_WINDOW_MINUTES * MINUTE_IN_MS)

  let windowStatus
  if (timestamp < windowStart) windowStatus = ScheduleWindowStatus.BELUM_DIBUKA
  else if (timestamp <= session.endAt) windowStatus = ScheduleWindowStatus.BISA_ABSEN
  else windowStatus = ScheduleWindowStatus.SELESAI

  const recordStatus = record?.status ?? null
  const attendanceStatus = recordStatus ?? (timestamp > session.endAt ? AttendanceStatus.TIDAK_HADIR : null)

  return {
    windowStatus,
    attendanceStatus,
    scanned: Boolean(record),
  }
}