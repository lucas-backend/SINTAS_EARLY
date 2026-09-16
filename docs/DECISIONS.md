# Technical Decisions

Dokumen ini mengunci keputusan yang menjadi prasyarat migration dan implementasi. `BLOCKED` berarti PRD dan Backend Guide belum memberi dasar yang cukup untuk memilih; implementasi tidak boleh menebak keputusan tersebut.

## 1. Timezone sekolah dan normalisasi UTC

**Status: BLOCKED untuk nilai timezone sekolah; mekanisme normalisasi dikunci.**

- **Pilihan final:** Simpan seluruh timestamp sebagai UTC di database. Gunakan timezone sekolah berbasis IANA yang configurable dari environment/configuration, lalu konversi pada boundary service dan response API. `start_at`, `end_at`, `session_date`, periode banner, dan tampilan laporan harus memakai timezone sekolah; waktu scan berasal dari server dan dinormalisasi ke UTC.
- **Alasan:** Ini diwajibkan oleh Backend Guide dan konsisten untuk deployment multi-instance. Nilai timezone spesifik sekolah belum disebutkan di PRD.
- **Dampak database/API/UI:** Database menyimpan timestamp UTC; konfigurasi wajib divalidasi sebagai timezone IANA. API menerima/mengembalikan waktu dengan kontrak timezone yang jelas. UI menampilkan waktu lokal sekolah dan tidak menghitung status absensi sendiri.
- **Asumsi yang masih perlu dikonfirmasi:** Identifier timezone sekolah, aturan jika sekolah mengubah timezone, dan apakah `session_date` ditafsirkan selalu menurut timezone sekolah.

## 2. Satu kelas aktif per siswa

**Status: BLOCKED.**

- **Pilihan final:** Belum ditetapkan apakah seorang siswa boleh memiliki lebih dari satu `class_students` aktif pada waktu yang sama.
- **Alasan:** PRD menjadikan ini open question. Data model hanya menyatakan sistem harus mencegah lebih dari satu kelas aktif bila keputusan produk menetapkannya.
- **Dampak database/API/UI:** Constraint atau validasi keanggotaan aktif belum boleh difinalkan. API plotting, query kelas aktif, authorization scan, dan UI admin akan berbeda bergantung pada pilihan ini.
- **Asumsi yang masih perlu dikonfirmasi:** Apakah tepat satu kelas aktif diwajibkan, termasuk saat perpindahan kelas, dan apakah ada pengecualian sementara.

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

**Status: BLOCKED.**

- **Pilihan final:** Belum ditetapkan format konten/media, ukuran atau rasio media, jumlah banner aktif, maupun aturan periode tampil.
- **Alasan:** PRD hanya mengharuskan banner aktif tampil dan banner tersembunyi tidak tampil; format dan jumlah secara eksplisit ditunda ke open question.
- **Dampak database/API/UI:** Model dapat menyiapkan `title`, `image_url` atau `content`, `is_active`, `display_start_at`, dan `display_end_at` seperti sketsa PRD, tetapi validasi field, filter aktif, urutan, batas jumlah, upload/storage, dan komponen beranda belum boleh diasumsikan.
- **Asumsi yang masih perlu dikonfirmasi:** Apakah banner image-only, text-only, atau keduanya; apakah periode bersifat opsional; dan apakah beberapa banner dapat aktif bersamaan.

## 6. Password minimum dan reset manual Admin

**Status: BLOCKED untuk kebijakan produk; mekanisme keamanan dasar dikunci.**

- **Pilihan final:** Password wajib di-hash dengan Argon2id dan tidak pernah disimpan plaintext. Panjang minimum, kompleksitas, serta apakah reset manual Admin menetapkan password tertentu atau menghasilkan password sementara belum ditetapkan.
- **Alasan:** Argon2id diwajibkan oleh Backend Guide, tetapi PRD hanya menyebut validasi password baru/konfirmasi dan menanyakan detail reset manual.
- **Dampak database/API/UI:** Hash dan verifikasi dapat diimplementasikan sekarang, tetapi schema validasi password, pesan form, endpoint reset Admin, audit trail, kewajiban ganti password saat login, dan cara penyampaian kredensial belum boleh dikunci.
- **Asumsi yang masih perlu dikonfirmasi:** Nilai minimum password, aturan reuse/expiry, siapa yang dapat direset Admin, dan apakah password sementara dikirim melalui kanal di luar sistem.

## 7. Kolom dan nama file export XLSX

**Status: BLOCKED.**

- **Pilihan final:** Belum ditetapkan daftar kolom, filter/pengurutan yang diekspor, timezone presentasi, format tanggal/waktu, atau pola nama file.
- **Alasan:** PRD hanya mensyaratkan workbook `.xlsx`, scope sesuai role, dan data lintas entitas untuk laporan Admin. Detail export disebut sebagai open question.
- **Dampak database/API/UI:** Query export, header workbook, urutan kolom, format cell, `Content-Disposition`, empty-export behavior, dan test parser belum dapat difinalkan. Authorization dan filter tetap wajib diterapkan sebelum query.
- **Asumsi yang masih perlu dikonfirmasi:** Kolom minimum untuk export Guru versus Admin, apakah identitas sensitif tertentu boleh disertakan, format nama file, dan apakah nama file memuat rentang tanggal/kelas.

## 8. Login dan lupa password Admin

**Status: BLOCKED.**

- **Pilihan final:** Belum ditetapkan apakah Admin memakai endpoint dan alur login/lupa password yang sama dengan Siswa dan Guru.
- **Alasan:** Login untuk tiga role diwajibkan, tetapi user story lupa password secara eksplisit menyebut Siswa dan Guru; PRD kemudian menanyakan perlakuan Admin sebagai open question.
- **Dampak database/API/UI:** Auth service, role policy, rate limit, reset eligibility, route UI, pesan error, dan test integration belum boleh mengasumsikan Admin termasuk atau dikecualikan dari forgot-password. Login tetap harus mendukung role Admin sesuai FR-01.
- **Asumsi yang masih perlu dikonfirmasi:** Apakah Admin boleh self-service reset memakai email/tanggal lahir, atau hanya reset manual oleh Admin lain/operasional terpisah.

## Gate implementasi

Migration final dan implementasi fitur yang bergantung pada keputusan di atas tidak boleh dikunci sebelum seluruh item `BLOCKED` memiliki keputusan produk eksplisit. Keputusan mekanisme yang sudah diwajibkan (UTC di database, timezone configurable, Argon2id, dan role login) tidak mengisi detail produk yang masih terbuka.
