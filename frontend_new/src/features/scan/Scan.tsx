import { useState } from "react";
import { useNavigate } from "react-router-dom";

import QrCode2RoundedIcon from "@mui/icons-material/QrCode2Rounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import Button from "../../components/Button";
import Header from "../../components/Header";
import WhiteSheet from "../../components/WhiteSheet";
import XPadding from "../../components/XPadding";

const mockSession = {
  mapel: "Matematika",
  kelas: "XII-A",
  guru: "Bapak/Ibu Guru",
  window: "07:00 - 08:30",
  status: "Bisa absen",
};

export default function Scan() {
  const navigate = useNavigate();
  const [manualCode, setManualCode] = useState("");

  return (
    <div className="min-h-dvh bg-blue-500 flex flex-col">
      <Header title="Scan QR Absensi" backLink="/dashboard" />

      <WhiteSheet>
        <XPadding className="flex flex-col gap-4">
          {/* Konteks sesi */}
          <div className="flex flex-col gap-1 rounded-lg border border-black/10 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xl font-semibold">{mockSession.mapel}</span>
              <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-600">
                {mockSession.status}
              </span>
            </div>
            <span className="text-sm text-slate-700">
              Kelas {mockSession.kelas} · {mockSession.guru}
            </span>
            <span className="flex items-center gap-1 text-sm text-slate-700">
              <ScheduleRoundedIcon className="h-4! w-4!" />
              Window scan {mockSession.window}
            </span>
          </div>

          {/* Frame kamera */}
          <div
            role="status"
            aria-live="polite"
            className="flex aspect-square w-full flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-black/15 bg-black/5 p-6"
          >
            <div className="bg-white rounded-lg p-3">
              <QrCode2RoundedIcon className="w-32! h-32! text-slate-800" />
            </div>
            <p className="text-sm text-slate-700 text-center">
              Kamera siap — arahkan kamera ke QR Code yang ditampilkan guru.
            </p>
          </div>

          {/* Instruksi */}
          <p className="text-center text-sm text-slate-700">
            Scan hanya aktif dari 15 menit sebelum mulai sampai jam selesai.
          </p>

          <Button
            type="button"
            onClick={() => navigate("/scan/result")}
          >
            MULAI SCAN
          </Button>

          {/* Fallback manual */}
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-black/10" />
            <span className="text-xs text-slate-700">atau kode manual</span>
            <span className="h-px flex-1 bg-black/10" />
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(event) => setManualCode(event.target.value)}
              placeholder="Masukkan kode QR"
              className="flex-1 rounded-lg border border-black/10 bg-white px-4 py-2 text-black focus:outline-none"
            />
            <button
              type="button"
              onClick={() => navigate("/scan/result")}
              className="rounded-lg bg-blue-100 px-4 py-2 font-semibold text-blue-500 cursor-pointer"
            >
              KIRIM
            </button>
          </div>
        </XPadding>
      </WhiteSheet>
    </div>
  );
}