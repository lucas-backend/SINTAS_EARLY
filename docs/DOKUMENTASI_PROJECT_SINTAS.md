# Dokumentasi Komprehensif — Project SINTAS

> Absensi Sekolah Berbasis QR Code (Siswa / Guru / Admin)
>
> Dokumen ini ditulis berdasarkan analisis menyeluruh terhadap seluruh source code
> yang ada di repository saat ini (`backend/`, `frontend/`, `frontend_new/`,
> `docs/`). Seluruh fakta di bawah mencerminkan kondisi implementasi yang
> benar-benar ada, bukan desain target.

---

## 1. Spesifikasi Project

### 1.1 Ringkasan dan Tujuan Aplikasi

**SINTAS** adalah SPA (Single-Page Application) sistem absensi sekolah berbasis
QR Code yang melayani **satu sekolah** dengan tiga peran pengguna: **Siswa**,
**Guru**, dan **Admin**. Produk ini dibangun untuk menggantikan pencatatan
kehadiran manual yang tidak praktis dengan alur digital yang terstruktur:
Guru membuat sesi absensi per pertemuan, sistem menerbitkan QR Code statis,
Siswa memindai QR tersebut dalam jendela waktu tertentu, dan sistem menyimpan
status kehadiran secara otomatis sesuai aturan waktu.

Aplikasi disusun sebagai **monolith** dalam satu repository dengan dua paket
JavaScript yang berdiri sendiri (independen — tanpa workspaces):

| Direktori | Peran |
| --- | --- |
| `backend/` | REST API Express.js — sumber kebenaran seluruh logika bisnis, waktu, dan otorisasi. |
| `frontend/` | React SPA produksi — antarmuka pengguna untuk Siswa/Guru/Admin. |
| `frontend_new/` | Golden master — prototype visual mock-data (React + TypeScript) yang menjadi sumber keputusan desain. |
| `docs/` | Dokumentasi produk, arsitektur, kontrak API, dan keputusan teknis. |

Prinsip arsitektur yang non-negotiable dari project ini:

1. **Backend adalah satu-satunya sumber kebenaran.** Status absensi (`HADIR`,
   `TERLAMBAT`, `TIDAK_HADIR`), waktu scan, timezone sekolah, dan scope laporan
   hanya boleh diputuskan oleh server (`AGENTS.md`, `backend/GUIDE.md` §1).
   Frontend hanya menampilkan dan tidak pernah menghitung aturan absensi sendiri.
2. **Lapisan kode ketat:** route → middleware → controller → service →
   repository → database. Controller tipis; aturan bisnis hidup di service;
   logika murni + zod hidup di `src/domain` dan `src/schemas`.
3. **Waktu disimpan dalam UTC** dan dikonversi ke timezone sekolah (IANA,
   default `Asia/Jakarta`) pada batas service/response.
4. **Idempotensi scan** dijamin oleh unique constraint `(session_id, student_id)`
   pada database; scan ganda mengembalikan record yang sudah ada dengan
   `duplicate: true`, bukan membuat record kedua.
5. **`TIDAK_HADIR` tidak pernah disimpan.** Ia adalah status yang dihitung saat
   riwayat/laporan dibaca apabila waktu server sudah melewati `end_at`.
6. **Dua frontend dengan dua peran.** Perubahan visual selalu dimulai dari
   golden master `frontend_new/`, disetujui, baru dirontokkan ke `frontend/`.

### 1.2 Daftar Fitur dan Fungsionalitas Utama

Berikut inventaris fitur yang benar-benar diimplementasikan dalam codebase,
dipetakan ke requirement PRD:

**Autentikasi & Manajemen Sesi (FR-01)**
- Login username + password untuk tiga role (`POST /api/v1/auth/login`).
- Sesi berbasis **cookie HttpOnly** (`auth_token`) berisi JWT HS256 (jose).
- Logout (`POST /api/v1/auth/logout`).
- Forgot password memakai email + tanggal lahir + password baru + konfirmasi
  (`POST /api/v1/auth/forgot-password`), berlaku untuk semua role termasuk Admin.
- Profil user login: `GET /api/v1/me` dan `PATCH /api/v1/me` (nama, email,
  WhatsApp, tanggal lahir — **username/NIM tidak dapat diubah**).
- Rate limit login (10/15 mnt), forgot-password (5/15 mnt), dan scan
  (default 120/menit/IP) via `express-rate-limit`.
- Proteksi CSRF dua lapis (allowlist Origin + token `x-csrf-token`).

**Beranda & Banner Sekolah (FR-02)**
- Banner aktif tampil untuk semua pengguna login (`GET /api/v1/banners`, filter
  periode tampil + `isActive`).
- Admin CRUD banner (`GET /manage`, `POST`, `PATCH`, `DELETE`; pagination,
  filter `isActive`/`search`).
- Frontend menampilkan banner sebagai carousel (`BannerCarousel`/`AdSlider`)
  dengan panah prev/next, fallback teks bila `imageUrl` kosong.

**Struktur Akademik & Penempatan (FR-04)**
- Master admin: jenjang (`education-levels`), kelas (`classes`), mata pelajaran
  (`subjects`) — full CRUD ter-scope ADMIN (list jenjang/kelas/subjek juga bisa
  dibaca TEACHER).
- Plotting siswa ke kelas (`memberships`) — satu kelas aktif per siswa,
  pelanggaran → `409 ACTIVE_CLASS_MEMBERSHIP_EXISTS`.
- Plotting guru → kelas + mapel (`assignments`) — `409 DUPLICATE_ASSIGNMENT`
  untuk penugasan aktif ganda.
- Guru melihat penugasan miliknya (`GET /api/v1/academic/assignments`);
  Siswa melihat kelas aktifnya (`GET /api/v1/academic/my-classes`);
  Admin mengelola via `GET /assignments/manage` + `GET /memberships` (ter-paginasi).
- Manajemen user admin: daftar pengguna, buat user (Siswa/Guru/Admin), reset
  password manual (`GET/POST /api/v1/users`, `PATCH /api/v1/users/:id/password`).

**Sesi Absensi dan QR Code (FR-05)**
- Guru membuat sesi dari assignment aktif miliknya
  (`POST /api/v1/attendance-sessions`) dengan `assignmentId`, `sessionDate`,
  `startAt`, `endAt`, `timezone`.
- Validasi timezone (harus = timezone sekolah), rentang waktu, dan tanggal sesi
  sesuai waktu lokal sekolah.
- QR payload **opaque 43-karakter base64url** hasil `randomBytes(32)` — tidak
  memuat data pribadi dan tidak mudah ditebak (`src/domain/attendanceQr.js`).
- Sesi duplikat untuk assignment+tanggal+waktu yang sama → `409 DUPLICATE_ATTENDANCE_SESSION`.
- Guru/Admin membaca daftar sesi (`GET /api/v1/attendance-sessions`) dan QR per
  sesi (`GET /api/v1/attendance-sessions/:id/qr`).

**Pemindaian dan Status Absensi (FR-06)**
- `POST /api/v1/attendance-scans` — jalur scan yang ringan (tanpa query
  banner/report/export).
- Jendela scan dibuka `start_at - 15 menit` sampai `end_at`.
- Scan `<= start_at + 15 menit` → `HADIR` (lateMinutes 0); setelah itu sampai
  `end_at` → `TERLAMBAT` (lateMinutes = selisih menit); di luar jendela →
  ditolak tanpa record.
- **Waktu scan diambil dari server**, tidak pernah dari client.
- Duplikat sekuensial/konkuren → satu record, response `200 + duplicate: true`.
- Siswa non-anggota kelas → `403 CLASS_MEMBERSHIP_REQUIRED`; QR invalid →
  `400 INVALID_QR_PAYLOAD`; sesi tidak ditemukan → `404 ATTENDANCE_SESSION_NOT_FOUND`.
- Endpoint jadwal siswa hari ini `GET /api/v1/attendance/today` — menghitung
  `windowStatus` (`BELUM_DIBUKA`/`BISA_ABSEN`/`SELESAI`), `attendanceStatus`,
  dan `scanned` di server.

**Riwayat & Rekap (FR-07, FR-08)**
- Riwayat pribadi siswa `GET /api/v1/attendance/history` (filter `from`/`to`/
  `status`, pagination, sort).
- Detail kehadiran kelas untuk guru `GET /api/v1/attendance/classes/:id`
  (ter-scope assignment aktif miliknya).
- Laporan global admin `GET /api/v1/reports/attendance` (ADMIN-only).
- Ekspor Excel `GET /api/v1/reports/attendance/export` untuk Guru/Admin:
  kolom `Tanggal sesi`, `Kelas`, `Mata pelajaran`, `Nama siswa`, `NIM`,
  `Status`, `Menit terlambat`, `Waktu scan`; nama file
  `laporan-kehadiran-{from}-{to}.xlsx`; export kosong → `404 NO_DATA_TO_EXPORT`;
  concurrency limit 2 export → `429 EXPORT_BUSY`.
- `TIDAK_HADIR` dihitung pada saat baca, bukan disimpan.

**Operasi & Kualitas**
- Health check: `/health/live` (proses hidup, tanpa DB) dan `/health/ready`
  (menguji koneksi DB via `SELECT 1`, gagal → `503 NOT_READY`).
- Structured logging pino dengan redaction secret/PII; request ID di header
  `x-request-id`; request timeout 10 detik (default).
- Kontrak error seragam `{ error: { code, message, fieldErrors? } }` dengan
  status 400/401/403/404/409/429/500.
- Test suite backend (Vitest + Supertest): 6 file unit + 7 file integration,
  71 kasus. Test frontend: 23 file, 88 kasus (Vitest + RTL + MSW).

---

## 2. Tech Stack

### 2.1 Backend (`backend/`)

| Area | Pilihan | Catatan penggunaan |
| --- | --- | --- |
| Runtime | Node.js + JavaScript ES Modules (`"type": "module"`) | `node --watch` untuk dev |
| Framework HTTP | Express 5 (`express ^5.1.0`) | Router factory, middleware chain |
| Database | MySQL 8.0+ | Wajib `DATABASE_URL`, timestamp UTC |
| ORM & Migration | Prisma ORM + Prisma Migrate (`@prisma/client ^6.16`) | Unique constraint, index, transaction (`prisma.$transaction`) |
| Validasi | `zod ^4` | Env, body, params, query (allowlist strict) |
| Hash password | `argon2 ^0.44` | Argon2id |
| JWT | `jose ^6` | HS256, cookie HttpOnly, issuer `sintas` |
| Security | `helmet ^8`, `cors ^2`, `express-rate-limit ^8` | Header keamanan, allowlist origin, rate limit |
| Logging | `pino ^9` | Redaction `password`, `token`, `qrPayload`, `birthDate`, cookie |
| Ekspor Excel | `exceljs ^4` | Workbook `.xlsx` dibuat di backend |
| Konfigurasi env | `dotenv ^17` + skema zod | `src/config/env.js` |
| Testing | `vitest ^3` + `supertest ^7` | Unit murni + integration HTTP-through-factory |
| Linting | ESLint 10 flat config | `eslint .` |

**Struktur direktori backend yang ada:**
```
backend/
  prisma/            # schema.prisma, migrations/, seed.js
  src/
    app.js           # createApp({ prisma, logger, env }) — tanpa listen
    server.js        # startup, graceful shutdown (SIGINT/SIGTERM)
    config/          # env.js, database.js, logger.js
    routes/          # index, auth, academic, user, banner, attendance, health
    controllers/     # thin: baca request → panggil service → response
    services/        # business rules (auth/, academic, attendance, banner, management)
    repositories/    # akses data terparameterisasi
    middleware/      # authenticate, authorize, csrf, errorHandler, requestId, validate
    schemas/         # zod per resource
    domain/          # attendanceStatus, attendanceSession, attendanceQr, permissions
  tests/
    unit/            # 6 file
    integration/     # 7 file
```

### 2.2 Frontend produksi (`frontend/`)

| Area | Pilihan |
| --- | --- |
| Build | Vite 8 + `@vitejs/plugin-react` + `@tailwindcss/vite` + `@vitejs/plugin-basic-ssl` (HTTPS dev untuk kamera) |
| UI | React 19 + React DOM |
| Styling | Tailwind CSS 4 (CSS-first, design tokens di `src/index.css`) |
| Routing | `react-router-dom` v7 (public + protected + role routes) |
| Server state | `@tanstack/react-query` v5 |
| HTTP | `axios` v1 dengan base URL `VITE_API_BASE_URL`, `withCredentials`, interceptor CSRF |
| Client state | `zustand` v5 (hanya session user sanitized + status/UI state) |
| Form | `react-hook-form` v7 + `zod` v4 + `@hookform/resolvers` |
| Komponen aksesibel | `@headlessui/react` v2 (dialog, dll.) |
| Ikon | `@mui/icons-material` + `@mui/material` (keputusan D1; `lucide-react` dihapus di M5) |
| QR scan kamera | `qr-scanner` v1 |
| QR tampil | `qrcode.react` v4 (halaman guru) |
| Testing | Vitest 5 + React Testing Library + `msw` v2 + jsdom, `@testing-library/jest-dom` |

**Route frontend yang ada:**
```
/login, /forgot-password                     (publik)
/app                         → ProtectedRoute + AppShell + RoleHome (redirect per role)
  /app/student               → dashboard, schedule, scan, history, profile
  /app/teacher               → dashboard, assignments, sessions(+new, +:id/qr), classes/:id/attendance, profile
  /app/admin                 → dashboard, banners, users, academic, plotting, reports, profile
*                            → NotFoundPage (Akses Ditolak → AccessDeniedPage untuk 403)
```

Alur auth frontend: axios menyalin cookie `csrf_token` (non-HttpOnly) ke header
`x-csrf-token` untuk request state-changing; error dinormalisasi ke
`ApiError { status, code, message, fieldErrors }`; `401` memicu
`handleUnauthorized()` yang hanya menandai `sessionExpired` bila status sesi
sebelumnya `authenticated`.

### 2.3 Golden master (`frontend_new/`)

| Area | Pilihan |
| --- | --- |
| Bahasa | TypeScript ~6.0 (strict `tsc -b`) |
| Build | Vite 8 + `@tailwindcss/vite` |
| UI | React 19, Tailwind 4, `@mui/icons-material` |
| Routing | `react-router-dom` v7 |

**Route golden master:** `/login`, `/dashboard`, `/jadwal`, `/scan`,
`/scan/result`, `/riwayat`, `/profil`, `/guru/buat-absen`, `/guru/sesi/:id`,
`/guru/rekap`, `*` (404). Seluruh data **mock**; prototype ini tidak memanggil
API sama sekali (0 penggunaan `fetch`/`axios`). Ia adalah kanvas desain visual
mobile-first: `bg-blue-500` + lembaran putih `rounded-t-[60px]`,
font Plus Jakarta Sans, ikon MUI, bottom nav `bg-blue-100`, status pill
hijau/oranye/abu.

### 2.4 Pola desain visual bersama (hasil fase M0–M5)

Primitif produksi adalah cermin golden master:

| Golden master | Produksi |
| --- | --- |
| `XPadding` | `ContentShell.jsx` |
| `Header` | `BlueHeader.jsx` |
| `Button` | `PrimaryButton.jsx` |
| `SearchBar` | `PillSearch.jsx` |
| `StatusAbsen` | `StatusDot.jsx` |
| `FeatureGrid` | `FeatureGrid.jsx` |
| `BottomNav` | `BottomNav.jsx` |
| `AdSlider` | `BannerCarousel.jsx` |

---

## 3. Alur Development

Bagian ini ditulis sebagai jurnal perkembangan aplikasi dari inisiasi hingga
kondisi repository saat ini, disusun dari riwayat `git log`, dokumen fase
(`docs/PROMPT_GUIDE.md`), dan keputusan yang dikunci di `docs/DECISIONS.md`.
Alur ini adalah **post-mortem** dari proses development yang benar-benar terjadi.

### 3.1 Fase 0 — Inisiasi, Klarifikasi, dan Konsep

Proyek diawali dari kebutuhan pemangku kepentingan (lihat
`docs/.ditulis_sendiri/brief_awal.md`): sebuah aplikasi absensi untuk siswa dan
guru dengan login username/password, scan barcode (QR), status hadir/terlambat /
tidak hadir (dengan menit keterlambatan), rekap Excel, banner event sekolah,
reset password oleh admin, dan pembuatan kelas. Melalui `question_log.md`,
beberapa keputusan dikonfirmasi sejak awal:

- Target = satu sekolah tertentu.
- Seluruh fitur Siswa/Guru/Admin masuk MVP.
- Monolith, single repository.
- **Definition of Done** mencakup unit test, integration test, dan dokumentasi.
- Aturan 15 menit dikonfirmasi: scan dari 15 menit sebelum jam mulai hingga
  tepat 15 menit setelah jam mulai = **Hadir**; setelah itu = Terlambat.

Dari titik ini disusun `docs/PRD.md` (problem statement, persona, user stories,
fitur roadmap, constraints teknis, data model sketch, edge cases) serta
`backend/GUIDE.md` dan `frontend/GUIDE.md` sebagai kontrak teknis dua sisi.

### 3.2 Fase Backend — B0 sampai B9 (urutan commit `b2`…`b9`)

Strategi yang dipakai: **backend selesai lebih dulu sebagai sumber kebenaran**,
kontrak API dikunci, aturan bisnis dibuktikan lewat test, baru frontend
dibangun di atas API yang stabil. Fase backend mengikuti urutan di
`docs/PROMPT_GUIDE.md` §4:

- **B0 — Bootstrap:** `backend/package.json`, `app.js` factory tanpa `listen`
  (dependency-injected, mudah dites), `server.js` dengan graceful shutdown,
  env tervalidasi Zod, Prisma singleton, pino logger + redaction, request ID,
  error handler terpusat, health routes `/health/live` + `/health/ready`,
  rate limit, CORS allowlist, Helmet.
- **B1 — Database:** `prisma/schema.prisma` memuat `users`,
  `student_profiles`, `teacher_profiles`, `education_levels`, `classes`,
  `subjects`, `class_students`, `teacher_assignments`, `attendance_sessions`,
  `attendance_records`, `banners`. Unique constraint `(session_id, student_id)`
  dan index penting dipasang di `migrations/20260917120000_init`. Seed
  idempotent (`prisma/seed.js`) membuat tiga akun demo (`student.demo`,
  `teacher.demo`, `admin.demo`), jenjang SMA, kelas, mapel, membership,
  assignment, satu sesi demo, dan satu banner — tanpa record absensi.
- **B2 — Domain murni:** `src/domain/attendanceStatus.js` —
  `classifyAttendanceScan()` dan `classifyScheduleItem()` menghitung jendela
  15 menit, status, dan menit keterlambatan secara deterministik. Unit test
  boundary di `-15 / 0 / +15 / >+15 / end_at` memperkuat aturan "tepat 15 menit
  masih Hadir".
- **B3 — Auth:** `argon2id` untuk hash, `jose` untuk JWT yang diletakkan di
  cookie HttpOnly, `authenticate` + `authorize(...roles)`, `GET/PATCH /me`,
  forgot-password (email + tanggal lahir), pesan error samar yang tidak
  membocorkan keberadaan akun.
- **B4 — Master akademik, user, banner:** CRUD jenjang/kelas/subjek, manajemen
  user + reset password admin, plotting siswa-guru, dan banner. Scope
  diterapkan di service sebelum query.
- **B5 — Sesi + QR:** Guru membuat sesi hanya dari assignment aktif miliknya;
  QR payload opaque; duplicate → 409; `GET qr` ter-scope.
- **B6 — Scan idempotent:** validasi berurutan (auth → QR payload → session →
  assignment aktif → membership) lalu insert dalam transaction; P2002
  (unique violation) ditangani sebagai response duplicate. Integration test
  membuktikan scan sekuensial dan **konkuren** hanya menghasilkan satu record,
  serta waktu client tidak dipercaya.
- **B7 — History/report:** riwayat siswa, detail kelas guru, laporan global
  admin, dan computed `TIDAK_HADIR` (tidak menyimpan baris baru).
- **B8 — Export XLSX + kontrak:** ExcelJS workbook dengan kolom dan nama file
  sesuai `docs/DECISIONS.md` #7; concurrency guard (2 export paralel);
  `404 NO_DATA_TO_EXPORT`; dokumen `docs/API_CONTRACT.md` + `docs/openapi.yaml`
  disinkronkan dengan route nyata.
- **B9 — Security & release readiness:** review auth, IDOR, CSRF/CORS, rate
  limit, log redaction, dan dokumentasi operasional (`backend/OPERATIONS.md`).

Checkpoint penting antar-fase (dari PROMPT_GUIDE): seluruh boundary test hijau,
test concurrency membuktikan idempotensi, dan **gate backend → frontend**
dicapai sebelum UI dimulai.

### 3.3 Kontrak API dan Fondasi Agent AI

Sebelum frontend, kontrak endpoint dikunci di `docs/API_CONTRACT.md` (927 baris)
— mencakup konvensi global, auth cookie, CSRF, pagination, error contract,
dan deskripsi per endpoint. `docs/openapi.yaml` menjadi spesifikasi yang dapat dibaca mesin. Pada saat yang sama, `AGENTS.md` dan `opencode.json` ditambahkan untuk
menstandarkan cara coding agent bekerja di repository (baca guide dulu, tidak
menebak requirement, laporkan keputusan yang dikunci).

### 3.4 Fase Frontend — F0 sampai F6 (commit `f0`…`f6`)

- **F0 — Fondasi & API client:** React 19 + Vite, router, React Query, Axios
  + cookie credentials, Zustand untuk session saja, react-hook-form + zod,
  Headless UI, error mapping terpusat, ProtectedRoute/RoleRoute, dan
  `.env.example`. Test routing memakai MSW sebagai test double.
- **F1 — Auth, AppShell, profil:** halaman login/forgot-password, shell
  terautentikasi dengan navigasi per role (beranda + profil saja — tanpa item
  mati), logout, profil dengan NIM read-only.
- **F2 — Dashboard/Jadwal/Riwayat siswa:** beranda dengan banner, ringkasan
  absensi hari ini (data dari `GET /attendance/today`), jadwal, riwayat dengan
  filter + pagination, label PRD (`Bisa absen`, `Belum dibuka`, `Selesai`),
  empty/loading/error/offline state.
- **F3 — Scanner QR:** pre-check sesi, permintaan izin kamera **setelah aksi
  pengguna**, `qr-scanner`, fallback input manual kode, satu mutation scan,
  panel hasil dari server (termasuk duplicate), penanganan offline/permission
  denied. Frame 1:1 responsif.
- **F4 — Workspace guru:** penugasan, form buat sesi (offset timezone sekolah),
  halaman QR sesi (QR nyata dari payload backend), detail kehadiran kelas
  (pagination + filter), export XLSX (binary download, nama file dari
  `Content-Disposition`).
- **F5 — Workspace admin:** banner management, users + reset password,
  academic master, plotting (via endpoint read `memberships` &
  `assignments/manage`), laporan global + export. Termasuk **bugfix middleware
  `validate`** — penggantian `req.query`/`req.params` via
  `Object.defineProperty` agar default pagination/filter benar-benar diterapkan
  di Express 5.1.
- **F6 — Quality & integration:** audit aksesibilitas, viewport 320/768/1440,
  keyboard flow, reduced motion, kontras, dan tidak ada PII/token bocor ke
  DOM/console.

### 3.5 Fase Merge UI — M0 sampai M5 (commit `m0`…`m5`)

Titik balik tersendiri: repository memiliki dua frontend, dan proyek memutuskan
`frontend_new/` (prototype eksisting) menjadi **golden master** desain, lalu
visualnya di-merge ke aplikasi produksi `frontend/` tanpa menyentuh business
logic. Rencana ini terdokumentasi di `docs/PLAN_MERGE_UI.md` dan seluruh
keputusan dikunci di `docs/DECISIONS.md` §15–§20:

- **M0 — Keputusan visual (D1–D9):** ikon MUI di kedua proyek, bell notifikasi
  dihapus, search bar beranda jadi filter fungsional, font Plus Jakarta Sans,
  banner carousel golden master menang, label CTA uppercase via CSS, sidebar
  desktop guru/admin dipertahankan dengan palet baru, dan **rebrand nama produk:
  LIMAN → Kak Lia → SINTAS**.
- **M1 — Pangkas golden master:** `frontend_new/` dibatasi jadi prototype fokus
  absen; tab ujian/tryout dihapus; jadwal jadi konteks absen dengan status
  PRD + aksi `Absen sekarang`; bottom nav diaktifkan per role; layar referensi
  baru (scan, hasil, riwayat, profil, buat absen, QR sesi, rekap) memakai pola
  sheet putih.
- **M2 — Token & primitif:** palet golden master dipetakan ke alias di
  `frontend/src/index.css`; primitif presentasi bersama dibuat
  (`ContentShell`, `BlueHeader`, `PrimaryButton`, `StatusDot`, `PillSearch`,
  `FeatureGrid`, `BottomNav`, `BannerCarousel`); AppShell mobile mengikuti pola
  header biru + sheet putih + bottom nav.
- **M3 — Repaint auth & siswa:** halaman login/404/beranda/jadwal/scan/riwayat/
  profil produksi diselaraskan dengan golden master; test tetap hijau.
- **M4 — Repaint guru & admin:** tabel tetap `<table>` semantik direstyle token
  baru; form/dialog memakai label terlihat; QR sesi produksi tetap QR nyata.
- **M5 — Visual regression & release readiness:** `lucide-react` dihapus dari
  produksi; bottom nav 7-item admin scrollable di 320px; sinkronisasi
  aksesibilitas ke golden master; verifikasi parity lintas viewport
  (320/390/768/1440) via screenshot headless Chrome CDP, hasilnya dicatat di
  `docs/PARITY_REPORT.md`.

Commit-commit terakhir menyempurnakan hal operasional:
- Dev HTTPS (`@vitejs/plugin-basic-ssl`) + akses LAN + CORS multi-origin +
  dokumentasi `docs/DEV_INSTRUCTION.md`.
- Perbaikan frame scanner QR (`ebb9d16`) agar proses pemindaian lebih cepat.
- Rebrand penuh ke SINTAS (`163883c`).
- Redirect `/` ke login/dashboard sesuai status sesi (`f45ba1c`).

### 3.6 Ringkasan Timeline Development

```
Inisiasi & klarifikasi (brief_awal, question_log)
   │
   ▼
PRD.md + backend/GUIDE.md + frontend/GUIDE.md
   │
   ▼
Fase Backend  B0 B1 B2 ... B9   → API_CONTRACT.md + openapi.yaml (gate)
   │
   ▼
Fase Frontend F0 F1 ... F6      (auth, siswa, scan, guru, admin, QA)
   │
   ▼
Fase Merge UI M0 ... M5         (golden master → produksi, parity, rebrand)
   │
   ▼
Penyempurnaan opsional (LAN/HTTPS dev, QR scanner, route root)
```

---

## 4. Cara Penggunaan AI

Project ini dikembangkan dengan workflow berbantuan AI yang terbagi dua peran
berbeda — **pemikir** dan **eksekutor** — untuk menjaga kualitas desain dan
disiplin implementasi.

### 4.1 Gemini — Thought Partner (Brainstorming, Desain, Konsep)

Gemini digunakan pada tahap-tahap yang membutuhkan penalaran dan penyusunan
konsep, bukan menulis kode final. Peran spesifiknya:

1. **Brainstorming ide produk.** Menjernihkan kebutuhan sekolah, menyusun
   pertanyaan klarifikasi ke pemangku kepentingan (lihat
   `docs/.ditulis_sendiri/question_log.md` dan `brief_awal.md`), dan menerjemah
   skenario sehari-hari (mis. murid scan dua kali, scan terlalu awal, batch
   siswa 06:45–07:00) menjadi requirement yang bisa diuji.
2. **Merancang struktur database / arsitektur.** Membantu menentukan model
   relasi: `users`, `student_profiles`, `teacher_profiles`, `education_levels`,
   `classes`, `subjects`, `class_students`, `teacher_assignments`,
   `attendance_sessions`, `attendance_records`, `banners`; memutuskan unique
   constraint `(session_id, student_id)`, penanganan satu-kelas-aktif, dan
   strategi `TIDAK_HADIR` computed vs stored.
3. **Mencari tutorial/penjelasan konseptual.** Riset topik seperti window scan
   boundary, normalisasi UTC + timezone IANA, idempotensi request, CSRF dengan
   cookie HttpOnly, dan pola clean architecture Express, sebelum keputusan
   dikunci.

Keluaran Gemini biasanya berupa dokumen keputusan (`docs/DECISIONS.md`),
bagian PRD/guide, atau draf skema yang kemudian dieksekusi secara teknis oleh
OpenCode. Rule penting: **Gemini tidak menulis kode produksi langsung**;
hasil konsep selalu dipastikan kegiatannya (PRD, guide, keputusan) sebelum
coding dimulai.

### 4.2 OpenCode (BigPickle / Deepseek V4.1 Flash via OpenRouter) — Teknis Eksekutor

OpenCode — model **big-pickle** (Deepseek V4.1 Flash via OpenRouter) —
adalah eksekutor teknis yang bekerja langsung di dalam editor. Peran spesifiknya:

1. **Implementasi coding murni.** Menyusun backend (Express factory,
   middleware, controller, service, repository, domain), schema Prisma +
   migration + seed, dan frontend React (routing, guard, query, komponen)
   sesuai panduan yang sudah ada (`AGENTS.md`, `backend/GUIDE.md`,
   `frontend/GUIDE.md`, `docs/PROMPT_GUIDE.md`).
2. **Perbaikan bug (debugging).** Menemukan dan memperbaiki regresi — contoh
   nyata pada repository ini: bugfix middleware `validate` (default pagination
   query tidak terpakai di Express 5.1), frame scanner QR yang memperlambat
   deteksi, dan supaya build/test kembali hijau.
3. **Refactoring di dalam editor.** Menjaga disiplin layering
   (route → middleware → controller → service → repository), memindahkan
   aturan status ke `src/domain/attendanceStatus.js`, menghapus `lucide-react`
   demi parity ikon MUI, dan pemangkasan golden master menjadi fokus absen.

**Aturan kerja lintas alat (dari PROMPT_GUIDE §1–§2):**

- Satu prompt = satu scope yang bisa diuji; jangan meminta seluruh aplikasi
  dalam satu prompt.
- Baca dokumen dan implementasi terdekat **sebelum** mengedit; tuliskan satu
  hipotesis teknis yang dapat diuji dan satu validasi pembeda.
- Jangan mengarang requirement di luar PRD; bila open question muncul, log di
  `docs/DECISIONS.md` — bukan menebak diam-diam.
- Backend memutuskan authorization, waktu, status absensi, dan scope laporan;
  frontend tidak pernah menjadi sumber kebenaran.
- Setelah setiap perubahan yang dapat diuji, jalankan lint/test paling sempit
  yang relevan; update dokumentasi/kontrak bila perilaku berubah.
- Di akhir pekerjaan, laporkan: file yang berubah, command yang dijalankan,
  hasil test, risiko, dan pertanyaan yang tersisa.

**Ringkasan pembagian peran:**

| Tahap | Alat | Tanggung jawab |
| --- | --- | --- |
| Brainstorming, PRD, desain DB, keputusan produk | Gemini | Konsep, struktur, riset, dokumen keputusan |
| Setup repo, schema/migration, API backend, frontend, test, lint, bugfix, refactor | OpenCode (BigPickle via OpenRouter) | Eksekusi kode nyata di dalam editor |

---

## 5. Rencana Deployment & Konfigurasi Infrastruktur

Berdasarkan pertimbangan arsitektur aplikasi (SPA statis + REST API monolith)
dan kebutuhan operasional (kamera QR membutuhkan HTTPS, skala burst scan
06:45–07:00, kontrol penuh atas environment), berikut rencana rilis yang
disepakati.

### 5.1 Arsitektur Target

```text
                          ┌─────────────────────┐
  Siswa/Guru/Admin  ────► │      Cloudflare      │  DNS, Proxy, WAF, SSL/TLS
                          └──────────┬──────────┘
                                     │ (HTTPS)
                    ┌────────────────┴─────────────────┐
                    ▼                                  ▼
        ┌────────────────────────┐        ┌────────────────────────┐
        │   FRONTEND (SPA)       │        │   BACKEND (REST API)    │
        │   Vercel (edge CDN)    │        │   VPS (Node/Express)    │
        │   app.sintas.id        │◄──────►│   api.sintas.id         │
        └────────────────────────┘        └────────────┬───────────┘
                                                       ▼
                                                  MySQL 8 (di VPS)
```

### 5.2 Frontend — Deploy ke Vercel

**Alasan:** memanfaatkan CI/CD otomatis Vercel, performa edge CDN untuk aset
statis, HTTPS built-in, dan kemudahan rollback per deployment. Frontend adalah
SPA (React + Vite) tanpa server logika, sehingga sangat cocok untuk model
deploy statis.

**Konfigurasi:**
- Repo dihubungkan ke Vercel; `Root Directory` = `frontend/`.
- Build command: `npm run build`; output: `dist/`; framework preset: Vite.
- Environment variables:
  - `VITE_API_BASE_URL=https://api.sintas.id/api/v1` (URL publik backend).
  - `VITE_SCHOOL_TIMEZONE=Asia/Jakarta`.
- **Rewrites SPA:** konfigurasi `rewrites` agar `frontend/*` mengarah ke
  `/index.html` (React Router handle `*` → NotFoundPage).
- Cookie auth `auth_token` bersifat HttpOnly + `SameSite=Lax`; karena frontend
  (Vercel) dan backend (api.sintas.id) **cross-origin**, cookie harus
  `Secure` dan opsi `SameSite` disesuaikan saat produksi; alternatif yang lebih
  aman adalah **Vercel Rewrites/Proxy** untuk `/api/*` → `https://api.sintas.id`
  agar frontend dan API terlihat same-origin (pola yang sudah dipakai di
  `frontend/vite.config.js` saat development).

### 5.3 Backend — Deploy ke VPS

**Alasan:** kontrol penuh atas environment (Node version, MySQL, pool
connection), resource server, log, dan proses yang berjalan lama; backend adalah
satu-satunya pemegang aturan bisnis dan akses database sehingga stabilitas dan
isolasi resource menjadi prioritas.

**Komponen di VPS:**
- **Node.js LTS** menjalankan `backend/` (`npm run start` → `node src/server.js`,
  port `3000`) dikelola **Process Manager** (mis. PM2/systemd) agar auto-restart
  saat crash/reboot.
- **Reverse proxy** (mis. Nginx/Caddy) di depan Express:
  - Serve HTTPS (`TLS` dari Cloudflare origin atau Let's Encrypt).
  - Forward `api.sintas.id` → `127.0.0.1:3000`.
  - Batasi body size, set timeouts, dan gzip.
- **MySQL 8** sebagai database; user database **least-privilege** terpisah;
  backup otomatis + verifikasi restore (lihat `backend/OPERATIONS.md`).
- **Proses rilis:**
  1. `npm ci` → `npm run lint` → `npm test`.
  2. `npm run prisma:generate`.
  3. `npx prisma migrate deploy` (sebelum traffic menerima schema baru).
  4. Restart service; verifikasi `/health/live` dan `/health/ready`.
  5. Smoke test (login, scan, riwayat, export `.xlsx`).
- **Environment (VPS)** wajib diatur — validasi `src/config/env.js` menolak
  nilai dev di production:
  - `NODE_ENV=production`, `DATABASE_URL` (MySQL production),
    `JWT_SECRET` (panjang ≥32 karakter, **bukan** default),
    `CORS_ORIGIN=https://app.sintas.id` (tanpa localhost),
    `SCHOOL_TIMEZONE=Asia/Jakarta`, `SCAN_RATE_LIMIT`, `LOG_LEVEL`.
- **Validasi burst scan:** sebelum traffic produksi, jalankan load test
  simulasi 06:45–07:00 (valid scan, retry, duplicate, invalid QR, concurrent
  scan) untuk mengukur response time, 429 rate, dan pool saturation —
  requirement wajib dari `backend/OPERATIONS.md`.

### 5.4 Domain & Keamanan — Cloudflare

**Alasan:** Cloudflare menjadi satu gerbang untuk DNS management, proxying
domain/subdomain, implementasi SSL/TLS, serta proteksi lapis tambahan (WAF,
rate limiting, bot protection).

**Konfigurasi:**
- **DNS:**
  - `app.sintas.id`  (A / CNAME) → Vercel.
  - `api.sintas.id`  (A) → IP VPS.
- **Proxy mode:** aktifkan Oranye (proxied) untuk kedua subdomain agar traffic
  melewati edge Cloudflare.
- **SSL/TLS:** mode `Full (strict)` — Cloudflare ↔ origin memakai sertifikat
  origin (Let's Encrypt/Caddy), origin menolak koneksi non-HTTPS bila perlu.
- **CRLF/JWKS tidak digunakan** — SINTAS memakai JWT dengan secret bersama dan
  cookie HttpOnly; pastikan `JWT_SECRET` hanya hidup di environment VPS,
  bukan di frontend.
- **Header keamanan:** Helmet di backend (`X-Content-Type-Options`,
  `X-Frame-Options`, CSP) ditambah aturan header di Cloudflare bila diperlukan.
- **Origin locking:** firewall VPS hanya menerima port 80/443 dari IP
  Cloudflare; backend tidak perlu terbuka langsung ke publik.
- **CORS:** `CORS_ORIGIN` hanya memuat domain frontend produksi (mis.
  `https://app.sintas.id`); jangan pernah `*` karena auth cookie
  (`backend/src/config/env.js` menolak `localhost` di production).

### 5.5 Checklist Release

- [ ] Migrasi Prisma diterapkan dan verified sebelum traffic.
- [ ] `.env` production lengkap; dev secret/localhost origin ditolak Zod.
- [ ] `/health/live` + `/health/ready` hijau di lingkungan produksi.
- [ ] SSL/TLS active end-to-end (Cloudflare → Vercel / VPS origin).
- [ ] Cookie `Secure; HttpOnly; SameSite` konsisten untuk cross-origin Vercel.
- [ ] Backup MySQL terkonfigurasi + prosedur rollback terdokumentasi
      (`backend/OPERATIONS.md`).
- [ ] Load test burst scan 06:45–07:00 lulus dengan metrik tercatat.
- [ ] Build production frontend & lint backend hijau; 88 test frontend dan
      71 test backend hijau.

---

## Lampiran — Peta Dokumen Referensi

| Dokumen | Isi |
| --- | --- |
| `docs/PRD.md` | Requirement produk lengkap, data model sketch, edge cases |
| `docs/DECISIONS.md` | Keputusan teknis terkunci (D1–D20, M0–M5) |
| `docs/DESIGN_BRIEF.md` | Bahasa visual, token warna/radius/typography |
| `docs/PLAN_MERGE_UI.md` | Kontrak visual "sama persis" golden master ↔ produksi |
| `docs/PARITY_REPORT.md` | Laporan verifikasi parity lintas viewport (M5) |
| `docs/API_CONTRACT.md` | Kontrak API per-endpoint (sumber kebenaran) |
| `docs/openapi.yaml` | Spesifikasi OpenAPI untuk endpoint |
| `docs/PROMPT_GUIDE.md` | Rencana bertahap + checkpoint pengembangan berbasis AI |
| `docs/DEV_INSTRUCTION.md` | Panduan run lokal, HTTPS dev, akses LAN, troubleshooting |
| `backend/GUIDE.md` | Arsitektur & aturan backend |
| `backend/OPERATIONS.md` | Runbook deployment, backup, rollback, load test |
| `frontend/GUIDE.md` | Arsitektur & aturan frontend produksi |
| `frontend_new/plan.md` | Peran golden master, struktur folder, metode folder |