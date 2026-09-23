import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import ListAltRoundedIcon from "@mui/icons-material/ListAltRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import QrCodeScannerRoundedIcon from "@mui/icons-material/QrCodeScannerRounded";

import type { menuType } from "./types";

// Data
export const siswaMenus: menuType[] = [
  { name: "Beranda", link: "/dashboard", icon: HomeOutlinedIcon },
  { name: "Absen", link: "/scan", icon: QrCodeScannerRoundedIcon },
  { name: "Riwayat", link: "/riwayat", icon: HistoryRoundedIcon },
  { name: "Profil", link: "/profil", icon: PersonOutlineRoundedIcon },
];

export const guruMenus: menuType[] = [
  { name: "Beranda", link: "/dashboard", icon: HomeOutlinedIcon },
  { name: "Buat Absen", link: "/guru/buat-absen", icon: QrCodeScannerRoundedIcon },
  { name: "Rekap", link: "/guru/rekap", icon: ListAltRoundedIcon },
  { name: "Profil", link: "/profil", icon: PersonOutlineRoundedIcon },
];

export const adminMenus: menuType[] = [
  { name: "Beranda", link: "/dashboard", icon: HomeOutlinedIcon },
  { name: "Profil", link: "/profil", icon: PersonOutlineRoundedIcon },
];