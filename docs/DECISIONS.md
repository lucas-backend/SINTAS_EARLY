# Technical Decisions

Dokumen ini mengunci keputusan yang menjadi prasyarat migration dan implementasi. `BLOCKED` berarti PRD dan Backend Guide belum memberi dasar yang cukup untuk memilih; implementasi tidak boleh menebak keputusan tersebut.

## 1. Timezone sekolah dan normalisasi UTC

**Status: DECIDED.**

- **Pilihan final:** Simpan seluruh timestamp sebagai UTC di database. Gunakan timezone sekolah berbasis IANA yang configurable dari environment/configuration, lalu konversi pada boundary service dan response API. `start_at`, `end_at`, `session_date`, periode banner, dan tampilan laporan harus memakai timezone sekolah; waktu scan berasal dari server dan dinormalisasi ke UTC.
- **Alasan:** Ini diwajibkan oleh Backend Guide dan konsisten untuk deployment multi-instance. Nilai timezone spesifik sekolah belum disebutkan di PRD.
- **Dampak database/API/UI:** Database menyimpan timestamp UTC; konfigurasi wajib divalidasi sebagai timezone IANA. API menerima/mengembalikan waktu dengan kontrak timezone yang jelas. UI menampilkan waktu lokal sekolah dan tidak menghitung status absensi sendiri.
- **Keputusan operasional:** Nilai default deployment MVP adalah `Asia/Jakarta`; `session_date` ditafsirkan menurut timezone sekolah dan perubahan timezone hanya berlaku untuk sesi baru.

## 2. Satu kelas aktif per siswa

**Status: DECIDED.**

- **Pilihan final:** Seorang siswa hanya boleh memiliki satu `class_students` aktif pada satu waktu.
- **Alasan:** Ini mencegah scope kelas yang ambigu pada scan dan laporan.
- **Dampak database/API/UI:** Validasi service plotting, query kelas aktif, authorization scan, dan UI admin memakai satu membership aktif per siswa.
- **Dampak implementasi:** Service plotting menolak membership aktif kedua; perpindahan kelas dilakukan dengan menonaktifkan membership lama terlebih dahulu.

## 3. Sesi absensi duplikat

**Status: DECIDED.**

- **Pilihan final:** Pembuatan sesi dengan assignment, tanggal, dan pasangan waktu yang sama ditolak dengan HTTP `409` dan code `DUPLICATE_ATTENDANCE_SESSION`.
- **Alasan:** PRD dan Backend Guide secara eksplisit menyediakan dua perilaku dan meminta pilihan produk sebelum implementasi.
- **Dampak database/API/UI:** Unique constraint/index menjadi perlindungan terakhir; API mengembalikan conflict tanpa data session existing. Guru hanya dapat membaca session dari assignment aktif miliknya, sedangkan Admin dapat membaca metadata seluruh session.
- **Asumsi yang masih perlu dikonfirmasi:** Tidak ada untuk scope attendance session ini.

## 4. Finalisasi `TIDAK_HADIR`

**Status: DECIDED.**

- **Pilihan final:** Status `TIDAK_HADIR` dihitung saat history/report dibuka jika waktu server sudah melewati `end_at` dan siswa merupakan anggota aktif kelas sesi. Sistem tidak membuat atau mengubah `attendance_records` untuk status ini.
- **Alasan:** Tidak ada worker/scheduler pada MVP; computed status memberi satu sumber kebenaran tanpa menambah proses operasional atau row duplikat.
- **Dampak database/API/UI:** `attendance_records` hanya berisi scan. History/report menggabungkan record scan dengan status computed dan mengembalikan bentuk item yang sama. Status dapat berubah dari belum muncul menjadi `TIDAK_HADIR` setelah sesi selesai.
- **Asumsi yang masih perlu dikonfirmasi:** Membership aktif saat query menjadi dasar eligibility historis karena model belum memiliki effective date; perubahan membership historis dapat memengaruhi laporan lama.

## 5. Format dan periode banner

**Status: DECIDED.**

- **Pilihan final:** Banner mendukung judul dan minimal salah satu dari `imageUrl` atau `content`; periode tampil opsional; beberapa banner aktif diperbolehkan dan endpoint hanya menampilkan banner aktif dalam periode.
- **Alasan:** Ini sesuai field model dan validasi yang sudah tersedia tanpa menambahkan upload/storage baru.
- **Dampak database/API/UI:** Model memakai `title`, `image_url` atau `content`, `is_active`, `display_start_at`, dan `display_end_at`; validasi field dan filter periode menjadi kontrak API.
- **Dampak implementasi:** Media tetap berupa URL/path; binary upload dan pembatasan jumlah banner tidak termasuk MVP.

## 6. Password minimum dan reset manual Admin

**Status: DECIDED.**

- **Pilihan final:** Password minimal 8 dan maksimal 128 karakter, di-hash Argon2id. Forgot-password memakai email + tanggal lahir untuk semua role, termasuk Admin; reset manual Admin di luar endpoint MVP dan tidak menambahkan password sementara.
- **Alasan:** Argon2id diwajibkan oleh Backend Guide, tetapi PRD hanya menyebut validasi password baru/konfirmasi dan menanyakan detail reset manual.
- **Dampak database/API/UI:** Schema validasi password dan pesan form mengikuti batas 8-128 karakter; audit trail, kewajiban ganti password, dan kanal kredensial tidak ditambahkan pada MVP.
- **Dampak implementasi:** Tidak ada aturan reuse/expiry atau kanal pengiriman kredensial baru pada MVP.

## 7. Kolom dan nama file export XLSX

**Status: DECIDED untuk MVP.**

- **Pilihan final:** Guru dan Admin mengekspor kolom `Tanggal sesi`, `Kelas`, `Mata pelajaran`, `Nama siswa`, `NIM`, `Status`, `Menit terlambat`, dan `Waktu scan`. Data memakai filter report yang sama dan diurutkan berdasarkan tanggal sesi terbaru. Timestamp ditampilkan dalam timezone sekolah.
- **Pilihan final:** Nama file adalah `laporan-kehadiran-{from}-{to}.xlsx`, dengan tanggal `YYYYMMDD`; nilai yang tidak difilter memakai `awal` dan `akhir`. Export tanpa baris mengembalikan `404 NO_DATA_TO_EXPORT`.
- **Alasan:** Kolom adalah minimum yang dibutuhkan PRD untuk rekap kelas/global dan tidak menyertakan password, token, QR payload, atau tanggal lahir. Nama file stabil dan rentang filter terlihat.
- **Dampak database/API/UI:** Authorization dan filter diterapkan sebelum query; endpoint mengembalikan `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` dengan `Content-Disposition: attachment`. NIM dianggap identitas akademik yang diperlukan untuk rekap dan bukan secret.
- **Asumsi yang masih perlu dikonfirmasi:** Konfirmasi sekolah bahwa NIM boleh berada di file export dan bahwa empty export berbentuk error terstruktur lebih sesuai daripada workbook header-only.

## 8. Login dan lupa password Admin

**Status: DECIDED.**

- **Pilihan final:** Admin memakai endpoint login yang sama dan boleh memakai forgot-password yang sama.
- **Alasan:** Login untuk tiga role diwajibkan, tetapi user story lupa password secara eksplisit menyebut Siswa dan Guru; PRD kemudian menanyakan perlakuan Admin sebagai open question.
- **Dampak database/API/UI:** Auth service, role policy, rate limit, dan pesan error memakai kontrak yang sama untuk Admin, Siswa, dan Guru.
- **Dampak implementasi:** Eligibility reset mengikuti seluruh user role; pesan tetap generik agar tidak membocorkan identitas.

## 9. Retensi data absensi

**Status: DECIDED untuk MVP.**

Record absensi tidak dihapus otomatis dan tidak ada endpoint penghapusan pada MVP. Retensi backup dan penghapusan manual mengikuti kebijakan deployment sekolah; prosedurnya wajib diaudit sebelum perubahan destruktif.

## 10. Endpoint jadwal siswa "bisa absen" hari ini

**Status: DECIDED.**

- **Pilihan final:** Tambahkan endpoint read-only `GET /api/v1/attendance/today` khusus STUDENT yang mengembalikan sesi pada tanggal kalender sekolah hari ini (berdasarkan waktu server dan `SCHOOL_TIMEZONE`, bukan jam client) untuk satu kelas aktif siswa, hanya dari assignment aktif. Setiap item memuat metadata sesi plus status yang **dihitung server**:
  - `windowStatus`: `BELUM_DIBUKA` (sebelum `startAt - 15 menit`), `BISA_ABSEN` (di dalam jendela `startAt - 15 menit` sampai `endAt`, inklusif), atau `SELESAI` (setelah `endAt`).
  - `attendanceStatus`: status record yang sudah ada (`HADIR`/`TERLAMBAT`), atau `TIDAK_HADIR` computed hanya jika sesi telah selesai tanpa record (konsisten D4), atau `null` bila sesi belum selesai dan belum discan.
  - `scanned`: boolean — jawaban langsung "apakah saya sudah absen?" untuk ringkasan beranda.
  - Urutan `startAt` naik; tanpa pagination; tanpa parameter query (hanya hari ini, tanggal kalender sekolah).
- **Alasan:** Beranda dan time rail siswa (DESIGN_BRIEF S1/S2, PRD FR-06) butuh status "Bisa absen"/"Belum dibuka"/"Selesai" dan status hari ini tanpa membiarkan client menghitung aturan window atau timezone. Ini menutup open item API_CONTRACT lama ("belum ada endpoint jadwal siswa aktif hari ini") dengan kontrak ringan yang tidak membaca data siswa lain.
- **Dampak database/API/UI:** Tidak ada migration. Repository menambah satu query `attendanceSession` yang disaring `sessionDate` == tanggal sekolah hari ini, `assignment.isActive`, dan membership aktif kelas siswa (satu kelas aktif, D2). Frontend menyusun `Jadwal terdekat` / `Absensi hari ini` dari response ini; label UI `Hadir`, `Terlambat`, `Tidak Hadir`, `Bisa absen`, `Belum dibuka`, `Selesai`.
- **Asumsi yang masih perlu dikonfirmasi:** Rentang lebih dari satu hari (mis. "Besok" pada jadwal) tidak disediakan MVP; cukup memperluas kontrak bila product meminta date-range. Metadata guru (`teacherName`) diikutsertakan karena tampilan jadwal menampilkan guru (DESIGN_BRIEF S2), bukan untuk kontrol akses.

## 11. Konvensi sesi dan guard frontend (F0)

**Status: DECIDED.**

- **Pilihan final:** Session store (Zustand) hanya menyimpan user sanitized, `status` (`loading`/`authenticated`/`unauthenticated`), dan `sessionExpired`. Semua server state tinggal di React Query. Axios menyalin nilai cookie `csrf_token` (non-HttpOnly) ke header `x-csrf-token` untuk request state-changing; error dinormalisasi ke `ApiError { status, code, message, fieldErrors }`. Response `401` memicu `handleUnauthorized()` yang hanya menandai sesi berakhir bila status sebelumnya `authenticated` (agar kegagalan login tidak mengumbar pesan "sesi berakhir").
- **Dampak UI:** `ProtectedRoute` menunggu `loading` sebelum menampilkan halaman; tanpa user diarahkan ke `/login`; `RoleRoute` menampilkan halaman akses ditolak untuk role yang tidak cocok. `/app` me-redirect ke beranda role (`/app/student|teacher|admin`). Pesan `sessionExpired` ditampilkan di halaman login saat sesi benar-benar berakhir.
- **Dampak implementasi:** Test routing memakai MSW sebagai test double (diizinkan GUIDE: rute publik dan protected diuji tanpa server eksternal); bukan mock API runtime. `.env.example` minimal `VITE_API_BASE_URL` dan `VITE_SCHOOL_TIMEZONE`; `.env*` di-gitignore.

## 12. Scope navigasi app shell frontend (F1)

**Status: DECIDED untuk MVP.**

- **Pilihan final:** Navigasi per role pada fase F1 hanya memuat halaman yang benar-benar tersedia: `Beranda` dan `Profil`. Item navigasi berikutnya (jadwal/riwayat untuk Siswa, sesi/QR untuk Guru, banner/pengguna/kelas/laporan untuk Admin) ditambahkan seiring fase fitur yang menyediakan halaman tersebut, bukan sebagai placeholder mati.
- **Alasan:** DESIGN_BRIEF melarang layar buntu dan tombol tanpa hasil tindakan; menampilkan item navigasi ke halaman yang belum ada akan menghasilkan dead-end. Scope fase F1 (auth, app shell, app bar, role navigation, logout, profile) hanya menghadirkan dua halaman tersebut.
- **Dampak database/API/UI:** `roleNav(role)` di `frontend/src/lib/permissions.js` adalah sumber daftar navigasi per role. `RoleRoute` memakai `Outlet` agar sub-route per role (index dashboard + `profile`) tersarang di dalam shell. Profil siswa menampilkan NIM sebagai read-only (PRD FR-03); username dan NIM tidak pernah dikirim ke `PATCH /me`.
- **Asumsi yang masih perlu dikonfirmasi:** Tidak ada keputusan produk baru; hanya pembatasan tampilan sesuai ketersediaan fase.

## 13. Workspace guru dan keputusan UI penunjang (F4)

**Status: DECIDED untuk MVP.**

- **Pilihan final:** Navigasi guru diperluas sesuai D12 dengan `Penugasan` dan `Sesi absensi` seiring halaman terkait tersedia. Alur utama guru: beranda → (daftar penugasan/daftar sesi) → form buat sesi → halaman QR sesi → detail kehadiran kelas → export XLSX.
- **Pilihan final (form):** Form buat sesi mengirim `{ assignmentId, sessionDate, startAt, endAt, timezone }` persis kontrak `POST /attendance-sessions`; `startAt`/`endAt` dibentuk sebagai ISO 8601 **dengan offset timezone sekolah** (`VITE_SCHOOL_TIMEZONE`), bukan timestamp client. Setelah berhasil membuat sesi, pengguna langsung diarahkan ke halaman QR sesi tersebut (langkah kerja berikutnya paling natural); daftar sesi hanya menampilkan sesi milik guru yang login sesuai scope backend.
- **Pilihan final (kehadiran & export):** Detail kehadiran kelas memakai paging + filter `from`/`to`/`status` dari server. Export mengeksekusi `GET /reports/attendance/export?classId=...` (guru selalu mengirim scope kelas), menyimpan binary response sebagai file dengan nama dari `Content-Disposition` (`laporan-kehadiran-{from}-{to}.xlsx`); nama fallback hanya dipakai bila header tidak ada. Error export dalam bentuk `404 NO_DATA_TO_EXPORT` / `429 EXPORT_BUSY` ditampilkan di UI memakai kontrak JSON yang dibaca ulang dari body Blob.
- **Alasan:** Semua tampilan guru dikonsumsi dari kontrak backend yang sudah ada; frontend tidak menghitung role, waktu, status absensi, ataupun scope query — menghindari duplikasi aturan bisnis dan memenuhi aturan "scan-path constraint" yang dilarang dibebani query laporan.
- **Dampak database/API/UI:** Tidak ada perubahan backend. UI menambahkan `frontend/src/features/teacher/`, `src/schemas/session.js`, halaman `pages/teacher/*`, service `academicService` (penugasan guru) serta perluasan `attendanceService` (sesi, QR, detail kelas, export), dan error mapping untuk `ASSIGNMENT_FORBIDDEN`, `INVALID_TIMEZONE`, `INVALID_DATETIME`, `INVALID_TIME_RANGE`, `INVALID_SESSION_DATE`.
- **Asumsi yang masih perlu dikonfirmasi:** Format offset timezone yang dikirim form (`+07:00` untuk Asia/Jakarta tanpa DST) cukup untuk MVP; wallpaper jam dengan DST tetap dihitung console boundary (backend menilai via timezone IANA). QR demo dari seed tidak dapat dipindai (payload non-kontrak, hanya untuk pengisian data).

## 14. Workspace admin dan perbaikan middleware validasi query (F5)

- **Pilihan final (endpoint):** Workspace admin (F5) memakai endpoint backend yang
  sudah ada (users, education-levels, classes, subjects, reports/export, banners,
  attendance-sessions) ditambah TIGA penambahan read-only/query kecil:
  1. `GET /api/v1/academic/memberships` (ADMIN, paginated, filter `classId`) —
     listing penempatan siswa untuk halaman Plotting.
  2. `GET /api/v1/academic/assignments/manage` (ADMIN, paginated, filter
     `teacherId`) — listing penugasan guru untuk halaman Plotting; sengaja
     dipisah path dari `GET /academic/assignments` (TEACHER-only, behavior tidak
     diubah).
  3. `GET /api/v1/banners/manage` kini ter-paginasi + filter `isActive`/
     `search` (schema `bannerListSchema`) agar tabel admin tidak perlu menarik
     seluruh banner sekaligus.
- **Pilihan final (bugfix middleware):** `validate` sekarang mengganti
  `req.query`/`req.params` dengan data hasil parse via `Object.defineProperty`.
  Versi lama memakai `Object.assign(req.query, ...)` yang pada Express 5.1
  tidak bertahan (getter query mengembalikan objek baru), sehingga default
  `page`/`limit`/`sort`/`order` dan semua filter query **tidak pernah
  diterapkan** pada seluruh endpoint list (academic, users, banners, report).
  Perbaikan ini mengaktifkan filter/pagination yang selama ini diam; tidak ada
  perubahan kontrak response.
- **Alasan:** Frontend tidak pernah menjadi sumber kebenaran scope/filter; semua
  pemfilteran dan pagination dibatasi allowlist query schema backend
  (strict) sehingga parameter tak dikenal ditolak `400 VALIDATION_ERROR`.
  Dashboard admin tidak menambah endpoint analitik baru di luar PRD — ringkasan
  memakai data dari endpoint list yang ada (meta.total) + sesi hari ini.
- **Dampak database/API/UI:** Tidak ada migration. `docs/API_CONTRACT.md` dan
  `docs/openapi.yaml` diperbarui. UI menambah `frontend/src/features/admin/`,
  `pages/admin/*`, `userService`, perluasan `academicService`/`bannerService`/
  `attendanceService`, `ConfirmDialog` + `Pagination`, dan `clearUserScopedCache`
  untuk prefix users/banners/academic/reports.

## 15. Keputusan visual merger dua frontend (M0)

**Status: DECIDED — fase M0 `PLAN_MERGE_UI.md`.**

Golden master (`frontend_new/`) adalah sumber keputusan visual; `frontend/` menirunya secara persis. Keputusan D1–D8 ini mengunci kontrak visual bagian 3 `PLAN_MERGE_UI.md` sebelum coding dan menyelaraskan `DESIGN_BRIEF.md` (bagian Visual Direction & Design Tokens). Implementasi (M1–M5) hanya mengubah lapisan presentasi; tidak ada perubahan business logic.

### D1 — Ikon: MUI Material icons di kedua proyek

**Status: DECIDED.**

- **Pilihan final:** Pakai MUI Material icons (`@mui/icons-material`) di **kedua** proyek. `frontend/` menambahkan dependency `@mui/icons-material` dan mengganti impor `lucide-react` pada seluruh lapisan presentasi yang meniru golden master (`lucide-react` dihapus seiring fase M2–M5).
- **Alasan:** Kontrak "sama persis" (invariant #11) menuntut bentuk glyph identik; glyph MUI khas dan menjadi bagian dari identitas visual golden master. Ini meng-override pilihan `lucide-react` pada `frontend/GUIDE.md` bagian 2 (wajib dicatat).
- **Dampak database/API/UI:** Tidak ada dampak database/API. UI: `frontend/package.json` + lockfile bertambah; semua komponen presentasi yang dipetakan mengganti import ikon; setiap ikon yang menyampaikan aksi/status tetap wajib punya accessible name (aturan GUIDE berlaku).
- **Asumsi:** Penambahan ukuran bundle akibat MUI icons dapat diterima MVP; ikon golden master yang tidak punya padanan MUI di `frontend/` dicatat, bukan diganti diam-diam.

### D2 — Bell notification di header beranda

**Status: DECIDED.**

- **Pilihan final:** Hapus bell notification dari golden master (`DashboardHeader.tsx`); tombol aksi bulat putih kanan diisi aksi navigasi Profil. Bell tidak tampil di kedua proyek.
- **Alasan:** PRD meniadakan fitur notifikasi (frontend GUIDE bagian 1); bell tanpa fungsi adalah dead element yang dilarang DESIGN_BRIEF. Menghapus dari golden master menjamin parity karena kedua proyek mengikuti golden master.
- **Dampak database/API/UI:** Tidak ada dampak backend. UI: `DashboardHeader.tsx` mengganti `NotificationsNoneRoundedIcon` dengan ikon aksi profil; invariant #4 (satu tombol aksi bulat putih `w-8 h-8` di kanan) tetap terjaga.
- **Asumsi:** Aksi header kanan cukup satu tombol (menuju Profil), bukan dua tombol.

### D3 — Search bar di beranda: filter fungsional

**Status: DECIDED.**

- **Pilihan final:** Pertahankan search bar pill di beranda sebagai filter yang **benar-benar berfungsi**: menyaring item Feature Grid dan baris jadwal terdekat yang sudah dimuat. Golden master (fase M1) mengisi perilaku filter mock; `frontend/` memfilter data nyata sisi client (item yang sudah ada di halaman), bukan menambah endpoint.
- **Alasan:** Menghindari dead element (DESIGN_BRIEF melarang UI tanpa tindakan). Ini meng-override larangan "Search di Beranda" pada DESIGN_BRIEF 2.3 karena kebutuhan filter kini nyata (grid fitur multi-role + jadwal terdekat).
- **Dampak database/API/UI:** Tidak ada endpoint baru; tidak ada request server untuk fitur ini. UI menambah state `search` lokal di beranda; placeholder golden master "Cari Fitur" menjadi fungsional di M1.
- **Asumsi:** Scope filter terbatas pada konten beranda (grid fitur + jadwal terdekat), bukan pencarian global lintas-route; bila produk ingin search global, itu keputusan baru (dicatat, bukan ditebak).

### D4 — Font: Plus Jakarta Sans di kedua proyek

**Status: DECIDED.**

- **Pilihan final:** Plus Jakarta Sans dipakai di **kedua** proyek. `frontend/` sudah memakainya (`--font-sans` di `src/index.css`); golden master menambahkan font (link `index.html` + `--font-sans` di `src/index.css`) pada fase M1.
- **Alasan:** DESIGN_BRIEF (3.2) menjadikan Plus Jakarta Sans font wajib; parity typography (invariant #12) butuh keluarga font yang sama di kedua proyek.
- **Dampak database/API/UI:** Tidak ada dampak backend. UI golden master: `index.html` menambah `<link>` font + theme font-family; ukuran tetap memakai skala Tailwind `text-xs`…`text-6xl`.
- **Asumsi:** Sumber font Google Fonts CDN dapat diterima; fallback `ui-sans-serif/system-ui` dipakai saat offline (sama di kedua proyek). Keputusan self-host font bila diperlukan adalah keputusan terpisah.

### D5 — Banner: carousel golden master menang

**Status: DECIDED.**

- **Pilihan final:** Golden master menang: banner memakai carousel dengan tombol panah prev/next (`AdSlider`), direplikasi sebagai `BannerCarousel` di `frontend/`. Pilihan "satu banner aktif + indikator" di DESIGN_BRIEF 2.3 di-override.
- **Alasan:** Kontrak "sumber keputusan visual = golden master" (PLAN bagian 1) dan PRD memperbolehkan beberapa banner aktif (DECISIONS #5) — carousel memberi akses ke semua banner aktif. Panah di golden master sudah ber-`aria-label` dan `disabled` state.
- **Dampak database/API/UI:** Tidak ada perubahan backend; kontrak banner tetap (`title`, `imageUrl`/`content`, `is_active`, periode tampil). UI `frontend/` menampilkan daftar banner aktif dalam carousel.
- **Asumsi:** Tanpa autoplay pada MVP (PRD tidak meminta; menghormati `prefers-reduced-motion`); indikator posisi opsional bila produk minta (keputusan baru, bukan ditebak).

### D6 — All-caps tombol CTA primary

**Status: DECIDED.**

- **Pilihan final:** Golden master menang: label tombol CTA primary ditulis uppercase (mis. `MASUK`) di kedua proyek. Aturan sentence case pada DESIGN_BRIEF (2.3, 3.2) di-override khusus untuk label tombol aksi; teks selain tombol tetap sentence case.
- **Alasan:** Parity visual persis (kontrak bagian 3); golden master adalah sumber keputusan visual. Perubahan hanya pada label tombol, bukan seluruh copy.
- **Dampak database/API/UI:** Tidak ada. UI: tombol primary di kedua proyek memakai label uppercase (mis. `MASUK` dan pola serupa untuk CTA sejenis); istilah status PRD (`Hadir`, `Terlambat`, `Tidak Hadir`) tetap capitalisasi normal.
- **Asumsi:** Keterbacaan (legibility) semua-caps diterima untuk label aksi pendek; penerapan uppercase secara literal di string (parity) — bila dipakai CSS `uppercase`, string aksesibel/DOM tetap normal. Kontras white-on-`blue-500` untuk tombol divalidasi saat token diaplikasikan (lihat risiko di bawah).

### D7 — App shell desktop Guru/Admin

**Status: DECIDED untuk MVP.**

- **Pilihan final:** Desktop Guru/Admin di `frontend/` mempertahankan sidebar `lg:` yang sudah ada, diwarnai ulang dengan palet/token golden master (keluarga `blue-500`). Golden master belum memiliki referensi sidebar; parity penuh desktop ditangguhkan hanya untuk area yang belum ada referensinya. Mobile selalu mengikuti pola golden master (latar `bg-blue-500` + lembaran putih + bottom nav).
- **Alasan:** MVP fokus mobile-first; membuat referensi sidebar baru di golden master memperluas scope M0. Sesuai opsi (a) PLAN bagian 11.
- **Dampak database/API/UI:** Tidak ada. UI: `AppShell` desktop memakai token baru; struktur sidebar yang ada tidak berubah (bukan menyalin JSX golden master).
- **Asumsi:** Bila produk menuntut sidebar yang sama persis, dilakukan sebagai fase lanjutan dengan alur kerja PLAN bagian 2 (buat referensi di golden master dulu, lalu rontok).

### D8 — Branding "LIMAN" → "Kak Lia"

**Status: DECIDED.**

- **Pilihan final:** Ganti branding golden master dari "LIMAN" menjadi "Kak Lia": `src/features/login/Login.tsx` (`appName`), `index.html` (`title` + `lang="id"`), `package.json` `name`, dan judul `doc/Struktur_Folder.md`. `frontend/` (produksi) tetap memakai nama "Kak Lia".
- **Alasan:** Konsistensi nama produk; golden master adalah kanvas desain aplikasi Kak Lia, bukan produk berbeda.
- **Dampak database/API/UI:** Tidak ada dampak backend/API. UI dan judul dokumen berubah; nama package berubah (prototype, bukan breaking).
- **Asumsi:** Nama tampilan ditulis "Kak Lia" (bukan all-caps dan bukan "KAK LIA"); perubahan branding tidak mengubah route/path.

### Penjabaran token & override DESIGN_BRIEF

Pemetaan nilai token (palet `blue-500` golden master menggantikan `school-blue-*`, radius Tailwind default, `border-black/10`) dan tanda `[OVERRIDE → golden master]` pada item Visual Direction ditulis langsung di `docs/DESIGN_BRIEF.md` (bagian 2 dan 3, disinkronkan pada fase M0) dan diterapkan di `frontend/src/index.css` pada fase M2.

### Risiko yang dicatat

- **Kontras white-on-`blue-500` (`#3B82F6`)** untuk tombol primary (`text-lg font-semibold`) berada di sekitar 3.7:1 — memenuhi 3:1 untuk teks besar, belum tentu 4.5:1 untuk teks normal. Validasi ulang terhadap kriteria aksesibilitas DESIGN_BRIEF 10.1 dilakukan saat token diterapkan (M2); bila gagal AA, keputusan perbaikan dicatat di DECISIONS (tidak mengubah golden master diam-diam).
- **TERLAMBAT** belum punya warna referensi di golden master (StatusAbsen hanya hadir/belum); nilai warna warning dipakai dari token lama dan dimutakhirkan saat layar rekap/jadwal tersedia.
- Parity desktop sejak awal tidak penuh untuk sidebar Guru/Admin (D7) — verifikasi "sama persis" (PLAN bagian 10) menoleransi beda sidebar vs pola sheet pada viewport desktop.

## 16. Keputusan fase M1 golden master (PLAN_MERGE_UI)

**Status: DECIDED — fase M1 `PLAN_MERGE_UI.md`.**

Fase M1 memangkas `frontend_new/` menjadi prototype fokus absen. D1–D8 (§15) tetap berlaku dan menjadi acuan. Keputusan di bawah melengkapi implementasi M1 tanpa menambah fitur di luar absensi (PRD) dan tanpa menyentuh business logic `frontend/`.

### M1-1 — Route golden master dan tidak ada route mati

- **Pilihan final:** Route final `frontend_new/`: `/login`, `/dashboard`, `/jadwal` (menggantikan `/jadwal-siswa` karena yang tersisa hanya pelajaran sebagai konteks absen), `/scan`, `/scan/result`, `/riwayat`, `/profil`, `/guru/buat-absen`, `/guru/sesi/:id`, `/guru/rekap`, dan `*` (404). Setiap link FeatureGrid/BottomNav/aksi halaman wajib menunjuk ke route yang ada.
- **Alasan:** Tabel 5.1 PLAN menyebut `/jadwal`; pendefinisian ulang menghilangkan tab ujian/tryout dari scope. Interlock "tidak ada route mati" adalah checkpoint M1.
- **Dampak:** Presentasi dan mock data saja; tidak ada dampak API/database. Data mock jadwal dan grid mengikuti route baru.

### M1-2 — Tavb Ujian/Tryout dihapus; Jadwal = konteks absen

- **Pilihan final:** `sectionUjian/*`, `sectionTryout/*`, `JadwalTabs.tsx`, dan entri tab pada `jadwalData.ts` dihapus. Layar Jadwal menampilkan date strip + section `Hari ini`/`Besok` + kartu pelajaran berstatus PRD (`Bisa absen`, `Belum dibuka`, `Selesai`) dengan tombol `Absen sekarang` hanya pada status `Bisa absen` (menuju `/scan`).
- **Alasan:** PLAN 5.1 & 5.2 — jadwal pelajaran menjadi konteks absen, bukan penyelenggara ujian/tryout.
- **Dampak:** Kartu jadwal menambah badge status dan aksi scan; warna status memakai keluarga palet golden master (green/orange/slate) dengan kontras teks yang dijaga.

### M1-3 — BottomNav absensi diaktifkan, per role, active dari route

- **Pilihan final:** `siswaMenus`: Beranda, Absen (`/scan`), Riwayat (`/riwayat`), Profil (`/profil`). `guruMenus`: Beranda, Buat Absen (`/guru/buat-absen`), Rekap (`/guru/rekap`), Profil. `adminMenus`: Beranda, Profil. State aktif dihitung dari `location.pathname` (bukan `isActive` statis); tombol menavigasi via react-router.
- **Alasan:** PLAN 5.2 (menu absensi Beranda/Absen/Riwayat/Profil) + prinsip D12 (tidak menampilkan item ke halaman yang belum ada).
- **Dampak:** Hanya `frontend_new/`; `menuType` menambah `link`. Item `isActive` statis diganti derivasi route.

### M1-4 — Admin belum memiliki layar referensi di M1

- **Pilihan final:** Khusus golden master M1, `adminFeatures` pada grid dikosongkan dan tidak ada route admin baru. Kebutuhan layar referensi admin (banner, pengguna, kelas/plotting, laporan) diputuskan pada fase guru/admin lanjutan (lihat PLAN M4).
- **Alasan:** PLAN 5.1 hanya mewajibkan layar siswa + minimal guru; menampilkan item grid admin ke halaman yang belum ada melanggar larangan dead element (DESIGN_BRIEF) dan "jangan menebak".
- **Dampak:** Dashboard admin prototype menampilkan grid kosong ("Tidak ada Fitur") hingga keputusan produk untuk item admin dicatat.

### M1-5 — Konten banner mock netral sekolah

- **Pilihan final:** Aset banner mock `AdSlider/adData.tsx` diganti dari konten lama "Promo SanEdu" (mereka legacy LIMAN) menjadi banner sekolah netral ("Open House & Expo Kak Lia", "Pendaftaran Ekstrakurikuler") dengan gambar lokal SVG di `public/` (rasio 16:7, offline-safe). Kontrak visual carousel (panah prev/next) dipertahankan.
- **Alasan:** Menghapus sisa branding lama dan memenuhi banner sekolah (PRD FR-02) sebagai elemen visual murni; menghindari dead element pada img (`src="#"`).
- **Dampak:** Hanya mock data/aset; favicon `public/favicon.svg` (logo LIMAN ungu) **tidak diubah** karena D8 tidak mencantumkannya — dicatat sebagai residual/open item untuk konfirmasi produk.

### M1-6 — Layar referensi 5.3 memakai pola sheet putih

Layar baru `Scan`, `ScanResult`, `Riwayat`, `Profil`, `BuatAbsen`, `SesiQr`, `RekapKelas` memakai `Header` (biru) + `WhiteSheet` (`bg-white w-full max-w-md mx-auto -mt-6 rounded-t-[60px] pt-13 pb-8`) + `XPadding`, sesuai instruksi M1 dan invariant #2. Semua data mock. `ScanResult` menyediakan preview variasi `Hadir`/`Terlambat`/`Sudah absen` sebagai referensi desain; di produksi (`frontend/`) status selalu datang dari server. Ikon navigasi/aksi dari `@mui/icons-material` (D1).

## 17. Keputusan fase M2 — Token, primitif, dan AppShell (PLAN_MERGE_UI)

**Status: DECIDED — fase M2 `PLAN_MERGE_UI.md`.**

Fase M2 menerapkan token palet golden master di `frontend/src/index.css`, menambah primitif presentasi (`ContentShell`, `BlueHeader`, `PrimaryButton`, `StatusDot`, `PillSearch`, `FeatureGrid`, `BottomNav`, `BannerCarousel`), dan mengubah AppShell: mobile memakai pola header biru + lembaran putih `rounded-t-[60px]` + bottom nav; desktop mempertahankan sidebar `lg:` (D7) dengan palet baru. Tidak ada perubahan logic, route, hook, service, store, skema, atau perilaku scan/auth. Ikon primitif memakai `@mui/icons-material` (eksekusi D1; dependency ditambahkan di `frontend/package.json`).

### M2-1 — Bottom nav produksi = `roleNav(role)`, bukan menu mock golden master

- **Pilihan final:** `BottomNav` pada AppShell `frontend/` memakai item dari `roleNav(user.role)` di `frontend/src/lib/permissions.js` (label + link produksi yang sudah ada), diterjemahkan ke ikon MUI. Menu golden master `siswaMenus`/`guruMenus`/`adminMenus` hanya menjadi referensi visual — rute mock berbeda (`/scan`, `/riwayat` vs `/app/student/scan`, dst.).
- **Alasan:** Larangan fase ("jangan mengubah route/behavior") lebih kuat daripada parity label; mengganti label/nav produksi akan memutus akses halaman guru/admin dan test yang mengeceknya.
- **Dampak:** Khusus role `ADMIN`, bottom nav menampilkan 7 item (`adminMenus` golden master hanya 2 karena layar referensi admin belum ada — M1-4); parity grafis bottom nav untuk admin ditangguhkan, drawer hamburger tetap menjadi akses kedua. Item non-`end` memakai prefix match agar halaman nested tetap menyala (e.g. `/app/student/schedule` aktif saat di beranda jadwal).
- **Asumsi:** 7 item masih muat pada viewport ≥320px; bila tidak, kepadatan bottom nav admin menjadi open question (bukan keputusan diam-diam).

### M2-2 — Primitif mirror golden master + perbaikan aksesibilitas nama tombol

- **Pilihan final:** `ContentShell` (setara `XPadding`), `BlueHeader` (setara `Header`), `PrimaryButton` (setara `Button`), `PillSearch` (setara `SearchBar`, keputusan D3 setuju), `StatusDot` (setara `StatusAbsen`), `FeatureGrid`, `BottomNav`, `BannerCarousel` (setara `AdSlider`) menyalin kelas/struktur golden master pada kontrak visual bagian 3.
- **Dampak:** `BlueHeader` menambah `aria-label="Kembali"` pada tombol back icon-only (golden master belum punya accessible name; aturan GUIDE aksesibilitas menang atas parity literal). Lokasi sesuai peta PLAN bagian 8.

### M2-3 — BannerCarousel mendukung fallback teks

- **Pilihan final:** `BannerCarousel` menerima `items` (kontrak banner produksi: `title`, `imageUrl` ATAU `content`, periode opsional). Bila `imageUrl` kosong merender kartu teks (title + content) di atas latar `blue-100`, sesuai state `Banner` = `image, text fallback` pada DESIGN_BRIEF §7 (golden master `AdSlider` selalu memakai `<img>`, mock `imageLink`).
- **Alasan:** Kontrak API banner memperbolehkan `content` tanpa `imageUrl`; parity visual `<img>` tidak bisa dijadikan satu-satunya jalur.

### M2-4 — Alias token di `frontend/src/index.css`

- **Pilihan final:** Nama token lama yang masih dipakai komponen di-*map* ke nilai golden master (PLAN bagian 7, opsi alias semantic): `school-blue-050 → #DBEAFE` (`blue-100`), `school-blue-700 → #3B82F6` (`blue-500`), `school-blue-900 → #3B82F6` (app bar/sidebar kini `blue-500`), `coral-600 → #FB923C` (`orange-400`), `success-700 → #16A34A` (`green-600`). Token baru ditambah: `blue-500/400/100`, `orange-400/300`, `slate-700`, `green-500/600`, `red-500`. Radius lama dipetakan ke skala Tailwind golden master: `radius-sm=8px`, `radius-md=12px`, `radius-lg=16px`, `radius-pill=9999px`.
- **Dampak:** `line-200`, `danger-700`, `warning-700`, `surface-50`, `ink-*`, `shadow-1/2` dipertahankan nilainya (golden master belum punya referensi pengganti). Resiko kontras white-on-`blue-500` tetap tercatat (DECISIONS §15 Risiko).

## 18. Keputusan fase M3 — Repaint auth & siswa (PLAN_MERGE_UI)

**Status: DECIDED — fase M3 `PLAN_MERGE_UI.md`.**

Fase M3 menyelaraskan lapisan presentasi `frontend/` untuk halaman auth (`LoginPage`, `ForgotPasswordPage`, `NotFoundPage`) dan halaman siswa (beranda, jadwal, scan + sub-komponennya, riwayat + `HistoryViews`, profil/`ProfileForm`) dengan golden master `frontend_new/`. Tidak ada perubahan route, hook, service, store, skema, guard, aturan status/timezone, atau idempotensi scan. Semua test (88) tetap hijau.

### M3-1 — Dependency MUI di-`npm install`

- **Pilihan final:** `@mui/icons-material` dan `@mui/material` (sudah ada di `frontend/package.json` sejak M2) benar-benar dipasang; `node_modules` sebelumnya basi sehingga seluruh test suite gagal resolve. Dijalankan `npm install` di `frontend/`.
- **Dampak:** `frontend/package-lock.json` diperbarui. Bukan perubahan logic.

### M3-2 — Auth memakai layout golden master; label aksesibel via `aria-label`

- **Pilihan final:** Login/NotFound memakai pola golden master (`bg-blue-500` penuh, ikon + judul, lembar putih, CTA `orange-400`). Forgot-password tidak punya referensi golden master, jadi memakai pola login. Input memakai placeholder visual golden master + `aria-label` (bukan label terlihat) agar `getByLabelText` tetap bekerja. Label CTA uppercase diterapkan lewat CSS (`uppercase`) sehingga teks DOM/aksesibel tetap `Masuk`/`Kirim` (keputusan D6: CSS, bukan string literal). Heading `Masuk`/`Pulihkan password` dipertahankan karena diwajibkan test.
- **Alasan:** Parity layout tanpa memutus alur bisnis login (username+password) dan tanpa memecah kontrak test.
- **Asumsi:** Menghilangkan label terlihat pada input login (placeholder + `aria-label`) dapat diterima; ini parity literal golden master.

### M3-3 — 404 tetap punya jalan keluar

- **Pilihan final:** Layout golden master (biru penuh, teks putih, "404") dipertahankan, dengan tambahan link `Kembali ke beranda`.
- **Alasan:** DESIGN_BRIEF §1.2 melarang layar buntu; golden master `NotFound.tsx` tidak punya aksi. Tambahan minimal, tidak mengubah struktur.

### M3-4 — Beranda siswa: konten di dalam AppShell, bukan header beranda golden master

- **Pilihan final:** AppShell (M2) tetap menjadi pemilik bar biru + lembar putih + bottom nav. Beranda siswa menerapkan bahasa visual golden master di lapisan konten: baris sapaan + avatar, `PillSearch` fungsional (D3: memfilter `FeatureGrid` dan jadwal terdekat, tanpa endpoint baru), `BannerCarousel` (D5), ringkasan absensi + `StatusDot`, jadwal terdekat, `FeatureGrid` dengan route produksi, dan akses cepat Riwayat/Profil. Headline golden master `Hi, Welcome!` + directive role diganti heading produksi `Halo, {nama}` (diwajibkan test), tetap `font-bold text-xl`.
- **Alasan:** Menghindari restrukturisasi AppShell yang akan menyentuh guru/admin dan test shell; scope M3 hanya lapisan presentasi halaman.
- **Asumsi/open item:** Header beranda golden master (avatar + sapaan di area biru) tidak dipindahkan ke AppShell; parity piksel area header beranda ditangguhkan sampai bila produk memutuskan AppShell siswa memakai pola golden master penuh.

### M3-5 — Tone status & window mengikuti golden master

- **Pilihan final:** `StatusBadge` memakai palet pill golden master: success `bg-green-500/10 text-green-600`, warning `bg-orange-400/10 text-orange-700`, danger `bg-red-500/10 text-red-500`, info `bg-blue-100 text-blue-500`, neutral `bg-black/5 text-slate-700`. `WINDOW_STATUS_TONES.BELUM_DIBUKA` diubah `info → warning` (oranye) agar sama dengan golden master `JadwalCard`; `audit`/`HistoryViews` konsisten.
- **Alasan:** Invariant #7 dan palet §3; perubahan hanya pemetaan tone presentasi di `lib/attendanceStatus.js`.
- **Dampak:** Badge pada halaman guru/admin ikut memakai palet baru (M4 akan melengkapi); teks/label tidak berubah. Glyph ikon `StatusBadge` dimigrasikan dari `lucide-react` ke `@mui/icons-material` (eksekusi D1) untuk semua status/window yang dipetakan. `BannerCarousel` mengembalikan fallback teks saat gambar gagal dimuat (state `broken image` DESIGN_BRIEF §7) yang hilang bila hanya memakai `<img>` golden master.

### M3-6 — Kartu jadwal menampilkan waktu mulai + durasi, ikon mapel generik

- **Pilihan final:** `ScheduleCard` mengikuti `JadwalCard` golden master (ikon dalam kotak `bg-blue-100 text-blue-500`, waktu+durasi di kanan, pill status, CTA `Absen sekarang` saat `BISA_ABSEN && !scanned`). Karena data produksi tidak memuat ikon per-mapel, dipakai ikon generik `MenuBookRounded` (bukan menebak pemetaan mapel→ikon). Waktu ditampilkan sebagai jam mulai + `{duration}min` (bukan rentang) agar sama dengan golden master.
- **Alasan:** Parity bentuk kartu tanpa menambah field/kontrak baru. Pemetaan ikon mapel per-mapel adalah keputusan produk terpisah (open item), bukan ditebak.
- **Asumsi:** Menampilkan jam mulai saja (endAt tetap tersedia di pre-check scan) dapat diterima; bila produk ingin rentang, itu perubahan golden master dulu.

### M3-7 — Riwayat & profil mempertahankan tabel/filter dan identitas read-only

- **Pilihan final:** `HistoryViews` mobile mengikuti baris golden master; tabel desktop + form filter tanggal/status tetap dipertahankan (DESIGN_BRIEF S5, responsive). Profil menampilkan identitas `username`/`NIM` sebagai `dt/dd` (bukan input berlabel) sesuai PRD "username/NIM tidak dapat diedit"; form data tetap `react-hook-form` + `zod`.
- **Alasan:** Parity visual tidak boleh menghapus kemampuan produksi (tabel/pagination/filter) atau mengubah aturan non-edit identitas.
- **Asumsi:** Tidak ada.

## 19. Keputusan fase M4 — Repaint workspace guru & admin (PLAN_MERGE_UI)

**Status: DECIDED — fase M4 `PLAN_MERGE_UI.md`.**

Fase M4 menyelaraskan lapisan presentasi `frontend/` untuk halaman guru (`pages/teacher/*` + `features/teacher/*`) dan admin (`pages/admin/*` + `features/admin/*`) dengan bahasa visual golden master yang sudah dikunci pada M0/M2/M3. Tidak ada perubahan logic: route, hook, service, store, skema, guard, invalidasi query, aturan waktu/status, idempotensi scan, dan alur export XLSX tidak disentuh. Validasi: lint/build/test `frontend/` hijau.

### M4-1 — Admin memakai bahasa visual M2/M3, tidak menambah layar referensi admin baru di golden master

- **Pilihan final:** Halaman admin direstyling memakai primitif M2 (`ContentShell`, `PrimaryButton`, `StatusBadge`, `Pagination`) dan bahasa visual golden master yang sudah diterapkan pada M3 (kartu `rounded-lg border border-black/10 bg-white`, ikon `blue-100`/`blue-500`, label `text-slate-700`), **tanpa** membuat layar referensi admin baru di `frontend_new/`.
- **Alasan:** M1-4 secara eksplisit menangguhkan referensi admin ke fase lanjutan, dan permintaan fase ini menegaskan workdir `frontend/` dengan "referensi yang sudah ada di golden master". Golden master hanya memiliki referensi guru (Buat Absen, QR Sesi, Rekap Kelas) pada 5.1; membuat mockup admin baru memperluas scope M0/M1 di luar fase ini.
- **Dampak:** Tidak menyentuh `frontend_new/`. Parity piksel desktop admin tetap ditangguhkan oleh D7 (sidebar) dan tidak adanya referensi admin; parity mobile mengikuti pola M3 (konten di dalam AppShell).
- **Asumsi/open item:** Bila produk menuntut layar referensi admin, itu dibuat lebih dulu di golden master pada fase lanjutan (alur PLAN bagian 2), bukan ditebak di sini.

### M4-2 — Tabel tetap tabel semantik, direstyle token golden master

- **Pilihan final:** Semua tabel guru/admin tetap `<table>` dengan `<caption class="sr-only">`, `<th scope="col">`, dan `Pagination` yang sudah ada (DESIGN_BRIEF §10.3, PLAN M4). Restyle: wrapper `overflow-x-auto rounded-lg border border-black/10 bg-white` tanpa shadow, header `border-b border-black/10 text-left text-slate-700`, baris `border-b border-black/5 last:border-b-0`, sel `p-3`.
- **Alasan:** PLAN M4 menuntut tabel tetap aksesibel + paginasi; hanya token visual yang berubah, bukan kemampuan produksi.
- **Dampak:** Perubahan kelas presentasi pada `SessionViews`, `AttendanceViews`, `UserViews`, `BannerViews`, `AcademicViews`, `PlottingViews`, `ReportViews`; `Pagination` memakai token golden master.

### M4-3 — Form & dialog: label tetap terlihat, gaya input golden master

- **Pilihan final:** Input memakai `rounded-lg border border-black/10 bg-white px-4 py-2`, label `text-sm font-medium text-slate-700`. Label terlihat dipertahankan (berbeda dari login M3 yang memakai placeholder + `aria-label`) agar seluruh `getByLabelText` test form guru/admin tetap bekerja. Dialog admin tetap Headless UI (focus trap) dengan kartu `rounded-2xl bg-white`; ikon dialog dimigrasikan ke `@mui/icons-material` (D1). Teks error field tetap `danger-700` (kontras DESIGN_BRIEF §10.1).
- **Alasan:** Form produksi guru/admin adalah data-entry panjang; label terlihat adalah aturan GUIDE §7 dan sudah diuji. Golden master tetap acuan gaya, bukan penghapusan label.
- **Dampak:** `DialogShell`, `ConfirmDialog`, `SessionForm`, `ClassAttendancePage` filter, dan form admin.

### M4-4 — Tombol primary memakai `PrimaryButton`; export XLSX tidak berubah

- **Pilihan final:** CTA utama (mis. "Buat sesi", "Buat sesi absensi", dialog submit) memakai `PrimaryButton` (label uppercase via CSS D6 bila berlaku). Alur export tetap: `GET /reports/attendance/export`, binary response, nama file dari `Content-Disposition`, error `NO_DATA_TO_EXPORT`/`EXPORT_BUSY` dibaca dari body Blob. Hanya tampilan tombol/status export yang mengikuti token golden master.
- **Alasan:** PLAN M4 menegaskan export tidak berubah; tombol adalah lapisan presentasi.
- **Dampak:** Tidak ada perubahan service/hook export; `useExportReport` dan `lib/download.js` tetap.

### M4-5 — QR sesi produksi tetap QR nyata; golden master hanya placeholder

- **Pilihan final:** `QrDisplay` tetap merender `QRCodeSVG` dari `qrPayload` yang dikembalikan backend (static QR, frontend tidak membuat/merotasi payload). Kartu pembungkus QR dan metadata sesi mengikuti gaya `SesiQr` golden master (`rounded-xl border border-black/10`, baris metadata `label text-slate-700` / `value font-semibold`).
- **Alasan:** Golden master memakai ikon `QrCode2Rounded` sebagai placeholder mock; produksi wajib QR yang dapat dipindai (fungsi bisnis, GUIDE §6). Bentuk visual yang disamakan, bukan fungsinya.
- **Dampak:** `QrDisplay`, `SessionQrPage`, `SessionForm` (panel detail).

### Risiko M4 yang dicatat

- Parity piksel desktop guru/admin tidak penuh karena D7 (sidebar produksi tanpa referensi golden master) dan tidak adanya layar referensi admin (M4-1); verifikasi "sama persis" menoleransi beda ini.
- Migrasi ikon `lucide-react` → `@mui/icons-material` (D1) diperluas ke seluruh permukaan guru/admin dan komponen feedback bersama (`EmptyState`, `ErrorState`, `ConfirmDialog`, `DialogShell`, `Pagination`); sisa penggunaan `lucide-react` dipangkas bertahap hingga M5.

## 20. Keputusan fase M5 — Visual regression & release readiness (PLAN_MERGE_UI)

**Status: DECIDED — fase M5 `PLAN_MERGE_UI.md`.**

Fase M5 memvalidasi parity `frontend/` terhadap golden master `frontend_new/` pada viewport 320/390/768/1440 dengan data nyata (backend dev + user seed), lalu menutup sisa pekerjaan presentasi. Tidak ada perubahan logic bisnis: route, guard, auth, status absen, timezone, idempotensi scan, invalidate query, dan export tidak disentuh. Validasi: `frontend_new/` lint+build hijau; `frontend/` lint+build hijau (1 warning pre-existing React Compiler di `UserFormDialog.jsx`) dan 88 test hijau.

### M5-1 — D1 tuntas: `lucide-react` dihapus dari produksi

- **Pilihan final:** Seluruh sisa ikon `lucide-react` di `frontend/` dimigrasikan ke `@mui/icons-material`/`@mui/material` sesuai D1: spinner overlay scan (`Loader2` → `CircularProgress`), tombol tutup dialog riwayat (`X` → `CloseRounded`), dan `ActiveBanner.jsx` (dead code, tak direferensikan) dihapus. Dependency `lucide-react` dikeluarkan dari `frontend/package.json` dan lockfile.
- **Alasan:** D1 mengunci MUI Material icons di kedua proyek untuk parity glyph; M4 mencatat pemangkasan sisa lucide hingga M5.
- **Dampak:** Presentasi saja. `npm install` di `frontend/` memperbarui lockfile; tidak ada perubahan API/DB.

### M5-2 — Bottom nav 320px: dapat di-scroll, tidak terpotong

- **Pilihan final:** Kontainer `BottomNav` (produksi dan golden master) diberi wrapper flex `w-max min-w-full` di dalam kontainer `overflow-x-auto` dengan item `shrink-0`. Untuk ≤4 item tampilan identik (tetap `justify-around`); untuk 7 item admin di viewport 320px, item terakhir dapat diakses dengan scroll horizontal alih-alih terpotong.
- **Alasan:** Menutup open question M2-1: 7 item × 48px melampaui lebar 320px dan sebelumnya terpotong tanpa cara mengakses item terakhir. Drawer hamburger tetap menjadi akses kedua.
- **Dampak:** Perubahan kelas presentasi pada `frontend/src/components/layout/BottomNav.jsx` dan `frontend_new/.../BottomNav/BottomNav.tsx`; markup test AppShell (berbasis peran/nama) tetap hijau. Scrollbar disembunyikan (`[scrollbar-width:none]`, `[&::-webkit-scrollbar]:hidden`) agar tampilan tetap bersih.

### M5-3 — Sinkronisasi aksesibilitas & referensi golden master

- **Pilihan final:** Golden master diselaraskan agar menghasilkan referensi yang benar dan setara produksi: tombol back `Header` diberi `type="button"` + `aria-label="Kembali"`; titik `StatusAbsen` diberi `aria-hidden="true"`; `NotFound` diberi link `Kembali ke beranda` (larangan layar buntu DESIGN_BRIEF §1.2, sejalan M3-3); input login golden master memakai placeholder `Username` + `type="text"` (kontrak login backend memakai username, bukan email).
- **Alasan:** Atribut aksesibilitas bukan keputusan fitur; menaruhnya di golden master menjaga parity DOM dan referensi. Tidak ada fitur baru di luar PRD.
- **Dampak:** `frontend_new/` saja untuk sinkronisasi ini (produksi sudah lebih dulu memilikinya).

### M5-4 — Divergensi yang diterima (residual, bukan bug)

- **Login:** produksi menambah link `Lupa password?` (wajib PRD) yang tidak dimiliki golden master; ini menggeser posisi vertikal form sehingga diff piksel ≠ 0 meski bahasa visual identik. Label tombol tetap `MASUK` (D6).
- **Beranda:** produksi mempertahankan `AppShell` (bar biru + lembar putih + bottom nav) dan konten kaya (ringkasan absensi, jadwal terdekat, akses cepat) sesuai M3-4; header beranda golden master (avatar + `Hi, Welcome!`) belum dipindah ke AppShell — parity piksel area header beranda ditangguhkan.
- **Jadwal/Scan/Riwayat:** produksi memakai komposisi di dalam `AppShell` (bukan header biru mandiri golden master) dan tabel desktop pada `sm:`; struktur memang berbeda sementara bahasa visual (warna/radius/spacing/ikon/pill status) sama.
- **Guru/Admin & desktop:** sidebar `lg:` (D7) dan halaman admin tanpa referensi golden master (M4-1) tetap ditangguhkan.
- **Alasan:** Perubahan pada AppShell/halaman ini akan menyentuh test shell dan membutuhkan keputusan produk baru; sesuai guardrail "jangan menebak", divergensi dicatat sebagai residual risk, bukan diperbaiki diam-diam.

### M5-5 — Metode verifikasi parity

- **Pilihan final:** Parity diverifikasi dengan menjalankan kedua dev server dan mengambil screenshot headless (Chrome CDP) pada viewport 320/390/768/1440 untuk login, beranda, jadwal, scan, hasil, riwayat, profil, 404, serta halaman guru/admin. Karena `frontend/` butuh auth, screenshot diambil dengan cookie sesi hasil login ke backend dev (user seed); golden master memakai mock data tanpa auth.
- **Catatan threshold:** Diff piksel default 0 hanya realistis untuk layar statis yang tidak punya perbedaan konten/keputusan. Layar dinamis (beranda/jadwal/riwayat) dan layar yang memang didefer (M5-4) diperiksa secara struktural (blok, warna, radius, spacing, typography, bentuk ikon), bukan piksel mentah. Hasil per layar dicatat di `docs/PARITY_REPORT.md`.
- **Dampak:** Tidak ada perubahan produk; menambah dokumen laporan parity sebagai bukti fase M5.

### Risiko M5 yang dicatat

- Bundle produksi masih memuat `@mui/material` (CircularProgress) di jalur scan; ukuran bundle 865 kB (gzip 263 kB) dan warning chunk >500 kB tetap ada (rekomendasi code-splitting di luar scope fase).
- Parity desktop guru/admin tidak penuh (D7 + M4-1) dan header beranda siswa belum mengikuti golden master penuh (M3-4); ini dicatat sebagai residual, bukan cacat M5.
- Verifikasi visual otomatis (image diff ber-threshold) belum menjadi bagian test suite; laporan parity berbasis screenshot manual/headless yang diregenerasi saat fase lanjutan.

## Gate implementasi

Keputusan yang memengaruhi migration dan authorization di atas sudah dikunci untuk scope MVP. Nilai timezone tetap configurable melalui environment dengan default `Asia/Jakarta`.
