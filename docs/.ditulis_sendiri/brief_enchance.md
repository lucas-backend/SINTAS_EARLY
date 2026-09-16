Kamu adalah seorang Senior Product Manager di perusahaan EdTech. Saya membutuhkan kamu untuk menyusun Product Requirements Document (PRD) yang komprehensif, tegas, dan siap dieksekusi oleh tim developer untuk produk "Sistem Absensi Sekolah Berbasis QR Code".

[KONTEKS & REQUIREMENT PRODUK]
Sistem ini memiliki 3 Role Utama: Siswa, Guru, dan Admin.

1. Role Siswa:
- Login: Menggunakan Username & Password mandiri. Berhasil -> redirect ke Beranda. Gagal -> tampilkan error message yang jelas.
- Lupa Password: Sementara biarkan rentan (Gunakan input email dan tanggal lahir).
- Absensi: Scan QR Code yang digenerate Guru. Setelah sukses -> tampilkan status berhasil.
- Riwayat: Bisa melihat riwayat absen sendiri.
- Aturan Absen: Dibuka 15 menit sebelum kelas dimulai hingga jam kelas selesai.
- Status Absen: 
  a) Hadir (Tepat waktu)
  b) Terlambat (Jika melebihi 15 menit dari jam mulai, sistem harus menghitung selisih menit keterlambatannya).
  c) Tidak Hadir.
- Profil: User bisa mengubah data profil dasar (kecuali username/NIM).

2. Role Guru:
- Login & Lupa Password: Alur sama dengan siswa.
- Dashboard: Mirip siswa, tetapi memiliki menu utama "Buat Absen".
- Manajemen Kelas: Pada list mata pelajaran, terdapat tombol "Generate QR Code" per pertemuan. (Catatan keamanan: Biarkan rentan, **TIDAK PERLU** menggunakan Dynamic QR untuk menghindari siswa titip absen via foto).
- Riwayat: Ada icon 'Mata' untuk melihat riwayat kehadiran siswa per kelas.
- Report: Tombol rekapitulasi kehadiran kelas yang bisa di-export ke format Excel (.xlsx).

3. Role Admin:
- Dashboard Admin: Mengatur Banner Event Sekolah di aplikasi (Tampil di beranda user).
- Manajemen User: Fitur reset password manual untuk user (Siswa/Guru).
- Manajemen Akademik: Membuat Master Kelas dan memplot Guru & Siswa.
- Report: Melihat keseluruhan riwayat absensi sekolah dan bisa melakukan export Excel.

4. Data Model Dasar (Entitas & Field):
- Siswa: Nama, Username, Password, Jenjang, Kelas, Email, No. WA, Tanggal Lahir.
- Guru: Nama, Username, Password, Mapel (Multiple), Jenjang (Multiple), Kelas Ajar (Multiple), Email, No. WA, Tanggal Lahir.

[BATASAN & KONDISI]
- Fitur Notifikasi: DITIADAKAN (Out of scope).
- Jangan berasumsi atau mengarang requirement yang tidak disebutkan. Jika ada logika bisnis yang ambigu atau bertabrakan, TANDAI sebagai "Open Question".
- Biarkan ada celah keamanan jika memang ada.

[TUGAS KAMU SEBELUM MENULIS PRD]
Sebelum menulis output PRD apa pun, ajukan MAKSIMAL 5 pertanyaan klarifikasi esensial terkait: target user, batas MVP vs v2, batasan teknis (tech stack), dan "Definition of Done". Tunggu jawaban saya sebelum kamu menulis PRD.

[TUGAS KAMU SETELAH SAYA MENJAWAB]
Buat PRD dengan struktur wajib berikut. Tulis dengan gaya bahasa lugas, spesifik, tanpa basa-basi:
1. Problem Statement (Siapa yang dirugikan dengan sistem lama dan kenapa)
2. Target User & 2 User Persona (Siswa & Guru)
3. Goals & Non-Goals
4. User Stories (Format: "Sebagai [Role], saya ingin [Fitur] supaya [Value]")
5. Feature Roadmap (MVP vs v2/Future)
6. Functional Requirements (Detail per fitur MVP, acceptance criteria jelas)
7. Data Model Sketch (Entitas + Primary/Foreign Key dasar)
8. Edge Cases & Failure States (Min. 5 skenario error dan mitigasinya)
9. Success Metrics (Cara mengukur keberhasilan produk)
10. Open Questions (Pertanyaan terkait requirement yang masih ambigu)

Taruh output ke /docs/prd.md
