# Dokumentasi FrontEnd SINTAS

## Pengembangan Struktur Folder

Referensi: https://www.robinwieruch.de/react-folder-structure/

Dalam pembuatan aplikasi ini, terapkan prinsip Evolusi Komponen secara bertahap melalui 3 tahapan pola berikut:

1.  Single React File (Satu File Utama)
2.  Multiple React File (Pemecahan File)
3.  From Files to Folder (Pengelompokan ke Folder)

- Tahap 1: Mulai dari Satu File (Single React File)
  Setiap kali membuat komponen fitur baru, selalu awali dengan membuat satu file tunggal di dalam folder fitur terkait. Tulis semua kode sub-komponen lokal di dalam file tersebut.
- Tahap 2: Pecah Komponen (Multiple React File)
  Jika ukuran file utama mulai membengkak dan kodenya terlalu kompleks, potong dan pisahkan sub-komponen tersebut menjadi file-file kecil yang mandiri agar lebih mudah dibaca dan dikelola (maintain).
- Tahap 3: Kelompokkan ke Folder (From Files to Folder)
  Ketika jumlah file pendukungnya sudah terlalu banyak, atau jika komponen tersebut membutuhkan file tambahan (seperti file tipe data, utilitas khusus, atau data statis), satukan seluruh file terkait ke dalam sebuah folder khusus.

Contohnya pada fitur Dashboard:

- Fase 1 (Satu File): Awalnya, kita buat semua kode dashboard di dalam satu file bernama Dashboard.tsx.
- Fase 2 (Pecah File): Ketika kodenya mulai panjang, kita pecah komponen besar tersebut menjadi file-file kecil yang terpisah (misalnya: DashboardHeader.tsx, SearchBar.tsx, BottomNav.tsx).
- Fase 3 (Masuk Folder): Jika file pendukungnya makin banyak dan butuh file tambahan (seperti file types.ts atau utils.ts), kita satukan mereka ke dalam folder khusus (contohnya folder BottomNav/ dan FeatureGrid/ yang ada di sidebar).

---

### Penjelasan Folder

| Folder      | Keterangan                                                                                                 |
| ----------- | ---------------------------------------------------------------------------------------------------------- |
| features/   | Menyimpan komponen berdasarkan fitur spesifik. Komponen di sini tidak reusable antarfitur.                 |
| components/ | Menyimpan komponen UI global yang dapat digunakan kembali (reusable components, misal: Button, Input).     |
| hooks/      | Menyimpan Custom Hooks global yang digunakan oleh lebih dari satu fitur (misal: useAuth, useClickOutside). |
| utils/      | Menyimpan fungsi pembantu (utility) global yang bersifat umum (misal: format tanggal, enkripsi data).      |
| context/    | Menyimpan React Context untuk manajemen state global aplikasi (misal: tema, sesi pengguna).                |
| types/      | Menyimpan definisi interface atau tipe TypeScript global yang digunakan di banyak tempat.                  |
| assets/     | Menyimpan aset statis aplikasi seperti gambar, logo, font, dan ikon.                                       |

---

### Struktur Internal di Dalam Folder Fitur/Komponen

Jika sebuah file komponen sudah dipecah menggunakan pola From Files to Folder (seperti folder BottomNav atau FeatureGrid pada sidebar), gunakan standarisasi file internal berikut:

| Nama File          | Keterangan                                                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| index.ts           | Sebagai Public API (Barrel File). Hanya mengekspor komponen utama agar jalur import dari luar lebih pendek dan bersih. |
| [NamaKomponen].tsx | File utama yang berisi implementasi logika dan JSX dari komponen tersebut.                                             |
| types.ts           | Menyimpan tipe data TypeScript yang hanya digunakan secara lokal di dalam folder tersebut.                             |
| utils.ts           | Menyimpan fungsi pembantu khusus yang hanya dipakai oleh komponen di dalam folder tersebut.                            |
| data.ts            | Menyimpan data statis, konfigurasi lokal, atau mock data yang dibutuhkan komponen terkait.                             |
