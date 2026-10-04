# PLAN — Jadwal Guru per Tanggal (dengan Date Strip yang Dapat Diklik)

**Status: SELESAI (J0–J5). Keputusan dikunci di `DECISIONS.md` §23.**
**Scope: frontend (utama) + dokumentasi. Backend tidak berubah.**
**Role: TEACHER saja.**

Dokumen ini merencanakan perubahan halaman guru dari daftar sesi datar menjadi
jadwal per tanggal seperti gambar referensi: strip tanggal di atas yang tiap
tanggalnya dapat diklik, daftar kelas untuk tanggal terpilih, dan **tanpa ikon
mata pelajaran** di kiri tiap kartu.

Acuan: [PRD](PRD.md), [DECISIONS](DECISIONS.md), [API_CONTRACT](API_CONTRACT.md),
[frontend/GUIDE](../frontend/GUIDE.md), [PLAN_MERGE_UI](PLAN_MERGE_UI.md),
[PLAN_JADWAL_ADMIN](PLAN_JADWAL_ADMIN.md), [AGENTS](../AGENTS.md), golden master
`frontend_new/features/jadwal/*`.

---

## 1. Ringkasan

Halaman `Sesi absensi` guru (`/app/teacher/sessions`) saat ini menampilkan
seluruh sesi milik guru dalam satu daftar datar (mobile list + tabel desktop).
Plan ini mengubahnya menjadi tampilan **jadwal per tanggal**:

1. **Date strip** berisi 5 tanggal Senin–Jumat (minggu yang memuat tanggal
   terpilih) di atas halaman; tiap tanggal adalah tombol yang dapat diklik untuk
   memilih tanggal. Tombol **"Hari ini"** muncul saat tanggal lain dipilih.
2. Daftar di bawah strip hanya menampilkan sesi pada **tanggal terpilih**.
3. Tombol **"Lebih lengkap"** membuka pemilih tanggal (date picker) agar guru
   dapat melihat tanggal mana pun (termasuk di luar minggu berjalan).
4. Tiap kartu menampilkan **nama kelas** (utama), **mata pelajaran/topik**
   (sekunder), **rentang jam + durasi**, serta aksi **Lihat QR** dan
   **Kehadiran**. Tidak ada ikon mapel di kiri kartu.
5. Label menu guru "Sesi absensi" diganti menjadi **"Jadwal"**; route tetap
   `/app/teacher/sessions` (menghindari churn route/test).

Backend, aturan status absensi, timezone, dan otorisasi **tidak disentuh**.
Guru tetap read-only terhadap sesi (D22/J1/J2).

---

## 2. Keputusan scope hasil klarifikasi

| # | Pertanyaan | Jawaban terpilih |
| --- | --- | --- |
| 1 | Penempatan halaman | Ganti halaman **"Sesi absensi"** menjadi **"Jadwal"**; route `/app/teacher/sessions` dipertahankan |
| 2 | Sumber data | **Kelompokkan di klien** dari `GET /attendance-sessions` yang ada; tanpa perubahan backend |
| 3 | Strip tanggal & "Lebih lengkap" | **Senin–Jumat (5 hari) + date picker**; tiap tanggal dapat diklik; tombol "Hari ini" |
| 4 | Isi kartu | **Kelas + mapel + jam + aksi** (Lihat QR, Kehadiran); tanpa ikon mapel |
| 5 | Cakupan role | **Guru saja** |

---

## 3. Baseline kondisi saat ini

| Aspek | Kondisi sekarang | Lokasi kunci |
| --- | --- | --- |
| Halaman sesi guru | Daftar datar semua sesi (mobile + tabel desktop) | `frontend/src/pages/teacher/SessionsPage.jsx` |
| Render kartu/tabel | `SessionMobileList` / `SessionDesktopTable` (tanpa strip tanggal) | `frontend/src/features/teacher/SessionViews.jsx` |
| Hook data | `useTeacherSessions()` → `GET /attendance-sessions` | `frontend/src/features/teacher/hooks/useTeacherSessions.js`; `services/attendanceService.js:44` |
| Kontrak response | `sessionMetadata`: `id, assignmentId, classId, className, subjectId, subjectName, teacherId, teacherName, sessionDate, startAt, endAt, createdAt`; tidak terpaginasi; urut `sessionDate desc, startAt desc` | `backend/src/services/attendance.service.js:11-24`; `docs/API_CONTRACT.md` §9.2 |
| Navigasi guru | `Penugasan`, `Sesi absensi` | `frontend/src/lib/permissions.js:34-39` |
| Route | `/app/teacher/sessions` (+ `/sessions/:sessionId/qr`, `/classes/:classId/attendance`) | `frontend/src/app/router.jsx:59-69` |
| Helper tanggal sekolah | `formatSchoolDate`, `formatSchoolTime`, `schoolDateString`, `todaySchoolDate`, `schoolDateOffset` (Intl, tanpa date-fns) | `frontend/src/lib/dateTime.js` |
| Referensi visual | `JadwalDateStrip`, `JadwalCard`, `jadwalData` (golden master, ikon mapel masih ada) | `frontend_new/src/features/jadwal/**`, `frontend_new/src/data/jadwal/jadwalData.ts` |

Catatan penting: **`date-fns`/`date-fns-tz` tidak terpasang** di
`frontend/package.json` meskipun disebut GUIDE §2. Plan ini **tidak menambah
dependency**; seluruh kalkulasi tanggal memakai helper `Intl` di
`lib/dateTime.js`.

---

## 4. Prinsip & guardrail yang wajib dijaga

- **Frontend bukan sumber kebenaran:** scope guru tetap ditentukan backend
  (`GET /attendance-sessions` hanya mengembalikan sesi assignment aktif milik
  guru). Klien hanya mengelompokkan/menyaring data yang sudah ter-scope.
- **Timezone:** pengelompokan tanggal memakai tanggal kalender sekolah
  (`schoolDateString`), bukan jam lokal browser. Tampilan jam memakai
  `formatSchoolTime` (timezone sekolah).
- **Tanpa perubahan backend:** tidak ada migration, route, skema, service, atau
  test backend yang disentuh.
- **Alur golden master (frontend/GUIDE §2.1):** perubahan visual dimulai di
  `frontend_new/` lebih dulu, lalu dirontokkan ke `frontend/`. Referensi guru
  untuk strip tanggal belum ada di golden master → dibuat dulu (fase J1).
- **Jangan menambah fitur di luar PRD.** Strip tanggal, pemilih tanggal, dan
  aksi Lihat QR/Kehadiran semuanya memakai data/kontrak yang sudah ada.
- **Aksesibilitas:** tombol tanggal punya `aria-label` tanggal lengkap dan
  `aria-pressed`; status aktif tidak dibedakan warna saja; dialog date picker
  dapat ditutup dengan keyboard.
- **Test:** `frontend/` `npm run lint`, `npm run test`, `npm run build` wajib
  hijau setelah markup berubah.

---

## 5. Keputusan yang harus dikunci di `docs/DECISIONS.md` sebelum coding

> Ditulis sebagai entri baru (mis. §23) dengan format standar (pilihan final,
> alasan, dampak, asumsi). Fase J0.

- **G1 — Label "Jadwal" untuk halaman sesi guru.** Menu guru "Sesi absensi"
  diganti "Jadwal"; route internal tetap `/app/teacher/sessions` (alasan:
  minim churn route/test, sama pola dengan J6 admin). Judul halaman "Jadwal".
- **G2 — Pengelompokan di klien.** Tidak ada perubahan backend; frontend
  mengelompokkan hasil `GET /attendance-sessions` per tanggal kalender sekolah.
  Konsekuensi: satu request menarik seluruh sesi guru (dokumentasi risiko §12).
- **G3 — Date strip 5 hari (Senin–Jumat) + date picker.** Strip menampilkan 5 hari
  (Senin–Jumat) dari minggu yang memuat tanggal terpilih; tiap hari dapat diklik;
  tombol "Hari ini" muncul saat tanggal lain dipilih; "Lebih
  lengkap" membuka dialog pemilih tanggal. Default tanggal terpilih = hari ini
  (timezone sekolah).
- **G4 — Kartu jadwal guru tanpa ikon mapel.** Kartu: kelas (utama), mapel/topik
  (sekunder), rentang jam + durasi, aksi "Lihat QR" dan "Kehadiran". Status
  window absensi (Bisa absen/Belum dibuka/Selesai) **tidak** ditampilkan pada
  kartu guru (berbeda dari kartu siswa); guru melihat jadwal, bukan status scan
  pribadi.
- **G5 — Guru saja.** Jadwal siswa tidak diubah pada plan ini.
- **G6 — Section daftar = tanggal terpilih (tanpa section "Besok" terpisah).**
  Karena strip sudah memungkinkan memilih tanggal mana pun, gambar referensi
  yang menampilkan section "Besok" tidak direplikasi; daftar hanya memuat
  tanggal terpilih dengan header label tanggal. **Perlu konfirmasi produk**
  (lihat Open Item O-1).

---

## 6. Rancangan UX

### 6.1 Date strip (`ScheduleDateStrip`)

- Membungkus 7 tombol tanggal: label hari (`weekday: 'short'`, id-ID) + nomor
  tanggal.
- Tanggal terpilih: gaya aktif golden master (`bg-blue-400 text-white`).
- Titik indikator (`rounded-full h-2 w-2`) ditampilkan bila tanggal itu punya
  minimal satu sesi; tanggal terpilih memakai titik putih (parity golden master).
- Tiap tombol: `type="button"`, `aria-label` tanggal lengkap (mis.
  "Senin, 29 September 2026"), `aria-pressed={isSelected}`.
- Strip menampilkan Senin–Jumat dari minggu yang memuat tanggal terpilih sehingga
  tanggal hasil date picker (bila hari kerja) selalu terlihat; akhir pekan tidak
  ditampilkan pada strip namun tetap dapat dipilih lewat pemilih tanggal.

### 6.2 Tombol & dialog "Lebih lengkap"

- Tombol teks "Lebih lengkap" di kanan strip membuka **dialog** (Headless UI,
  sesuai GUIDE §2) berisi `<input type="date">` dengan `aria-label`.
- Memilih tanggal menutup dialog dan memilih tanggal tersebut; strip berpindah
  minggu bila perlu.
- Batas tanggal: bebas (masa lalu/akan datang); tanggal tanpa sesi menampilkan
  empty state.

### 6.3 Kartu jadwal (`TeacherScheduleCard`)

Struktur mengikuti `JadwalCard` golden master **tanpa kotak ikon**:

- Kiri: nama kelas (`text-xl font-semibold`, mis. "12 IPA 1") + mapel/topik
  (sekunder, mis. "Bab 3 - Turunan & Integral").
- Kanan: rentang jam (`formatSchoolTime(startAt)`–`formatSchoolTime(endAt)`) +
  durasi `{n} menit` (`(endAt - startAt) / 60000`).
- Aksi (link): **Lihat QR** → `/app/teacher/sessions/${id}/qr`;
  **Kehadiran** → `/app/teacher/classes/${classId}/attendance`.
- Kartu `rounded-lg border border-black/10 bg-white p-4` (token M2/M3/M4).

### 6.4 Pengelompokan & label tanggal

- Helper murni baru `frontend/src/lib/scheduleDates.js`:
  - `groupSessionsBySchoolDate(sessions)` → `Map<YYYY-MM-DD, session[]>` memakai
    `schoolDateString(session.sessionDate)`.
  - `buildWeekStrip(selectedISO)` → 5 tanggal Senin–Jumat beserta
    `{ iso, dayLabel, dayNumber, isSelected, isToday }`.
  - `addDaysToIso(iso, n)` (util murni; boleh ditambahkan ke `dateTime.js`).
- Header daftar: "Hari ini" bila tanggal terpilih = hari ini sekolah, "Besok"
  bila = besok, selain itu tanggal lengkap (`formatSchoolDateLong`).
- Item diurutkan `startAt` naik (jam mulai).

### 6.5 Desktop

- Tabel desktop (`SessionDesktopTable`) dipertahankan (M4-2) namun **disaring
  ke tanggal terpilih**; kolom "Tanggal sesi" dihapus karena tanggal sudah ada
  di header, atau diganti header kolom tanggal. Kolom: Waktu, Mata pelajaran /
  Kelas, Aksi.
- Strip tanggal tetap tampil di atas tabel pada desktop.

### 6.6 State loading / empty / error

- Pakai `SectionState` + `Skeleton` yang sudah ada.
- Empty state per tanggal: "Tidak ada jadwal pada tanggal ini".
- Error: "Jadwal tidak dapat dimuat." dengan retry dari `SectionState`.
- Offline: `useIsOnline` + `OfflineNotice` tetap.

---

## 7. Perubahan file frontend

| File | Perubahan |
| --- | --- |
| `src/lib/permissions.js` | Label nav TEACHER `Sesi absensi` → `Jadwal` (ikon tetap `qr`/`calendar`); route tidak berubah |
| `src/pages/teacher/SessionsPage.jsx` | Judul "Jadwal"; render `ScheduleDateStrip` + `TeacherScheduleCard`/tabel; state `selectedDate`; query `useTeacherSessions`; grouping |
| `src/features/teacher/ScheduleDateStrip.jsx` | **Baru** — strip 7 tombol tanggal + tombol "Lebih lengkap" |
| `src/features/teacher/DatePickerDialog.jsx` | **Baru** — dialog Headless UI + `<input type="date">` |
| `src/features/teacher/TeacherScheduleCard.jsx` | **Baru** — kartu kelas/mapel/jam/aksi tanpa ikon |
| `src/features/teacher/SessionViews.jsx` | Sesuaikan: saring per tanggal; sesuaikan kolom tabel; pertahankan `Actions` |
| `src/lib/scheduleDates.js` | **Baru** — helper grouping/strip (murni) |
| `src/lib/dateTime.js` | Opsional: tambah `addDaysToIso` bila tidak ditaruh di `scheduleDates.js` |
| `src/features/teacher/hooks/useTeacherSessions.js` | Tidak berubah (tetap memakai query key `attendanceKeys.teacherSessions`) |

**Tidak diubah:** router, `attendanceService`, hook query, guard, store, skema,
`AssignmentCard`, `ClassAttendancePage`, `SessionQrPage`, backend, DB.

---

## 8. Golden master (`frontend_new/`)

Sesuai GUIDE §2.1, referensi visual dibuat lebih dulu di golden master:

- Tambah layar referensi guru "Jadwal" (mock) dengan `JadwalDateStrip` yang
  **dapat diklik** + tombol "Lebih lengkap" + kartu kelas tanpa ikon.
- Sesuaikan `JadwalDateStrip.tsx` agar tombol punya state aktif & callback
  (mock), dan buat varian kartu tanpa ikon untuk konteks guru.
- **Checkpoint:** `frontend_new/` `npm run lint` + `npm run build` hijau.
- Jika produk memutuskan cukup memakai gambar referensi yang sudah disetujui
  sebagai acuan tanpa menambah layar golden master, langkah ini boleh
  dipersempit — dicatat sebagai Open Item O-2.

---

## 9. Test frontend

- **Baru** `src/pages/teacher/SessionsPage.test.jsx` (atau `SchedulePage`):
  - default memilih hari ini; menampilkan sesi hari ini.
  - klik tanggal lain → daftar berubah sesuai tanggal.
  - tombol "Lebih lengkap" membuka dialog; memilih tanggal memfilter daftar.
  - tanggal tanpa sesi → empty state.
  - kartu menampilkan kelas, mapel, jam, durasi, dan tautan QR/Kehadiran.
  - tidak ada ikon mapel (assert tidak ada elemen ikon mapel).
- **Baru** `src/lib/scheduleDates.test.js`: grouping lintas tanggal, strip 7
  hari, hari ini/terpilih, batas minggu.
- Update `src/pages/teacher/teacherAccess.test.jsx` bila memeriksa label nav
  "Sesi absensi" → "Jadwal".
- MSW handler: `GET /attendance-sessions` sudah ada; pastikan fixture memuat
  `className`, `subjectName`, `sessionDate`, `startAt`, `endAt` beberapa tanggal.
- Tidak ada test backend yang berubah.

---

## 10. Sinkronisasi dokumen

- `docs/DECISIONS.md`: entri baru (§23) berisi G1–G6.
- `docs/API_CONTRACT.md` / `docs/openapi.yaml`: **tidak berubah** (tanpa
  endpoint/parameter baru).
- `docs/DOKUMENTASI_PROJECT_SINTAS.md`: sesuaikan label menu guru ("Jadwal")
  dan narasi halaman.
- `docs/PARITY_REPORT.md`: catat layar guru "Jadwal" per tanggal sebagai
  divergensi referensi (golden master bila ditambah pada fase J1).
- `frontend/GUIDE.md`: tidak berubah (primitif yang dipakai sudah ada).

---

## 11. Fase & checkpoint

| Fase | Isi | Checkpoint |
| --- | --- | --- |
| **J0** | Kunci G1–G6 di `docs/DECISIONS.md` | Tidak ada item wajib BLOCKED |
| **J1** | Golden master: layar guru "Jadwal" per tanggal (mock) | `frontend_new/` lint+build hijau; tiap tanggal dapat diklik |
| **J2** | Helper murni `scheduleDates.js` + unit test | Unit test hijau; lint hijau |
| **J3** | Komponen strip, dialog, kartu + halaman guru | `SessionsPage.test.jsx` hijau; lint hijau |
| **J4** | Label nav "Jadwal", saring tabel desktop, sinkron dokumen | `frontend/` lint + test + build hijau |
| **J5** | Verifikasi viewport 320/390/768/1440 + keyboard | Screenshot/parity; residual risk tercatat |

---

## 12. Skenario verifikasi utama

1. Guru membuka "Jadwal" → strip menampilkan 5 hari Senin–Jumat; hari ini
   terpilih (bila hari kerja); daftar memuat sesi hari ini (bila ada).
2. Klik tanggal lain yang punya sesi → daftar berubah; titik indikator hanya
   tampil pada tanggal yang punya sesi.
3. Klik "Lebih lengkap" → pilih tanggal jauh → daftar menampilkan tanggal itu;
   strip berpindah minggu; tanggal terpilih ter-highlight.
4. Tanggal tanpa sesi → empty state, bukan error.
5. Kartu menampilkan kelas, mapel, jam, durasi; "Lihat QR" → halaman QR;
   "Kehadiran" → detail kehadiran kelas.
6. Tidak ada ikon mapel di kiri kartu.
7. Guru lain tidak melihat sesi bukan miliknya (scope backend tetap).
8. Desktop: tabel tersaring ke tanggal terpilih; strip tetap ada.

---

## 13. Risiko & Open Items

- **O-1 — Section "Besok" pada gambar referensi.** Plan memilih satu daftar
  untuk tanggal terpilih (G6). Bila produk ingin tetap menampilkan preview
  "Besok" di bawah tanggal terpilih, itu perubahan pada golden master dulu
  (bukan ditebak).
- **O-2 — Penambahan layar referensi guru di golden master.** GUIDE mewajibkan
  perubahan visual dimulai di golden master. Bila tim memutuskan gambar
  referensi yang disetujui sudah cukup, fase J1 dapat dipersempit.
- **O-3 — Performa grouping klien.** `GET /attendance-sessions` tidak
  terpaginasi; seiring bertambahnya sesi per tahun, payload membesar. MVP
  menerima ini (sesuai pilihan "kelompokkan di klien"); bila jadi masalah,
  perubahan berikutnya adalah filter `from`/`to` di backend (keputusan baru).
- **O-4 — Definisi "minggu".** Plan memakai Senin–Jumat yang memuat tanggal
  terpilih (akhir pekan tidak ditampilkan pada strip, tetapi tetap dapat dipilih
  lewat date picker). Bila produk ingin "7 hari ke depan" (rolling), itu keputusan
  terpisah.
- **O-5 — Status window absensi tidak tampil untuk guru.** Berbeda dari kartu
  siswa; bila guru ingin tahu sesi yang sedang "Bisa absen", itu fitur baru di
  luar plan ini.
- **O-6 — Kolom tabel desktop.** Menghapus kolom "Tanggal sesi" menyentuh
  markup test tabel guru bila ada; verifikasi saat J4.