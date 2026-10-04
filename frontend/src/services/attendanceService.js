import { apiClient } from '../lib/apiClient'

export const attendanceKeys = {
  today: ['attendance', 'today'],
  historyBase: ['attendance', 'history'],
  scan: ['attendance', 'scan'],
  teacherSessions: ['attendance', 'sessions'],
  adminSessions: ['attendance', 'sessions', 'all'],
  sessionQr: (id) => ['attendance', 'sessions', id, 'qr'],
  sessionRosterBase: ['attendance', 'roster'],
  sessionRoster: (id) => ['attendance', 'roster', id],
  classAttendanceBase: ['attendance', 'classes'],
  classAttendance: (classId, filters) => ['attendance', 'classes', classId, filters],
  manualOverride: ['attendance', 'status-overrides'],
  dailyRecapBase: ['reports', 'attendance', 'daily'],
  dailyRecap: (filters) => ['reports', 'attendance', 'daily', filters],
  recapSummaryBase: ['reports', 'attendance', 'summary'],
  recapSummary: (filters) => ['reports', 'attendance', 'summary', filters],
  adminReportBase: ['reports', 'attendance'],
  adminReport: (filters) => ['reports', 'attendance', filters],
}

export async function getTodaySchedule() {
  const payload = await apiClient.get('/attendance/today')
  return payload.data
}

// Satu mutation per scan (docs/PROMPT_GUIDE.md F3): payload QR hasil decode
// dikirim apa adanya; validitas waktu/status ditentukan server. Duplicate scan
// idempotent dikembalikan 200 dengan `duplicate: true`, bukan error.
export async function scanAttendance(qrPayload) {
  const payload = await apiClient.post('/attendance-scans', { qrPayload })
  return payload.data
}

// Sesi milik guru yang login (scope backend: assignment aktif miliknya).
export async function getTeacherSessions() {
  const payload = await apiClient.get('/attendance-sessions')
  return payload.data
}

// QR payload statis dan metadata sesi berasal dari backend; frontend tidak
// membuat atau menebak payload.
export async function getSessionQr(id) {
  const payload = await apiClient.get(`/attendance-sessions/${id}/qr`)
  return payload.data
}

// Daftar siswa satu sesi + status teresolusi (scan/manual/computed) untuk
// halaman kehadiran kelas per pertemuan.
export async function getSessionRoster(id) {
  const payload = await apiClient.get(`/attendance-sessions/${id}/roster`)
  return payload.data
}

// Status manual guru per (sesi, siswa). Server menolak HADIR/TERLAMBAT/
// TIDAK_HADIR; hanya IZIN/SAKIT/ALFA/DISPEN.
export async function setManualAttendanceStatus({ sessionId, studentId, status }) {
  const payload = await apiClient.post('/attendance-status-overrides', {
    sessionId,
    studentId,
    status,
  })
  return payload.data
}

// Hapus override manual sehingga status kembali ke hasil scan/computed.
export async function clearManualAttendanceStatus({ sessionId, studentId }) {
  const payload = await apiClient.delete(
    `/attendance-status-overrides/${sessionId}/${studentId}`,
  )
  return payload.data
}

export async function getDailyRecap({ date, classId } = {}) {
  const payload = await apiClient.get('/reports/attendance/daily', {
    params: { date, classId },
  })
  return payload.data
}

export async function getRecapSummary({ from, to, classId } = {}) {
  const payload = await apiClient.get('/reports/attendance/summary', {
    params: { from, to, classId },
  })
  return payload.data
}

export async function createAttendanceSession(data) {
  const payload = await apiClient.post('/attendance-sessions', data)
  return payload.data
}

// Sesi seluruh sekolah untuk admin (scope backend: ADMIN melihat semua).
export async function getAdminSessions() {
  const payload = await apiClient.get('/attendance-sessions')
  return payload.data
}

export async function updateAttendanceSession(id, data) {
  const payload = await apiClient.patch(`/attendance-sessions/${id}`, data)
  return payload.data
}

export async function deleteAttendanceSession(id) {
  const payload = await apiClient.delete(`/attendance-sessions/${id}`)
  return payload.data
}

export async function getClassAttendance(
  classId,
  { from, to, status, assignmentId, page = 1, limit = 20 } = {},
) {
  const payload = await apiClient.get(`/attendance/classes/${classId}`, {
    params: { from, to, status, assignmentId, page, limit },
  })
  return payload.data
}

// Export sebagai binary; nama file diambil dari Content-Disposition.
export function exportAttendanceReport(params) {
  return apiClient.get('/reports/attendance/export', {
    params,
    responseType: 'blob',
  })
}

// Laporan global admin; scope/filter ditentukan backend (allowlist query).
export async function getGlobalAttendanceReport({
  from,
  to,
  status,
  classId,
  page = 1,
  limit = 20,
} = {}) {
  const payload = await apiClient.get('/reports/attendance', {
    params: { from, to, status, classId, page, limit },
  })
  return payload.data
}