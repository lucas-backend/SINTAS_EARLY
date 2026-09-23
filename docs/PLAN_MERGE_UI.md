# Plan: Unifikasi UI Frontend — `frontend_new` sebagai Sumber Desain Absen

Dokumen ini adalah rencana eksekusi agar:

1. `frontend_new/` **hanya fokus pada absen** (dipangkas menjadi prototype/desain referensi untuk alur absensi Kak Lia).
2. **Style** (tokens, warna, typography, radius, ikon) dari `frontend_new/` **di-merge** ke `frontend/` sebagai aplikasi produksi.
3. **Style & layout `frontend/` sama persis dengan `frontend_new/`** (parity visual, mobile-first, material design blue-500).

Referensi yang wajib dibaca sebelum eksekusi: `docs/DESIGN_BRIEF.md`, `docs/DECISIONS.md`, `frontend/GUIDE.md`, `frontend_new/doc/Struktur_Folder.md`, `frontend_new/plan.md`, dan `docs/PRD.md`. Semua keputusan baru wajib dimasukkan ke `docs/DECISIONS.md` sebelum coding (aturan AGENTS.md).

---

## 1. Ringkasan dan Tujuan

Saat ini ada dua kodebasis frontend dengan tujuan berbeda:

| Proyek | Teknologi | Isi sekarang | Peran setelah plan ini |
| --- | --- | --- | --- |
| `frontend_new/` | React 19 + TS + Tailwind 4 + MUI icons + react-router 7 | Prototype "LIMAN": login, dashboard, jadwal, latihan-soal, quiz, ujian/tryout | **Sumber desain (golden master)** — prototype absensi mobile-first yang dibatasi cuma fitur absen + layar referensi alur absen |
| `frontend/` | React 19 + JS + Tailwind 4 + lucide-react + headlessui + RQ + zustand + RHF/zod | SPA Kak Lia produksi: auth, siswa/guru/admin, scan, riwayat, sesi, QR, laporan, export | **Aplikasi produksi** — arsitektur & logic tetap, visual & layout **sama persis** dengan `frontend_new/` |

Hasil akhir visual: tampilan mobile-first `bg-blue-500` dengan lembaran putih `rounded-t-[60px]`, header biru, pill search, status absen, grid fitur 3 kolom, dan bottom nav — yang berlaku di kedua proyek.

> `frontend_new/` tetap berdiri sebagai proyek tersendiri (dipakai sebagai mockup/kanvas desain yang cepat diubah). Semua perubahan visual **dimulai dari `frontend_new/` dulu** sebagai golden master, lalu dirontokkan ke `frontend/`. `frontend/` tidak boleh mengubah layout visual sendiri di luar kontrak visual ini.

## 2. Definisi Peran Dua Frontend

- **Golden master (`frontend_new/`)**: memakai mock data, tidak wajib memanggil API, boleh dihancurkan untuk eksperimen visual. Menjadi pegangan "sama persis".
- **Produksi (`frontend/`)**: memakai API nyata (`VITE_API_BASE_URL`, cookie auth, React Query). Mempertahankan aturan pada `frontend/GUIDE.md` bagian arsitektur (feature folders, `services`, `schemas`, route guard, `lib/permissions.js`), tetapi **mengganti lapisan presentasi** agar meniru golden master.

Alur kerja:

```
ubah visual → golden master (frontend_new) → approve → rontok ke frontend → visual regression
```

## 3. Kontrak Visual "Sama Persis" (Invariant)

Ini daftar invariant yang wajib dipegang oleh kedua proyek untuk layar yang sama. `frontend/` dianggap "sama persis" bila semua invariant berikut identik di DOM/rendering kedua proyek:

1. **Warna dasar halaman**: latar atas `bg-blue-500` (Tailwind default `#3B82F6`), konten jatuh ke lembaran putih.
2. **Container**: pembungkus konten = `w-full px-4 sm:px-0 max-w-sm mx-auto` (setara `components/XPadding`). Lembaran putih `bg-white w-full max-w-md mx-auto -mt-6 rounded-t-[60px] pt-13 pb-8`.
3. **Header tampilan** (login-gaya): `bg-blue-500 text-white py-8` + tombol kembali (icon arrow) absolute kiri + judul `text-2xl font-semibold`.
4. **Header beranda**: avatar bulat putih `w-12 h-12 rounded-full`, sapaan `font-bold text-xl`, nama `text-sm`, tombol aksi bulat putih `w-8 h-8` di kanan.
5. **Search bar**: `rounded-full` pill, `border border-black/10`, ikon search, input tanpa outline.
6. **Status absen**: titik `rounded-full h-2 p-2` (`bg-green-500` hadir / `bg-red-500` belum) + teks "Anda sudah/belum absen hari ini."
7. **Grid fitur**: `grid grid-cols-3 gap-4`, border `border-black/10`, `rounded-xl`, padding besar, ikon dalam lingkaran `text-blue-500 bg-blue-100 rounded-full h-18 w-18`, label `text-sm font-medium text-slate-700`.
8. **Button primary**: `bg-blue-500 font-semibold text-lg py-2 w-full rounded-lg disabled:opacity-50 disabled:cursor-not-allowed` (overridable class).
9. **Bottom nav**: `bg-blue-100 rounded-t-[60px] fixed bottom-0 max-w-lg left-1/2 -translate-x-1/2`, item aktif `rounded-2xl bg-blue-500 text-white h-12 w-12`.
10. **Radius & spacing payload**: `rounded-full`, `rounded-xl`, `rounded-lg`, `rounded-2xl`, `rounded-t-[60px]`; jarak memakai skala Tailwind default (spacing base).
11. **Ikon**: satu set ikon yang sama bentuknya di kedua proyek (lihat Keputusan D1).
12. **Typography**: keluarga font sama di kedua proyek (lihat Keputusan D4), ukuran `text-xs`…`text-6xl` via Tailwind.

Jika salah satu invariant berubah di golden master, `frontend/` ikut berubah; sebaliknya perubahan di `frontend/` tidak diperbolehkan karena itu mengubah golden contract.

## 4. Inventaris Aset Style `frontend_new/`

File sumber style/layout yang menjadi referensi merge:

| Kategori | File | Elemen yang dipakai |
| --- | --- | --- |
| Container | `src/components/XPadding.tsx` | wrapper `max-w-sm` + `px-4` |
| Header | `src/components/Header.tsx` | header biru + back + title |
| Button | `src/components/Button.tsx` | button full-width biru `rounded-lg` |
| Header beranda | `src/features/dashboard/components/DashboardHeader.tsx` | avatar + greeting + aksi bulat |
| Search | `src/features/dashboard/components/SearchBar.tsx` | pill search |
| Status absen | `src/features/dashboard/components/StatusAbsen.tsx` | dot hijau/merah + teks |
| Grid fitur | `src/features/dashboard/components/FeatureGrid/*` | grid 3 kolom + icon circle |
| Bottom nav | `src/features/dashboard/components/BottomNav/BottomNav.tsx` | nav bawah pill (saat ini di-comment di Dashboard) |
| Login | `src/features/login/Login.tsx` | layar biru penuh + judul besar + form input putih |
| 404 | `src/pages/NotFound.tsx` | layar biru penuh + teks putih |
| Banner | `src/components/AdSlider/*` | carousel banner baru, dijadikan "Banner sekolah" sesuai PRD |
| Skelaton layout dashboard | `src/features/dashboard/Dashboard.tsx` | pola `bg-blue-500 pt-8` → search (overlap) → sheet putih `rounded-t-[60px]` |

Palet yang digunakan golden master (bukan tokens `school-blue` di `DESIGN_BRIEF` lama): `blue-500`, `blue-400`, `blue-100`, `orange-400`, `slate-700`, `white`, `black/10`, `green-500/600`, `red-500`, `orange-300`. Kontrak visual pada bagian 3 menjadikan palet ini sebagai acuan.

## 5. Scope `frontend_new/`: Hanya Fokus Absen

Pangkas `frontend_new/` agar hanya berisi alur absensi. Nama aplikasi diubah dari "LIMAN" menjadi "Kak Lia" (atau label lain yang disepakati), bahasa `lang="id"`, dan teks UI memakai istilah PRD (`Hadir`, `Terlambat`, `Tidak Hadir`, `Bisa absen`, `Belum dibuka`, `Selesai`).

### 5.1 Fitur/layar yang dipertahankan

| Layar | Route (golden master) | Konten |
| --- | --- | --- |
| Login | `/login` | Alur sign-in (mock, redirect ke beranda) |
| Beranda (berdasarkan role) | `/dashboard` | Header beranda + search + banner + status absen + grid fitur absen |
| Jadwal konteks absen | `/jadwal` | Daftar pelajaran/hari ini-besok dengan status `Bisa absen`/`Belum dibuka`/`Selesai` + aksi `Absen sekarang` |
| Scanner QR | `/scan` | Frame kamera 1:1 + instruksi + fallback manual (diresurgi ke-phasa M1, tambahan layar referensi) |
| Hasil scan | `/scan/result` | Panel success/warning/duplicate sesuai status server |
| Riwayat | `/riwayat` | List rows tanggal | mapel/kelas | status + filter |
| Profil | `/profil` | Formitas profil dasar (username/NIM read-only) |
| Guru — Buat absen | `/guru/buat-absen` | Form buat sesi (assignment, tanggal, jam) |
| Guru — QR sesi | `/guru/sesi/:id` | Tampilan QR + metadata sesi + window waktu |
| Guru — Rekap kelas | `/guru/rekap` | Tabel kehadiran + tombol export |
| 404 | `*` | Layar biru + teks putih |

### 5.2 Fitur yang dihapus/dipindahkan dari scope

- `features/quiz/*` dan route `/quiz/:id/*` — minat-bakat/remedial bukan absensi → hapus.
- `features/latihan-soal/*` dan route `/latihan-soal*` → hapus.
- `features/jadwal/*` bagian `sectionUjian`/`sectionTryout` (ujian/tryout) → hapus; yang tersisa hanya jadwal pelajaran sebagai konteks absen.
- `components/QuizItemCard.tsx` → hapus.
- Grid fitur: isi ulang dengan item absen saja (mis. `Absen`, `Riwayat`, `Jadwal`, `Profil`); hapus `Tugas`, `Passing Grade`, `Minat Bakat`, `Remedial`, `Latihan Soal`.
- `guruFeatures`/`adminFeatures` pada `FeatureGrid/data.ts` diisi dengan item absensi (guru: `Buat Absen`, `Sesi`, `Rekap`; admin hasil keputusan produk).
- `BottomNav` di-aktifkan kembali dengan menu absensi (Beranda, Absen, Riwayat, Profil).

### 5.3 Layar referensi tambahan (golden master)

`frontend_new/` perlu menambah layar baru untuk menjadi referensi lengkap alur absen yang dipakai `frontend/`: Scanner, Hasil Scan, Riwayat, Profil, Buat Absen, QR Sesi, Rekap Kelas. Semua memakai mock data dan mengikuti pola layout yang sudah ada (XPadding + sheet putih). Ini diperlukan supaya `frontend/` punya acuan visual per layar, bukan menebak layout.

## 6. Strategi Merge Style ke `frontend/`

`frontend/` **tidak mewarisi struktur file** `frontend_new/`, hanya **mewariskan visual**. Arsitektur produksi tetap (lihat `frontend/GUIDE.md`): feature folders, `services`, `schemas`, `lib`, route guard, React Query.

Langkah umum per layar di `frontend/`:

1. Ambil JSX/layout dari golden master, terjemahkan ke halaman/komponen `frontend/` dengan data nyata dari React Query/service.
2. Ganti impor ikon MUI (`@mui/icons-material`) sesuai keputusan ikon (D1); ganti TSX → JSX, default export tetap mengikuti pola setempat.
3. Token: jangan menulis color hex acak — definisikan di `src/index.css` (lihat bagian 7) lalu pakai semantic alias agar komponen lama tidak harus diubah nama class-nya.
4. Pertahankan semua behavior & test: role guard, 401/403, idempotensi scan, invalidate query, download export, dsb. Hanya lapisan presentasi yang berubah.

## 7. Token Baru di `frontend/src/index.css`

Ganti/memetakan theme token lama (`school-blue-*`, `ink-*`, dst.) menjadi palet golden master. Dua pilihan:

- **Rekomendasi: alias semantic**. Pertahankan nama token yang sudah dipakai komponen (`--color-school-blue-700`, dll.) tetapi **ubah nilainya** ke nilai golden master (`blue-500` = `#3B82F6`, dst.). Ini meminimalkan churn dan tetap "persis" secara visual.
- Nilai wajib yang di-adopt dari golden master: `blue-500 #3B82F6` (aksi/latar header), `blue-400`, `blue-100` (latar icon circle), `orange-400` (CTA login/secondary), `slate-700` (label grid), `green-500`/`red-500` (status dot), `black/10` (border halus), radius `rounded-full/xl/lg/2xl/[60px]`, dan `rounded-t-[60px]` untuk sheet.
- Hapus prefisi lama bila semua komponen sudah diberi token baru (opsional, fase M5).

## 8. Peta Komponen (Golden Master → `frontend/`)

| Komponen `frontend_new` | Implementasi di `frontend/` | Lokasi target `frontend/src` |
| --- | --- | --- |
| `XPadding` | `ContentShell` | `components/layout/ContentShell.jsx` (baru) |
| `Header` (back+title) | `BlueHeader` | `components/layout/BlueHeader.jsx` (baru) |
| `DashboardHeader` (avatar+greeting) | pakai/meniru, masuk ke `AppShell` atau `DashboardHeader` | `components/layout/AppShell.jsx` (diubah) + `components/common/` |
| `Button` | `PrimaryButton` | `components/common/PrimaryButton.jsx` (baru) |
| `SearchBar` | `PillSearch` | `components/common/PillSearch.jsx` (baru, jika keputusan D3 setuju) |
| `StatusAbsen` | pakai `FeaturedSummary` / dibuat `AbsenStatusDot` | `components/common/StatusDot.jsx` (baru) |
| `FeatureGrid` | `FeatureGrid` | `components/common/FeatureGrid.jsx` (baru) |
| `BottomNav` | `BottomNav` (mobile) | `components/layout/BottomNav.jsx` (baru) |
| `AdSlider` | `BannerCarousel` | `features/banners/BannerCarousel.jsx` (baru/ubah) |
| Login (form) | `LoginPage` (rewrite layout) | `pages/auth/LoginPage.jsx` (diubah) |
| NotFound | `NotFoundPage` (rewrite layout) | `pages/NotFoundPage.jsx` (diubah) |
| Jadwal item | `ScheduleCard` + `TimeRail` | `features/attendance/ScheduleCard.jsx` (restyle) |
| — | `ScanResultPanel`, `ScanPrecheck`, dll. → restyle | `features/attendance/*` (restyle) |

App shell: **mobile** memakai pola golden master (header biru `bg-blue-500` + sheet putih + bottom nav); **desktop** mempertahankan sidebar `lg:` yang sudah ada tetapi memakai palet/token golden master (keputusan D7).

## 9. Fase Eksekusi dan Checkpoint

> Prinsip PROMPT_GUIDE: satu fase = satu scope teruji; jangan menumpuk fitur dan refactor visual dalam satu langkah. Setiap fase: lint/build + test terkecil yang relevan sebelum lanjut.

### Fase M0 — Kunci keputusan (tanpa coding)

- Tulis keputusan baru di `docs/DECISIONS.md` sesuai bagian 11 (D1–D8).
- Sinkronkan `DESIGN_BRIEF.md`: bagian 2 (visual direction) dan 3 (tokens) diperbarui agar **tidak bertentangan** dengan pilihan golden master (mis. arah biru penuh, bell, search, all-caps) — atau tandai bagian yang di-override.
- **Checkpoint:** tidak ada keputusan diam-diam; `DESIGN_BRIEF` konsisten dengan kontrak visual bagian 3.

### Fase M1 — Pangkas `frontend_new/` jadi fokus absen

- Hapus quiz, latihan-soal, ujian/tryout; bersihkan route di `App.tsx`; ubah isi `FeatureGrid` data; aktifkan `BottomNav`; ubah nama app & `lang="id"`.
- Tambah layar referensi absen (5.3) dengan mock data.
- **Checkpoint:** `npm run lint` + `npm run build` di `frontend_new/` lulus; tidak ada route mati; dashboard siswa menampilkan status absen + menu absen saja.

### Fase M2 — Token & primitif di `frontend/`

- Perbarui `src/index.css` (bagian 7).
- Buat primitif: `ContentShell`, `BlueHeader`, `PrimaryButton`, `PillSearch`(opsional), `StatusDot`, `FeatureGrid`, `BottomNav`, `BannerCarousel`.
- Setel `AppShell` mobile mengikuti pola sheet putih + bottom nav; desktop mengikuti D7.
- **Checkpoint:** lint/build lulus; seluruh test routing/app shell (`router.test.jsx`, `AppShell.test.jsx`, `studentAccess`/`teacherAccess`) tetap hijau setelah markup diubah.

### Fase M3 — Repaint auth & siswa

> **Status:** selesai (keputusan §18 `docs/DECISIONS.md`). lint/build/test `frontend/` hijau (88 test). Verifikasi screenshot lintas viewport masih manual (lihat open item §18 M3-4).

- `LoginPage`, `ForgotPasswordPage`, `NotFoundPage`: layout = golden master.
- Beranda siswa (`pages/student/DashboardPage.jsx` + `features/attendance/*`), Jadwal (`SchedulePage`), Scan (`ScanPage` + `QrScannerFrame` + `ScanResultPanel` + `ManualScanForm`), Riwayat (`HistoryPage` + `HistoryViews`), Profil.
- **Checkpoint:** side-by-side dengan golden master (lihat bagian 10) per layar; semua state loading/empty/error/duplicate masih berfungsi.

### Fase M4 — Repaint workspace guru & admin

> **Status:** selesai (keputusan §19 `docs/DECISIONS.md`). Semua halaman guru/admin di `frontend/` direstyling memakai token/primitive golden master; tabel tetap `<table>` + `Pagination`; export XLSX tidak berubah. Referensi admin tidak ditambah ke golden master (M4-1).

- Pastikan golden master punya referensi guru/admin (5.1). Terapkan ke `pages/teacher/*`, `pages/admin/*`, tabel (restyle tapi tetap `table` + `Pagination`), form buat sesi, `QrDisplay`, rekap, export.
- **Checkpoint:** lint/build + test role access + scan path tetap hijau.

### Fase M5 — Visual regression & release readiness

> **Status:** selesai (keputusan §20 `docs/DECISIONS.md`, laporan `docs/PARITY_REPORT.md`). Parity diaudit lintas viewport 320/390/768/1440 dengan screenshot headless (Chrome CDP) pada data nyata (backend dev + user seed) dan mock golden master. `frontend_new/` lint+build hijau; `frontend/` lint+build hijau (1 warning pre-existing) dan 88 test hijau. D1 tuntas (`lucide-react` dihapus), bottom nav 320px diperbaiki (M2-1 ditutup), dan kebijakan ikon/golden master ditulis di `frontend/GUIDE.md`.

- Validasi "sama persis" (bagian 10) lintas viewport 320/390/768/1440.
- Perbarui `frontend/GUIDE.md`: daftar primitif baru, kebijakan ikon (D1), dan aturan "perubahan visual harus lewat golden master".
- **Checkpoint:** tidak ada layar golden master yang terlewat; semua test/lint/build lulus; residual risk tercatat.

## 10. Verifikasi "Sama Persis" (Visual Regression)

Alur verifikasi per layar:

1. Jalankan kedua dev server: `npm run dev` di `frontend_new/` dan `npm run dev` di `frontend/`.
2. Ambil screenshot layar yang sama (login, beranda, jadwal, scan, hasil, riwayat, 404) di viewport 320, 390, 768, dan 1440 px.
3. Bandingkan: layout block, warna, radius, spacing, ukuran font, dan bentuk ikon. Idealnya pakai tool diff gambar (mis. `pixelmatch`) atau side-by-side manual; perbedaan harus > threshold yang disetujui (default: 0 untuk layar yang ada di golden master dan tidak ada konten dinamis).
4. Setiap temuan → perbaiki di `frontend_new/` dulu bila itu keputusan visual, lalu rontok ke `frontend/`.

Kriteria lulus: tidak ada perbedaan visual bermakna pada seluruh layar bagian 5.1 untuk viewport mobile; untuk desktop, beda hanya pada bagian yang memang D7 tetapkan (sidebar vs pola sheet).

## 11. Keputusan yang Harus Dikunci (Open Question → DECISIONS.md)

| # | Pertanyaan | Opsi | Rekomendasi awal |
| --- | --- | --- | --- |
| D1 | Ikon mana yang dipakai agar benar-benar sama persis? | (a) MUI Material icons di `frontend/` juga (pasang `@mui/icons-material`), (b) lucide-react di golden master, (c) biarkan beda glyph | (a) MUI icons — bentuk glyph-nya khas dan menjadi bagian dari "sama persis". Ini mengoverride pilihan `lucide-react` di GUIDE.md dan wajib dicatat. |
| D2 | Bell notification di header beranda (PRD meniadakan notifikasi) | (a) hapus dari golden master → diganti aksi profil, (b) biarkan sebagai elemen visual murni | (a) hapus untuk tidak menambah fitur non-PRD; parity tetap karena keduanya mengikuti golden master. |
| D3 | Search bar di beranda (DESIGN_BRIEF melarang search tanpa kebutuhan) | (a) pertahankan sebagai elemen desain (filter fitur/jadwal yang benar-benar berfungsi), (b) hapus | (a) pertahankan tapi harus fungsional (filter) agar bukan dead-element. |
| D4 | Font | (a) Plus Jakarta Sans di kedua proyek, (b) font default sistema di kedua | (a) Plus Jakarta Sans — sudah dipakai `frontend/`; tambahkan di `frontend_new/` supaya sama. |
| D5 | Banner carousel (golden master `AdSlider` memakai panah) vs "satu banner + indikator" di DESIGN_BRIEF | (a) ikuti golden master (carousel dengan panah), (b) ganti golden master | (a) golden master menang; DESIGN_BRIEF di-update. |
| D6 | All-caps tombol (golden master `MASUK`) vs sentence case di DESIGN_BRIEF | (a) ikuti golden master, (b) ubah golden master | (a) golden master menang jika produk menyetujui; DESIGN_BRIEF di-update. |
| D7 | App shell desktop Guru/Admin: golden master tidak punya referensi sidebar | (a) sidebar tetap + token golden master, (b) buat referensi sidebar baru di golden master dulu | (a) sidebar tetap untuk MVP; parity penuh ditangguhkan hanya untuk bagian desktop yang belum ada referensinya. |
| D8 | Branding/nama app pada golden master ("LIMAN" → "Kak Lia") | — | Ganti ke "Kak Lia" agar konsisten; `frontend_new` tetap bermuatan prototype. |

Setiap keputusan wajib ditulis format `DECISIONS.md`: pilihan final, alasan, dampak database/API/UI, asumsi.

## 12. File yang Terkena Dampak

**`frontend_new/` (fokus absen):**
- `src/App.tsx` (route baru), `src/features/dashboard/*` (grid/bottom nav/data), `src/features/login/Login.tsx` (branding), `src/features/jadwal/*` (hapus ujian/tryout), hapus `src/features/quiz/`, `src/features/latihan-soal/`, `src/components/QuizItemCard.tsx`, tambah `src/features/scan/`, `src/features/riwayat/`, `src/features/guru/`, `index.html` (`lang="id"`, judul), `plan.md` (update).

**`frontend/` (merge style):**
- `src/index.css` (token baru), `src/components/layout/AppShell.jsx`, `src/components/layout/*` (primitif baru), `src/pages/auth/*`, `src/pages/student/*`, `src/pages/teacher/*`, `src/pages/admin/*`, `src/features/attendance/*`, `src/features/student/*`, `src/features/teacher/*`, `src/features/banners/*`, `src/pages/NotFoundPage.jsx`.
- `package.json`/lockfile bila keputusan D1 memilih MUI icons di produksi.

**Docs:**
- `docs/DECISIONS.md` (D1–D8), `docs/DESIGN_BRIEF.md` (visual direction & tokens), `docs/PLAN_MERGE_UI.md` (perbarui status pengerjaan), `frontend/GUIDE.md` (primitif & kebijakan ikon/visual), `frontend_new/doc/Struktur_Folder.md` (bila struktur bergeser).

**Guard rails:** jangan mengubah route/auth/status/timezone logic di `frontend/`; jangan merusak scan-path idempotency behavior; perbarui test yang menyentuh markup (AppShell, router, login) bila memang berubah; `npm run lint` + `npm run build` (dan `npm test` di `frontend/`) wajib hijau tiap fase.