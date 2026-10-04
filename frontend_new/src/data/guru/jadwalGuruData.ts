// Mock data referensi jadwal guru per tanggal (PLAN_JADWAL_GURU fase J1).
// Tanggal memakai kalender sekolah; tiap tanggal dapat dipilih di date strip.

export interface JadwalGuruDate {
  iso: string;
  day: string;
  date: number;
}

export interface JadwalGuruItem {
  id: number;
  className: string;
  subject: string;
  startTime: string;
  endTime: string;
  duration: number;
}

export const jadwalGuruDates: readonly JadwalGuruDate[] = [
  { iso: "2026-09-28", day: "Sen", date: 28 },
  { iso: "2026-09-29", day: "Sel", date: 29 },
  { iso: "2026-09-30", day: "Rab", date: 30 },
  { iso: "2026-10-01", day: "Kam", date: 1 },
  { iso: "2026-10-02", day: "Jum", date: 2 },
];

export const jadwalGuruItemsByDate: Record<string, readonly JadwalGuruItem[]> = {
  "2026-09-30": [
    {
      id: 1,
      className: "12 IPA 1",
      subject: "Bab 3 - Turunan & Integral",
      startTime: "07:00",
      endTime: "08:30",
      duration: 90,
    },
    {
      id: 2,
      className: "12 IPA 2",
      subject: "Bab 3 - Turunan & Integral",
      startTime: "08:30",
      endTime: "10:00",
      duration: 90,
    },
    {
      id: 3,
      className: "12 IPA 3",
      subject: "Bab 3 - Turunan & Integral",
      startTime: "10:30",
      endTime: "12:00",
      duration: 90,
    },
  ],
  "2026-10-01": [
    {
      id: 4,
      className: "12 IPA 4",
      subject: "Bab 4 - Limit Fungsi",
      startTime: "08:30",
      endTime: "10:00",
      duration: 90,
    },
    {
      id: 5,
      className: "12 IPA 5",
      subject: "Bab 4 - Limit Fungsi",
      startTime: "10:30",
      endTime: "12:00",
      duration: 90,
    },
  ],
};

export const jadwalGuruDefaultDate = "2026-09-30";