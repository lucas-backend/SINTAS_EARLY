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

## Gate implementasi

Keputusan yang memengaruhi migration dan authorization di atas sudah dikunci untuk scope MVP. Nilai timezone tetap configurable melalui environment dengan default `Asia/Jakarta`.
