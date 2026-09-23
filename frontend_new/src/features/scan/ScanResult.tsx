import { useState } from "react";
import { useNavigate } from "react-router-dom";

import type { SvgIconComponent } from "@mui/icons-material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import Button from "../../components/Button";
import Header from "../../components/Header";
import WhiteSheet from "../../components/WhiteSheet";
import XPadding from "../../components/XPadding";

type Variant = "hadir" | "terlambat" | "duplicate";

interface ResultSpec {
  icon: SvgIconComponent;
  iconClassName: string;
  heading: string;
  status: string;
  late?: string;
  note: string;
}

const mockResults: Record<Variant, ResultSpec> = {
  hadir: {
    icon: CheckCircleRoundedIcon,
    iconClassName: "text-green-600",
    heading: "Absensi tercatat",
    status: "Hadir",
    note: "Absen tercatat pada waktu scan Anda.",
  },
  terlambat: {
    icon: WarningAmberRoundedIcon,
    iconClassName: "text-orange-600",
    heading: "Absensi terlambat",
    status: "Terlambat",
    late: "Terlambat 12 menit",
    note: "Scan tetap tercatat dengan status Terlambat.",
  },
  duplicate: {
    icon: InfoRoundedIcon,
    iconClassName: "text-blue-500",
    heading: "Sudah absen",
    status: "Hadir",
    note: "Absensi untuk sesi ini sudah tercatat pada pukul 07:02 WIB.",
  },
};

const variants: { key: Variant; label: string }[] = [
  { key: "hadir", label: "Hadir" },
  { key: "terlambat", label: "Terlambat" },
  { key: "duplicate", label: "Sudah absen" },
];

const mockDetail = {
  mapel: "Matematika",
  kelas: "XII-A",
  tanggal: "Selasa, 30 September 2026",
  waktuScan: "07:02 WIB",
};

export default function ScanResult() {
  const navigate = useNavigate();
  const [variant, setVariant] = useState<Variant>("hadir");
  const spec = mockResults[variant];
  const Icon = spec.icon;

  return (
    <div className="min-h-dvh bg-blue-500 flex flex-col">
      <Header title="Hasil Scan" backLink="/scan" />

      <WhiteSheet>
        <XPadding className="flex flex-col gap-4">
          {/* Preview status (mock prototype) */}
          <div className="flex justify-center gap-2">
            {variants.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setVariant(item.key)}
                className={`rounded-full px-3 py-1 text-xs font-semibold border border-black/10 ${
                  variant === item.key ? "bg-blue-500 text-white" : "text-slate-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Panel hasil */}
          <div className="flex flex-col items-center gap-3 rounded-xl border border-black/10 p-6 text-center">
            <Icon className={`w-16! h-16! ${spec.iconClassName}`} />
            <h2 className="text-2xl font-bold">{spec.heading}</h2>
            <span className="rounded-full bg-green-500/10 px-4 py-1 text-sm font-semibold text-green-600">
              {spec.status}
            </span>
            <p className="text-sm text-slate-700">{spec.note}</p>
            {spec.late && (
              <p className="text-sm font-semibold text-orange-700">{spec.late}</p>
            )}
          </div>

          {/* Detail sesi */}
          <div className="flex flex-col gap-2 rounded-lg border border-black/10 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-700">Mata pelajaran</span>
              <span className="font-semibold">{mockDetail.mapel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700">Kelas</span>
              <span className="font-semibold">{mockDetail.kelas}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700">Tanggal</span>
              <span className="font-semibold">{mockDetail.tanggal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700">Waktu scan</span>
              <span className="font-semibold">{mockDetail.waktuScan}</span>
            </div>
          </div>

          <Button type="button" onClick={() => navigate("/riwayat")}>
            LIHAT RIWAYAT
          </Button>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="rounded-lg bg-blue-100 py-2 font-semibold text-blue-500 cursor-pointer"
          >
            Kembali ke beranda
          </button>
        </XPadding>
      </WhiteSheet>
    </div>
  );
}