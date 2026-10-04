import { describe, expect, it } from 'vitest'
import {
  addDaysToIso,
  buildWeekStrip,
  dayNumber,
  groupSessionsBySchoolDate,
  scheduleDateLabel,
} from './scheduleDates'

describe('addDaysToIso', () => {
  it('menambah dan mengurangi hari melintasi batas bulan', () => {
    expect(addDaysToIso('2026-09-30', 1)).toBe('2026-10-01')
    expect(addDaysToIso('2026-10-01', -1)).toBe('2026-09-30')
  })

  it('mengembalikan string kosong untuk input tidak valid', () => {
    expect(addDaysToIso('', 1)).toBe('')
    expect(addDaysToIso('30-09-2026', 1)).toBe('')
  })
})

describe('buildWeekStrip', () => {
  const today = '2026-09-30'
  const strip = buildWeekStrip(today, today)

  it('mengembalikan 5 tanggal Senin–Jumat', () => {
    expect(strip).toHaveLength(5)
    const first = new Date(`${strip[0].iso}T00:00:00Z`).getUTCDay()
    const last = new Date(`${strip[4].iso}T00:00:00Z`).getUTCDay()
    expect(first).toBe(1)
    expect(last).toBe(5)
  })

  it('menandai tanggal terpilih dan hari ini', () => {
    const selected = strip.filter((item) => item.isSelected)
    const todayItems = strip.filter((item) => item.isToday)
    expect(selected).toHaveLength(1)
    expect(selected[0].iso).toBe(today)
    expect(todayItems).toHaveLength(1)
    expect(todayItems[0].iso).toBe(today)
  })

  it('memuat tanggal terpilih meski bukan hari ini', () => {
    const other = buildWeekStrip('2026-10-05', today)
    expect(other.some((item) => item.isSelected && item.iso === '2026-10-05')).toBe(true)
  })
})

describe('dayNumber', () => {
  it('mengambil nomor tanggal', () => {
    expect(dayNumber('2026-09-01')).toBe(1)
    expect(dayNumber('2026-09-30')).toBe(30)
  })
})

describe('groupSessionsBySchoolDate', () => {
  it('mengelompokkan sesi per tanggal kalender sekolah', () => {
    const groups = groupSessionsBySchoolDate([
      { id: 1, sessionDate: '2026-09-30T00:00:00.000Z' },
      { id: 2, sessionDate: '2026-10-01T00:00:00.000Z' },
      { id: 3, sessionDate: '2026-09-30T00:00:00.000Z' },
    ])
    expect(groups.size).toBe(2)
    expect(groups.get('2026-09-30')).toHaveLength(2)
    expect(groups.get('2026-10-01')).toHaveLength(1)
  })

  it('mengembalikan map kosong tanpa sesi', () => {
    expect(groupSessionsBySchoolDate().size).toBe(0)
  })
})

describe('scheduleDateLabel', () => {
  const today = '2026-09-30'

  it('memberi label Hari ini dan Besok', () => {
    expect(scheduleDateLabel(today, today)).toBe('Hari ini')
    expect(scheduleDateLabel('2026-10-01', today)).toBe('Besok')
  })

  it('memberi tanggal lengkap untuk hari lain', () => {
    const label = scheduleDateLabel('2026-10-05', today)
    expect(label).not.toBe('Hari ini')
    expect(label).not.toBe('Besok')
    expect(label.length).toBeGreaterThan(0)
  })
})