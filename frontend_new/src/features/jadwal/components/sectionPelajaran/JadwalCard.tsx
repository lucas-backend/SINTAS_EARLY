import { useNavigate } from "react-router-dom";

import type { JadwalItem } from "../../../../types/jadwal";

interface Props {
  item: JadwalItem;
}

const statusPill: Record<JadwalItem["status"], string> = {
  "Bisa absen": "bg-green-500/10 text-green-600",
  "Belum dibuka": "bg-orange-400/10 text-orange-700",
  Selesai: "bg-black/5 text-slate-700",
};

export default function JadwalCard({ item }: Props) {
  const Icon = item.icon;
  const navigate = useNavigate();
  const canScan = item.status === "Bisa absen";

  return (
    <div className="flex items-center justify-between rounded-lg border border-black/10 p-4">
      <div className="flex items-center">
        <div
          className={`${item.backgroundClassName} ${item.colorClassName} mr-4 flex h-12 w-12 items-center justify-center rounded-lg`}
        >
          <Icon />
        </div>

        <div className="mr-4 flex flex-col">
          <span className="text-xl font-semibold">{item.name}</span>
          <span>{item.subject}</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="flex flex-col items-end">
          <span className="font-semibold">{item.time}</span>
          <span>{item.duration}min</span>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusPill[item.status]}`}
        >
          {item.status}
        </span>

        {canScan && (
          <button
            type="button"
            onClick={() => navigate("/scan")}
            className="rounded-lg bg-blue-500 px-4 py-1.5 text-sm font-semibold text-white cursor-pointer"
          >
            Absen sekarang
          </button>
        )}
      </div>
    </div>
  );
}