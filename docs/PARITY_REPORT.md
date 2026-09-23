# Laporan Parity Visual — `frontend/` vs Golden Master `frontend_new/`

Fase M5 `docs/PLAN_MERGE_UI.md` bagian 10. Keputusan terkunci: `docs/DECISIONS.md` §20.

## Metode

- Kedua dev server dijalankan: golden master `frontend_new/` (port 5174, mock data, tanpa auth) dan produksi `frontend/` (port 5173, HTTPS + proxy `/api` ke backend dev port 3000).
- Screenshot diambil dengan Chrome headless via CDP pada viewport **320 / 390 / 768 / 1440 px** (tinggi 900). Layar produksi diambil setelah login memakai cookie sesi dari backend dev (user seed `student.demo`, `teacher.demo`, `admin.demo`); CSRF di-mint otomatis oleh GET.
- Diff piksel (System.Drawing) dihitung sebagai indikator awal; karena konten produksi dinamis dan beberapa layar memang didefer (M5-4), penilaian akhir per layar memakai perbandingan **struktural** kontrak visual PLAN bagian 3: warna, radius, spacing, typography, bentuk ikon, posisi blok.
- Artefak screenshot: `%LOCALAPPDATA%\Temp\opencode\parity\new*` (golden master) dan `...\prod*` (produksi). Tidak dikomit (bukan bagian source).

## Ringkasan per layar

| Layar | Golden master | Produksi | Status | Catatan divergensi |
| --- | --- | --- | --- | --- |
| Login | `/login` | `/login` | **Parity tinggi** | Warna `blue-500`, ikon `MenuBookRounded`, judul `text-6xl`, lembar/CTA `orange-400` `MASUK` identik. Produksi menambah link `Lupa password?` (PRD) → menggeser vertikal (diff piksel ≠ 0). Placeholder kini `Username` di keduanya (M5-3). |
| 404 | `*` | `*` | **Parity tinggi** | Biru penuh + teks putih + `404` sama; keduanya kini punya aksi `Kembali ke beranda` (M5-3/M3-3). Copy `Page Not Found` vs `Halaman tidak ditemukan` (produksi, i18n). |
| Beranda siswa | `/dashboard` | `/app/student` | **Parity bahasa visual; struktur didefer** | Token/ikon/radius/pill sama. Header: golden `Hi, Welcome!` + avatar; produksi `AppShell` (bar `Kak La` + lembar putih + bottom nav) + heading `Halo, {nama}` (M3-4). Produksi menambah ringkasan absensi, jadwal, akses cepat. |
| Jadwal | `/jadwal` | `/app/student/schedule` | **Parity bahasa visual; struktur didefer** | Date strip + kartu `rounded-lg border-black/10` + pill status + CTA `Absen sekarang` sama. Produksi di dalam AppShell + tabel/`sm:` dan pengelompokan `Bisa absen/Belum dibuka/Selesai`. |
| Scan | `/scan` | `/app/student/scan` | **Parity bahasa visual; struktur didefer** | Ikon QR, frame, tombol primary biru, fallback manual sama. Golden punya header biru mandiri; produksi di dalam AppShell dengan alur precheck/permission/scanning/result (fungsi bisnis). |
| Hasil scan | `/scan/result` | (state `/app/student/scan`) | **Parity bahasa visual** | Panel status ikon besar + badge + baris detail + tombol solid biru. Golden menampilkan variasi mock; produksi menampilkan status server (termasuk duplicate). |
| Riwayat | `/riwayat` | `/app/student/history` | **Parity tinggi (mobile)** | Baris `tanggal \| mapel/kelas \| status` sama; produksi menambah filter, pagination, dan tabel desktop (kemampuan produksi, M3-7). |
| Profil | `/profil` | `/app/student/profile` (+ guru/admin) | **Parity tinggi** | Avatar bulat `bg-blue-100` + ikon, identitas read-only, kartu form. Produksi memakai `dt/dd` + RHF/zod. |
| Guru — Buat Absen | `/guru/buat-absen` | `/app/teacher/sessions/new` | **Parity bahasa visual; tanpa referensi penuh** | Gaya form/card/label meniru golden; golden memakai mock. Sidebar desktop (D7) tidak ada referensi. |
| Guru — QR sesi | `/guru/sesi/:id` | `/app/teacher/sessions/:id/qr` | **Parity bahasa visual** | Kartu `rounded-xl border-black/10` + baris metadata sama; produksi merender QR nyata (`QRCodeSVG`), golden placeholder ikon (M4-5). |
| Guru — Rekap | `/guru/rekap` | `/app/teacher/classes/:id/attendance` | **Parity bahasa visual; tabel** | Tabel semantik + `Pagination` direstyle token golden (M4-2); golden memakai mock list. |
| Admin — Beranda | (tidak ada referensi, M1-4) | `/app/admin` | **Parity terhadap bahasa M2/M3** | Kartu ringkasan token golden; sidebar desktop didefer (D7). Bottom nav 7 item kini scrollable @320 (M5-2). |
| Admin — tabel | (tidak ada referensi, M4-1) | `/app/admin/{banners,users,academic,plotting,reports}` | **Parity terhadap bahasa M2/M3** | Tabel `<table>` + `Pagination`, dialog Headless UI, form label terlihat (M4-3). |

Kesimpulan: **tidak ada divergensi visual tak terduga** pada bahasa visual (warna/radius/spacing/typography/bentuk ikon). Semua perbedaan yang tersisa adalah hasil keputusan yang sudah dikunci (D7, M1-4, M3-4, M4-1) atau tambahan fungsional PRD (filter/tabel/export/forgot-password).

## Aksesibilitas & states

| Aspek | Temuan | Tindakan |
| --- | --- | --- |
| Focus-visible | `index.css` menetapkan outline global 2px offset 2px; AppShell memakai `focus-visible:outline-white` di permukaan biru | OK |
| Reduced motion | `prefers-reduced-motion` global menonaktifkan animasi; skeleton memakai `motion-reduce:animate-none`; carousel tanpa autoplay (D5) | OK |
| Label & accessible name | Login pakai `aria-label`; tombol back golden master kini `aria-label="Kembali"`; dialog & ikon dekoratif `aria-hidden` | Diperbaiki (M5-3) |
| Kontras | Teks utama `ink-900` on putih; label `slate-700`; tombol white-on-`blue-500` (`text-lg`) lolos 3:1 teks besar; risiko white-on-blue-500 untuk teks normal masih dicatat | Risiko §15 |
| PII/token di DOM/console | Tidak ada `console.*`, `localStorage`/`sessionStorage`. Satu akses `document.cookie` hanya untuk membaca `csrf_token` non-HttpOnly di `lib/apiClient.js`; `auth_token` HttpOnly tidak dibaca JS | OK |
| Keyboard flow | Skip link tersedia, `main` `tabindex=-1`, semua aksi tombol/link native; tidak ada handler hanya-hover | OK |
| Viewport 320px | Bottom nav admin (7 item) sebelumnya terpotong; kini scrollable (M5-2). Layar lain tidak terpotong | Diperbaiki |

## Residual risk

1. Parity piksel desktop guru/admin tidak penuh: sidebar `lg:` (D7) + halaman admin tanpa layar referensi golden master (M4-1).
2. Header beranda siswa belum mengikuti golden master penuh (M3-4) — AppShell masih pemilik bar biru; perubahan menunggu keputusan produk.
3. Bundle produksi 865 kB (gzip 263 kB) dengan warning chunk >500 kB; `@mui/material` menambah berat di jalur scan.
4. Diff piksel otomatis ber-threshold belum masuk CI; laporan ini diregenerasi manual/headless.
5. Warning lint pre-existing React Compiler pada `frontend/src/features/admin/forms/UserFormDialog.jsx` (0 error, tidak terkait parity).

## Perubahan kode fase ini

- `frontend_new/`: `components/Header.tsx` (aria-label back), `.../StatusAbsen.tsx` (aria-hidden dot), `features/login/Login.tsx` (`Username`), `pages/NotFound.tsx` (link beranda), `.../BottomNav/BottomNav.tsx` (struktur scroll).
- `frontend/`: `pages/student/ScanPage.jsx` (lucide→MUI), `features/student/HistoryDetailDialog.jsx` (lucide→MUI), hapus `features/banners/ActiveBanner.jsx`, `components/layout/BottomNav.jsx` (scroll), `package.json` (hapus `lucide-react`), `GUIDE.md` (kebijakan ikon + primitif + aturan golden master), `docs/DECISIONS.md` §20.
