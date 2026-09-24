export interface IAd {
  id: number;
  title: string;
  name: string;
  link?: string;
  imageLink: string;
}

export const ads: IAd[] = [
  {
    id: 1,
    title: "Open House & Expo SINTAS",
    name: "Kegiatan Sekolah",
    imageLink: "/banner-kegiatan.svg",
  },
  {
    id: 2,
    title: "Pendaftaran Ekstrakurikuler",
    name: "Pengumuman",
    imageLink: "/banner-pengumuman.svg",
  },
];