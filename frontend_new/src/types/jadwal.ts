import type { SvgIconComponent } from "@mui/icons-material";

export type WindowStatus = "Bisa absen" | "Belum dibuka" | "Selesai";

export interface JadwalDate {
  day: string;
  date: number;
  isActive?: boolean;
}

export interface JadwalItem {
  icon: SvgIconComponent;
  name: string;
  subject: string;
  time: string;
  duration: number;
  status: WindowStatus;
  colorClassName: string;
  backgroundClassName: string;
}

export interface JadwalSection {
  title: string;
  items: readonly JadwalItem[];
}