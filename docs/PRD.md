# Product Requirements Document

## 1. Problem Statement

Sekolah membutuhkan pencatatan kehadiran yang lebih terstruktur daripada proses manual atau rekap terpisah. Siswa berisiko mengalami proses absensi dan pengecekan riwayat yang tidak praktis. Guru terbebani oleh pembuatan sesi absensi dan rekap kehadiran per kelas. Admin kesulitan mengelola data akademik, pengguna, banner sekolah, dan laporan absensi secara terpusat.

Produk ini adalah sistem absensi sekolah berbasis QR Code untuk satu sekolah, dengan role Siswa, Guru, dan Admin. Sistem dibangun sebagai single repository dan aplikasi monolith menggunakan React.js, Express.js, dan MySQL.

## 2. Target User & User Persona

### Target User

- Satu sekolah tertentu.
- Siswa yang mengikuti pembelajaran dan melakukan absensi.
- Guru yang mengelola sesi absensi serta memantau kehadiran kelas.
- Admin yang mengelola pengguna, struktur akademik, banner, dan laporan sekolah.

### Persona 1: Siswa

Siswa menggunakan username dan password untuk masuk, melihat informasi di beranda, memindai QR Code pada sesi pembelajaran, melihat riwayat absensi, dan mengubah profil dasar. Siswa membutuhkan hasil absensi yang jelas, termasuk status dan jumlah menit keterlambatan jika berlaku.

### Persona 2: Guru

Guru mengajar satu atau lebih mata pelajaran pada beberapa kelas. Guru membutuhkan cara cepat untuk membuat QR Code per pertemuan, melihat daftar kehadiran siswa di kelas yang diajar, dan mengekspor rekap dalam format `.xlsx`.

## 3. Goals & Non-Goals

### Goals

- Menyediakan login berbasis username dan password untuk tiga role.
- Menyediakan absensi QR Code dengan aturan waktu yang konsisten.
- Menyimpan status Hadir, Terlambat, dan Tidak Hadir.
- Menyediakan riwayat personal, riwayat per kelas, dan laporan keseluruhan sekolah.
- Memungkinkan Admin mengelola pengguna, kelas, penempatan guru-siswa, dan banner event.
- Menghasilkan aplikasi monolith React.js dan Express.js dengan MySQL yang dapat diuji dan didokumentasikan.

### Non-Goals

- Notifikasi apa pun, termasuk push notification, email, SMS, dan WhatsApp.
- Dynamic QR Code atau rotasi QR Code. QR Code per pertemuan bersifat statis sesuai keputusan produk.
- Pencegahan berbagi foto QR Code atau mekanisme anti-titip absen tambahan.
- Multi-school atau multi-tenant.
- Fitur selain yang tercantum dalam PRD ini.

## 4. User Stories

- Sebagai Siswa, saya ingin login dengan username dan password supaya dapat mengakses beranda dan fitur absensi.
- Sebagai Siswa, saya ingin mendapat pesan error yang jelas saat login gagal supaya mengetahui bahwa akses belum berhasil.
- Sebagai Siswa, saya ingin memulihkan password menggunakan email dan tanggal lahir supaya dapat kembali masuk.
- Sebagai Siswa, saya ingin memindai QR Code pertemuan supaya kehadiran saya tercatat.
- Sebagai Siswa, saya ingin melihat status dan riwayat absensi sendiri supaya dapat memantau kehadiran.
- Sebagai Siswa, saya ingin mengubah data profil dasar kecuali username/NIM supaya data saya tetap relevan.
- Sebagai Guru, saya ingin login dan memulihkan password dengan alur yang sama supaya dapat mengelola absensi.
- Sebagai Guru, saya ingin membuat QR Code untuk setiap pertemuan pada mata pelajaran dan kelas yang saya ajar supaya siswa dapat melakukan absensi.
- Sebagai Guru, saya ingin melihat kehadiran siswa per kelas supaya dapat memantau absensi.
- Sebagai Guru, saya ingin mengekspor rekap kelas ke Excel supaya dapat menggunakannya untuk pelaporan.
- Sebagai Admin, saya ingin mengelola banner event supaya banner tampil di beranda pengguna.
- Sebagai Admin, saya ingin mereset password Siswa dan Guru secara manual supaya dapat membantu pengguna yang kehilangan akses.
- Sebagai Admin, saya ingin membuat master kelas dan memplot Guru serta Siswa supaya struktur akademik terkelola.
- Sebagai Admin, saya ingin melihat dan mengekspor seluruh riwayat absensi supaya sekolah memiliki rekap terpusat.

## 5. Feature Roadmap

### MVP

Seluruh fitur yang disepakati masuk MVP:

- Login, logout, lupa password, dan kontrol akses berdasarkan role.
- Beranda dan banner event sekolah.
- Profil Siswa dan Guru.
- Pembuatan sesi absensi dan QR Code statis per pertemuan oleh Guru.
- Pemindaian QR Code dan pencatatan status absensi.
- Riwayat absensi Siswa.
- Riwayat detail absensi kelas untuk Guru.
- Ekspor rekap `.xlsx` untuk Guru dan Admin.
- Manajemen pengguna dan reset password oleh Admin.
- Master kelas serta plotting Guru dan Siswa oleh Admin.
- Laporan seluruh absensi oleh Admin.
- Unit test, integration test, dan dokumentasi.

### V2/Future

Belum ada fitur v2 yang disetujui. Dynamic QR Code, notifikasi, dan peningkatan keamanan pemulihan password tidak termasuk roadmap yang committed dan hanya dapat dikerjakan melalui keputusan produk baru.

## 6. Tech Stack & Architecture

### 6.1 Tech Stack

- **Frontend:** React.js menggunakan JavaScript. Frontend bertanggung jawab atas UI, client-side routing, validasi form dasar, akses kamera/browser API, dan pengelolaan state tampilan.
- **Backend:** Express.js menggunakan JavaScript. Backend bertanggung jawab atas REST API, autentikasi, otorisasi berbasis role, validasi bisnis, aturan waktu absensi, pembuatan sesi, scan QR, laporan, dan ekspor `.xlsx`.
- **Database:** MySQL sebagai database relasional utama untuk data pengguna, akademik, sesi, dan record absensi.
- **Data access:** Gunakan ORM atau query builder JavaScript yang mendukung migration, transaction, prepared statement, dan foreign key. Pilihan library final ditetapkan pada technical design, tetapi akses database tidak boleh menggunakan string query yang dirangkai dari input pengguna.
- **Authentication:** Session berbasis cookie HttpOnly atau token yang disimpan secara aman sesuai keputusan implementasi. Password wajib di-hash menggunakan algoritma password hashing modern, bukan disimpan plaintext.
- **QR Code:** QR Code statis berisi identifier/payload sesi yang ditandatangani atau sulit ditebak. QR Code bukan dynamic QR dan tidak berubah berkala.
- **Export:** Backend menghasilkan workbook `.xlsx` dari data yang telah dibatasi sesuai role dan filter.

### 6.2 Arsitektur Aplikasi

Aplikasi menggunakan single repository dengan pemisahan direktori frontend dan backend, tetapi tetap dideploy sebagai satu sistem monolith:

```text
project/
	frontend/   # React.js SPA
	backend/    # Express.js REST API
	docs/
```

- React.js berkomunikasi dengan Express.js melalui REST API berbasis JSON.
- Express.js memisahkan route, controller, service/domain logic, validation, authorization middleware, dan data access.
- Aturan status absensi dan kalkulasi keterlambatan hanya boleh berada di service/domain layer backend. Frontend boleh memberi preview, tetapi keputusan final selalu berdasarkan waktu server.
- Semua operasi scan dan pembuatan sesi menggunakan transaction bila melibatkan lebih dari satu perubahan data.
- Endpoint laporan dan export wajib menerapkan authorization serta filter scope sebelum query dijalankan.
- File gambar banner disimpan pada object/file storage yang ditentukan saat deployment; database menyimpan URL/path dan metadata, bukan binary besar jika tidak diperlukan.

### 6.3 Batasan Teknis / Technical Constraints

- Target awal adalah satu sekolah, tetapi backend harus mampu menangani lonjakan akses serentak ratusan hingga ribuan siswa pada rentang sekitar 06:45-07:00.
- API harus stateless pada level application server agar beberapa instance Express dapat berjalan di belakang reverse proxy/load balancer bila diperlukan.
- Request scan harus idempotent terhadap pasangan `session_id` dan `student_id`. Unique constraint database menjadi perlindungan terakhir terhadap duplicate record, bukan hanya pengecekan di frontend.
- Endpoint scan harus ringan: validasi session/assignment/student, hitung status, dan insert record. Query yang tidak diperlukan, payload besar, dan pembuatan file export tidak boleh berada di jalur scan.
- Gunakan connection pool MySQL dengan batas koneksi yang dikonfigurasi. Jangan membuat koneksi database baru untuk setiap request.
- Tambahkan index pada kolom yang digunakan dalam scan dan laporan, termasuk unique index `(session_id, student_id)`, index sesi berdasarkan waktu, serta index assignment dan student.
- Gunakan transaction dengan isolation dan locking yang sesuai untuk mencegah race condition saat dua scan dari siswa yang sama tiba hampir bersamaan.
- Gunakan rate limiting per akun/IP/device secara proporsional. Rate limit tidak boleh menghalangi scan valid massal dari banyak siswa, tetapi harus menahan retry loop dan abuse dari satu client.
- Sediakan health check dan readiness check. Instance yang tidak dapat terhubung ke MySQL tidak boleh menerima traffic baru.
- Gunakan reverse proxy/load balancer dan horizontal scaling sebagai strategi scale-out ketika satu instance Express tidak cukup. Session store, jika session server-side digunakan, harus shared; jangan bergantung pada memory satu instance.
- Cache hanya data yang aman untuk dicache, seperti banner aktif, daftar master subject, dan konfigurasi sekolah. Jangan mengandalkan cache sebagai sumber kebenaran untuk status scan.
- Jika digunakan, Redis dapat menjadi shared session store, cache, dan rate-limit store. Redis bukan pengganti MySQL untuk record absensi.
- Selama traffic spike, endpoint export dan laporan dapat diberi concurrency limit atau diproses asynchronous agar tidak mengambil connection pool dari endpoint scan.
- Semua request memiliki timeout, structured logging, correlation/request ID, dan metrik minimal: response time, error rate, database pool saturation, request count per endpoint, serta duplicate/conflict scan.
- Traffic spike harus diuji dengan load test yang mensimulasikan burst scan pada interval 06:45-07:00, termasuk retry, duplicate scan, QR invalid, dan database contention.
- Deployment wajib memiliki backup database, migration yang dapat diulang dengan aman, dan prosedur rollback. Detail provider hosting tetap menjadi Open Question.

## 7. Functional Requirements

### FR-01. Autentikasi dan Otorisasi

- Sistem harus menyediakan login username dan password untuk Siswa, Guru, dan Admin.
- Login berhasil harus mengarahkan pengguna ke beranda sesuai aksesnya.
- Login gagal harus menampilkan error yang jelas tanpa membocorkan apakah username atau password tertentu benar.
- Pengguna hanya dapat mengakses fitur sesuai role.
- Logout harus mengakhiri sesi aktif.
- Lupa password harus menerima email, tanggal lahir, password baru, dan konfirmasi password baru. Sistem mengizinkan reset jika data cocok.
- Admin harus dapat mereset password Siswa atau Guru secara manual.
- Acceptance criteria: kredensial valid membuat sesi dan redirect; kredensial invalid menampilkan error; akses role yang tidak sesuai ditolak; password baru dan konfirmasi yang berbeda ditolak.
- Catatan: alur lupa password yang memakai email dan tanggal lahir memang rentan sesuai requirement.

### FR-02. Beranda dan Banner

- Pengguna yang login dapat melihat beranda.
- Banner aktif yang dikelola Admin tampil di beranda pengguna.
- Admin dapat membuat, mengubah, menampilkan, dan menyembunyikan banner.
- Acceptance criteria: perubahan status banner tercermin pada beranda; banner tersembunyi tidak tampil; detail format dan jumlah banner mengikuti keputusan pada Open Questions.

### FR-03. Profil

- Siswa dan Guru dapat mengubah data profil dasar yang diizinkan.
- Username dan NIM/identitas login tidak dapat diubah melalui profil.
- Field profil mencakup nama, email, nomor WhatsApp, dan tanggal lahir; data akademik mengikuti hak kelola Admin.
- Acceptance criteria: perubahan valid tersimpan dan tampil saat halaman dimuat ulang; username/NIM tetap; input invalid ditolak dengan pesan error.

### FR-04. Master Akademik dan Penempatan

- Admin dapat membuat dan mengelola master kelas.
- Admin dapat memplot Siswa ke kelas.
- Admin dapat memplot Guru ke kelas ajar dan mata pelajaran.
- Guru dapat memiliki lebih dari satu mata pelajaran, jenjang, dan kelas ajar.
- Acceptance criteria: hanya Admin yang dapat mengubah plotting; Guru hanya melihat kelas/mata pelajaran yang ditugaskan; Siswa hanya terhubung pada penempatan yang berlaku.

### FR-05. Pembuatan Sesi Absensi dan QR Code

- Guru dapat melihat daftar mata pelajaran dan kelas yang diajarkan.
- Guru dapat membuat satu sesi absensi untuk setiap pertemuan.
- Sesi memiliki mata pelajaran, kelas, tanggal, waktu mulai, dan waktu selesai.
- Sistem menghasilkan QR Code statis untuk sesi tersebut.
- QR Code tidak perlu berubah secara berkala dan dapat dipindai selama jendela absensi.
- Acceptance criteria: Guru hanya dapat membuat sesi untuk penugasan miliknya; QR Code mengacu pada sesi yang benar; sesi duplikat untuk pertemuan yang sama ditolak atau ditangani sesuai keputusan Open Questions.

### FR-06. Pemindaian dan Status Absensi

- Siswa dapat memindai QR Code sesi melalui aplikasi.
- Jendela absensi dibuka 15 menit sebelum waktu mulai dan berakhir pada waktu selesai.
- Scan dari 15 menit sebelum waktu mulai sampai dengan 15 menit setelah waktu mulai berstatus **Hadir**.
- Scan setelah 15 menit sejak waktu mulai sampai dengan waktu selesai berstatus **Terlambat**.
- Untuk status Terlambat, sistem menyimpan selisih menit antara waktu scan dan waktu mulai.
- Siswa yang tidak tercatat sampai sesi berakhir berstatus **Tidak Hadir**.
- Scan di luar jendela absensi ditolak dan tidak membuat record absensi.
- Satu Siswa hanya boleh memiliki satu record untuk satu sesi.
- Setelah berhasil, sistem menampilkan status absensi kepada Siswa.
- Acceptance criteria: scan valid membuat tepat satu record; scan ulang tidak menggandakan record; scan terlalu awal/terlambat ditolak; batas 15 menit dihitung konsisten; data sesi atau QR Code tidak valid menampilkan error.

### FR-07. Riwayat dan Rekap Guru

- Siswa dapat melihat riwayat absensi miliknya beserta tanggal, kelas/mata pelajaran, status, dan menit keterlambatan bila ada.
- Guru dapat membuka detail kehadiran siswa per kelas melalui aksi lihat.
- Guru dapat mengekspor rekap kelas ke `.xlsx`.
- Guru hanya dapat melihat data dari kelas dan mata pelajaran yang ditugaskan.
- Acceptance criteria: hasil riwayat sesuai data tersimpan; filter/scope akses tidak melampaui penugasan; file ekspor dapat dibuka sebagai workbook Excel dan memuat status kehadiran.

### FR-08. Laporan Admin

- Admin dapat melihat seluruh riwayat absensi sekolah.
- Admin dapat mengekspor seluruh riwayat ke `.xlsx`.
- Acceptance criteria: laporan memuat data lintas kelas, Guru, Siswa, dan mata pelajaran; hanya Admin yang dapat mengakses laporan global; ekspor gagal secara terkontrol jika tidak ada data atau terjadi error server.

### FR-09. Kualitas dan Dokumentasi

- Implementasi menggunakan React.js, Express.js, MySQL, single repository, dan arsitektur monolith.
- Unit test harus mencakup aturan waktu absensi, kalkulasi keterlambatan, otorisasi role, dan validasi utama.
- Integration test harus mencakup login, pembuatan sesi, scan QR, pencatatan riwayat, dan ekspor laporan.
- Dokumentasi harus mencakup setup lokal, konfigurasi environment, migrasi/seed database, cara menjalankan test, dan alur penggunaan utama.

## 8. Data Model Sketch

Nama tabel dapat disesuaikan saat desain teknis, tetapi relasi minimum berikut diperlukan.

- `users` (**PK** `id`): `username` unik, `password_hash`, `role`, `email`, `phone`, `birth_date`, `name`, `created_at`, `updated_at`. Tambahkan index pada `username`, `email`, dan `role` sesuai query operasional.
- `student_profiles` (**PK/FK** `user_id` -> `users.id`): `student_number`/NIM, `education_level_id`.
- `teacher_profiles` (**PK/FK** `user_id` -> `users.id`).
- `education_levels` (**PK** `id`): `name`.
- `classes` (**PK** `id`): `name`, `education_level_id` (**FK**), dan field status/metadata yang disepakati.
- `subjects` (**PK** `id`): `name`.
- `class_students` (**PK** `id`): `class_id` (**FK**), `student_id` (**FK**), `is_active`, `created_at`, `updated_at`, dengan unique constraint atau unique partial strategy pada pasangan penempatan aktif sesuai kemampuan MySQL. Sistem harus mencegah satu siswa memiliki lebih dari satu kelas aktif bila keputusan produk menetapkannya.
- `teacher_assignments` (**PK** `id`): `teacher_id` (**FK**), `class_id` (**FK**), `subject_id` (**FK**), `is_active`, timestamp. Tambahkan unique constraint pada pasangan Guru-kelas-mata pelajaran yang aktif.
- `attendance_sessions` (**PK** `id`): `assignment_id` (**FK**), `session_date`, `start_at`, `end_at`, `qr_payload`/identifier statis unik, `created_by` (**FK**), timestamp. Tambahkan constraint/index untuk mencegah sesi duplikat pada assignment, tanggal, dan pasangan waktu setelah keputusan duplikasi dikunci.
- `attendance_records` (**PK** `id`): `session_id` (**FK**), `student_id` (**FK**), `scanned_at`, `status`, `late_minutes`, timestamp. Wajib unique constraint pada `(session_id, student_id)` untuk idempotensi dan index pada `(student_id, scanned_at)` serta `(session_id, status)` untuk riwayat dan rekap.
- `banners` (**PK** `id`): `title`, `image_url` atau `content`, `is_active`, `display_start_at`, `display_end_at`, `created_by` (**FK**), timestamp. Tambahkan index pada `is_active` dan periode tampil.

### 8.1 Aturan Database dan Konsistensi

- Semua ID menggunakan tipe integer/bigint auto-increment atau UUID yang dipilih secara konsisten di seluruh tabel. API tidak boleh mencampur format ID tanpa alasan teknis.
- Foreign key, unique constraint, `NOT NULL`, enum/check validation yang didukung versi MySQL, dan timestamp diterapkan pada level database selain validasi di Express.js.
- Waktu disimpan dalam format yang konsisten, direkomendasikan UTC pada database, lalu dikonversi ke timezone sekolah pada service dan response API.
- `start_at` dan `end_at` wajib valid, dengan `end_at` lebih besar dari `start_at`. Window scan dihitung sebagai `start_at - 15 menit` sampai `end_at`.
- Status record dibatasi pada `HADIR`, `TERLAMBAT`, dan `TIDAK_HADIR`. Nilai yang ditampilkan frontend dapat menggunakan label Bahasa Indonesia, tetapi nilai API/database harus konsisten.
- Insert attendance record harus menangani duplicate-key conflict secara terkontrol: response mengembalikan record yang sudah ada atau status duplicate, tanpa membuat record kedua.
- Password wajib disimpan sebagai hash, bukan plaintext. Foreign key, unique constraint, index, dan timestamp harus diterapkan pada level database atau ORM/query builder.

## 9. Edge Cases & Failure States

| Skenario                                                | Perilaku/Mitigasi                                                                                       |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Username atau password salah                            | Tolak login dan tampilkan pesan umum yang jelas; jangan mengungkap field mana yang salah.               |
| Email/tanggal lahir lupa password tidak cocok           | Tolak reset, tampilkan error, dan jangan mengubah password.                                             |
| Password baru dan konfirmasi berbeda                    | Tolak form sampai kedua nilai sama.                                                                     |
| QR Code dipindai sebelum jendela dibuka                 | Tolak scan dan tampilkan bahwa sesi belum dibuka.                                                       |
| QR Code dipindai setelah sesi selesai                   | Tolak scan dan tampilkan bahwa sesi telah ditutup.                                                      |
| QR Code tidak valid, rusak, atau bukan milik sesi aktif | Tolak scan tanpa membuat record dan tampilkan error.                                                    |
| Siswa memindai QR Code dua kali                         | Pertahankan satu record; scan berikutnya menampilkan status yang sudah tercatat.                        |
| Siswa tidak melakukan scan sampai sesi berakhir         | Tandai atau tampilkan sebagai Tidak Hadir sesuai proses finalisasi yang dipilih.                        |
| Guru mencoba membuat sesi di luar penugasannya          | Tolak operasi dengan error otorisasi.                                                                   |
| Pengguna mencoba membuka laporan role lain              | Tolak akses dan jangan mengembalikan data laporan.                                                      |
| Tidak ada data untuk diekspor                           | Tampilkan status tidak ada data atau file kosong sesuai keputusan UI; jangan menghasilkan error mentah. |
| Koneksi/server gagal saat scan atau ekspor              | Jangan mengklaim berhasil; tampilkan error dan izinkan pengguna mencoba kembali.                        |

## 10. Success Metrics

- Minimal 95% percobaan login valid berhasil membuat sesi dan redirect dalam kondisi layanan normal.
- Minimal 99% scan valid dalam jendela absensi menghasilkan record yang benar dan tidak duplikat.
- 100% record absensi memiliki status yang sesuai aturan waktu pada automated test.
- 100% ekspor laporan yang berhasil menghasilkan file `.xlsx` yang dapat dibuka dan sesuai scope akses.
- 100% endpoint/halaman terlindungi menolak akses role yang tidak berwenang pada integration test.
- Unit test, integration test, dan dokumentasi tersedia serta dapat dijalankan oleh developer lain mengikuti instruksi repository.

Baseline, periode pengukuran, dan target adopsi pengguna masih perlu disepakati.

## 11. Open Questions

1. Apa nama dan daftar nilai jenjang yang digunakan sekolah?
2. Apakah satu Siswa hanya boleh berada di satu kelas aktif pada satu waktu?
3. Apakah satu sesi absensi memiliki tepat satu Guru, kelas, mata pelajaran, tanggal, dan pasangan waktu?
4. Bagaimana sesi yang sama diperlakukan jika Guru menekan Generate QR Code lebih dari sekali: menampilkan QR yang sama atau menolak duplikasi?
5. Bagaimana sistem memfinalisasi status Tidak Hadir: job otomatis setelah `end_at`, dihitung saat riwayat/laporan dibuka, atau proses manual?
6. Apakah waktu mengikuti timezone server, timezone sekolah, atau konfigurasi lain?
7. Apakah batas 15 menit bersifat inklusif tepat pada menit ke-15? PRD ini menganggap tepat 15 menit masih Hadir.
8. Field profil yang boleh diubah Siswa/Guru selain username/NIM belum dirinci secara final.
9. Format banner, ukuran media, jumlah banner aktif, dan periode tampil belum ditentukan.
10. Apakah Admin juga memiliki alur login dan lupa password yang sama, atau hanya Siswa/Guru?
11. Kolom, filter, pengurutan, dan format nama file untuk ekspor Excel belum ditentukan.
12. Detail deployment single repository monolith, provider hosting, dan environment MySQL belum ditentukan.
13. Apakah reset password manual Admin menetapkan password tertentu atau menghasilkan password sementara?
14. Kebijakan retensi dan penghapusan data absensi belum ditentukan.
