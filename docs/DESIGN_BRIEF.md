# Design Brief & Design System

## 0. Ringkasan Keputusan

Produk ini adalah aplikasi absensi sekolah berbasis QR Code untuk tiga role: Siswa, Guru, dan Admin. Pengalaman utama Siswa harus membuat tiga hal terasa jelas dalam kurang dari lima detik:

1. Apakah saya sudah absen hari ini?
2. Kelas apa yang sedang atau akan berlangsung?
3. Apa yang harus saya lakukan sekarang?

Keputusan desain utama:

- Gunakan satu sistem visual untuk seluruh role, dengan navigasi dan prioritas konten yang berubah sesuai tugas role.
- Pertahankan biru sebagai warna kepercayaan dan aksi utama, tetapi hindari layar yang didominasi biru penuh.
- Status Hadir, Terlambat, dan Tidak Hadir selalu ditulis dengan label dan teks pendukung; warna dan ikon hanya menjadi penguat.
- QR Code statis bukan berarti alurnya boleh tanpa konfirmasi. Sistem tetap harus menjelaskan sesi, jendela waktu, hasil scan, dan kegagalan.
- Semua keputusan waktu mengikuti timezone sekolah. Tepat 15 menit setelah jam mulai masih berstatus Hadir, sesuai PRD.

## 1. Design Audit & Principles

### 1.1 Audit lima layar referensi

| Layar            | Yang sudah bekerja                                | Masalah yang harus diperbaiki                                                                                                                                                                                                               |
| ---------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Beranda Siswa    | Ada greeting, banner, shortcut Absen, dan Riwayat | Banner terlalu dominan dibanding tugas absensi; search tidak memiliki tujuan yang jelas; status “sudah absen” hanya berupa titik hijau; notifikasi tampil walau notifikasi dikeluarkan dari scope PRD; kartu fitur dan ikon terasa generik. |
| Daftar Pelajaran | Pengelompokan Hari Ini/Besok mudah dipindai       | Tanggal memakai format yang tidak konsisten; “Lebih lengkap” terlalu kecil; jadwal tidak menunjukkan apakah sesi dapat diabsen; warna ikon tidak memiliki arti status; jam dan durasi tidak menjadi informasi yang terstruktur.             |
| Scanner QR       | Area scan terlihat jelas                          | Kamera ditampilkan seperti alat teknis tanpa instruksi, status izin, atau batas sesi; kontrol ikon tidak diberi label; tidak ada state loading, invalid QR, terlalu awal, atau sesi berakhir.                                               |
| Hasil Absen      | Konfirmasi berhasil terasa positif                | “Terima kasih” bukan informasi yang dibutuhkan; status, nama pelajaran, waktu scan, dan keterlambatan tidak terlihat; tombol terlihat seperti link di satu layar dan tombol penuh di layar lain.                                            |
| Riwayat Absen    | Tabel sederhana dan familiar                      | Hanya satu tanggal yang terlihat; tidak ada filter, pagination, empty state, menit terlambat, atau penjelasan status; tabel tidak siap untuk layar kecil; tombol “Kembali” terlalu jauh dari konteks navigasi.                              |

Masalah lintas layar:

- Header, radius, shadow, ukuran tombol, dan jarak antar elemen belum berasal dari token yang sama.
- Tipografi terlalu kecil pada label sekunder dan kontras biru muda tidak memadai.
- Ikon dipakai sebagai dekorasi, padahal beberapa di antaranya menyampaikan tindakan atau status. Ikon harus memiliki label, tooltip, atau teks yang menyertainya.
- Primary action berubah bentuk dan posisi. Pengguna tidak mendapat pola yang bisa dipelajari.
- Tidak ada desain untuk permission kamera, loading, error, offline, empty, atau duplicate scan.
- UI belum membedakan informasi operasional untuk Siswa dari alat kerja Guru/Admin.

### 1.2 Tiga design principles

#### 1. Waktu harus terbaca sebelum dekorasi

Absensi adalah tugas berbasis waktu. Tampilkan jadwal, jendela scan, status, dan menit keterlambatan dengan hirarki yang kuat. Banner, ilustrasi, dan ornamen tidak boleh mengambil ruang dari keputusan pengguna.

#### 2. Setiap status memberi jalan keluar

Hadir, Terlambat, Tidak Hadir, belum dibuka, sudah ditutup, QR tidak valid, offline, dan izin ditolak harus memiliki label yang eksplisit, penjelasan singkat, dan aksi berikutnya. Tidak ada layar buntu.

#### 3. Konsistensi mengurangi beban belajar

Satu nama aksi, satu token spacing, satu pola header, satu pola status, dan satu posisi primary action digunakan lintas role. Perbedaan role diekspresikan lewat data dan tugas, bukan lewat tema visual yang berbeda-beda.

## 2. Visual Direction

### 2.1 Mood dan referensi gaya

Mood: **calm school operations**. Rasanya bersih, tepercaya, dan cukup hangat untuk siswa, tetapi cukup terstruktur untuk guru dan admin. Referensi perilaku visualnya adalah aplikasi transit/utility yang cepat dipindai, dashboard akademik yang rapi, dan papan pengumuman sekolah yang modern: informasi penting tampil singkat, status kuat, dekorasi terkendali.

Signature yang dipakai: **time rail**. Pada daftar jadwal dan riwayat, waktu menjadi garis baca utama dengan label status di sisi kanan. Ini menghubungkan jadwal, sesi QR, dan riwayat dalam satu bahasa visual yang khas.

### 2.2 Yang dipertahankan

- Biru sebagai sinyal aksi utama dan kepercayaan.
- Banner sekolah sebagai konten editorial yang dikelola Admin.
- Kartu shortcut untuk Absen dan Riwayat pada Beranda Siswa.
- Ikon mata pelajaran sebagai pembantu pemindaian cepat, bukan sebagai satu-satunya makna.
- Konfirmasi sukses yang singkat setelah scan.

### 2.3 Yang wajib dibuang atau dihindari

- Header biru penuh di setiap layar jika tidak membawa konteks; gunakan top bar ringkas dengan area konten putih.
- Shadow besar dan blur di bawah header.
- Teks biru muda berukuran kecil seperti “Lebih lengkap” yang sulit dibaca.
- Emoji, ikon dekoratif, atau simbol matematika sebagai pengganti ikon pelajaran resmi.
- Tombol icon-only tanpa accessible name.
- Campuran radius 4, 8, 12, dan 16 px tanpa aturan.
- Carousel banner dengan panah kecil yang tidak jelas; gunakan satu banner aktif dengan indikator yang dapat diakses atau daftar yang dapat digeser dengan keyboard.
- Pesan sukses generik seperti “Terima Kasih” tanpa status absensi.
- Search di Beranda sebelum ada kebutuhan pencarian yang nyata.
- Notifikasi bell karena fitur notifikasi bukan bagian dari PRD.
- All-caps untuk seluruh label tombol; gunakan sentence case agar lebih mudah dibaca.

### 2.4 Arah fotografi dan ilustrasi

Banner boleh memakai foto atau ilustrasi event sekolah yang nyata, cerah, dan tidak mengganggu teks. Rasio banner 16:7 pada mobile dan 3:1 pada desktop; teks penting tidak ditempatkan di area yang dapat terpotong. UI inti tidak bergantung pada ilustrasi agar tetap berguna saat gambar gagal dimuat.

## 3. Design Tokens

### 3.1 Color tokens

| Token             | Hex       | Penggunaan                                                                                   |
| ----------------- | --------- | -------------------------------------------------------------------------------------------- |
| `ink-900`         | `#132238` | Teks utama, heading, data penting                                                            |
| `ink-700`         | `#3E5064` | Teks sekunder dan label                                                                      |
| `ink-500`         | `#687B8F` | Placeholder dan metadata non-kritis; tidak untuk teks kecil di atas putih jika gagal kontras |
| `school-blue-700` | `#0F6B9A` | Primary button, link, focus ring                                                             |
| `school-blue-900` | `#123B5D` | App bar, teks pada area biru                                                                 |
| `school-blue-050` | `#EAF4FB` | Surface biru muda, selected state                                                            |
| `coral-600`       | `#C94F35` | Accent event, bukan warna teks normal di atas putih                                          |
| `success-700`     | `#147D3F` | Hadir/sukses; dipasangkan dengan label                                                       |
| `warning-700`     | `#9A5B00` | Terlambat/peringatan                                                                         |
| `danger-700`      | `#B42318` | Error, Tidak Hadir, destructive                                                              |
| `surface-0`       | `#FFFFFF` | Surface utama                                                                                |
| `surface-50`      | `#F6F8FA` | Background halaman                                                                           |
| `line-200`        | `#D7E0E8` | Border dan divider                                                                           |

Rules:

- Teks utama selalu `ink-900` atau lebih gelap.
- Warna status tidak pernah dipakai sendirian untuk menyampaikan makna.
- `coral-600` dipakai sebagai aksen visual atau background dengan teks gelap/putih yang diuji, bukan sebagai body text kecil.
- Pada tombol primary, gunakan `school-blue-700` dengan teks putih. Pada app bar, gunakan `school-blue-900` dengan teks putih.

### 3.2 Typography

Font wajib: **Plus Jakarta Sans** untuk seluruh UI. Bentuk hurufnya ramah namun tetap memiliki angka yang mudah dibaca pada jadwal. Jangan mencampur font lain pada MVP; konsistensi angka dan label lebih penting daripada efek dekoratif.

| Token        | Size / line height | Weight | Penggunaan                                                |
| ------------ | ------------------ | ------ | --------------------------------------------------------- |
| `display-sm` | 28 / 36 px         | 700    | Greeting atau hasil sukses utama, maksimal satu per layar |
| `heading-lg` | 24 / 32 px         | 700    | Judul halaman                                             |
| `heading-md` | 20 / 28 px         | 700    | Judul section                                             |
| `heading-sm` | 16 / 24 px         | 700    | Judul kartu dan item                                      |
| `body-lg`    | 16 / 24 px         | 400    | Instruksi dan paragraf pendek                             |
| `body-md`    | 14 / 20 px         | 400    | Konten utama default                                      |
| `label-md`   | 14 / 20 px         | 600    | Label field dan tombol                                    |
| `caption`    | 12 / 16 px         | 400    | Metadata; tidak boleh memuat informasi wajib sendirian    |
| `data`       | 14 / 20 px         | 600    | Jam, status, jumlah menit                                 |

Gunakan sentence case. Jangan mengecilkan font untuk memaksa konten masuk satu baris; biarkan wrap pada mobile.

### 3.3 Spacing, radius, dan shadow

Spacing base 4 px: `space-1` 4, `space-2` 8, `space-3` 12, `space-4` 16, `space-5` 20, `space-6` 24, `space-8` 32, `space-10` 40, `space-12` 48, `space-16` 64.

- `radius-sm`: 6 px untuk input dan compact control.
- `radius-md`: 10 px untuk card, banner, and button.
- `radius-lg`: 16 px untuk modal dan bottom sheet.
- `radius-pill`: 999 px hanya untuk status badge dan avatar.
- `shadow-1`: `0 1px 3px rgba(19, 34, 56, 0.10)` untuk card terangkat.
- `shadow-2`: `0 8px 24px rgba(19, 34, 56, 0.12)` untuk modal/bottom sheet saja.
- Hindari shadow pada setiap section; divider cukup untuk konten padat.

## 4. Screen Inventory

### 4.1 Lima layar referensi

| ID  | Layar                   | Tujuan                                                                   | Primary action yang disarankan                                                   |
| --- | ----------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| S1  | Beranda Siswa           | Menjawab kondisi absensi hari ini dan memberi akses cepat ke tugas utama | `Mulai absen` atau `Lihat status hari ini`, tergantung sesi aktif                |
| S2  | Daftar Pelajaran/Jadwal | Memilih sesi atau melihat pelajaran hari ini dan besok                   | `Absen sekarang` pada sesi yang sedang terbuka                                   |
| S3  | Scanner QR              | Membaca QR sesi yang ditampilkan Guru                                    | Scan otomatis; tombol sekunder `Masukkan dari galeri` hanya bila memang didukung |
| S4  | Hasil Scan              | Menjelaskan hasil pencatatan absensi                                     | `Lihat riwayat` atau `Kembali ke beranda`                                        |
| S5  | Riwayat Absen           | Memeriksa riwayat personal berdasarkan periode dan status                | `Filter` dan `Lihat detail` bila ada                                             |

### 4.2 Layar perantara yang wajib ditambahkan

- Login dan lupa password: pintu masuk yang disebut PRD tetapi tidak ada pada eksplorasi.
- Permission kamera: menjelaskan mengapa kamera diperlukan sebelum browser prompt.
- Scan pre-check: detail pelajaran, kelas, jam mulai/selesai, dan status “dibuka pukul ...”.
- Scan result: satu template hasil untuk Hadir, Terlambat, duplicate scan, dan gagal.
- Session unavailable: terlalu awal, sesi sudah ditutup, QR invalid, atau sesi bukan untuk siswa tersebut.
- Riwayat detail: detail tanggal, kelas, pelajaran, waktu scan, status, dan menit terlambat.
- Riwayat empty dan filter: periode tanpa record tidak boleh terlihat seperti bug.
- Offline/error pemuatan: mempertahankan konteks dan menawarkan retry.
- Guru: daftar penugasan, form buat sesi, tampilan QR sesi, dan rekap kehadiran kelas.
- Admin: dashboard, manajemen banner, pengguna, kelas/plotting, dan laporan global.

## 5. User Flow

### 5.1 Journey Siswa: masuk dan melihat kondisi hari ini

1. Buka Login.
2. Masukkan username dan password.
3. Jika invalid, tampilkan pesan umum: “Username atau password tidak sesuai.” Pertahankan input username, kosongkan password.
4. Jika valid, masuk ke Beranda.
5. Beranda menampilkan greeting, banner aktif, ringkasan absensi hari ini, dan jadwal terdekat.
6. Siswa memilih `Mulai absen` pada sesi yang sedang terbuka atau membuka daftar pelajaran.

### 5.2 Journey Siswa: scan QR

1. Beranda/Jadwal menampilkan sesi dengan status `Bisa absen`, `Belum dibuka`, atau `Selesai`.
2. Siswa memilih sesi `Bisa absen`.
3. Scan pre-check menampilkan nama pelajaran, kelas, guru, dan window absensi.
4. Jika kamera belum diizinkan, tampilkan Permission kamera.
5. Kamera membaca QR. Jangan membuat tombol “Submit” tambahan jika scan otomatis.
6. Sistem memvalidasi QR, siswa, assignment, dan waktu server.
7. Tampilkan hasil: Hadir jika scan <= 15 menit setelah mulai; Terlambat jika lebih dari 15 menit sampai akhir; duplicate jika sudah tercatat.
8. Tampilkan waktu scan dan menit terlambat bila ada.
9. Siswa memilih `Lihat riwayat` atau `Kembali ke beranda`.

### 5.3 Journey Siswa: riwayat

1. Siswa membuka Riwayat dari Beranda atau hasil scan.
2. Default filter adalah 7 hari terakhir dengan tanggal terbaru di atas.
3. Siswa dapat memfilter status dan memilih rentang tanggal.
4. Item riwayat menampilkan tanggal, pelajaran, kelas, status, dan menit terlambat.
5. Siswa membuka detail bila membutuhkan waktu scan atau alasan status.

### 5.4 Journey Guru: buat sesi dan pantau

1. Guru login dan masuk ke Beranda Guru.
2. Guru memilih kelas dan mata pelajaran dari penugasan yang sah.
3. Guru mengisi tanggal, waktu mulai, dan waktu selesai.
4. Sistem menolak assignment yang bukan milik Guru dan duplikasi sesi pada pasangan assignment/tanggal/waktu.
5. Sistem membuat satu QR statis dan halaman QR yang menampilkan detail sesi.
6. Guru membagikan QR di kelas; layar memiliki kontrol brightness/fullscreen yang berlabel.
7. Guru membuka daftar kehadiran untuk melihat Hadir, Terlambat, dan Tidak Hadir.
8. Guru mengekspor rekap `.xlsx`; state loading dan error harus terlihat.

### 5.5 Journey Admin

1. Admin login.
2. Admin mengelola banner aktif/nonaktif, user, kelas, plotting, dan laporan global.
3. Setiap tabel menyediakan filter, pagination, empty state, dan konfirmasi untuk tindakan destruktif.
4. Laporan global dapat diekspor dengan scope dan waktu yang terlihat sebelum download.

### 5.6 Journey lupa password

1. Pilih `Lupa password`.
2. Isi email, tanggal lahir, password baru, dan konfirmasi password.
3. Validasi inline untuk format, kecocokan, dan kekuatan minimum password.
4. Jika data tidak cocok, gunakan pesan umum dan jangan mengungkap field yang gagal.
5. Sukses mengembalikan pengguna ke Login dengan pesan bahwa password telah diperbarui.

## 6. Layout per Screen

### S1. Beranda Siswa

Struktur dari atas ke bawah:

1. Top bar: avatar, nama, role/kelas kecil, menu profil; hapus bell notification.
2. Ringkasan `Absensi hari ini`: status utama dan jumlah sesi yang belum diikuti.
3. Banner aktif dengan judul dan tanggal event; banner tidak mengalahkan status absensi.
4. `Jadwal terdekat`: maksimal tiga item dengan time rail dan aksi kontekstual.
5. Shortcut sekunder: `Riwayat absensi` dan `Profil`.

Primary action adalah sesi yang sedang bisa diabsen. Jika tidak ada sesi terbuka, primary action menjadi `Lihat jadwal`, bukan tombol palsu.

### S2. Daftar Pelajaran/Jadwal

Gunakan segmented date control dengan tanggal lengkap dan state terpilih yang jelas. Di bawahnya gunakan section `Sedang berlangsung`, `Hari ini`, dan `Besok` bila relevan. Setiap item berisi jam, nama mapel, kelas, guru, durasi, dan status sesi.

Pindahkan `Lebih lengkap` menjadi filter atau navigasi yang jelas. Jangan menjadikan ikon mapel berwarna sebagai pembawa makna status. Tombol `Absen sekarang` hanya muncul pada item yang valid.

### S3. Scanner QR

Top bar memiliki back, judul `Scan QR absensi`, dan tombol bantuan teks. Area kamera memakai rasio stabil 1:1 dengan frame kontras tinggi. Di bawahnya:

- Instruksi: “Arahkan kamera ke QR Code yang ditampilkan guru.”
- Konteks sesi: mapel dan kelas jika sudah dipilih.
- Status kamera: memuat, siap, izin ditolak, atau kamera tidak tersedia.
- Bantuan: “Scan hanya aktif dari 15 menit sebelum mulai sampai jam selesai.”

Jangan menampilkan kontrol kamera yang tidak didukung aplikasi. Jika fullscreen/flash/galeri belum menjadi requirement, hilangkan dari MVP.

### S4. Hasil Scan

Gunakan satu template dengan status yang berubah:

- Icon/status badge.
- Heading: `Absensi tercatat` atau `Absensi terlambat`.
- Detail: mapel, kelas, tanggal, waktu scan, status, dan `Terlambat X menit` bila berlaku.
- Penjelasan duplicate scan: “Absensi untuk sesi ini sudah tercatat pada pukul ...”.
- Primary action: `Lihat riwayat`.
- Secondary action: `Kembali ke beranda`.

Jangan gunakan tombol outline sebagai primary di satu layar lalu tombol solid pada layar lain. Primary selalu solid biru.

### S5. Riwayat Absen

Top bar berisi back dan judul. Di bawahnya: filter tanggal, filter status, ringkasan jumlah record, lalu daftar/tabel.

Mobile memakai list rows dengan grid tanggal | mapel/kelas | status. Tablet dan desktop memakai tabel dengan kolom tanggal, jam scan, siswa, kelas, mapel, status, dan menit terlambat sesuai role. Status badge selalu menyertakan teks. Letakkan tombol kembali di top bar, bukan fixed di bawah layar.

## 7. Component Library

| Komponen            | Variant                                               | State                                                     |
| ------------------- | ----------------------------------------------------- | --------------------------------------------------------- |
| `AppBar`            | student, teacher, admin, back, menu                   | default, scrolled, loading                                |
| `Button`            | primary, secondary, ghost, danger, icon               | default, hover, focus-visible, pressed, disabled, loading |
| `TextField`         | text, password, date, search                          | empty, filled, focus, invalid, disabled                   |
| `Select`            | single, multi, date range                             | closed, open, selected, invalid, disabled                 |
| `StatusBadge`       | hadir, terlambat, tidak hadir, dibuka, ditutup, error | default, compact                                          |
| `ScheduleCard`      | upcoming, active, completed, unavailable              | default, hover, selected, loading                         |
| `AttendanceRow`     | student, teacher detail, admin report                 | default, selected, loading                                |
| `Banner`            | image, text fallback                                  | loading, active, hidden, broken image                     |
| `DateSegment`       | day, week, custom                                     | default, selected, disabled                               |
| `QrScanner`         | camera, permission, unavailable                       | initializing, ready, detecting, success, error            |
| `QrDisplay`         | teacher session                                       | ready, fullscreen, expired                                |
| `ResultPanel`       | success, warning, error, duplicate                    | default, loading                                          |
| `DataTable`         | teacher, admin                                        | loading, empty, error, paginated                          |
| `Toast`             | success, warning, error, info                         | entering, visible, dismissing                             |
| `Modal/BottomSheet` | confirmation, filter, detail                          | open, closing                                             |
| `Skeleton`          | text, card, table, banner                             | loading                                                   |

Aturan komponen:

- Icon button wajib memiliki accessible name dan tooltip pada desktop.
- Touch target minimal 44 x 44 px.
- Setiap tombol menyatakan hasil tindakan, misalnya `Buat sesi`, `Simpan perubahan`, `Coba lagi`.
- Jangan menaruh card di dalam card. Gunakan section dan divider untuk hirarki.

## 8. States

| Layar kunci    | Loading                                      | Empty                                              | Error                                                              | Success                                     | Offline                                                                                  |
| -------------- | -------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Beranda        | Skeleton greeting, ringkasan, banner, jadwal | “Belum ada jadwal hari ini” + `Lihat jadwal`       | Banner gagal, jadwal tetap usable + `Coba lagi` per section        | Ringkasan “Semua absensi hari ini tercatat” | Tampilkan cache terakhir, label waktu, dan `Coba lagi`; jangan mengklaim data terbaru    |
| Jadwal         | Skeleton rows                                | “Belum ada pelajaran pada tanggal ini”             | “Jadwal tidak dapat dimuat” + retry                                | Sesi aktif diberi badge `Bisa absen`        | Jadwal cache read-only; sembunyikan aksi scan jika validasi server tidak tersedia        |
| Scanner        | Kamera initializing + instruksi              | Tidak berlaku; kamera siap adalah default          | Izin ditolak, kamera gagal, QR invalid, terlalu awal, sesi selesai | Pindah ke ResultPanel dengan status server  | “Koneksi terputus. Absensi belum tercatat.” + retry; jangan menyimpan klaim sukses lokal |
| Hasil scan     | Verifikasi record                            | Tidak berlaku                                      | Duplicate, server error, sesi berubah                              | Status, detail sesi, timestamp server       | Tampilkan bahwa hasil belum dapat diverifikasi dan arahkan retry                         |
| Riwayat        | Skeleton filter dan rows                     | “Belum ada riwayat pada periode ini” + ubah filter | “Riwayat tidak dapat dimuat” + retry                               | Data dan filter tampil                      | Cache diberi label `Terakhir diperbarui ...`; export dinonaktifkan                       |
| Guru QR/report | QR/report skeleton                           | Belum ada sesi/record + action                     | Unauthorized, export gagal, sesi duplikat                          | QR dibuat atau file siap diunduh            | QR/report tidak dibuat tanpa konfirmasi server                                           |
| Admin tables   | Skeleton table                               | Empty state dengan action membuat data             | Error per tabel, bukan blank page                                  | Toast dan row update                        | Read-only cache untuk tabel; write/export disabled                                       |

Pesan error harus menjawab apa yang terjadi dan langkah berikutnya. Hindari “Something went wrong” tanpa retry atau konteks.

## 9. Responsive Behaviour

### Mobile: 320-767 px

- Fokus pada satu kolom dan satu primary action per layar.
- Padding horizontal 16 px; minimum touch target 44 px.
- Jadwal menjadi list; tabel riwayat menjadi row bertingkat.
- Scanner memakai lebar kontainer dengan rasio 1:1, bukan ukuran tetap 293 px seperti referensi.
- Filter dibuka dalam bottom sheet; top bar tetap terlihat.
- Banner boleh scroll horizontal hanya bila ada lebih dari satu banner aktif; setiap item memiliki label dan indikator.

### Tablet: 768-1199 px

- Konten utama maksimal 960 px dengan dua kolom pada Beranda: status/jadwal di kiri, banner/shortcut di kanan.
- Riwayat memakai tabel ringkas; filter tetap terlihat di atas.
- Scanner mempertahankan area QR maksimal 480 px agar tidak terlalu besar.
- Guru dapat menampilkan QR dan ringkasan kehadiran dalam layout dua panel.

### Desktop: 1200 px ke atas

- Gunakan sidebar 240 px untuk Guru/Admin; Siswa tetap boleh memakai top bar plus content rail.
- Konten maksimal 1200 px; jangan meregangkan card sampai memenuhi viewport.
- Guru QR display dapat memakai dua panel: QR besar dan status real-time di sisi kanan.
- Admin memakai data table dengan toolbar filter, column visibility, pagination, dan export.
- Semua layout menjaga fokus visual pada status dan aksi utama, bukan menambah dekorasi kosong.

Breakpoints bukan alasan untuk mengubah makna. Label, urutan status, dan nama action harus tetap sama pada semua ukuran.

## 10. Accessibility

### 10.1 Contrast

Target minimum WCAG 2.2 AA: 4.5:1 untuk body text normal, 3:1 untuk text besar, dan 3:1 untuk komponen grafis/border yang menyampaikan informasi.

Dengan token di atas, target kombinasi yang wajib digunakan:

| Kombinasi                    | Rasio target | Keterangan     |
| ---------------------------- | ------------ | -------------- |
| `ink-900` on `surface-0`     | >= 14:1      | Teks utama     |
| `ink-700` on `surface-0`     | >= 7:1       | Teks sekunder  |
| White on `school-blue-700`   | >= 4.5:1     | Primary button |
| White on `school-blue-900`   | >= 10:1      | App bar        |
| `success-700` on `surface-0` | >= 4.5:1     | Status teks    |
| `warning-700` on `surface-0` | >= 4.5:1     | Status teks    |
| `danger-700` on `surface-0`  | >= 5:1       | Error status   |

Jangan gunakan `#91C8F2` atau biru muda sejenis sebagai teks kecil di atas putih. Background status boleh berwarna muda, tetapi teks di atasnya harus memakai token gelap yang lolos kontras.

### 10.2 Focus order dan keyboard

- Urutan tab mengikuti urutan visual dan tugas: skip link, app bar, filter, content, primary action, secondary action.
- Focus-visible memakai outline 2 px `school-blue-700` dengan offset 2 px; jangan menghapus outline browser tanpa pengganti.
- Semua fungsi utama dapat dijalankan tanpa mouse: login, filter, membuka detail, menjalankan retry, dan menutup modal.
- Date range, select, modal, dan bottom sheet harus mengelola focus trap dan mengembalikan focus ke trigger saat ditutup.
- QR scanner tidak boleh menjadi satu-satunya jalur yang dapat digunakan; permission/error harus bisa dinavigasi keyboard.
- Jangan memakai hover sebagai satu-satunya cara menampilkan informasi.

### 10.3 Semantics dan ARIA

- Gunakan heading hierarchy `h1` lalu `h2` sesuai struktur halaman.
- Gunakan native `button`, `a`, `input`, dan `table` sebelum menambah ARIA.
- `StatusBadge` memiliki teks visible; jangan mengandalkan `aria-label` yang berbeda dari teks visual.
- Error field memakai `aria-invalid="true"`, `aria-describedby` ke pesan error, dan pesan tidak hanya berupa warna.
- Toast memakai `role="status"` untuk sukses/info dan `role="alert"` untuk error yang membutuhkan perhatian.
- Scanner memiliki live region untuk “Kamera siap”, “QR terdeteksi”, dan pesan gagal. Jangan mengumumkan frame kamera terus-menerus.
- Tabel menggunakan caption atau label yang menjelaskan scope; pada mobile, hubungan label-nilai tetap terbaca oleh screen reader.
- Gambar banner memiliki alt text yang menjelaskan event; gambar dekoratif memakai alt kosong.

### 10.4 Motion dan input

- Animasi hanya untuk perpindahan hasil scan, skeleton, dan perubahan status; durasi 150-250 ms.
- Hormati `prefers-reduced-motion` dengan menghapus transform dan autoplay carousel.
- Kamera membutuhkan permission yang eksplisit dan fallback yang jelas.
- Jangan mengandalkan gesture swipe untuk banner atau filter tanpa kontrol alternatif.

## 11. Definition of Done untuk UI

Sebuah layar dianggap siap jika:

- Primary action, scope akses, dan status waktu dapat dipahami tanpa penjelasan lisan.
- Default, loading, empty, error, success, dan offline sudah dirancang untuk layar tersebut.
- Semua warna, typography, spacing, radius, dan shadow memakai token.
- Kontras diuji dengan automated checker dan manual keyboard walkthrough.
- Mobile 320 px, tablet 768 px, dan desktop 1440 px tidak menghasilkan overlap atau teks terpotong.
- Screen reader dapat mengidentifikasi heading, status, field error, dan action utama.
- Copy memakai istilah yang sama dengan PRD: `Hadir`, `Terlambat`, `Tidak Hadir`, `Bisa absen`, `Belum dibuka`, dan `Selesai`.
- Implementasi tidak menambahkan notifikasi, dynamic QR, atau fitur lain di luar scope MVP.

## 12. Open Decisions yang Harus Dikunci Product/Engineering

1. Timezone sekolah dan sumber waktu server.
2. Apakah satu siswa hanya memiliki satu kelas aktif pada satu waktu.
3. Mekanisme finalisasi `Tidak Hadir`: job setelah `end_at` atau computed saat data dibuka.
4. Ukuran, jumlah, dan periode tampil banner.
5. Kebijakan password minimum dan reset password manual Admin.
6. Apakah scan dari galeri diizinkan; rekomendasi saya: tidak untuk MVP agar tugas kamera tetap jelas.
7. Nama file dan kolom final export `.xlsx`.

Keputusan tersebut memengaruhi copy, state, dan API contract. Jangan mengunci visual final untuk area itu dengan asumsi diam-diam.
