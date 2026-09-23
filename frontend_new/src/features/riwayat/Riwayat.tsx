import { useState } from "react";

import Header from "../../components/Header";
import WhiteSheet from "../../components/WhiteSheet";
import XPadding from "../../components/XPadding";

type Status = "Hadir" | "Terlambat" | "Tidak Hadir";

interface RiwayatItem {
  id: number;
  date: string;
  time: string;
  mapel: string;
  kelas: string;
  status: Status;
  late?: number;
}

const mockRiwayat: RiwayatItem[] = [
  {
    id: 1,
    date: "Selasa, 29 September 2026",
    time: "07:00",
    mapel: "Matematika",
    kelas: "XII-A",
    status: "Hadir",
  },
  {
    id: 2,
    date: "Senin, 28 September 2026",
    time: "09:00",
    mapel: "Bahasa Inggris",
    kelas: "XII-A",
    status: "Terlambat",
    late: 12,
  },
  {
    id: 3,
    date: "Jumat, 25 September 2026",
    time: "11:00",
    mapel: "Biologi",
    kelas: "XII-A",
    status: "Tidak Hadir",
  },
];

const statusFilters: ("Semua" | Status)[] = [
  "Semua",
  "Hadir",
  "Terlambat",
  "Tidak Hadir",
];

const statusBadge: Record<Status, string> = {
  Hadir: "bg-green-500/10 text-green-600",
  Terlambat: "bg-orange-400/10 text-orange-700",
  "Tidak Hadir": "bg-red-500/10 text-red-500",
};

export default function Riwayat() {
  const [filter, setFilter] = useState<"Semua" | Status>("Semua");

  const items =
    filter === "Semua"
      ? mockRiwayat
      : mockRiwayat.filter((item) => item.status === filter);

  return (
    <div className="min-h-dvh bg-blue-500 flex flex-col">
      <Header title="Riwayat Absen" backLink="/dashboard" />

      <WhiteSheet>
        <XPadding className="flex flex-col gap-4">
          {/* Filter status */}
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-full border border-black/10 px-4 py-1.5 text-xs font-semibold cursor-pointer ${
                  filter === item
                    ? "bg-blue-500 text-white"
                    : "text-slate-700"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <p className="text-sm text-slate-700">
            Menampilkan {items.length} sesi
          </p>

          {/* Daftar riwayat */}
          {items.length > 0 ? (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-black/10 p-4"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">{item.date}</span>
                    <span className="text-sm text-slate-700">
                      {item.time} · {item.mapel} · {item.kelas}
                    </span>
                    {item.late && (
                      <span className="text-sm font-semibold text-orange-700">
                        Terlambat {item.late} menit
                      </span>
                    )}
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge[item.status]}`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-black/10 p-6 text-center text-sm text-slate-700">
              Belum ada riwayat pada periode ini.
            </p>
          )}
        </XPadding>
      </WhiteSheet>
    </div>
  );
}