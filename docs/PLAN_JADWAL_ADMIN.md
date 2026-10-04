# PLAN — Jadwal (Sesi Absensi) di Kendali Admin & Penempatan di Halaman Pengguna

**Status: SELESAI (P0–P6). Keputusan dikunci di `DECISIONS.md` §22.**
**Scope:** backend + frontend.

> **Revisi (pasca-P6):** aksi "Penugasan" pada tabel Pengguna **dihapus**; penugasan guru dibentuk **otomatis saat admin membuat/mengubah sesi** (J7). Form sesi memilih Kelas + Mata pelajaran + Guru; `POST`/`PATCH` sesi memakai triplet tersebut (bukan `assignmentId`). Halaman Penempatan tetap dihapus.

Dokumen ini merencanakan dua perubahan tata kelola pada workspace Admin:

1. **Jadwal = sesi absensi** dipindah sepenuhnya ke kendali Admin. Guru tidak lagi membuat/mengubah/menghapus sesi; guru tetap membaca sesi miliknya, menampilkan QR, melihat kehadiran kelas, dan mengekspor rekap.
2. **Penempatan** (siswa→kelas dan guru→kelas+mapel) dilakukan langsung di halaman **Pengguna**; halaman **Penempatan** terpisah dihapus.

Dokumen acuan: [PRD](PRD.md), [DECISIONS](DECISIONS.md), [API_CONTRACT](API_CONTRACT.md), [DESIGN_BRIEF](DESIGN_BRIEF.md), [PROMPT_GUIDE](PROMPT_GUIDE.md), [PLAN_ADMIN_CRUD](PLAN_ADMIN_CRUD.md), `backend/GUIDE.md`, `frontend/GUIDE.md`, `AGENTS.md`.

---

## 1. Keputusan scope hasil klarifikasi

Keputusan pemangku kepentingan (sesi klarifikasi):

1. **Arti "jadwal":** sesi absensi yang sudah ada sekarang (`attendance_sessions`) — **bukan** model jadwal pelajaran berulang baru. Tidak ada tabel/migration baru.
2. **Akses guru setelah perubahan:** guru tetap dapat **melihat sesi miliknya, menampilkan QR, melihat rekap kehadiran kelas, dan export**. Yang dicabut hanya hak **membuat/mengubah/menghapus** sesi.
3. **Bentuk penempatan:** **aksi per baris pengguna** di halaman Pengguna, membuka dialog. Siswa → kelola kelas; Guru → kelola penugasan.
4. **Halaman Penempatan terpisah: DIKONFIRMASI dihapus total** (route `admin/plotting` + item menu + tautan beranda). Tanpa redirect/deep-link.

`class_students`, `teacher_assignments`, dan `attendance_sessions` sudah punya operasi CRUD admin (PLAN_ADMIN_CRUD / DECISIONS §21); perubahan di sini **mengubah otorisasi** (`POST attendance-sessions`) dan **memindahkan lapisan UI**, bukan medan data baru.

---

## 2. Baseline kondisi saat ini

| Aspek | Kondisi sekarang | Lokasi kunci |
| --- | --- | --- |
| Create sesi | `ADMIN` **dan** `TEACHER` (guru di-scope ke assignment miliknya) | `backend/src/routes/attendance.routes.js:24-30`; `backend/src/services/attendance.service.js:137-180` |
| Update/Delete sesi | `ADMIN` only, sudah ada | `attendance.routes.js:37-51` |
| Baca sesi + QR | `ADMIN` (semua) dan `TEACHER` (miliknya) | `attendance.routes.js:31-36,52-58`; `attendance.service.js:247-261` |
| Halaman sesi admin | `AdminSessionsPage` (list + create/edit/delete) — label nav "Sesi" | `frontend/src/pages/admin/SessionsPage.jsx`; `frontend/src/lib/permissions.js:46` |
| Halaman buat sesi guru | `/app/teacher/sessions/new` + `SessionForm` + `useCreateSession` | `frontend/src/pages/teacher/CreateSessionPage.jsx`; `frontend/src/features/teacher/SessionForm.jsx` |
| Entry "Buat sesi" guru | Dashboard, Sessions, Assignments, `AssignmentCard` | `teacher/DashboardPage.jsx:56-62,134-141`; `teacher/SessionsPage.jsx:24-31,41-48`; `features/teacher/AssignmentCard.jsx:10,41` |
| Penempatan | Halaman terpisah `/app/admin/plotting` (tab siswa & guru) + menu "Penempatan" | `frontend/src/pages/admin/PlottingPage.jsx`; `permissions.js:45,75`; `admin/DashboardPage.jsx:12` |
| Data penempatan | `GET /academic/memberships?classId`; `GET /academic/assignments/manage?teacherId`; POST/PATCH/DELETE | `backend/src/routes/academic.routes.js:32-40`; `services/academic.service.js:128-237` |
| Halaman Pengguna | list + create/edit/reset/delete; baris aksi per role | `frontend/src/pages/admin/UsersPage.jsx`; `features/admin/views/UserViews.jsx` |

---

## 3. Prinsip & guardrail yang wajib dijaga

- **Layering:** route → middleware → controller → service → repository. Controller tipis; aturan bisnis di service; skema Zod di `src/schemas/`. (`AGENTS.md`)

- **Error contract** tetap `{ error: { code, message, fieldErrors? } }` (400/401/403/404/409/429). Pesan berbahasa Indonesia.

- **Scan-path constraint:** jangan menambah query banner/report/export di jalur scan. Perubahan `createSession` tidak menyentuh jalur scan.

- **UTC + `SCHOOL_TIMEZONE`:** sesi tetap dinormalisasi server; tidak ada perubahan aturan window/status.

- **Frontend bukan sumber kebenaran:** role, waktu, status, dan scope tetap diputus backend. Dialog penempatan hanya mengirim input; server menegakkan "satu kelas aktif per siswa" (D2) dan uniqueness assignment.

- **Idempotensi & invariant:** test duplicate/concurrent scan, boundary waktu, dan `SESSION_HAS_RECORDS` wajib tetap hijau.

- **Jangan menambah fitur di luar PRD tanpa dicatat.** PRD **FR-05** menyebut sesi dibuat **Guru**. Memindahkannya menjadi Admin-only **melampaui PRD** → wajib dikunci sebagai keputusan baru di `docs/DECISIONS.md` (meng-override bagian guru pada A0-4). Lihat bagian 4.

- **Test:** backend `npm run lint`, `npm run test:unit`, `npm run test:integration`; frontend `npm run lint`, `npm run test`, `npm run build`. Semua test existing (88 frontend + suite backend) wajib tetap hijau setelah disesuaikan.

---

## 4. Keputusan yang dikunci di `docs/DECISIONS.md` (§22 — P0 SELESAI)

> Entri #22 dengan J1–J6 sudah ditulis. Kode belum diimplementasikan (fase P1–P6).

- **J1 — Sesi/jadwal dibuat Admin saja.** `POST /api/v1/attendance-sessions` menjadi `authorize('ADMIN')`. Service memakai `findActiveAssignmentById` untuk assignment mana pun yang aktif. Mencabut wewenang create guru (meng-override A0-4 bagian TEACHER). Alasan: permintaan pemangku kepentingan; jadwal terpusat. Dampak: test `attendanceSession` disesuaikan; kontrak/OpenAPI diperbarui.
- **J2 — Guru tetap read-only terhadap sesi.** `GET /attendance-sessions` (milik sendiri), `GET /:id/qr`, `GET /attendance/classes/:id`, dan `GET /reports/attendance/export` tidak berubah. Guru tidak lagi melihat tombol "Buat sesi".
- **J3 — Penempatan di halaman Pengguna.** Aksi per baris: STUDENT → "Kelola kelas"; TEACHER → "Kelola penugasan". Halaman `/app/admin/plotting` + item menu "Penempatan" + tautan beranda dihapus total.
- **J4 — Ganti kelas siswa (non-atomic) — DIKONFIRMASI.** Perpindahan kelas = nonaktifkan membership aktif (`DELETE /academic/memberships/:id`) lalu buat membership baru (`POST /academic/memberships`). Keduanya endpoint yang sudah ada; tidak ada endpoint baru pada MVP.
- **J5 — Filter `studentId` pada daftar membership.** `GET /academic/memberships` menerima `studentId` opsional (allowlist) agar dialog siswa dapat membaca kelas aktifnya tanpa menarik seluruh data. `teacherId` pada `/assignments/manage` sudah ada dan dipakai ulang.
- **J6 — Label UI "Jadwal".** Menu/halaman admin untuk sesi absensi diberi label "Jadwal" (heading "Jadwal absensi"). Route internal tetap `/app/admin/sessions` untuk meminimalkan churn; rename path adalah keputusan terpisah bila diinginkan.

---

## 5. Perubahan backend

### 5.1 `POST /api/v1/attendance-sessions` menjadi Admin-only

- `backend/src/routes/attendance.routes.js`: ubah `authorize("ADMIN", "TEACHER")` → `authorize("ADMIN")` pada `POST /` (baris 24-30). `GET /` dan `GET /:id/qr` tetap `ADMIN`/`TEACHER`.
- `backend/src/services/attendance.service.js` `createSession` (137-180):
  - Ganti guard menjadi `if (user.role !== 'ADMIN')` → `403 FORBIDDEN` ("Hanya admin yang dapat membuat jadwal absensi.").
  - Assignment selalu `repository.findActiveAssignmentById(data.assignmentId)`; tidak ada lagi cabang ownership TEACHER. Bila tidak ada → `404 NOT_FOUND` ("Penugasan tidak ditemukan.").
  - `createdById = user.id`; `qrPayload` tetap dibuat server; duplikat tetap `409 DUPLICATE_ATTENDANCE_SESSION`.
- Method repository `findActiveAssignmentForTeacher` tidak lagi dipakai oleh `createSession`. **Pilihan:** biarkan (test lain mungkin memakai) atau hapus bila benar-benar tak terpakai; dicatat saat implementasi.

### 5.2 Filter `studentId` pada daftar membership

- `backend/src/schemas/academic.schemas.js` `membershipListSchema` (58-64): tambah `studentId: id.optional()`.
- `backend/src/repositories/academic.repository.js` `listMemberships(query)` (158-169): bangun `where` dari `classId` **dan/atau** `studentId`.
- Authorization tidak berubah (ADMIN via `requireAdmin`).

### 5.3 Test backend

- `backend/tests/integration/attendanceSession.test.js`:
  - Teacher `POST` → **403** (sebelumnya 201).
  - Admin `POST` untuk assignment aktif → 201 (tetap).
  - Teacher tetap bisa `GET /attendance-sessions` (hanya miliknya) dan `GET /:id/qr` miliknya → **tetap hijau**; QR guru lain → 404.
  - Guru `PATCH`/`DELETE` → 403 (tetap).
  - Duplikat, `SESSION_HAS_RECORDS`, filter `deletedAt` tetap diuji.
- `backend/tests/integration/academic.test.js`: tambah `GET /academic/memberships?studentId=...` mengembalikan membership siswa terpilih; non-admin → 403.
- Unit schema: `membershipListSchema` menerima/menolak `studentId`.
- Mock `prisma` pada injection test disesuaikan bila signature `listMemberships` berubah.

---

## 6. Perubahan frontend

### 6.1 Admin — halaman Jadwal

- `frontend/src/pages/admin/SessionsPage.jsx`: heading "Jadwal absensi", deskripsi disesuaikan ("Kelola jadwal sesi absensi seluruh kelas"). CRUD sudah lengkap; tidak ada perubahan logika.
- `frontend/src/lib/permissions.js`:
  - `ROLE_NAV.ADMIN`: hapus `Penempatan` (baris 45), hapus entri `Pengguna` duplikat (baris 48), ubah label `Sesi` → `Jadwal` (baris 46).
  - `ROLE_BOTTOM_NAV.ADMIN`: hapus `Penempatan` (baris 75); sesuaikan ikon/label bila perlu.
- `frontend/src/pages/admin/DashboardPage.jsx`: hapus `QUICK_LINKS` "Penempatan" (baris 12); tambahkan tautan "Jadwal absensi" ke `/app/admin/sessions`.

### 6.2 Guru — menjadi read-only

- Hapus route `teacher/sessions/new` di `frontend/src/app/router.jsx:65` dan import `TeacherCreateSessionPage`.
- Hapus berkas yang menjadi dead code: `frontend/src/pages/teacher/CreateSessionPage.jsx`, `CreateSessionPage.test.jsx`, `frontend/src/features/teacher/SessionForm.jsx`, `frontend/src/features/teacher/hooks/useCreateSession.js`. (Pastikan tidak ada importer lain sebelum menghapus.)
- `frontend/src/pages/teacher/SessionsPage.jsx`: hapus tombol/link "Buat sesi" (baris 24-31) dan aksi pada empty state (baris 41-48); ubah salinan menjadi "Jadwal sesi yang dibuat admin."
- `frontend/src/pages/teacher/DashboardPage.jsx`: hapus CTA "Buat sesi" header (56-62) dan CTA empty (134-141); ubah pesan empty menjadi arahan menghubungi admin; simpulkan kartu "Sesi dibuat" → "Sesi tersedia" / tetap.
- `frontend/src/pages/teacher/AssignmentsPage.jsx`: hapus kalimat "Buat sesi absensi dari salah satu penugasan" (baris 19-20).
- `frontend/src/features/teacher/AssignmentCard.jsx`: hapus tautan/aksi "Buat sesi" (baris 10, 41) — kartu menjadi informasi saja.
- Navigasi guru (`permissions.js:34-39`) tidak berubah; "Sesi absensi" tetap (kini read-only).

### 6.3 Penempatan di halaman Pengguna

- `frontend/src/pages/admin/UsersPage.jsx`:
  - Teruskan role target ke view dan tambahkan handler aksi penempatan.
  - State baru: `placementTarget` (student) dan `assignmentsTarget` (teacher), masing-masing membuka dialog.
- `frontend/src/features/admin/views/UserViews.jsx`:
  - `RowActions`: tambah tombol **"Kelas"** bila `user.role === 'STUDENT'`, tombol **"Penugasan"** bila `user.role === 'TEACHER'` (selain Ubah/Hapus/Reset).
- Dialog baru (reuse komponen yang ada sebisa mungkin):
  - `frontend/src/features/admin/forms/StudentPlacementDialog.jsx`: menampilkan kelas aktif siswa (dari `useMemberships({ studentId })`), dropdown kelas (dari `useClasses`), tombol "Tempatkan"/"Pindah kelas" (jika sudah ada kelas aktif → `useDeleteMembership` lalu `useCreateMembership`, sesuai J4), dan tombol "Keluarkan dari kelas" (nonaktifkan).
  - `frontend/src/features/admin/forms/TeacherAssignmentsDialog.jsx`: daftar penugasan guru (`useAssignmentsManage({ teacherId })`), tambah penugasan (`useCreateAssignment` + pilih kelas/mapel), nonaktifkan/aktifkan (`useDeleteAssignment`/`useUpdateAssignment`). Dapat memakai ulang `AssignmentsManageTable`.
- Hook `frontend/src/features/admin/hooks/usePlotting.js` diperluas: `useMemberships({ studentId })` (filter baru) dan invalidasi query tetap. Service `academicService` sudah menyediakan fungsi; tambahkan parameter `studentId` pada `getMemberships`.
- **Hapus:** `frontend/src/pages/admin/PlottingPage.jsx`, `PlottingPage.test.jsx`, route `admin/plotting` (`router.jsx:78`), item nav/dashboard "Penempatan".

### 6.4 Test frontend

- `UsersPage.test.jsx`: aksi "Kelas" untuk siswa (tempatkan/pindah) dan "Penugasan" untuk guru (tambah/hapus).
- `adminAccess.test.jsx` / `router.test.jsx`: hapus ekspektasi route/nav `plotting`; verifikasi nav admin tanpa "Penempatan" dan dengan "Jadwal".
- Hapus/ubah test guru yang mengasumsikan "Buat sesi": `CreateSessionPage.test.jsx` (dihapus), `teacher/DashboardPage.test.jsx`, `teacher/SessionsPage` bila ada, `teacher/AssignmentsPage.test.jsx` (baris 30-33), `teacherAccess.test.jsx` bila merujuk `sessions/new`.
- MSW handler: hapus `POST /attendance-sessions` untuk role guru bila dipakai test; tambah query `studentId` pada handler memberships.

---

## 7. Sinkronisasi dokumen

- `docs/DECISIONS.md`: entri **#22** (J1–J6), menegaskan override A0-4 (guru create dicabut) dan keputusan melody.
- `docs/API_CONTRACT.md`: ubah role `POST /attendance-sessions` → ADMIN (baris 894); tambah query `studentId` pada `GET /academic/memberships` (bagian 6.4); perbarui catatan scope guru (baris 369-370).
- `docs/openapi.yaml`: role/param tersebut.
- `docs/DATABASE.md`: **tidak berubah** (tanpa migration).
- `docs/DOKUMENTASI_PROJECT_SINTAS.md`: daftar route (`plotting` dihapus; guru tanpa `sessions/new`) dan narasi alur sesi.
- `docs/PARITY_REPORT.md`: hapus baris halaman admin `plotting`.
- `docs/PRD.md`: **tidak diubah**; diskrepansi FR-05 dijelaskan di DECISIONS #22.

---

## 8. Urutan fase & checkpoint

| Fase | Isi | Checkpoint |
| --- | --- | --- |
| **P0** | Kunci keputusan J1–J6 di `docs/DECISIONS.md` #22; jawab Open Items | Tidak ada item wajib yang BLOCKED |
| **P1** | Backend: `POST attendance-sessions` ADMIN-only + test | `test:integration` attendanceSession + scan hijau |
| **P2** | Backend: filter `studentId` membership + test | `test:integration` academic hijau |
| **P3** | Frontend admin: label "Jadwal", nav/dashboard, hapus "Penempatan" dari nav | `adminAccess.test.jsx`, `router.test.jsx` hijau |
| **P4** | Frontend guru: hapus create sesi (route, halaman, aksi) | Test guru + lint/build hijau |
| **P5** | Frontend penempatan di halaman Pengguna + hapus halaman/route Plotting | `UsersPage.test.jsx` + lint/build hijau |
| **P6** | Sinkron `API_CONTRACT`/`openapi`/`DOKUMENTASI`/`PARITY` + review akhir | Semua test/lint/build hijau; dokumen konsisten route nyata |

---

## 9. Skenario verifikasi utama

1. Guru membuka "Sesi absensi" → melihat sesi miliknya; **tidak ada** tombol Buat sesi; `POST /attendance-sessions` dari sesi guru → `403`.
2. Admin membuat sesi untuk assignment guru mana pun → QR terbit; guru pemilik assignment dapat membuka QR dan menampilkan di kelas.
3. Guru lain membuka QR sesi bukan miliknya → `404`.
4. Admin menghapus/mengubah sesi tanpa scan → sukses; yang sudah punya scan → `409 SESSION_HAS_RECORDS`.
5. Halaman Pengguna: siswa tanpa kelas → "Kelas" → tempatkan → aktif; siswa dengan kelas → "Kelas" → pindah → kelas lama nonaktif, kelas baru aktif; "Keluarkan" → nonaktif.
6. Halaman Pengguna: guru → "Penugasan" → tambah/nonaktifkan penugasan; guru melihat perubahan di halaman Penugasan/beranda (via `GET /academic/assignments`).
7. Menu admin tidak lagi memuat "Penempatan"; route `/app/admin/plotting` tidak dapat diakses (kecuali memilih redirect O-1).
8. Report/export tidak berubah; sesi ter-soft-delete tetap tidak muncul.

---

## 10. Risiko & Open Items

- **O-1 — Nasib deep-link `/app/admin/plotting` — SELESAI.** Dikonfirmasi dihapus total, tanpa redirect; route tidak didefinisikan (jatuh ke halaman 404).
- **O-2 — Perpindahan kelas non-atomic — SELESAI.** Dikonfirmasi memakai dua request (nonaktifkan lalu buat) sesuai J4; risiko kegagalan request kedua diterima pada MVP. Endpoint atomik tidak dibuat.
- **O-3 — Satu kelas aktif per siswa (D2).** Dialog harus menonaktifkan kelas lama sebelum menetapkan kelas baru; `POST` hanya menolak `409 ACTIVE_CLASS_MEMBERSHIP_EXISTS` bila masih ada kelas aktif. Pastikan urutan request di UI benar.
- **O-4 — Batas satu arsip nonaktif.** `class_students`/`teacher_assignments` memiliki `@@unique([..., isActive])`; siklus aktif→nonaktif berulang dapat memicu `409 MEMBERSHIP_ARCHIVED`/`ASSIGNMENT_ARCHIVED` (lihat PLAN_ADMIN_CRUD O-4). UI harus menampilkan pesan jelas.
- **O-5 — Performa dialog penugasan guru.** `GET /assignments/manage?teacherId=` sudah ter-paginasi (default 20). Dialog perlu pagination atau limit memadai agar guru dengan banyak penugasan tetap lengkap.
- **O-6 — Diskrepansi PRD FR-05.** Sesi kini 100% Admin. Wajib tercatat di DECISIONS #22; PRD tidak diubah.
- **O-7 — Nama route "sessions" vs label "Jadwal".** Label UI "Jadwal" dengan path `/app/admin/sessions` dapat membingungkan developer; rename path adalah keputusan terpisah (menyentuh test).
- **O-8 — Ikon nav "Sesi" guru.** Label guru dipertahankan "Sesi absensi"; bila produk ingin menyeragamkan istilah "Jadwal", berlaku perubahan label serupa (tanpa logika).
