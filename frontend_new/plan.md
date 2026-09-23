## Plan: Kak Lia — Prototype Fokus Absen

Repositori ini kini adalah **golden master** desain visual aplikasi absensi Kak Lia (lihat `docs/PLAN_MERGE_UI.md`). Prototype hanya memuat alur absensi dengan mock data; bukan produk mandiri. `frontend/` (produksi) menirukan visualnya secara persis tanpa menyalin struktur file.

**Scope (setelah fase M1)**

1. Identitas: nama aplikasi "Kak Lia", `lang="id"`, judul halaman, font Plus Jakarta Sans (keputusan D4/D8).
2. Fitur absensi yang dipertahankan: login, beranda (status absen + grid fitur absen + banner sekolah + bottom nav), jadwal pelajaran sebagai konteks absen (status `Bisa absen`/`Belum dibuka`/`Selesai` + aksi `Absen sekarang`).
3. Layar referensi absen (sub-bab 5.3 PLAN): Scanner `/scan`, Hasil Scan `/scan/result` (preview Hadir/Terlambat/Sudah absen), Riwayat `/riwayat`, Profil `/profil`, dan minimal guru: `/guru/buat-absen`, `/guru/sesi/:id`, `/guru/rekap`.
4. Fitur yang dihapus: quiz, latihan-soal, ujian/tryout, `QuizItemCard`. Grid fitur hanya berisi item absensi; BottomNav diaktifkan ulang (Beranda/Absen/Riwayat/Profil per role).
5. Kontrak visual (PLAN bagian 3) dipegang: `bg-blue-500` + lembaran putih `rounded-t-[60px]`, XPadding, Header biru, pill search fungsional, status dot hijau/merah, grid 3 kolom ikon circle, tombol primary `bg-blue-500`, bottom nav pill.

**Struktur folders**

- `src/features/dashboard/` — beranda: header, search, status absen, FeatureGrid, BottomNav (folder per komponen + `data.ts`/`types.ts`/`utils.ts`).
- `src/features/jadwal/` — jadwal pelajaran konteks absen (sectionPelajaran).
- `src/features/scan/` — Scanner + Hasil Scan.
- `src/features/riwayat/`, `src/features/profil/`, `src/features/guru/` — layar referensi.
- `src/components/` — reusable global: Button, Header, XPadding, WhiteSheet, AdSlider.
- `src/data/`, `src/types/` — mock data dan tipe global.

**Verification**

1. `npm run lint` dan `npm run build` dijalankan dari `frontend_new/`.
2. Tidak ada route mati: setiap link FeatureGrid/BottomNav/aksi halaman menunjuk ke route di `src/App.tsx`.
3. Dashboard siswa hanya menampilkan menu absensi dan status absen.

**Decisions**

- Semua keputusan produk/visual dikunci di `docs/DECISIONS.md` §15 (D1–D8) dan §16 (M1-1..M1-6).
- Perubahan visual berikutnya dimulai dari proyek ini (golden master) sebelum dirontokkan ke `frontend/`.