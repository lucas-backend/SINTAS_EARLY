import { buildWeekStrip } from '../../lib/scheduleDates'
import { formatSchoolDateLong } from '../../lib/dateTime'

// Strip tanggal jadwal guru (PLAN_JADWAL_GURU G3): 7 tombol Senin–Minggu dari
// minggu yang memuat tanggal terpilih. Tiap tanggal dapat diklik; titik
// menandakan tanggal tersebut memiliki sesi.
export function ScheduleDateStrip({
  selectedDate,
  sessionsByDate,
  onSelect,
  onOpenPicker,
  onToday,
  isToday = false,
}) {
  const strip = buildWeekStrip(selectedDate)

  return (
    <div className="mt-4 flex flex-wrap items-end gap-2">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Pilih tanggal jadwal">
        {strip.map((item) => {
          const hasSession = (sessionsByDate.get(item.iso)?.length ?? 0) > 0
          return (
            <button
              key={item.iso}
              type="button"
              onClick={() => onSelect(item.iso)}
              aria-pressed={item.isSelected}
              aria-label={formatSchoolDateLong(new Date(`${item.iso}T12:00:00Z`))}
              className={`flex min-w-14 flex-col items-center justify-center rounded-lg border border-black/20 py-2 ${
                item.isSelected ? 'bg-blue-400 text-white' : 'text-blue-400'
              }`}
            >
              <span>{item.dayLabel}</span>
              <span className="font-bold">{item.dayNumber}</span>
              <span
                aria-hidden="true"
                className={`mt-2 h-2 w-2 rounded-full ${
                  hasSession
                    ? item.isSelected
                      ? 'bg-white'
                      : 'bg-blue-400'
                    : 'bg-transparent'
                }`}
              />
            </button>
          )
        })}
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-3">
        {!isToday && onToday ? (
          <button
            type="button"
            onClick={onToday}
            className="text-sm font-semibold text-blue-500"
          >
            Hari ini
          </button>
        ) : null}

        <button
          type="button"
          onClick={onOpenPicker}
          className="text-sm font-semibold text-blue-500"
        >
          Lebih lengkap
        </button>
      </div>
    </div>
  )
}