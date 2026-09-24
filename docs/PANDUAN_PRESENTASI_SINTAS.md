# Panduan & Naskah Presentasi — SINTAS

**Aplikasi Absensi Sekolah Berbasis QR Code**

> Dokumen ini dibuat khusus untuk **presenter non-teknis** yang akan
> mempresentasikan proyek SINTAS di hadapan **dewan penguji**.
> Seluruh bahasa di sini sudah disederhanakan: fokus pada masalah, solusi,
> manfaat, dan dampak — bukan pada seluk-beluk koding.

---

## Cara Memakai Panduan Ini

- **Waktu presentasi ideal:** 8–10 menit (diiringi demo 2–3 menit), lalu sesi
  tanya jawab.
- **Gaya yang paling disarankan:** bicara seperti sedang bercerita kepada
  guru/pengawas sekolah, bukan seperti membacakan kertas.
- **Naskah Ucapan** (Kotak) adalah kalimat siap-ucap. Hafalkan intinya,
  bukan hafalan kata demi kata. Boleh diparafrase selama pesan utamanya sama.
- **Pantang:** menyebut "bug", "error", "rumit", "sulit", atau menjawab
  "itu tidak penting". Sampaikan ranah teknis sebagai "pekerjaan di balik
  layar yang sudah kami siapkan matang".
- **Jika ragu:** lihat **Kartu Cepat** di halaman terakhir.

---

## 1. Ringkasan Eksekutif (Elevator Pitch)

### 1.1 Masalah yang Diselesaikan Proyek Ini

Absensi di sekolah pada umumnya masih dilakukan dengan kertas atau sesekali
daftar nama yang diedarkan kelas. Cara ini memiliki tiga kelemahan besar:

1. **Memakan waktu.** Guru harus menyebut nama satu per satu atau menunggu
   siswa menandatangani daftar; hal yang sama berulang setiap pertemuan.
2. **Rentan tidak akurat.** Daftar bisa salah dihitung, nama bisa terlewat,
   dan catatan "terlambat" mudah menjadi perdebatan karena tidak ada catatan
   waktu yang pasti.
3. **Menyulitkan rekap.** Mengumpulkan dan menjumlahkan kehadiran semua siswa
   selama sebulan atau satu semester dilakukan manual, lambat, dan melelahkan.

### 1.2 Solusi Utamanya

**SINTAS** adalah aplikasi absensi digital berbasis **QR Code** untuk satu
sekolah. Alur kerjanya sederhana:

1. **Guru** membuat sesi absensi (mis. pelajaran Matematika hari Senin jam
   07.00–08.40).
2. Sistem langsung menghasilkan **Kode QR** untuk sesi tersebut.
3. **Siswa** memindai kode itu dengan ponsel mereka — sekali, dalam hitungan
   detik.
4. Sistem mencatat status secara merata:
   - Datang tepat waktu → **Hadir**.
   - Datang melebihi batas toleransi (15 menit setelah jam mulai) tapi masih
     dalam sesi → **Terlambat** (beserta menit keterlambatannya).
   - Tidak memindai sampai sesi selesai → **Tidak Hadir**.
5. **Guru dan Admin** dapat melihat rekap dan mengunduhnya sebagai berkas
   laporan siap cetak.

Semuanya terjadi otomatis. Tidak ada penghitungan manual, tidak ada antrean
panjang, dan siapa yang terlambat tercatat dengan adil karena terjadi di
mesinnya, bukan di ingatan manusia.

### 1.3 Siapa yang Diuntungkan

| Pihak | Keuntungan |
| --- | --- |
| **Siswa** | Cukup memindai satu kode — cepat, tanpa kertas, dan status kehadiran mereka jelas & bisa dilihat sendiri. |
| **Guru** | Tidak perlu mengecam nama. Pembuatan sesi, pengecekan kehadiran per kelas, dan rekap untuk diserahkan ke sekolah otomatis. |
| **Admin Sekolah** | Mengelola data siswa/guru/kelas, melihat laporan kehadiran seluruh sekolah, dan mengunduh laporan dalam satu tempat terpusat. |
| **Sekolah** | Data kehadiran lebih rapi, akurat, dan bisa dipertanggungjawabkan. |

### 1.4 Elevator Pitch Siap-Ucap (Versi 1 Kalimat)

> "SINTAS adalah aplikasi absensi digital berbasis kode QR untuk sekolah —
> guru membuat sesi, siswa memindai satu kode, dan kehadiran tercatat secara
> otomatis, adil, dan rapi tanpa kertas.

---

## 2. Kamus Analog Teknis (Tech-to-Layman Translation)

Gunakan analogi ini setiap kali dewan penguji menyebut istilah teknis.
Anda tidak perlu menjelaskan teknisnya — cukup sambungkan ke analogi dan
kembalikan ke manfaat.

### 2.1 Aplikasi Tampilan (Frontend) vs Jantung Sistem (Backend)

- **Bahasa teknis:** *Frontend* (tampilan pengguna) dan *backend* (logika
  sistem).
- **Analogi:** Restoran. **Frontend = ruang makan** — yang terlihat dan
  dipegang pelanggan: meja, menu, piring saji. **Backend = dapur** — tempat
  semua bahan diolah, aturan masakan diputuskan, dan tidak semua orang boleh
  masuk.
- **Kalimat presenter:** "Anda boleh bayangkan aplikasi ini seperti restoran.
  Yang dilihat guru dan siswa adalah ruang makannya — tampilan yang rapi dan
  mudah digunakan. Tapi semua aturan penting, seperti cara menghitung
  keterlambatan dan menyimpan data, dikerjakan di dapur — di balik layar —
  supaya konsisten dan aman."

### 2.2 API (Jembatan Komunikasi Antarbagian)

- **Bahasa teknis:** *Application Programming Interface (API)*.
- **Analogi:** Pelayan restoran. Pelanggan duduk di ruang makan, dapur ada di
  belakang. Pelayan menerima pesanan, menyampaikannya ke dapur, lalu
  mengantarkan masakan kembali. Tamu tidak perlu masuk dapur dan koki tidak
  perlu keluar melayani.
- **Kalimat presenter:** "Ruang makan dan dapur berkomunikasi lewat pelayan.
  Dalam bahasa teknis, pelayan itu bernama API. Bagian tampilan memberi tahu
  'saya mau buat sesi absen', dan dapur menjawab 'sudah selesai, ini kode
  QR-nya'. Komunikasinya rapi, satu standar, dan tidak ada yang bingung."

### 2.3 Database (Tempat Penyimpanan Data)

- **Bahasa teknis:** *Database* (MySQL).
- **Analogi:** Gudang arsip sekolah yang sangat tertib. Ada lemari khusus
  siswa, lemari khusus guru, lemari jadwal, dan lemari catatan kehadiran.
  Setiap lemari punya label dan rak, jadi barang mudah dicari tanpa dibongkar
  habis.
- **Kalimat presenter:** "Seluruh data — siswa, guru, kelas, jadwal, dan
  kehadiran — tersimpan di satu gudang arsip digital yang tertib. Disimpan
  sekali, tidak bertebaran di kertas, dan langsung bisa dicari saat
  dibutuhkan."

### 2.4 Waktu Tercatat Seragam (UTC + Zona Waktu Sekolah)

- **Bahasa teknis:** *Timestamp UTC, timezone Asia/Jakarta*.
- **Analogi:** Waktu siaran langsung internasional. Siaran bola selalu
  diumumkan dalam satu patokan waktu dunia, lalu setiap negara melihatnya
  dalam waktu lokal masing-masing. Dengan begitu tidak ada yang salah hitung.
- **Kalimat presenter:** "Agar kehadiran adil, sistem mencatat waktu dengan
  satu patokan yang sama untuk seluruh sekolah, lalu menampilkannya dalam jam
  operasional sekolah. Hasilnya, pertanyaan 'apakah siswa ini benar terlambat
  5 menit?' selalu dijawab dengan bukti waktu yang sama — bukan perkiraan."
- **Catatan penting:** alasannya karena tidak bisa dicurangi dari sisi
  pengguna; sistemlah yang memegang kendali waktu.

### 2.5 Kode QR sebagai Tiket Masuk

- **Bahasa teknis:** *QR payload, generate session per pertemuan*.
- **Analogi:** Tiket konser / kode boarding pesawat. Setiap sesi memunculkan
  satu tiket khusus yang hanya berlaku untuk sesi itu. Penjaga pintu
  (sistem) menyamakan kode dengan jadwal; hanya siswa yang benar-benar ada di
  kelas itu yang bisa masuk.
- **Kalimat presenter:** "Setiap pertemuan punya 'tiket masuk' sendiri berupa
  kode QR. Kode ini tidak bisa dipakai di kelas lain, tidak bisa dipakai
  sebelum waktunya, dan tidak bisa digunakan dua kali oleh siswa yang sama.
  Seperti tiket menyebut kursi dan waktu — satu tiket, satu orang, satu sesi."

### 2.6 Pengaman Data (Sandi Rahasia + Kartu Tanda Anggota)

- **Bahasa teknis:** *Password terenkripsi, cookie sesi login*.
- **Analogi:** Kunci + stempel tinta rahasia. Kata sandi disimpan dalam bentuk
  teracak (bukan teks asli) — seperti menyimpan gambaran kunci, bukan
  kuncinya sendiri. Saat login, pengguna menerima "stempel tinta" yang tidak
  terlihat yang menempel selama sesi berlangsung, jadi aplikasi selalu tahu
  "ini tamu yang sudah diperiksa".
- **Kalimat presenter:** "Data yang kita anggap paling pribadi — kata sandi —
  tidak pernah disimpan dalam bentuk aslinya. Dan setiap orang yang masuk
  mendapat 'tanda pengenal' sementara yang membuat sistem tahu siapa yang
  sedang bertugas, sehingga siswa tidak bisa melihat data guru, dan guru tidak
  bisa melihat menu admin. Semua sesuai kewenangan masing-masing."

### 2.7 Uji Otomatis (Pasukan Pemeriksa Kualitas)

- **Bahasa teknis:** *Unit test & integration test (71 + 88 pengujian)*.
- **Analogi:** Rehearsal sebelum panggung dibuka. Sebelum pertunjukan resmi,
  aktor berlatih dan kru mengecek lampu berkali-kali, sehingga saat
  penonton datang tidak ada kejutan.
- **Kalimat presenter:** "Sebelum aplikasi ini dihadirkan, sistem sudah
  'berlatih' sebanyak ratusan kali secara otomatis: uji coba masuk, uji coba
  memindai, uji coba rekap. Semua uji ini dijalankan setiap kali ada
  perubahan, jadi sekolah menerima produk yang sudah teruji, bukan yang
  asal jadi."

---

## 3. Panduan & Naskah Presentasi (Slide demi Slide)

**Rekomendasi tata letak:** 8 slide. Slide 5 menyatu dengan demo langsung.

### Slide 1 — Judul

- **Poin Kunci:** Nama proyek, satu kalimat esensial, dan pesan percaya diri.
- **Naskah Ucapan:**
  > "Selamat pagi/siang. Terima kasih atas kesempatan ini. Kami ingin
  > memperkenalkan **SINTAS** — sebuah aplikasi absensi digital berbasis kode
  > QR untuk sekolah kami. Ini bukan sekadar pengganti daftar hadir kertas,
  > tetapi cara baru agar kehadiran menjadi cepat, adil, dan rapi. Izinkan saya
  > menceritakan mengapa kami membuat ini."
- **Demo:** Tidak ada. Tampilkan slide judul yang bersih (logo + tagline
  "Absensi Sekolah, Kini Secepat Pindai").

### Slide 2 — Masalah

- **Poin Kunci:** Absensi manual itu lambat, tidak akurat, dan rekapnya
  melelahkan. Tiga baris atau tiga kartu visual.
- **Naskah Ucapan:**
  > "Sebelum SINTAS, mari kita lihat keseharian yang terjadi di banyak
  > sekolah. Setiap pagi, guru harus mengecam nama satu per satu — sementara
  > siswa sudah menunggu di kursi. Daftar kertas mudah hilang dan mudah salah
  > hitung. Dan di akhir bulan, ada orang yang harus menjumlahkan kehadiran
  > semua siswa secara manual. Tiga masalah besar: **lambat, tidak akurat, dan
  > melelahkan**."
- **Demo:** Tidak ada.

### Slide 3 — Solusi (Alur Utama)

- **Poin Kunci:** Gambar alur 4 langkah: Guru buat sesi → Sistem keluarkan QR →
  Siswa pindai → Status tercatat otomatis.
- **Naskah Ucapan:**
  > "SINTAS menyelesaikan ketiga masalah itu dalam empat langkah. Guru membuat
  > sesi absensi untuk pertemuannya — cukup ketuk beberapa kali. Sistem
  > langsung mengeluarkan kode QR khusus sesi itu. Siswa memindainya dengan
  > ponsel masing-masing — sekali, dalam hitungan detik. Lalu sistem mencatat
  > statusnya: Hadir, Terlambat, atau Tidak Hadir, lengkap dengan menit
  > keterlambatannya. Tidak ada nama yang dipanggil, tidak ada kertas yang
  > diedarkan."
- **Demo:** Tidak ada (jika perlu, tunjukkan animasi alur di slide).

### Slide 4 — Siapa yang Diuntungkan (Peran Pengguna)

- **Poin Kunci:** Tiga peran: Siswa, Guru, Admin. Apa yang masing-masing bisa
  lakukan dan rasakan.
- **Naskah Ucapan:**
  > "SINTAS melayani tiga peran. **Siswa** memindai kode dan bisa melihat
  > riwayat kehadirannya sendiri — kapan saja, dari ponselnya. **Guru** membuka
  > sesi, melihat peta kehadiran kelasnya, dan mengunduh rekap tanpa
  > menghitung satu angka pun. **Admin** mengelola data siswa, guru, kelas,
  > pengumuman sekolah, dan melihat laporan kehadiran seluruh sekolah.
  > Tiga kelompok, satu alat, semua diuntungkan."
- **Demo:** Tidak ada.

### Slide 5 — DEMO LANGSUNG

- **Poin Kunci:** Ini slide paling penting. Tunjukkan nyata, bukan teori:
  1. Login sebagai **guru** → buka halaman sesi → tunjukkan kode QR.
  2. Beralih ke **peran siswa** → pindai kode dengan ponsel → tunjukkan hasil
     "Hadir".
  3. Buka **admin** → buka rekap/laporan → unduh berkas laporan.
- **Naskah Ucapan (intro sebelum demo):**
  > "Tentu, cerita tanpa bukti hanyalah cerita. Izinkan saya menunjukkan
  > SINTAS bekerja secara langsung. Saya akan berperan sebagai guru, lalu
  > sebagai siswa, lalu sebentar sebagai admin — sekadar membuktikan bahwa
  > ini benar-benar berjalan."
- **Panduan Demo Produk (langkah visual):**
  - Pastikan jendela browser sudah terbuka & login guru lebih dulu (jangan
    login di depan penguji bila koneksi lambat).
  - Langkah 1: tunjukkan daftar sesi guru → buka satu sesi → tunjukkan kode QR
    di layar.
  - Langkah 2: gunakan ponsel yang sudah siap di halaman pemindaian → pindai →
    tunggu animasi sukses → tunjukkan kartu hasil "Hadir" bersama waktu.
  - Langkah 3: dari peran siswa, buka "Riwayat" → tunjukkan bahwa hari ini
    tercatat.
  - Langkah 4: buka menu admin (pindah akun sudah login sebelumnya di tab
    lain) → buka laporan → tekan unduh → tunjukkan berkas yang terbuka.
  - Tunjukkan **satu kecurangan yang dicegah**: coba pindai dua kali → sistem
    menjawab "sudah tercatat" tanpa membuat data ganda. Ini poin yang paling
    disukai penguji.
  - **Rencana B:** jika internet/kamera gagal, langsung lanjut: "Sebagai
    cadangan, berikut tampilan yang baru saja saya tunjukkan" sambil menunjuk
    slide screenshot. Latih alur fallback ini minimal sekali sebelum
    presentasi.

### Slide 6 — Keandalan & Keamanan

- **Poin Kunci:** Data aman, waktu tidak bisa direkayasa, sistem teruji.
  Gunakan analogi dari Kamus (stempel tinta & pasukan pemeriksa).
- **Naskah Ucapan:**
  > "Sekarang, hal yang paling penting bagi sekolah: **kenapa bisa
  > dipercaya?** Pertama, setiap pengguna hanya melihat bagian yang menjadi
  > haknya. Kedua, waktu dicatat oleh sistem dengan satu patokan yang sama —
  > bukan dari pengaturan ponsel siswa, sehingga tidak bisa dimodifikasi.
  > Ketiga, jika siswa memindai dua kali karena penasaran, sistem mencatat
  > sekali saja — tidak ada data ganda. Dan sebelum hadir di hadapan sekolah,
  > sistem sudah melalui ratusan uji otomatis yang memastikan jalur utama
  > selalu bekerja."
- **Demo:** opsional — tampilkan layar hasil "sudah tercatat" saat pindai
  ganda (jika sudah dilakukan di Slide 5, cukup mengingatkan).

### Slide 7 — Dampak & Nilai

- **Poin Kunci:** Berikan angka manfaat sederhana: hemat waktu, rekap instan,
  keterlambatan terukur, laporan siap cetak. Bandingkan "sebelum vs sesudah".
- **Naskah Ucapan:**
  > "Apa hasilnya bagi sekolah? Guru menghemat waktu yang tadinya untuk
  > mengecam nama — kini untuk mengajar. Rekap kehadiran yang tadinya
  > memakan berhari-hari menjadi satu unduhan. Keterlambatan tidak lagi
  > menjadi perdebatan karena angkanya tercatat otomatis. Dan laporan untuk
  > dinas atau wali murid dapat diserahkan dalam bentuk rapi, kapan pun
  > dibutuhkan."
- **Demo:** Tidak ada. Tampilkan tabel "Sebelum / Sesudah".

### Slide 8 — Penutup

- **Poin Kunci:** Ringkasan satu kalimat + undangan bertanya.
- **Naskah Ucapan:**
  > "Sebagai penutup: **SINTAS mengubah absensi sekolah dari kebiasaan manual
  > yang lambat menjadi pengalaman satu pemindaian yang cepat, adil, dan
  > rapi.** Kami sangat terbuka atas pertanyaan dari dewan penguji. Terima
  > kasih."
- **Demo:** Tidak ada.

---

## 4. Strategi Tanya Jawab (Q&A Survival Kit)

### 4.1 Lima Pertanyaan Umum + Jawaban Aman

**Pertanyaan 1 — "Mengapa harus QR Code? Kenapa bukan yang lain?"**

> "Pertanyaan yang sangat baik. Kode QR kami pilih karena paling praktis untuk
> satu alasan sederhana: **setiap sesi punya kodenya sendiri dan setiap siswa
> bisa memindainya dengan ponsel yang hampir pasti mereka bawa.** Tidak perlu
> alat tambahan yang mahal, dan kode tidak bisa dipakai di sesi lain — sama
> seperti tiket yang hanya berlaku untuk satu acara."

**Pertanyaan 2 — "Bagaimana kalau siswa memindai dua kali atau menitipkan
kode lewat chat?"**

> "Dua hal yang sangat wajar ditanyakan. Satu, kalau siswa memindai dua kali,
> sistem mengenalinya dan mencatatnya **sekali saja** — tidak pernah ada data
> ganda. Dua, kode QR bersifat pribadi per sesi, ditampilkan di kelas saat
> sesi berjalan. Poin yang lebih penting: sistem mencatat **waktu** dari
> mesinnya sendiri, bukan dari ponsel siswa. Jadi memindai 'kode titipan'
> tidak mengubah fakta bahwa yang tercatat adalah waktu sistem — kehadiran
> yang sah tetap harus dilakukan di lokasi dan waktu sesi berlangsung."

**Pertanyaan 3 — "Bagaimana aturan terlambat ditentukan? Kok bisa adil?"**

> "Aturannya sama untuk semua siswa dan dihitung otomatis. Sistem membuka
> jendela pemindaian **15 menit sebelum jam mulai**. Siswa yang memindai
> hingga **15 menit setelah jam mulai** dicatat **Hadir**. Lewat dari itu,
> tetap tercatat, tetapi statusnya **Terlambat** beserta menit keterlambatan.
> Setelah sesi ditutup, yang belum memindai dicatat sebagai **Tidak Hadir**.
> Keputusannya di mesin — adil karena tidak ada campur tangan siapa pun."

**Pertanyaan 4 — "Apakah data siswa aman? Siapa yang bisa melihatnya?"**

> "Sangat aman, dan ini prioritas kami. Kata sandi tidak pernah disimpan dalam
> bentuk aslinya. Setiap orang yang masuk hanya melihat bagian sesuai perannya
> — siswa hanya data dirinya, guru hanya kelas yang diajarnya, dan admin yang
> membawahi seluruh data. Semua komunikasi data juga berjalan dalam saluran
> yang dienkripsi, seperti email yang berisikan amplop tertutup."

**Pertanyaan 5 — "Apakah aplikasi ini bisa dipakai sekolah lain atau
dikembangkan?"**

> "Saat ini SINTAS dirancang dan difokuskan untuk kebutuhan satu sekolah —
> sesuai lingkup proyek ini. Namun karena seluruh bagian dibangun dengan
> aturan yang tertata — data terpusat, proses pemeriksaan yang teruji —,
> menyesuaikannya untuk lingkungan lain bukan sesuatu yang mustahil: misalnya
> memperbarui pengaturan jam operasional atau nama sekolah. Perkembangan
> lanjutan bisa menjadi langkah berikutnya setelah proyek ini dinilai."

### 4.2 Script Saat Penguji Bertanya Hal yang Terlalu Teknis

Gunakan tiga langkah: **Tenang → Alihkan ke Manfaat → Tawarkan Detail di
Belakang**.

**Langkah 1 — Beri waktu berpikir (jeda 1–2 detik, jangan langsung menjawab).**

**Langkah 2 — Alihkan ke nilai manfaat dengan kalimat pembuka yang sudah
disiapkan:**

> "Terima kasih, pertanyaan yang bagus. Izinkan saya jawab dari sisi yang
> paling relevan bagi sekolah…" *(lalu sambungkan ke manfaat)*

**Langkah 3 — Jika penguji tetap ingin detail teknis, akui dengan tenang dan
beri jalan keluar:**

> "Untuk detail teknisnya secara mendalam, seluruhnya sudah saya dokumentasikan
> dalam panduan teknis proyek — saya dengan senang hati memeriksanya bersama
> dewan setelah presentasi ini, atau saya bisa tunjukkan bagian yang
> relevannya sekarang."

**Kalimat penyelamat tambahan (pilih yang paling sesuai):**

- *"Saya lebih senang menjawab ini dari sisi pengalaman pengguna dulu, karena
  itulah tujuan aplikasi ini dibuat."*
- *"Secara garis besar begini — di balik layar, bagian itu bertugas memastikan
  hasilnya selalu sama dan adil, seperti mesin yang tidak kenal lelah."*
- *"Supaya tidak terlalu teknis, intinya adalah: sistem mengerjakannya
  secara otomatis dan konsisten, sehingga sekolah tidak perlu khawatir."*
- Jika penguji membandingkan dengan teknologi lain: *"Betul, ada beberapa
  pendekatan. Yang kami pilih adalah yang paling sederhana untuk kebutuhan
  sekolah: cepat, murah, dan mudah dipakai oleh semua pengguna."*
- Jika dihadapkan pada istilah tertentu yang tidak Anda kenal, jangan
  mengarang. Jawab dengan jujur namun percaya diri:
  *"Itu istilah yang masuk wilayah teknis implementasi yang sangat dalam.
  Yang bisa saya pastikan: keputusan itu sudah diambil dengan pertimbangan
  keamanan dan keandalan — dan detailnya tercatat lengkap dalam dokumentasi
  proyek."*

### 4.3 Sikap Tubuh & Aturan Emas Tanya Jawab

- Pertahankan kontak mata dengan penguji yang bertanya, lalu sebarkan ke
  seluruh ruangan saat menjawab.
- Jangan memotong pertanyaan penguji. Selesaikan.
- Boleh mengulang pertanyaan dengan kata sendiri: *"Kalau saya pahami,
  Bapak/Ibu bertanya tentang…"* — ini juga memberi Anda waktu berpikir.
- Perbaiki selip kata dengan santai tanpa penjelasan panjang.
- Bila ragu, kaki tetap tenang, napas dulu, senyum — lalu gunakan kalimat
  jembatan dari Kotak 4.2.

---

## Lampiran — Kartu Cepat (Cheat Sheet untuk Dibawa Presenter)

**Pesan inti (3 butir):**
1. SINTAS = absensi digital berbasis QR untuk satu sekolah.
2. Alur = Guru buat sesi → Sistem keluarkan QR → Siswa pindai → Status
   tercatat otomatis.
3. Hasil = cepat, adil, rapi; rekap siap unduh tanpa hitung manual.

**Angka kunci yang aman disebut:**
- Toleransi terlambat: 15 menit setelah jam mulai → Hadir; lewat → Terlambat.
- Jendela pindai terbuka sejak 15 menit sebelum jam mulai.
- Pindai ganda: tetap satu catatan (tidak ada data ganda).
- Sistem sudah teruji melalui ratusan uji otomatis di balik layar.

**Tiga istilah + analoginya (jika terpaksa disebut):**
- API → pelayan restoran.
- Database → gudang arsip sekolah yang tertib.
- Frontend/Backend → ruang makan / dapur.

**Rencana B demo:** tutup aplikasi lapangan → buka slide screenshot versi
cadangan → *"ini tampilan yang baru saja berjalan; karena koneksi sedang
tidak mendukung, saya perlihatkan penampilannya lewat slide."*

---

*Dokumen naratif ini disusun dari dokumentasi teknis proyek
(`docs/PRD.md`, `docs/DOKUMENTASI_PROJECT_SINTAS.md`, dan pendukung lainnya)
dan seluruh fakta di dalamnya mencerminkan perilaku nyata aplikasi.*