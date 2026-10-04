import type { JadwalGuruDate } from "../../../data/guru/jadwalGuruData";

interface Props {
  dates: readonly JadwalGuruDate[];
  selectedIso: string;
  itemsByDate: Record<string, readonly unknown[]>;
  onSelect: (iso: string) => void;
  onOpenPicker: () => void;
  onToday?: () => void;
  isToday?: boolean;
}

export default function JadwalGuruDateStrip({
  dates,
  selectedIso,
  itemsByDate,
  onSelect,
  onOpenPicker,
  onToday,
  isToday = false,
}: Props) {
  return (
    <div className="mt-4 flex flex-wrap items-end gap-2">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Pilih tanggal jadwal">
        {dates.map((item) => {
          const isSelected = item.iso === selectedIso;
          const hasSession = (itemsByDate[item.iso]?.length ?? 0) > 0;
          return (
            <button
              key={item.iso}
              type="button"
              onClick={() => onSelect(item.iso)}
              aria-pressed={isSelected}
              className={`flex min-w-14 flex-col items-center justify-center rounded-lg border border-black/20 py-2 ${
                isSelected ? "bg-blue-400 text-white" : "text-blue-400"
              }`}
            >
              <span>{item.day}</span>
              <span className="font-bold">{item.date}</span>
              <span
                aria-hidden="true"
                className={`mt-2 h-2 w-2 rounded-full ${
                  hasSession
                    ? isSelected
                      ? "bg-white"
                      : "bg-blue-400"
                    : "bg-transparent"
                }`}
              />
            </button>
          );
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
  );
}