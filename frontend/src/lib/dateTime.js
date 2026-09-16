const SCHOOL_TIMEZONE =
  import.meta.env.VITE_SCHOOL_TIMEZONE ?? 'Asia/Jakarta'

function formatter(options) {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: SCHOOL_TIMEZONE,
    ...options,
  })
}

export function formatSchoolDate(value) {
  if (!value) return ''
  return formatter({ dateStyle: 'medium' }).format(new Date(value))
}

export function formatSchoolTime(value) {
  if (!value) return ''
  return formatter({ timeStyle: 'short' }).format(new Date(value))
}

export function formatSchoolDateTime(value) {
  if (!value) return ''
  return formatter({ dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  )
}

export function formatSchoolDateLong(value) {
  if (!value) return ''
  return formatter({
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

// Tanggal kalender sekolah (timezone sekolah) sebagai YYYY-MM-DD, bukan waktu
// lokal browser. Dipakai untuk default filter dan label tanggal display.
export function schoolDateString(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: SCHOOL_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))
}

export function todaySchoolDate() {
  return schoolDateString(new Date())
}

export function schoolDateOffset(days) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: SCHOOL_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]))
  const offsetDate = new Date(
    Date.UTC(Number(map.year), Number(map.month) - 1, Number(map.day) + days),
  )
  return schoolDateString(offsetDate)
}