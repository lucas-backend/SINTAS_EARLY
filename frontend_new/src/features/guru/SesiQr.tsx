import { useNavigate, useParams } from "react-router-dom";

import QrCode2RoundedIcon from "@mui/icons-material/QrCode2Rounded";
import Button from "../../components/Button";
import Header from "../../components/Header";
import WhiteSheet from "../../components/WhiteSheet";
import XPadding from "../../components/XPadding";

const mockSesi = {
  mapel: "Matematika",
  kelas: "XII-A",
  guru: "Guru Pengampu",
  tanggal: "Selasa, 30 September 2026",
  window: "06:45 - 08:30",
};

export default function SesiQr() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-dvh bg-blue-500 flex flex-col">
      <Header title="QR Sesi" backLink="/guru/buat-absen" />

      <WhiteSheet>
        <XPadding className="flex flex-col gap-4">
          {/* QR */}
          <div className="flex flex-col items-center gap-3 rounded-xl border border-black/10 p-6">
            <div className="bg-white rounded-lg p-4 border border-black/10">
              <QrCode2RoundedIcon className="w-48! h-48! text-slate-800" />
            </div>
            <p className="text-center text-sm text-slate-700">
              Sesi #{id} — QR ini statis dan tidak berubah selama sesi aktif.
            </p>
          </div>

          {/* Metadata sesi */}
          <div className="flex flex-col gap-2 rounded-lg border border-black/10 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-700">Mata pelajaran</span>
              <span className="font-semibold">{mockSesi.mapel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700">Kelas</span>
              <span className="font-semibold">{mockSesi.kelas}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700">Guru</span>
              <span className="font-semibold">{mockSesi.guru}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700">Tanggal</span>
              <span className="font-semibold">{mockSesi.tanggal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700">Window scan</span>
              <span className="font-semibold">{mockSesi.window}</span>
            </div>
          </div>

          <Button type="button" onClick={() => navigate("/guru/rekap")}>
            LIHAT REKAP KELAS
          </Button>
        </XPadding>
      </WhiteSheet>
    </div>
  );
}