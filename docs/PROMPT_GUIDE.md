# Prompt Guide - Pengembangan Bertahap Project SINTAS

Dokumen ini adalah urutan prompt yang dapat diberikan kepada coding agent agar pengembangan berjalan bertahap, terukur, dan tetap sesuai dengan [PRD](PRD.md), [Design Brief](DESIGN_BRIEF.md), [Frontend Guide](../frontend/GUIDE.md), dan [Backend Guide](../backend/GUIDE.md).

Strategi utama: selesaikan backend sebagai sumber kebenaran terlebih dahulu, kunci kontrak API, buktikan aturan bisnis melalui test, kemudian bangun frontend di atas API yang sudah stabil. Jangan meminta agent membangun seluruh aplikasi dalam satu prompt.

## 1. Cara Menggunakan Panduan

1. Jalankan prompt secara berurutan.
2. Setelah setiap fase, baca laporan agent dan jalankan checkpoint yang disebutkan.
3. Jangan lanjut ke fase berikutnya jika checkpoint gagal atau keputusan produk masih ambigu.
4. Berikan prompt lanjutan hanya setelah agent menyelesaikan scope fase saat ini.
5. Jika agent menemukan open question, minta agent menuliskannya sebagai keputusan eksplisit sebelum coding.
6. Jangan meminta refactor besar bersamaan dengan fitur baru.

Setiap prompt sebaiknya menghasilkan perubahan kecil yang dapat diuji. Minta agent untuk:

- membaca file terkait sebelum mengedit;
- menyebutkan hipotesis dan file yang akan disentuh;
- memakai pola yang sudah ditetapkan dalam guide;
- tidak mengubah file di luar scope tanpa alasan;
- membuat atau memperbarui test untuk behavior yang berubah;
- menjalankan validasi setelah edit;
- melaporkan file yang berubah, command yang dijalankan, hasil test, risiko, dan pekerjaan tersisa.

## 2. Prompt Pembuka untuk Semua Fase

Gunakan pembuka ini sebelum prompt fase apa pun:

```text
Kamu bekerja di repository project-sintas. Baca terlebih dahulu docs/PRD.md,
docs/DESIGN_BRIEF.md, backend/GUIDE.md, dan frontend/GUIDE.md yang relevan dengan
scope tugas ini.

Ikuti aturan berikut:
- Jangan mengarang requirement di luar PRD.
- Jangan mengubah file yang tidak diperlukan untuk scope fase ini.
- Sebelum edit, inspeksi implementasi dan test terdekat, lalu tuliskan satu
	hipotesis teknis yang dapat diuji dan satu validasi pembeda.
- Pisahkan route, middleware, controller, service, repository, dan domain logic
	sesuai guide. Controller tidak boleh memuat aturan bisnis.
- Validasi authorization di backend; frontend tidak pernah menjadi sumber
	kebenaran untuk role, waktu, status absensi, atau scope laporan.
- Gunakan error response yang konsisten: { error: { code, message, fieldErrors? } }.
- Jangan menyimpan secret, password plaintext, token, QR payload mentah, atau
	tanggal lahir lengkap di log.
- Setelah mengedit, jalankan test atau lint/build yang paling sempit dan relevan
	sebelum pekerjaan lain.

Jangan lanjut ke scope fase berikutnya. Di akhir, laporkan perubahan, validasi,
keputusan yang dikunci, risiko, dan pertanyaan yang masih terbuka.
```

## 3. Keputusan Produk yang Harus Dikunci

Sebelum migration final, gunakan prompt berikut. Nilai contoh harus diganti jika sekolah memiliki keputusan berbeda.

```text
Tinjau open questions pada PRD dan Backend Guide. Buat dokumen keputusan teknis
singkat di docs/DECISIONS.md tanpa mengubah implementasi dulu.

Kunci minimal:
1. timezone sekolah dan cara normalisasi UTC;
2. apakah siswa hanya boleh memiliki satu kelas aktif;
3. perilaku saat guru membuat sesi duplikat;
4. strategi finalisasi TIDAK_HADIR;
5. format dan periode banner;
6. kebijakan password minimum dan reset password manual admin;
7. format kolom dan nama file export XLSX;
8. apakah admin memakai login dan forgot-password yang sama.

Untuk setiap keputusan tulis: pilihan final, alasan, dampak database/API/UI,
dan asumsi yang masih perlu dikonfirmasi. Jika keputusan tidak dapat dibuat dari
PRD, tandai BLOCKED dan jangan menebak diam-diam.
```

**Checkpoint:** `docs/DECISIONS.md` ada, tidak ada keputusan penting yang diam-diam tersebar di kode, dan semua item BLOCKED diketahui sebelum migration final.

## 4. Fase Backend

### Fase B0 - Audit dan Bootstrap Backend

```text
Mulai dari backend. Audit isi backend/ dan repository root, lalu siapkan fondasi
Express.js ES Modules sesuai backend/GUIDE.md.

Scope:
- buat backend/package.json dan script dev, start, lint, test, test:unit,
	test:integration, prisma:generate, prisma:migrate, dan prisma:seed bila belum ada;
- buat konfigurasi environment tervalidasi dengan Zod dan backend/.env.example
	tanpa secret;
- buat app.js tanpa listen dan server.js untuk startup/graceful shutdown;
- siapkan PrismaClient singleton, logger terstruktur, request ID, error handler,
	dan endpoint /health/live serta /health/ready;
- pasang dependency minimum yang memang dibutuhkan, tanpa menambahkan library
	yang belum digunakan.

Tambahkan test untuk health route, malformed environment, error response, dan
graceful shutdown dasar. Jangan membuat fitur domain atau frontend pada fase ini.
```

**Checkpoint:** `npm run lint`, test backend, dan health check berjalan. `/health/live` tidak membutuhkan database; `/health/ready` gagal secara aman saat database belum siap.

### Fase B1 - Prisma Schema, Migration, dan Seed

```text
Implementasikan schema Prisma berdasarkan data model pada PRD dan keputusan di
docs/DECISIONS.md.

Cakup users, student_profiles, teacher_profiles, education_levels, classes,
subjects, class_students, teacher_assignments, attendance_sessions,
attendance_records, dan banners. Terapkan foreign key, nullability, enum/status,
timestamp, unique constraint, dan index yang diwajibkan guide, terutama:
- users.username;
- membership dan assignment aktif;
- attendance_sessions berdasarkan assignment dan waktu;
- unique (session_id, student_id);
- attendance_records berdasarkan student_id/scanned_at dan session_id/status.

Buat migration yang aman dijalankan, seed development yang tidak memakai
password plaintext di database, dan dokumentasikan cara reset/seed. Jangan
mengubah status absensi atau membuat endpoint dulu.
```

**Checkpoint:** migration pada MySQL test database berhasil, `prisma validate` dan `prisma generate` berhasil, seed repeatable, serta constraint penting dapat dibuktikan melalui test/schema inspection.

### Fase B2 - Domain Murni dan Validasi Dasar

```text
Implementasikan domain layer tanpa HTTP dan tanpa akses database.

Buat pure functions/schema untuk:
- enum HADIR, TERLAMBAT, TIDAK_HADIR;
- validasi start_at sebelum end_at;
- scan window start_at - 15 menit sampai end_at;
- tepat start_at + 15 menit masih HADIR;
- setelah batas tersebut sampai end_at menjadi TERLAMBAT;
- late_minutes dari waktu scan server;
- scan sebelum window atau setelah end_at ditolak.

Tambahkan test boundary untuk -15 menit, tepat waktu mulai, +15 menit, +15 menit
lebih sedikit, +15 menit lebih besar, dan tepat end_at. Gunakan waktu yang
diinject ke function; jangan memakai Date.now() langsung di test.
```

**Checkpoint:** unit test domain lengkap dan deterministik. Tidak ada kalkulasi status absensi di controller atau frontend.

### Fase B3 - Authentication, Session, dan Authorization

```text
Implementasikan auth end-to-end secara minimal sesuai backend/GUIDE.md.

Scope:
- login username/password untuk STUDENT, TEACHER, dan ADMIN;
- Argon2id untuk hash dan verify password;
- cookie/token HttpOnly sesuai keputusan arsitektur, tanpa localStorage;
- logout dan invalid/expired session;
- authenticate middleware dan authorize(...roles);
- GET/PATCH /api/v1/me dengan field profil yang boleh diubah;
- forgot-password memakai email, tanggal lahir, password baru, dan konfirmasi;
- pesan login/reset yang tidak membocorkan akun mana yang ada;
- Helmet, CORS allowlist, body limit, rate limit login/reset, dan error handler.

Tambahkan test unit untuk password/schema/policy dan integration test untuk login
valid, login invalid, logout, unauthenticated, forbidden role, profil, serta
forgot-password mismatch dan success. Jangan membuat endpoint attendance dulu.
```

**Checkpoint:** semua role guard terbukti melalui HTTP integration test; secret tidak muncul di response/log; password tidak pernah disimpan plaintext.

### Fase B4 - Academic Master, Assignment, dan Banner

```text
Implementasikan service, repository, controller, dan route untuk:
- master education level, class, dan subject;
- user management dan reset password manual oleh ADMIN;
- plotting siswa ke kelas;
- plotting guru ke kelas dan subject;
- GET/PATCH profile sesuai field yang diizinkan;
- CRUD/status banner aktif.

Terapkan authorization scope di service sebelum query data. Guru hanya dapat
melihat assignment miliknya; siswa hanya melihat kelas aktifnya; admin mengelola
master. Validasi pagination, filter, sorting, dan input dengan allowlist.

Tambahkan integration test untuk admin allowed, non-admin rejected, assignment
ownership, active membership, banner hide/show, dan validation error.
```

**Checkpoint:** tidak ada endpoint yang mengembalikan data di luar scope role; test ownership dan admin-only lulus.

### Fase B5 - Attendance Session dan QR Payload

```text
Implementasikan pembuatan dan pembacaan attendance session.

Scope:
- guru hanya dapat membuat sesi dari teacher_assignment aktif miliknya;
- validasi assignment, tanggal, start_at, end_at, dan timezone;
- cegah sesi duplikat sesuai docs/DECISIONS.md;
- hasilkan opaque QR payload statis yang tidak memuat PII dan tidak mudah ditebak;
- GET daftar sesi ter-scope dan GET /attendance-sessions/:id/qr;
- response menampilkan metadata sesi yang aman;
- transaction untuk mutation yang membutuhkan lebih dari satu perubahan.

Tambahkan test unauthorized assignment, invalid time range, duplicate session,
payload invalid/tampered, QR tidak bocor data pribadi, dan role scope.
```

**Checkpoint:** guru lain tidak dapat membuat atau membaca QR sesi; duplicate behavior konsisten dan terdokumentasi.

### Fase B6 - Scan Transaction dan Idempotency

```text
Implementasikan POST /api/v1/attendance-scans sebagai jalur ringan dan
idempotent.

Validasi berurutan: auth siswa, QR payload, session, assignment, active class
membership, waktu server, lalu insert record dalam transaction. Gunakan unique
constraint (session_id, student_id) sebagai perlindungan terakhir dan tangani
duplicate-key sebagai response idempotent yang mengembalikan record existing atau
penanda duplicate sesuai kontrak API.

Aturan final:
- window dibuka 15 menit sebelum start_at;
- sampai tepat start_at + 15 menit = HADIR;
- setelah itu sampai end_at = TERLAMBAT;
- scan di luar window tidak membuat record;
- late_minutes konsisten untuk TERLAMBAT;
- tidak ada query banner/report/export di scan path.

Tambahkan unit test domain dan integration test valid scan, semua boundary waktu,
QR invalid, session closed, student bukan anggota kelas, duplicate sequential,
duplicate concurrent, dan database conflict. Jangan percaya waktu dari client.
```

**Checkpoint:** test concurrent/duplicate membuktikan hanya satu record; response tidak mengklaim sukses jika insert gagal; jalur scan tidak membuat export atau query global.

### Fase B7 - History, Finalisasi Tidak Hadir, dan Report

```text
Implementasikan history dan report setelah scan stabil.

Scope:
- history siswa dengan filter tanggal/status dan pagination;
- detail kehadiran kelas yang hanya dapat dilihat guru sesuai assignment;
- laporan global admin;
- strategi TIDAK_HADIR sesuai docs/DECISIONS.md, dengan satu sumber kebenaran;
- mapping field response yang konsisten dan timezone sekolah.

Terapkan scope sebelum query, allowlist filter/sort, default/max limit, dan
empty result API yang jelas. Tambahkan test siswa tidak dapat melihat siswa lain,
guru tidak dapat melihat kelas lain, admin dapat melihat global report, dan
status TIDAK_HADIR tidak menggandakan data.
```

**Checkpoint:** fixture lintas role menunjukkan tidak ada data leakage; status, timezone, pagination, dan empty result konsisten.

### Fase B8 - Excel Export, OpenAPI, dan Operasional

```text
Tambahkan export XLSX di backend menggunakan ExcelJS.

Scope:
- endpoint export scoped untuk guru dan admin;
- filter yang sama dengan report dan authorization sebelum query;
- header/filename sesuai docs/DECISIONS.md;
- response content type dan Content-Disposition benar;
- tidak ada data sensitif di kolom yang tidak disepakati;
- export tanpa data ditangani secara eksplisit;
- concurrency limit atau proteksi resource untuk export.

Lengkapi OpenAPI untuk auth, attendance, profile, academic, banner, report, dan
error schema. Tambahkan test workbook yang dapat dibuka, scope export, empty
export, forbidden export, health/readiness, dan graceful shutdown.
```

**Checkpoint:** file `.xlsx` dapat dibuka oleh library parser/test, scope role lulus, OpenAPI sesuai route nyata, dan semua backend test/lint lulus.

### Fase B9 - Security, Load Test, dan Release Readiness

```text
Lakukan review backend tanpa menambah fitur baru.

Periksa dan perbaiki hanya temuan yang relevan terhadap PRD:
- authentication, authorization, IDOR, CSRF bila cookie dipakai, CORS, Helmet;
- injection dan query parameterization Prisma;
- rate limit login/reset/scan yang tidak menghambat burst valid;
- log redaction, request ID, timeout, error handling;
- migration/seed/backup/rollback documentation;
- pool connection dan readiness;
- scan burst 06:45-07:00 dengan valid, retry, duplicate, invalid QR, dan
	contention database.

Buat laporan hasil dan daftar residual risk. Jangan menyatakan production-ready
tanpa menyebut dependency atau pengujian yang belum tersedia.
```

**Checkpoint:** test suite lengkap, load-test baseline tercatat, dokumentasi setup/migration/test/deployment diperbarui, dan residual risk eksplisit.

## 5. Kontrak API Sebelum Frontend

Sebelum mulai frontend, minta agent menghasilkan kontrak yang dapat dipakai frontend:

```text
Audit semua route backend yang sudah dibuat terhadap PRD dan frontend/GUIDE.md.
Buat docs/API_CONTRACT.md yang memuat method, path, auth, role, request schema,
success response, pagination, error code, HTTP status, timezone, dan contoh aman
untuk setiap endpoint.

Pastikan kontrak mencakup login/logout/forgot-password, me, banner, schedule,
attendance session, QR, scan, history, teacher detail, admin report, dan export.
Jalankan contract consistency check terhadap route/schema yang benar-benar ada.
Jika ada perbedaan antara implementasi dan dokumentasi, perbaiki sumber yang
lebih tepat lalu test ulang. Jangan mulai UI sebelum kontrak ini stabil.
```

**Gate backend -> frontend:** migration dapat dijalankan, seed tersedia, auth dan role test lulus, scan boundary/idempotency test lulus, report/export test lulus, OpenAPI/API contract tersedia, dan command setup terdokumentasi.

## 6. Fase Frontend

### Fase F0 - Frontend Foundation dan API Client

```text
Mulai frontend hanya setelah backend gate lulus. Baca docs/API_CONTRACT.md dan
frontend/GUIDE.md.

Siapkan React 19 + Vite dengan routing, React Query, Axios instance berbasis
VITE_API_BASE_URL, cookie credentials sesuai kontrak, Zustand hanya untuk session
sanitized/UI state, React Hook Form + Zod, Headless UI, dan lucide-react.

Buat struktur feature folder sesuai frontend/GUIDE.md, error mapping terpusat,
query client, protected route, role route, loading/error/expired-session state,
dan .env.example. Jangan membuat mock API permanen atau menyimpan token di
localStorage. Pertahankan frontend dapat dibuild tanpa backend aktif.
```

**Checkpoint:** dependency terpasang, lint/build lulus, route publik dan protected route memiliki test dasar, 401 mengarah ke login, 403 ke halaman akses ditolak.

### Fase F1 - Auth, App Shell, dan Profile

```text
Implementasikan /login, /forgot-password, authenticated app shell, app bar,
role navigation, logout, dan profile menggunakan API contract.

Ikuti DESIGN_BRIEF: Plus Jakarta Sans, token warna/spasi/radius, sentence case,
accessible labels, focus-visible, error field dengan aria-describedby, dan tidak
ada bell notification. Sediakan loading, validation error, server error,
expired-session, dan keyboard flow.

Tambahkan component test untuk login success/error, forgot-password validation,
role redirect, logout, profile edit, dan field username/NIM yang tidak editable.
```

**Checkpoint:** tiga role mendapat shell dan navigasi sesuai scope; mobile/desktop tidak overlap; lint/build/component test lulus.

### Fase F2 - Student Dashboard, Schedule, dan History

```text
Implementasikan dashboard siswa, banner aktif, ringkasan absensi hari ini,
jadwal/time rail, history, filter, detail, empty/loading/error/offline state.

Gunakan label PRD: Hadir, Terlambat, Tidak Hadir, Bisa absen, Belum dibuka,
Selesai. Status tidak boleh hanya dibedakan melalui warna. Jangan menambahkan
notifikasi, search tanpa requirement, dynamic QR, atau fitur non-MVP.

Gunakan React Query untuk server state dan invalidate query setelah mutation.
Tambahkan test untuk query/error/empty/filter dan akses role.
```

### Fase F3 - Student QR Scanner dan Result

```text
Implementasikan flow pre-check, permission kamera, scanner qr-scanner, manual
fallback bila kamera tidak tersedia, mutation scan satu kali, dan result panel.

Kamera hanya diminta setelah aksi pengguna. Hentikan scan saat QR terdeteksi,
disable retry cepat selama request, dan tampilkan hasil server tanpa menghitung
status di client. Tangani belum dibuka, sesi selesai, QR invalid, duplicate,
offline, permission denied, dan server error dengan aksi berikutnya.

Pastikan frame 1:1 responsif, live region untuk state penting, accessible name,
dan layout mobile 320px. Jangan mengimplementasikan scan dari galeri kecuali
keputusan produk berubah.
```

**Checkpoint:** component/E2E test mencakup success Hadir, Terlambat, duplicate, invalid QR, offline, dan camera permission failure.

### Fase F4 - Teacher Workspace

```text
Implementasikan dashboard guru, assignment list, form buat sesi, QR display,
attendance detail per kelas, dan export XLSX.

Semua assignment/session berasal dari API; frontend tidak membuat QR atau
menentukan scope. Tampilkan detail mapel, kelas, guru, tanggal, window waktu,
loading, duplicate session, export loading/error, dan empty state. Gunakan two
panel pada desktop dan layout satu kolom pada mobile tanpa mengorbankan primary
action.
```

### F5 - Admin Workspace

```text
Implementasikan dashboard admin, banner management, user/reset password,
education level/class/subject, plotting siswa-guru, global attendance report,
filter/pagination, dan export.

Setiap tabel memiliki loading, empty, error per tabel, retry, confirmation untuk
tindakan destruktif, keyboard support, dan scope yang terlihat. Jangan menaruh
semua data dalam satu global store; gunakan React Query dengan query key yang
memasukkan filter.
```

### Fase F6 - Frontend Quality and Integration

```text
Lakukan audit frontend terhadap DESIGN_BRIEF, frontend/GUIDE.md, dan API contract.

Uji viewport 320px, 768px, dan 1440px; keyboard-only flow; focus-visible;
contrast; reduced motion; loading/empty/error/offline; 401/403; dan tidak adanya
PII/token di DOM atau console. Jalankan lint, build, component test, dan
Playwright untuk login, role guard, scan result, create session, dan download
export.

Perbaiki hanya issue yang ditemukan dan laporkan residual risk. Jangan menambah
fitur di luar PRD.
```

## 7. Prompt Review Akhir

```text
Lakukan final review sebagai reviewer teknis. Prioritaskan bug, authorization
leakage, race condition/idempotency, kesalahan timezone/status, security issue,
regresi API, accessibility, dan test gap.

Periksa implementasi terhadap PRD, DESIGN_BRIEF, backend/GUIDE.md,
frontend/GUIDE.md, docs/DECISIONS.md, dan docs/API_CONTRACT.md. Tampilkan temuan
berdasarkan severity dengan file yang terdampak, bukti, dampak, dan perbaikan
minimal. Setelah itu tampilkan test yang sudah lulus dan residual risk.
Jangan melakukan refactor atau edit sebelum daftar temuan disetujui.
```

## 8. Pola Prompt Perbaikan Ketika Test Gagal

```text
Test berikut gagal: [nama command/test dan output ringkas].

Kerjakan diagnosis lokal pada slice yang sama. Baca implementasi dan test yang
gagal, rumuskan hipotesis penyebab, lalu lakukan perubahan terkecil yang dapat
membedakan hipotesis tersebut. Jangan memperluas scope atau mengubah kontrak
API tanpa bukti. Jalankan ulang test yang sama sebelum test lain.

Laporkan root cause, file yang berubah, hasil rerun, dan apakah perlu update
dokumentasi/contract.
```

## 9. Checklist Handoff Antar Fase

### Backend ke frontend

- [ ] `docs/DECISIONS.md` tersedia dan keputusan kritis sudah dikunci.
- [ ] Migration, seed, `.env.example`, dan setup lokal terdokumentasi.
- [ ] Auth cookie/session, 401, 403, logout, dan role policy teruji.
- [ ] Domain attendance boundary, timezone, duplicate, dan idempotency teruji.
- [ ] History, report, scope, dan export XLSX teruji.
- [ ] Health/readiness, logging, rate limit, dan error contract tersedia.
- [ ] `docs/API_CONTRACT.md` sesuai dengan route dan schema nyata.

### Frontend ke release

- [ ] Semua role memiliki route guard dan navigation scope.
- [ ] Loading, empty, error, offline, success, dan expired-session state tersedia.
- [ ] Scanner memakai server result dan memiliki fallback permission/error.
- [ ] Tidak ada token/secret/PII sensitif di localStorage, console, atau DOM yang tidak perlu.
- [ ] UI diuji pada 320px, 768px, dan 1440px.
- [ ] Keyboard, focus, label, status text, dan contrast memenuhi brief.
- [ ] Lint, build, component test, integration/E2E test lulus.

## 10. Prinsip Penting

- Satu prompt = satu scope yang dapat diuji.
- Backend memutuskan authorization, waktu, status absensi, dan scope data.
- Constraint database dan transaction melindungi behavior yang tidak boleh duplikat.
- Test boundary lebih penting daripada demo happy path.
- Contract API dikunci sebelum UI memakai endpoint.
- Agent harus berhenti pada blocker nyata dan meminta keputusan, bukan menebak requirement.
- Fitur non-MVP seperti notifikasi, dynamic QR, multi-school, dan scan galeri tidak boleh masuk tanpa keputusan produk baru.
