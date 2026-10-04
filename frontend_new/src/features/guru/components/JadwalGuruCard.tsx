import { Link } from "react-router-dom";

import type { JadwalGuruItem } from "../../../data/guru/jadwalGuruData";

interface Props {
  item: JadwalGuruItem;
}

export default function JadwalGuruCard({ item }: Props) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-black/10 p-4">
      <div className="mr-4 flex min-w-0 flex-col">
        <span className="truncate text-xl font-semibold">{item.className}</span>
        <span className="truncate text-sm text-slate-700">{item.subject}</span>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <div className="flex flex-col items-end">
          <span className="font-semibold">
            {item.startTime}–{item.endTime}
          </span>
          <span className="text-sm text-slate-700">{item.duration} menit</span>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Link
            to="/guru/sesi/1"
            className="rounded-lg px-2 py-1 text-sm font-semibold text-blue-500"
          >
            Lihat QR
          </Link>
          <Link
            to="/guru/rekap"
            className="rounded-lg px-2 py-1 text-sm font-semibold text-blue-500"
          >
            Kehadiran
          </Link>
        </div>
      </div>
    </div>
  );
}