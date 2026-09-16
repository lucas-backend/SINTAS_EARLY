import { CalendarCheck2, ListTodo } from 'lucide-react'

export function AttendanceSummary({ items }) {
  const total = items.length
  const scannedCount = items.filter((item) => item.scanned).length
  const remaining = total - scannedCount
  const hasOpenSession = items.some(
    (item) => item.windowStatus === 'BISA_ABSEN' && !item.scanned,
  )

  return (
    <section
      aria-label="Ringkasan absensi hari ini"
      className="rounded-radius-md border border-line-200 bg-surface-0 p-5 shadow-1"
    >
      <h2 className="text-heading-md font-bold text-ink-900">Absensi hari ini</h2>
      {total === 0 ? (
        <div className="mt-3 flex items-start gap-2">
          <CalendarCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-ink-500" aria-hidden="true" />
          <div>
            <p className="text-label-md text-ink-900">Belum ada sesi hari ini</p>
            <p className="mt-0.5 text-body-md text-ink-700">
              Jadwal akan muncul 15 menit sebelum jam mulai.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <p className="text-display-sm font-bold text-school-blue-900">
            {scannedCount} dari {total} sesi
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-body-md text-ink-700">
            <ListTodo className="h-4 w-4 shrink-0 text-ink-500" aria-hidden="true" />
            {remaining > 0
              ? `Belum mengikuti ${remaining} sesi hari ini.`
              : 'Semua absensi hari ini tercatat.'}
          </p>
          {hasOpenSession ? (
            <p className="mt-1 text-caption text-success-700">
              Ada sesi dengan status Bisa absen hari ini.
            </p>
          ) : null}
        </div>
      )}
    </section>
  )
}