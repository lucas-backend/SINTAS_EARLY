import { useState } from "react";

import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import Button from "../../components/Button";
import Header from "../../components/Header";
import WhiteSheet from "../../components/WhiteSheet";
import XPadding from "../../components/XPadding";

type Status = "Hadir" | "Terlambat" | "Tidak Hadir";

interface KehadiranItem {
  id: number;
  nama: string;
  nim: string;
  status: Status;
  late?: number;
}

const mockKehadiran: KehadiranItem[] = [
  { id: 1, nama: "I Made Dipa Rama Artike", nim: "12345678", status: "Hadir" },
  { id: 2, nama: "Ni Putu Ayu Pratiwi", nim: "12345679", status: "Hadir" },
  { id: 3, nama: "Komang Agus Wirawan", nim: "12345680", status: "Terlambat", late: 12 },
  { id: 4, nama: "Gede Darma Putra", nim: "12345681", status: "Tidak Hadir" },
  { id: 5, nama: "Ayu Gita Maharani", nim: "12345682", status: "Hadir" },
];

const statusBadge: Record<Status, string> = {
  Hadir: "bg-green-500/10 text-green-600",
  Terlambat: "bg-orange-400/10 text-orange-700",
  "Tidak Hadir": "bg-red-500/10 text-red-500",
};

const summary: { label: Status; count: number }[] = [
  { label: "Hadir", count: 27 },
  { label: "Terlambat", count: 4 },
  { label: "Tidak Hadir", count: 2 },
];

export default function RekapKelas() {
  const [downloaded, setDownloaded] = useState(false);

  function handleExport() {
    setDownloaded(true);
  }

  return (
    <div className="min-h-dvh bg-blue-500 flex flex-col">
      <Header title="Rekap Kelas" backLink="/dashboard" />

      <WhiteSheet>
        <XPadding className="flex flex-col gap-4">
          {/* Konteks */}
          <div className="flex flex-col gap-1">
            <p className="text-xl font-bold">Matematika — XII-A</p>
            <p className="text-sm text-slate-700">
              Selasa, 30 September 2026 · 07:00 - 08:30
            </p>
          </div>

          {/* Ringkasan */}
          <div className="grid grid-cols-3 gap-2">
            {summary.map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-1 rounded-lg border border-black/10 p-3"
              >
                <span className="text-xl font-bold">{item.count}</span>
                <span
                  className={`rounded-full px-3 py-0.5 text-xs font-semibold ${statusBadge[item.label]}`}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* Export */}
          <Button
            type="button"
            onClick={handleExport}
            disabled={downloaded}
          >
            EKSPOR XLSX
          </Button>

          {downloaded && (
            <p className="flex items-center gap-1 text-sm font-semibold text-green-600">
              <DownloadRoundedIcon className="h-4! w-4!" />
              laporan-kehadiran-20260929-20260929.xlsx (mock)
            </p>
          )}

          {/* Tabel kehadiran */}
          <div className="overflow-x-auto rounded-lg border border-black/10">
            <table className="w-full min-w-80 text-sm">
              <caption className="sr-only">
                Daftar kehadiran Matematika XII-A
              </caption>
              <thead>
                <tr className="border-b border-black/10 text-left text-slate-700">
                  <th scope="col" className="p-3 font-semibold">
                    Nama
                  </th>
                  <th scope="col" className="p-3 font-semibold">
                    NIM
                  </th>
                  <th scope="col" className="p-3 font-semibold">
                    Status
                  </th>
                  <th scope="col" className="p-3 font-semibold">
                    Terlambat
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockKehadiran.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-black/5 last:border-b-0"
                  >
                    <td className="p-3 font-medium">{item.nama}</td>
                    <td className="p-3 text-slate-700">{item.nim}</td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-3 py-0.5 text-xs font-semibold ${statusBadge[item.status]}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700">
                      {item.late ? `${item.late} menit` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </XPadding>
      </WhiteSheet>
    </div>
  );
}