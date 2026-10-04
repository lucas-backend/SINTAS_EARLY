import { formatSchoolDateLong, schoolDateString, todaySchoolDate } from './dateTime'

// Helper murni untuk jadwal guru per tanggal (PLAN_JADWAL_GURU, G2/G3).
// Semua tanggal adalah tanggal kalender sekolah (YYYY-MM-DD), bukan jam lokal
// browser. Tidak menambah dependency date-fns.

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function isoToUtcDate(iso) {
  return new Date(`${iso}T00:00:00Z`)
}

export function addDaysToIso(iso, days) {
  if (!ISO_DATE.test(iso ?? '')) return ''
  const date = isoToUtcDate(iso)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

// Indeks hari dengan Senin = 0 ... Minggu = 6.
function mondayIndex(iso) {
  const day = isoToUtcDate(iso).getUTCDay()
  return (day + 6) % 7
}

function weekdayLabel(iso) {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'UTC',
    weekday: 'short',
  }).format(isoToUtcDate(iso))
}

export function dayNumber(iso) {
  return Number(iso.slice(8, 10))
}

// Lima tanggal Senin–Jumat dari minggu yang memuat tanggal terpilih.
// Akhir pekan tidak ditampilkan pada strip jadwal.
export function buildWeekStrip(selectedIso, todayIso = todaySchoolDate()) {
  const monday = addDaysToIso(selectedIso, -mondayIndex(selectedIso))
  return Array.from({ length: 5 }, (_, index) => {
    const iso = addDaysToIso(monday, index)
    return {
      iso,
      dayLabel: weekdayLabel(iso),
      dayNumber: dayNumber(iso),
      isSelected: iso === selectedIso,
      isToday: iso === todayIso,
    }
  })
}

// Mengelompokkan sesi guru per tanggal kalender sekolah.
export function groupSessionsBySchoolDate(sessions = []) {
  const groups = new Map()
  sessions.forEach((session) => {
    const iso = schoolDateString(session.sessionDate)
    if (!iso) return
    const list = groups.get(iso) ?? []
    list.push(session)
    groups.set(iso, list)
  })
  return groups
}

// Label header daftar: "Hari ini", "Besok", atau tanggal lengkap.
export function scheduleDateLabel(iso, todayIso = todaySchoolDate()) {
  if (!iso) return ''
  if (iso === todayIso) return 'Hari ini'
  if (iso === addDaysToIso(todayIso, 1)) return 'Besok'
  return formatSchoolDateLong(new Date(`${iso}T12:00:00Z`))
}