# Brief Fitur: Rombak Dashboard SISWA & GURU + Rekap H.I.S.A.D

## 0. Konteks & guardrail wajib

Proyek **SINTAS** (React 19 + Vite di `frontend/`, Express 5 + Prisma + MySQL di `backend/`). Kerjakan **langsung di `frontend/`** (kesepakatan: melewati alur parity golden master `frontend_new/`; deviasi dari `PLAN_MERGE_UI.md` bagian 2 harus dikunci di `docs/DECISIONS.md`).

Wajib dibaca sebelum menyentuh perilaku: `AGENTS.md`, `frontend/GUIDE.md`, `backend/GUIDE.md`, `docs/DECISIONS.md`, `docs/PRD.md`, `docs/openapi.yaml`.
Jangan menyentuh: auth/CSRF, aturan window scan (`start_at-15m … end_at`), timezone sekolah, idempotensi scan (`(session_id, student_id)`, duplicate → 200 `duplicate:true`), computed `TIDAK_HADIR`, dan jalur scan (tidak boleh ditambahi query laporan).
`npm run lint` + `npm run build` (frontend) dan `npm run lint` + `npm test` (backend) harus hijau.

> **Status keputusan:** sudah dikunci di `docs/DECISIONS.md` §24 (R1–R6). `AGENTS.md` mengunci enum hanya `HADIR`/`TERLAMBAT`/`TIDAK_HADIR`; perluasan enum dan penghapusan halaman **wajib** disertai update `docs/PRD.md`.

## 1. Perubahan role SISWA

**Navigasi (bottom nav)** — `src/lib/permissions.js` `ROLE_NAV.STUDENT`:
- Sisa hanya: **Beranda** (`/app/student`, `end:true`) dan **Profil** (`/app/student/profile`, `end:true`).
- Hapus item **Jadwal** dan **Riwayat**.

**Hapus total (route + halaman + komponen), bukan sekadar disembunyikan:**
- Route `/app/student/history` dan `pages/student/HistoryPage.jsx` + `features/student/HistoryViews.jsx` + `HistoryDetailDialog.jsx`.
- `features/attendance/ManualScanForm.jsx` (kode manual) dan pemakaiannya di scan flow.
- `PillSearch` / state `search` di beranda siswa.
- Section **"Absen hari / Jadwal terdekat"** lama, `FeatureGrid` siswa, dan quick-link **Riwayat** di beranda.
- Bersihkan import/route mati; perbarui `src/app/router.jsx` dan test terkait (`studentAccess.test.jsx`, `HistoryPage.test.jsx`, `DashboardPage.test.jsx`, `ScanPage.test.jsx`).

**Dashboard beranda siswa = "Jadwal Hari Ini"** (`pages/student/DashboardPage.jsx`, sumber data `useTodaySchedule` → `GET /api/v1/attendance/today`):
- Header sapaan + avatar tetap; **banner tetap** (PRD FR-02).
- Konten utama: daftar **semua jadwal hari ini** per mata pelajaran/jadwal.
- Tiap item jadwal punya **tombol Scan barcode di samping list**.
- Tombol scan membuka pemindaian **untuk sesi mapel tersebut** (payload/konteks sesi terkait).
- Setelah sesi itu discan, tampilkan **ceklis pada item list**-nya. Ceklis berlaku untuk semua status (`HADIR`/`TERLAMBAT`); `TERLAMBAT` dibedakan lewat label/warna, bukan tanpa ceklis.
- Sediakan **rekap hari ini saja** di dashboard (ringkasan kehadiran hari ini).
- Hapus search, grid fitur, dan quick link.

## 2. Perubahan role GURU

**Navigasi (bottom nav)** — `ROLE_NAV.TEACHER`:
- Sisa hanya: **Beranda** (`/app/teacher`, `end:true`) dan **Profil** (`/app/teacher/profile`, `end:true`).
- Hapus item **Penugasan**, **Jadwal/QR** (sessions), dan **Riwayat** (tombol Jadwal & Riwayat dihapus dari bottom nav).
- Hapus/rapikan route mati: `/app/teacher/assignments`, `/app/teacher/sessions`, `/app/teacher/sessions/:id/qr`, `/app/teacher/classes/:id/attendance` — pindahkan fungsinya ke halaman baru (lihat bawah).

**Dashboard guru = "Penugasan & Absensi (QR)"** (`pages/teacher/DashboardPage.jsx`):
- Ganti seluruh konten lama ("GURU HAPUS SEMUA").
- Tampilkan daftar **penugasan** guru, dengan aksi **buat sesi + tampilkan QR** di halaman yang sama (gabungan Penugasan & Absensi/QR). Pertahankan `SessionForm`, `QrDisplay`, `QrScanner` statis dari backend — jangan bikin QR dinamis.

**Halaman Rekap terpisah** (pertahankan route `/app/teacher/reports` atau sejenis, jangan di bottom nav):
- **Rekap per hari** — daftar siswa yang **tidak masuk** pada tanggal terpilih.
- **Rekap keseluruhan per siswa** dalam **penugasan guru yang login** (semua kelas/mapel yang dia ajar): tampilkan **total pertemuan, total hadir, izin, sakit, alfa, dispen** dalam format **H.I.S.A.D**.
- **Guru dapat input manual** status `IZIN`/`SAKIT`/`ALFA`/`DISPEN` per siswa di halaman Rekap.
- Jangan tarik query rekap ke jalur scan.

## 3. Perubahan backend (sertakan)

- **Domain status:** tambah `IZIN`, `SAKIT`, `ALFA`, `DISPEN` di `src/domain/attendanceStatus.js` / enum Prisma, selaras `docs/DECISIONS.md`. `HADIR`/`TERLAMBAT` tetap dari scan; `TIDAK_HADIR` tetap computed on read.
- **Penyimpanan status manual:** tabel terpisah (mis. `attendance_status_overrides`) atau perluasan `attendance_records` — putuskan & catat (jangan simpan ulang computed `TIDAK_HADIR` sebagai scan).
- **Endpoint baru:** rekap harian (siapa tidak masuk), rekap keseluruhan per siswa (scope = penugasan guru), dan input/ubah status manual. Ikuti kontrak error `{ error: { code, message, fieldErrors? } }`, layering route→middleware→controller→service→repository, dan factory router.
- **Migrasi:** `npx prisma migrate dev`; perbarui `schema.prisma`, `docs/openapi.yaml`, `docs/API_CONTRACT.md`, dan seed bila perlu.
- **Test:** tambah unit test aturan status + integration test endpoint rekap & input manual; jaga test idempotensi/kontrak scan tetap hijau.

## 4. Keputusan (SUDAH DIKUNCI di `docs/DECISIONS.md` §24, R1–R6)

1. **R1** — Perluasan enum status ke H.I.S.A.D (`HADIR`/`TERLAMBAT`/`IZIN`/`SAKIT`/`ALFA`/`DISPEN` + computed `TIDAK_HADIR`); sumber `IZIN`/`SAKIT`/`ALFA`/`DISPEN` = input manual guru.
2. **R2** — Rekap H.I.S.A.D: kolom `H` = `HADIR` + `TERLAMBAT`; `TERLAMBAT` jadi breakdown/sub-label.
3. **R3** — Status manual disimpan di tabel baru `attendance_status_overrides` (unique `(session_id, student_id)`), berlaku per sesi/pertemuan, hanya guru pemegang penugasan.
4. **R4** — Hapus total route/halaman siswa `history` & `schedule`, kode manual, search; beranda = Jadwal Hari Ini + scan per mapel + ceklis + rekap hari ini; nav siswa = Beranda + Profil.
5. **R5** — Nav guru = Beranda + Profil; beranda = Penugasan & Absensi (QR); halaman Rekap terpisah (`/app/teacher/reports`) dengan rekap harian + keseluruhan H.I.S.A.D + input manual.
6. **R6** — Kerjakan langsung di `frontend/`, golden master `frontend_new/` tidak disentuh (deviasi PLAN_MERGE_UI bagian 2).

Wajib menyertai implementasi: update `docs/PRD.md`, `docs/openapi.yaml`, `docs/API_CONTRACT.md`, dan `docs/DATABASE.md`.

## 5. Non-goals

Admin tidak diubah. Tidak ada notifikasi, dynamic QR, multi-sekolah, atau fitur di luar brief ini. Golden master `frontend_new/` tidak disentuh.

## 6. Acceptance criteria

- Bottom nav siswa & guru = **Beranda + Profil**; tidak ada tombol/route mati.
- Dashboard siswa = Jadwal Hari Ini dengan tombol scan per mapel + ceklis semua status + rekap hari ini; search, riwayat, kode manual, dan jadwal terdekat hilang total.
- Dashboard guru = Penugasan & Absensi (QR) dalam satu halaman; halaman Rekap menyajikan rekap harian (tidak masuk) dan rekap keseluruhan per siswa H.I.S.A.D, dengan input manual Izin/Sakit/Alfa/Dispen.
- Endpoint rekap & input manual punya otorisasi role + scope penugasan guru; `openapi.yaml` sinkron; lint/build/test hijau.
