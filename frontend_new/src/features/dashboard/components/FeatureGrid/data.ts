import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import QrCode2RoundedIcon from "@mui/icons-material/QrCode2Rounded";
import QrCodeScannerRoundedIcon from "@mui/icons-material/QrCodeScannerRounded";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import ListAltRoundedIcon from "@mui/icons-material/ListAltRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";

import type { featureType } from "./types";

// Data
export const siswaFeatures: featureType[] = [
  {
    name: "Absen",
    link: "/scan",
    icon: QrCodeScannerRoundedIcon,
  },
  {
    name: "Jadwal",
    link: "/jadwal",
    icon: CalendarMonthRoundedIcon,
  },
  {
    name: "Riwayat",
    link: "/riwayat",
    icon: HistoryRoundedIcon,
  },
  {
    name: "Profil",
    link: "/profil",
    icon: PersonOutlineRoundedIcon,
  },
];

export const guruFeatures: featureType[] = [
  {
    name: "Buat Absen",
    link: "/guru/buat-absen",
    icon: AddCircleRoundedIcon,
  },
  {
    name: "Sesi",
    link: "/guru/sesi/1",
    icon: QrCode2RoundedIcon,
  },
  {
    name: "Rekap",
    link: "/guru/rekap",
    icon: ListAltRoundedIcon,
  },
];

export const adminFeatures: featureType[] = [];