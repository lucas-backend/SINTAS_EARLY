# PLAN — CRUD Admin untuk Semua Tabel

**Status: SELESAI (A0–A8). Keputusan dikunci di `DECISIONS.md` §21.**
**Scope:** backend + frontend.

Dokumen ini merencanakan pelengkapan operasi Create/Read/Update/Delete (CRUD/**soft delete**) untuk seluruh tabel yang dikelola Admin pada halaman admin SINTAS. Dokumen acuan: [PRD](PRD.md), [DECISIONS](DECISIONS.md), [API_CONTRACT](API_CONTRACT.md), [DESIGN_BRIEF](DESIGN_BRIEF.md), [PROMPT_GUIDE](PROMPT_GUIDE.md), `backend/GUIDE.md`, `frontend/GUIDE.md`, `AGENTS.md`.

---

## 1. Keputusan scope hasil klarifikasi

Keputusan pemangku kepentingan (sesi klarifikasi):

1. **Tabel yang dilengkapi:** `users` (update + delete), `class_students` (delete), `teacher_assignments` (delete), `attendance_sessions` (CRUD admin). `attendance_records` **tidak** masuk scope (dikunci D9/no-delete MVP).
2. **Strategi hapus:** soft delete / deactivate (bukan hard delete), agar riwayat absensi & FK `onDelete: Restrict` tidak rusak.
3. **Edit pengguna:** field dasar (`name`, `email`, `phone`, `birthDate`) **plus** data akademik siswa (`studentNumber`, `educationLevelId`). `username` dan `role` **tidak** dapat diubah.
4. **Cakupan:** backend + frontend.

`education_levels`, `classes`, `subjects`, `banners` sudah CRUD penuh dan **tidak** diubah pada fase ini (lihat Open Item O-1).

---

## 2. Matriks status CRUD saat ini

| Tabel | Create | Read (list) | Update | Delete | Aksi plan |
| --- | --- | --- | --- | --- | --- |
| `users` | ✅ `POST /users` | ✅ `GET /users` | ➖ hanya reset password | ❌ | + `PATCH /users/:id`, `DELETE /users/:id` |
| `student_profiles` | ✅ via create user | nested | ❌ | ❌ | ikut `PATCH /users/:id` (upsert) |
| `teacher_profiles` | ✅ via create user | nested | n/a | n/a | tidak ada field tambahan |
| `education_levels` | ✅ | ✅ | ✅ | ✅ | tidak diubah |
| `classes` | ✅ | ✅ | ✅ | ✅ | tidak diubah |
| `subjects` | ✅ | ✅ | ✅ | ✅ | tidak diubah |
| `class_students` | ✅ `POST /academic/memberships` | ✅ `GET .../memberships` | ✅ `PATCH .../memberships/:id` (`isActive`) | ❌ | + `DELETE .../memberships/:id` (deactivate) |
| `teacher_assignments` | ✅ `POST /academic/assignments` | ✅ `GET .../assignments/manage` | ✅ `PATCH .../assignments/:id` (`isActive`) | ❌ | + `DELETE .../assignments/:id` (deactivate) |
| `attendance_sessions` | ➖ TEACHER only | ✅ `GET /attendance-sessions` (ADMIN) | ❌ | ❌ | admin CRUD: izinkan ADMIN create, + `PATCH`, + `DELETE` (soft) |
| `attendance_records` | ➖ via scan | via report | ❌ | ❌ (dikunci D9) | **tidak diubah** |
| `banners` | ✅ | ✅ | ✅ | ✅ | tidak diubah |

UI admin saat ini: `UsersPage` (create + reset password), `AcademicPage` (CRUD penuh), `PlottingPage` (**read-only**), `BannersPage` (CRUD penuh), `ReportsPage` (read/export). Tidak ada halaman sesi admin.

---

## 3. Prinsip & guardrail yang wajib dijaga

- **Layering:** route → middleware → controller → service → repository. Controller tipis, aturan bisnis di service, skema Zod di `src/schemas/`. (`AGENTS.md`)
- **Error contract:** `{ error: { code, message, fieldErrors? } }`, status 400/401/403/404/409.
- **CSRF + HttpOnly cookie** tidak disentuh; `x-csrf-token` untuk request state-changing.
- **UTC + `SCHOOL_TIMEZONE`** untuk semua timestamp sesi.
- **Scan-path constraint:** jangan menambah query banner/report/export di jalur scan. Perubahan `findSessionForScan` hanya boleh menambah filter `deletedAt: null` (predikat kolom, bukan query baru).
- **Frontend bukan sumber kebenaran:** role, status, waktu, scope selalu dari backend.
- **Jangan menambah fitur di luar PRD tanpa mencatatnya di `docs/DECISIONS.md`.** Admin membuat/mengubah sesi absensi berada di luar FR-05 (sesi dibuat Guru) sehingga **wajib** dikunci sebagai keputusan baru (lihat bagian 5).
- **Test:** backend `npm run lint`, `npm run test:unit`, `npm run test:integration`; frontend `npm run lint`, `npm run test`, `npm run build`. Semua test existing (88 frontend + suite backend) wajib tetap hijau.

---

## 4. Model soft delete (keputusan teknis utama)

Karena FK mayoritas `onDelete: Restrict`, hard delete tidak aman. Konvensi yang diusulkan:

| Tabel | Mekanisme delete | Kolom baru | Aturan query |
| --- | --- | --- | --- |
| `users` | `deletedAt = now()` | `deletedAt DateTime?` | semua list & auth mengabaikan `deletedAt != null` |
| `attendance_sessions` | `deletedAt = now()` | `deletedAt DateTime?` | list/report/QR/scan mengabaikan `deletedAt != null` |
| `class_students` | `isActive = false` (idempotent) | — (pakai `isActive`) | list sudah memuat status; tambah filter opsional |
| `teacher_assignments` | `isActive = false` (idempotent) | — (pakai `isActive`) | idem |
| `education_levels`/`classes`/`subjects` | tetap hard delete (fase ini) | — | — |

**Catatan integritas penting:**
- `class_students`/`teacher_assignments` memiliki `@@unique([..., isActive])` sehingga hanya boleh ada **satu baris nonaktif** per tuple. Delete harus **idempotent**: bila baris sudah nonaktif → `200`; bila Prisma melempar `P2002` (sudah ada baris nonaktif lain) → `409 MEMBERSHIP_ARCHIVED`/`ASSIGNMENT_ARCHIVED`.
- Soft-deleted `users` **tetap memegang** `username`/`email` unik (tidak bisa dipakai ulang) — agar identitas historis tidak tertukar. Dicatat sebagai asumsi.
- Soft-deleted `attendance_sessions` tetap memegang unique `(assignmentId, sessionDate, startAt, endAt)`, sehingga sesi identik tidak bisa dibuat ulang selama masih soft-deleted → tetap `409 DUPLICATE_ATTENDANCE_SESSION`. Dicatat sebagai batasan MVP.
- **Token JWT bersifat stateless** (`ACCESS_TOKEN_TTL` default `15m`, `authenticate` tidak membaca DB). User yang di-soft-delete masih bisa memakai token aktifnya maksimal 15 menit. Keputusan: terima risiko ini pada MVP + tolak login user terhapus; alternatif (lookup DB di `authenticate`) dicatat di Open Item O-3.

---

## 5. Keputusan yang sudah dikunci di `docs/DECISIONS.md` (Phase A0 — SELESAI)

Entri **#21 — CRUD Admin dan soft delete (PLAN_ADMIN_CRUD)** telah ditambahkan (A0-1 s.d. A0-7), memuat:

1. Soft delete `users` + `attendance_sessions` memakai `deletedAt`; `class_students`/`teacher_assignments` memakai `isActive=false` idempotent.
2. Field edit user dan larangan mengubah `username`/`role`.
3. Admin boleh create/update/delete sesi absensi (melampaui FR-05) + aturan guard (bagian 6.4).
4. Perilaku login untuk user terhapus + batas token 15 menit.
5. Penegasan `attendance_records` tetap tanpa delete (D9) dan master akademik tetap hard delete pada fase ini.

Open Items yang belum dikunci (jangan ditebak; perlu keputusan product sebelum item terkait dikerjakan): lihat bagian 11.

---

## 6. Perubahan backend

### 6.1 Schema & migration

`backend/prisma/schema.prisma`:

```prisma
model User {
  ...
  deletedAt DateTime? @map("deleted_at") @db.Timestamp(6)
  @@index([deletedAt])
}

model AttendanceSession {
  ...
  deletedAt DateTime? @map("deleted_at") @db.Timestamp(6)
  @@index([deletedAt])
}
```

- Migration: `npx prisma migrate dev --name admin_crud_soft_delete` (dari `backend/`).
- `npx prisma generate`.
- Seed (`backend/prisma/seed.js`) tidak perlu berubah (data seed `deletedAt = null`), tetapi robust terhadap upsert: tidak menyentuh `deletedAt`.
- Update `docs/DATABASE.md` (kolom baru + tabel `users`/`attendance_sessions`).

### 6.2 Schema validasi baru (`backend/src/schemas/academic.schemas.js`)

```js
export const updateUserSchema = z.object({
  name: z.string().trim().min(1).max(150).optional(),
  email: z.string().trim().email().max(255).nullable().optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  birthDate: z.coerce.date().nullable().optional(),
  studentNumber: z.string().trim().min(1).max(50).optional(),
  educationLevelId: id.optional(),
}).strict()
```

- Service menolak `studentNumber`/`educationLevelId` bila target bukan `STUDENT` → `400 VALIDATION_ERROR`.
- Untuk student, bila salah satu field profil dikirim, kedua/kolomnya di-upsert sesuai nilai tersimpan.

`backend/src/schemas/attendance.schemas.js` tambah:

```js
export const attendanceSessionPatchSchema = attendanceSessionSchema
  .partial()
  .strict()
  // superRefine: minimal satu field ada; timezone tetap divalidasi bila dikirim
```

### 6.3 Endpoint baru/berubah

| Method | Path | Auth | Perubahan |
| --- | --- | --- | --- |
| `PATCH` | `/api/v1/users/:id` | ADMIN | **baru** — edit field dasar + profil siswa |
| `DELETE` | `/api/v1/users/:id` | ADMIN | **baru** — soft delete |
| `DELETE` | `/api/v1/academic/memberships/:id` | ADMIN | **baru** — deactivate idempotent |
| `DELETE` | `/api/v1/academic/assignments/:id` | ADMIN | **baru** — deactivate idempotent |
| `POST` | `/api/v1/attendance-sessions` | ADMIN, TEACHER | **ubah** — ADMIN diizinkan (tanpa ownership) |
| `PATCH` | `/api/v1/attendance-sessions/:id` | ADMIN | **baru** — edit metadata sesi |
| `DELETE` | `/api/v1/attendance-sessions/:id` | ADMIN | **baru** — soft delete |

#### Users — `PATCH /api/v1/users/:id`

- Body `updateUserSchema` (strict).
- Service:
  - Target wajib ada, `role != ADMIN`, dan `deletedAt == null` → else `404 NOT_FOUND`.
  - `email` berubah → cek unik → `409 DUPLICATE_EMAIL`.
  - `studentNumber` berubah → cek unik → `409 DUPLICATE_STUDENT_NUMBER`.
  - Bukan student + field profil siswa dikirim → `400 VALIDATION_ERROR`.
  - Student + field profil dikirim → upsert `studentProfile` (validasi `educationLevelId` ada).
  - Return `publicUser`.
- Repository (`management.repository.js`): `updateUser(id, data, studentProfileData)`; tambah `findStudentNumber`.
- Controller/hook `useAdminUsers` invalidate `userKeys.list()` + `academic` keys yang menampilkan nama siswa.

#### Users — `DELETE /api/v1/users/:id`

- Target wajib ada & `deletedAt == null`; target `ADMIN` → `404 NOT_FOUND` (selaras reset password, D8); menghapus diri sendiri → `400 CANNOT_DELETE_SELF`.
- Soft delete: `update({ deletedAt: new Date() })`.
- **Login** (`auth.service.js`) harus menolak user `deletedAt != null` (pesan generik `401 INVALID_CREDENTIALS`).
- `resetPassword` & `GET /users` mengabaikan user terhapus.
- Karena `authenticate` stateless, token aktif tetap valid ≤15 menit (lihat bagian 4 / O-3).

#### Memberships — `DELETE /api/v1/academic/memberships/:id`

- `404` bila tidak ada. Bila sudah `isActive=false` → `200`.
- Set `isActive=false`; tangkap `P2002` → `409 MEMBERSHIP_ARCHIVED`.
- Invalidasi cache `academicKeys.memberships()` + `classes` (anggota kelas).

#### Assignments — `DELETE /api/v1/academic/assignments/:id`

- Perilaku idempotent sama dengan memberships (`409 ASSIGNMENT_ARCHIVED` pada `P2002`).
- Assignment dengan sesi terkait tetap aman (tidak dihapus; `isActive=false` membuat sesi lama tetap ada — historis).

#### Attendance sessions (admin)

- **Create (`POST`):** route berubah jadi `authorize('ADMIN','TEACHER')`. Service:
  - TEACHER: assignment wajib aktif & milik guru (`403 ASSIGNMENT_FORBIDDEN`).
  - ADMIN: assignment cukup ada & aktif (`404`/`400` bila tidak).
  - Aturan timezone/tanggal/range identik; duplikat tetap `409`.
  - `createdById = req.user.id`; `qrPayload` tetap dibuat server.
- **Update (`PATCH`, ADMIN only):** body `attendanceSessionPatchSchema`.
  - Guard: sesi ada & `deletedAt == null` → else `404`.
  - **Bila sudah ada `attendance_records` → `409 SESSION_HAS_RECORDS`** (mengubah jadwal setelah scan akan merusak status `HADIR`/`TERLAMBAT`).
  - `assignmentId` boleh diubah hanya ke assignment aktif lain; `classId` mengikuti assignment.
  - Validasi timezone/range/sessionDate & cek duplikat ulang → `409 DUPLICATE_ATTENDANCE_SESSION`.
  - `qrPayload` **tidak** berubah.
- **Delete (`DELETE`, ADMIN only):**
  - Sesi ada & belum terhapus → else `404`.
  - **Bila ada `attendance_records` → `409 SESSION_HAS_RECORDS`** (jangan hilangkan riwayat). Soft delete hanya untuk sesi tanpa scan.
  - Set `deletedAt`; scan & listing mengabaikannya.

#### Query filter `deletedAt` yang wajib disesuaikan

- `attendance.repository.js`: `listAllSessions`, `listSessionsForTeacher`, `findSessionForReader`, `findSessionForScan`, `listTodaySessionsForStudent`, `buildReportWhere` (report/export) → tambah `deletedAt: null`.
- `management.repository.js`: `listUsers`, `findUser`, `findUsername`, `resetPassword`.
- Repository `banner`/`academic` tidak terpengaruh.

### 6.4 Ringkasan file backend

- `prisma/schema.prisma` + migration.
- `src/schemas/academic.schemas.js`, `src/schemas/attendance.schemas.js`.
- `src/routes/user.routes.js`, `src/routes/academic.routes.js`, `src/routes/attendance.routes.js`.
- `src/controllers/management.controller.js`, `src/controllers/academic.controller.js`, `src/controllers/attendance.controller.js`.
- `src/services/management.service.js`, `src/services/academic.service.js`, `src/services/attendance.service.js`, `src/services/auth.service.js`.
- `src/repositories/management.repository.js`, `src/repositories/academic.repository.js`, `src/repositories/attendance.repository.js`.

### 6.5 Test backend

- `tests/integration/`:
  - Users: `PATCH` sukses, `403` non-admin, `404` target admin/terhapus, `409` duplicate email/studentNumber, `400` field siswa pada non-student, `DELETE` soft + login user terhapus gagal, `400 CANNOT_DELETE_SELF`.
  - Academic: `DELETE` membership & assignment idempotent, `404`, `403` non-admin, dampak ke list.
  - Attendance session: ADMIN create (tanpa ownership), TEACHER tetap hanya miliknya, `PATCH` sukses, `409 SESSION_HAS_RECORDS`, `DELETE` soft, scan terhadap sesi terhapus ditolak, report/export tidak memuat sesi terhapus, duplikat tetap `409`.
  - Unit: schema `updateUserSchema`/`attendanceSessionPatchSchema`; helper idempotent deactivate.
- Mock `prisma` pada injection test **harus ditambah** method baru (`updateUser`, `findStudentNumber`, `updateSession`, `softDeleteSession`, `updateMembership`, `updateAssignment`, dst.).
- Wajib menjaga test idempotensi/duplicate scan & boundary yang sudah ada tetap hijau.

---

## 7. Perubahan frontend

### 7.1 Pengguna (`UsersPage`)

- `frontend/src/services/userService.js`: tambah `updateUser(id, data)`, `deleteUser(id)`.
- `frontend/src/features/admin/hooks/useAdminUsers.js`: tambah `useUpdateUser`, `useDeleteUser` (invalidasi `userKeys.list()`).
- `frontend/src/features/admin/forms/UserFormDialog.jsx`: dukung mode edit (prop `user`); defaultValues; field `username`/`role` **read-only** saat edit; field siswa (`studentNumber`, `educationLevelId`) hanya muncul untuk `STUDENT`.
- `frontend/src/features/admin/views/UserViews.jsx`: tambah aksi **Ubah** + **Hapus**.
- `frontend/src/pages/admin/UsersPage.jsx`: state edit + `ConfirmDialog` hapus (pola sama dengan `BannersPage`).
- `frontend/src/schemas/admin.js`: tambah `updateUserSchema` + mapper payload.

### 7.2 Penempatan (`PlottingPage`) — dari read-only menjadi CRUD

- `frontend/src/services/academicService.js`: tambah `createMembership`, `updateMembership`, `deleteMembership`, `createAssignment`, `updateAssignment`, `deleteAssignment`, `getStudents` (user role STUDENT, pakai `userService`).
- `frontend/src/features/admin/hooks/usePlotting.js`: mutation untuk create/toggle/delete.
- Form baru: `frontend/src/features/admin/forms/MembershipFormDialog.jsx`, `AssignmentFormDialog.jsx`.
- `frontend/src/features/admin/views/PlottingViews.jsx`: kolom Aksi (Aktifkan/Nonaktifkan, Hapus).
- `frontend/src/pages/admin/PlottingPage.jsx`: tombol tambah per tab + dialog + `ConfirmDialog`; tetap tampilkan status.
- `frontend/src/schemas/admin.js`: `membershipSchema`, `assignmentSchema`.

### 7.3 Sesi absensi admin (halaman baru)

- `frontend/src/pages/admin/SessionsPage.jsx` (daftar + filter kelas/assignment/tanggal + pagination).
- `frontend/src/features/admin/views/SessionViews.jsx` (tabel + list mobile).
- `frontend/src/features/admin/forms/SessionAdminFormDialog.jsx` (create/edit; memakai kontrak `session.js` yang ada: `{ assignmentId, sessionDate, startAt, endAt, timezone }`).
- `frontend/src/features/admin/hooks/useAdminSessions.js` (list pakai `GET /attendance-sessions`, create/patch/delete).
- `frontend/src/services/attendanceService.js`: tambah `createSession` reuse + `updateSession`, `deleteSession`, `getSessions` (bila belum ada helper admin).
- `frontend/src/app/router.jsx`: route `admin/sessions`.
- `frontend/src/lib/permissions.js`: tambah item ADMIN `{ to: '/app/admin/sessions', label: 'Sesi', icon: 'qr' }` (mengikuti aturan D12: item hanya muncul karena halaman tersedia).

### 7.4 Test frontend

- `UsersPage.test.jsx`: edit user + konfirmasi hapus.
- `PlottingPage.test.jsx` (baru): create/toggle/delete membership & assignment.
- `SessionsPage.test.jsx` (baru): create sesi admin, edit, hapus, error `SESSION_HAS_RECORDS`.
- `adminAccess.test.jsx` / `router.test.jsx`: route & nav sesi admin.
- MSW handler: tambah endpoint `PATCH/DELETE users`, `DELETE memberships/assignments`, `POST/PATCH/DELETE attendance-sessions`.

---

## 8. Sinkronisasi dokumen

- `docs/DECISIONS.md`: entri #21 (bagian 5).
- `docs/API_CONTRACT.md`: tabel ringkasan endpoint + bagian 6.4/6.5/7/9 (schema, contoh, error code baru: `DUPLICATE_EMAIL`, `DUPLICATE_STUDENT_NUMBER`, `CANNOT_DELETE_SELF`, `SESSION_HAS_RECORDS`).
- `docs/openapi.yaml`: paths & schemas baru.
- `docs/DATABASE.md`: kolom `deleted_at` + catatan soft delete.
- `docs/PRD.md`: **tidak** diubah; diskrepansi FR-05 (admin buat sesi) dijelaskan di DECISIONS #21.

---

## 9. Urutan fase & checkpoint

| Fase | Isi | Checkpoint |
| --- | --- | --- |
| **A0** | Kunci keputusan baru di `docs/DECISIONS.md` (#21) + jawab Open Items | Tidak ada item wajib yang BLOCKED |
| **A1** | Schema `deletedAt` + migration + generate + update DATABASE.md | `npx prisma validate`/`generate` sukses; migration jalan di DB dev |
| **A2** | Backend users (PATCH/DELETE) + filter `deletedAt` + login | `test:integration` users + auth hijau |
| **A3** | Backend memberships/assignments DELETE (idempotent) | `test:integration` academic hijau |
| **A4** | Backend sessions admin create/update/delete + guard records + filter | `test:integration` attendanceSession + scan hijau |
| **A5** | Frontend users (edit/hapus) | `UsersPage.test.jsx` + lint/build hijau |
| **A6** | Frontend plotting CRUD | `PlottingPage.test.jsx` + lint/build hijau |
| **A7** | Frontend sessions admin + nav + route | `SessionsPage.test.jsx`, `router.test.jsx`, `adminAccess.test.jsx` hijau |
| **A8** | Sinkron API_CONTRACT/openapi + review akhir | Semua test/lint/build hijau; dokumen konsisten route nyata |

---

## 10. Skenario verifikasi utama

1. Admin edit user student (nama + NISN + jenjang) → tersimpan, `GET /users` menampilkan nilai baru.
2. Admin tidak bisa mengubah `username`/`role` (field ditolak/read-only).
3. Admin hapus user → hilang dari list, login user tersebut ditolak.
4. Admin nonaktifkan membership/assignment → list status nonaktif; delete berulang tetap `200`.
5. Admin buat sesi untuk assignment guru → QR terbit; guru pemilik assignment tidak terganggu.
6. Admin edit sesi sebelum ada scan → sukses; setelah ada scan → `409 SESSION_HAS_RECORDS`.
7. Admin hapus sesi tanpa scan → hilang dari list & report; scan ke sesi itu ditolak.
8. Report/export tidak menampilkan sesi terhapus; riwayat absensi lama utuh.

---

## 11. Risiko & Open Items

Item **O-2** dan **O-3** memakai nilai default yang sudah dikunci di `DECISIONS.md` A0-4/A0-5 sampai product menyatakan sebaliknya; **O-1/O-4/O-5/O-6/O-7** tidak memblokir fase A1–A8.

- **O-1 — Master akademik masih hard delete.** `education_levels`/`classes`/`subjects` tetap hard delete meski FK `Restrict` (delete gagal bila ada relasi). Perlu keputusan apakah ikut di-soft-delete (berdampak ke unique constraint `subject.name`, filter list, dan data lama). **Rekomendasi:** fase lanjutan terpisah.
- **O-2 — Ruang lingkup admin sesi.** PRD FR-05 hanya memberi Guru wewenang membuat sesi. Menambah admin create/update/delete sesi adalah fitur baru; wajib ditulis di DECISIONS #21. Perlu konfirmasi apakah admin juga boleh membuat sesi untuk kelas mana pun atau hanya mengoreksi/menghapus.
- **O-3 — Revokasi token user terhapus.** Token tetap valid ≤ `ACCESS_TOKEN_TTL` (15m). Alternatif: lookup `users` di `authenticate` (menambah query ke jalur scan) atau menurunkan TTL. Perlu keputusan.
- **O-4 — Gaya hapus `class_students`/`teacher_assignments`.** Batas satu baris nonaktif per tuple (unique `isActive`) memaksa delete idempotent. Bila product ingin banyak arsip nonaktif, perlu ubah constraint (migration lanjutan).
- **O-5 — Sesi terhapus tetap memblokir recreate** karena unique `(assignmentId, sessionDate, startAt, endAt)`. Perlu keputusan apakah sediakan "restore" atau membiarkan `409`.
- **O-6 — User terhapus tetap memegang username/email unik.** Bisa menyulitkan pembuatan akun dengan username sama; perlu kebijakan (tetap reserved vs. suffix/reuse).
- **O-7 — Audit trail.** Soft delete menambah kolom tetapi tidak mencatat siapa/kapan menghapus. Bila audit trail diwajibkan, perlu field `deletedById` (di luar MVP).
