// Label UI untuk status absensi dan window sesi. Sumber kebenaran tetap enum
// dari API; pemetaan ini hanya untuk tampilan (frontend/GUIDE.md section 6).
export const ATTENDANCE_STATUS_LABELS = Object.freeze({
  HADIR: 'Hadir',
  TERLAMBAT: 'Terlambat',
  TIDAK_HADIR: 'Tidak Hadir',
  IZIN: 'Izin',
  SAKIT: 'Sakit',
  ALFA: 'Alfa',
  DISPEN: 'Dispen',
})

export const WINDOW_STATUS_LABELS = Object.freeze({
  BELUM_DIBUKA: 'Belum dibuka',
  BISA_ABSEN: 'Bisa absen',
  SELESAI: 'Selesai',
})

export function attendanceStatusLabel(status) {
  return ATTENDANCE_STATUS_LABELS[status] ?? null
}

export function windowStatusLabel(status) {
  return WINDOW_STATUS_LABELS[status] ?? null
}

// Status manual yang boleh diisi guru (HADIR/TERLAMBAT dari scan,
// TIDAK_HADIR dihitung server) — docs/DECISIONS.md §24 R1/R3.
export const MANUAL_STATUS_OPTIONS = Object.freeze([
  { value: 'IZIN', label: 'Izin' },
  { value: 'SAKIT', label: 'Sakit' },
  { value: 'ALFA', label: 'Alfa' },
  { value: 'DISPEN', label: 'Dispen' },
])

// Peta status → huruf H.I.S.A.D. TERLAMBAT dihitung sebagai H, TIDAK_HADIR
// dan ALFA tampil sebagai A (docs/DECISIONS.md §24 R2).
export const ATTENDANCE_STATUS_LETTERS = Object.freeze({
  HADIR: 'H',
  TERLAMBAT: 'H',
  IZIN: 'I',
  SAKIT: 'S',
  ALFA: 'A',
  DISPEN: 'D',
  TIDAK_HADIR: 'A',
})

// Kartu ringkasan per sesi: HADIR menampung HADIR+TERLAMBAT, ALFA menampung
// ALFA+TIDAK_HADIR (computed).
export const ATTENDANCE_SUMMARY_CARDS = Object.freeze([
  { key: 'hadir', label: 'Hadir', tone: 'success', statuses: ['HADIR', 'TERLAMBAT'] },
  { key: 'izin', label: 'Izin', tone: 'warning', statuses: ['IZIN'] },
  { key: 'sakit', label: 'Sakit', tone: 'info', statuses: ['SAKIT'] },
  { key: 'alfa', label: 'Alfa', tone: 'danger', statuses: ['ALFA', 'TIDAK_HADIR'] },
  { key: 'dispen', label: 'Dispen', tone: 'neutral', statuses: ['DISPEN'] },
])

export function attendanceStatusLetter(status) {
  return ATTENDANCE_STATUS_LETTERS[status] ?? null
}

// Tone visual dipasangkan dengan teks; warna tidak pernah jadi satu-satunya
// pembawa makna (docs/DESIGN_BRIEF.md).
export const ATTENDANCE_STATUS_TONES = Object.freeze({
  HADIR: 'success',
  TERLAMBAT: 'warning',
  TIDAK_HADIR: 'danger',
  IZIN: 'warning',
  SAKIT: 'info',
  ALFA: 'danger',
  DISPEN: 'neutral',
})

// Tone mengikuti golden master JadwalCard: Bisa absen hijau, Belum dibuka
// oranye, Selesai slate (PLAN_MERGE_UI §3 invariant #6/#7). Hanya tampilan.
export const WINDOW_STATUS_TONES = Object.freeze({
  BELUM_DIBUKA: 'warning',
  BISA_ABSEN: 'success',
  SELESAI: 'neutral',
})

export function attendanceStatusTone(status) {
  return ATTENDANCE_STATUS_TONES[status] ?? 'neutral'
}

export function windowStatusTone(status) {
  return WINDOW_STATUS_TONES[status] ?? 'neutral'
}