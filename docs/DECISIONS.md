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

## Gate implementasi

Keputusan yang memengaruhi migration dan authorization di atas sudah dikunci untuk scope MVP. Nilai timezone tetap configurable melalui environment dengan default `Asia/Jakarta`.
