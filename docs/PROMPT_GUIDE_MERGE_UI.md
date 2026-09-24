# Prompt Guide — Merge UI (`PLAN_MERGE_UI.md`)

Dokumen ini berisi urutan prompt yang dapat diberikan kepada coding agent untuk mengeksekusi [PLAN_MERGE_UI.md](PLAN_MERGE_UI.md): memangkas `frontend_new/` menjadi prototype absen (golden master), menggabungkan style-nya ke `frontend/`, dan membuat `frontend/` tampil **sama persis** dengan golden master.

Bacaan wajib sebelum mulai dan selama proses: `docs/PLAN_MERGE_UI.md`, `docs/PROMPT_GUIDE.md`, `docs/DESIGN_BRIEF.md`, `docs/DECISIONS.md`, `docs/PRD.md`, `frontend/GUIDE.md`, dan `frontend_new/doc/Struktur_Folder.md`.

Strategi utama: **golden master dulu, produksi belakangan**. Semua keputusan visual dibuat dan disetujui di `frontend_new/` terlebih dahulu, lalu dirontokkan `frontend/`. `frontend/` tidak boleh mengubah layout visual sendirian.

## 1. Cara Menggunakan Panduan

1. Jalankan prompt secara berurutan (M0 → M5).
2. Setelah setiap fase, baca laporan agent dan jalankan checkpoint yang disebutkan.
3. Jangan lanjut ke fase berikutnya jika checkpoint gagal atau keputusan produk belum dikunci.
4. Berikan prompt lanjutan hanya setelah agent menyelesaikan scope fase saat ini.
5. Jika agent menemukan open question, minta agent menuliskannya sebagai keputusan eksplisit di `docs/DECISIONS.md` sebelum coding.
6. Jangan meminta perubahan visual golden master dan refactor `frontend/` bersamaan dalam satu fase.

Setiap prompt sebaiknya menghasilkan perubahan kecil yang dapat diuji. Minta agent untuk:

- membaca file terkait sebelum mengedit (termasuk golden master yang menjadi acuan);
- menyebutkan hipotesis dan file yang akan disentuh;
- memakai pola yang sudah ditetapkan dalam `PLAN_MERGE_UI.md` dan guide;
- tidak mengubah file di luar scope tanpa alasan;
- memperbarui atau menambahkan test untuk behavior/markup yang berubah;
- menjalankan validasi dari folder (workdir) yang benar (`frontend_new/` atau `frontend/`) — tidak ada root package.json;
- melaporkan file yang berubah, command yang dijalankan, hasil test/lint/build, risiko, dan pekerjaan tersisa.

## 2. Prompt Pembuka untuk Semua Fase

Gunakan pembuka ini sebelum prompt fase mana pun:

```text
Kamu bekerja di repository project-sintas. Baca terlebih dahulu docs/PLAN_MERGE_UI.md,
docs/DECISIONS.md, docs/DESIGN_BRIEF.md, frontend/GUIDE.md, dan bagian terkait dari
frontend_new/doc/Struktur_Folder.md sesuai scope fase ini.

Ikuti aturan berikut:
- Peran dua frontend: frontend_new/ adalah golden master (prototype absen, mock data,
	sumber keputusan visual); frontend/ adalah aplikasi produksi yang MENIRU visualnya secara
	persis. Perubahan visual dimulai dari frontend_new/ dulu, baru dirontokkan ke frontend/.
- Jangan mengubah logika bisnis di frontend/ (role guard, auth, status absen, timezone,
	scan idempotency, invalidate query, export) — yang boleh berubah hanya lapisan presentasi,
	kecuali diizinkan eksplisit oleh fase.
- Jangan mengarang requirement di luar PRD. Jika ada benturan atribut visual (bell, search,
	all-caps, carousel, ikon, font), tanyakan/laporkan sebelum memilih; jangan menebak diam-diam.
- Setiap keputusan baru harus dicatat di docs/DECISIONS.md sebelum implementasi.
- Kerjakan command dari folder yang benar (workdir): npm run lint / npm run build / npm test
	dijalankan di dalam frontend_new/ atau frontend/, bukan dari root repo.
- Setelah mengedit, jalankan lint/build/test yang paling sempit dan relevan sebelum pekerjaan lain.

Jangan lanjut ke scope fase berikutnya. Di akhir, laporkan perubahan, validasi, keputusan yang
dikunci, risiko, dan pertanyaan yang masih terbuka.
```

## 3. Fase M0 — Kunci Keputusan dan Sinkronisasi Dokumentasi

```text
	Kunci keputusan UI merger sesuai bagian 11 PLAN_MERGE_UI.md SEBELUM coding. Ini fase dokumentasi,
	tanpa mengubah implementasi.

	Buat entri keputusan di docs/DECISIONS.md (format: pilihan final, alasan, dampak database/API/UI,
	asumsi) untuk minimal:
	1. Ikon: apakah frontend/ memakai MUI Material icons (parity penuh) atau tetap lucide-react.
	2. Bell notification di header beranda — PRD meniadakan notifikasi; pilih hapus dari golden master
		atau biarkan sebagai elemen visual murni.
	3. Search bar di beranda — biarkan sebagai filter fungsional atau hapus.
	4. Font — Plus Jakarta Sans diterapkan di KEDUA proyek (tambah ke frontend_new/) atau font default.
	5. Banner carousel golden master vs "satu banner + indikator" pada DESIGN_BRIEF.
	6. All-caps tombol ("MASUK") vs sentence case.
	7. App shell desktop Guru/Admin: sidebar tetap dengan token golden master, atau buat referensi
		sidebar baru di golden master terlebih dahulu.
	8. Branding/nama app: ganti "LIMAN" menjadi "SINTAS".

	Setelah keputusan terkunci, sinkronkan docs/DESIGN_BRIEF.md (bagian Visual Direction dan
	Design Tokens) agar TIDAK bertentangan dengan kontrak visual PLAN_MERGE_UI bagian 3. Tandai
	bagian yang sengaja di-override oleh golden master. Jangan menyentuh kode aplikasi pada fase ini.
```

**Checkpoint:** `docs/DECISIONS.md` memuat D1–D8 dengan status/jawaban jelas; `DESIGN_BRIEF.md` konsisten dengan kontrak visual; tidak ada keputusan penting yang diam-diam dipilih di lain tempat.

## 4. Fase M1 — Pangkas `frontend_new/` Menjadi Fokus Absen (Golden Master)

```text
Eksekusi bagian 5 PLAN_MERGE_UI.md di dalam frontend_new/ (workdir = frontend_new): jadikan
prototype hanya fokus absen.

Scope:
- Hapus fitur non-absen: features/quiz/*, features/latihan-soal/*, components/QuizItemCard.tsx,
	dan route-nya di src/App.tsx; pada features/jadwal/* hapus section Ujian/Tryout, sisakan
	jadwal pelajaran sebagai konteks absen.
- Ubah identitas: nama aplikasi "LIMAN" menjadi "SINTAS", <html lang="id">, judul halaman, dan
	label UI memakai istilah PRD (Hadir, Terlambat, Tidak Hadir, Bisa absen, Belum dibuka, Selesai).
- Isi ulang FeatureGrid (data.ts) dengan item absensi saja; aktifkan kembali BottomNav dengan
	menu absensi (Beranda, Absen, Riwayat, Profil); perbarui switcher per role.
- Tambahkan layar referensi absen sesuai sub-bab 5.3: Scanner (/scan), Hasil Scan (/scan/result),
	Riwayat (/riwayat), Profil (/profil), dan (minimal) halaman referensi guru: Buat Absen,
	QR sesi, Rekap kelas. Semua memakai mock data dan mengikuti pola XPadding + sheet putih
	rounded-t-[60px] yang sudah dipakai Dashboard.
- Pertahankan seluruh elemen kontrak visual (bagian 3) dan jangan menambah fitur di luar absen.

Validasi: npm run lint dan npm run build di frontend_new/ lulus; tidak ada route mati; dashboard
siswa hanya menampilkan menu dan status absen.
```

**Checkpoint:** build/lint hijau; tidak ada sisa referensi quiz/latihan-soal/ujian di route, import, maupun navigasi; setiap layar referensi baru tampil konsisten (mobile-first, `bg-blue-500` + sheet putih).

## 5. Fase M2 — Token dan Primitif di `frontend/`

```text
Bawa style golden master ke frontend/ (workdir = frontend) sesuai bagian 6, 7, dan 8
PLAN_MERGE_UI.md, TANPA mengubah arsitektur produksi (feature folder, services, schemas, route
guard, React Query tetap).

Scope:
- Perbarui src/index.css: petakan token lama (school-blue-*, ink-*, dll.) menjadi nilai palet
	golden master (blue-500 #3B82F6, blue-100, orange-400, slate-700, green/red status, black/10
	border) memakai alias semantic sesuai bagian 7.
- Buat primitif baru di components/: ContentShell (setara XPadding), BlueHeader (header biru +
	back + title), PrimaryButton, StatusDot, FeatureGrid, BottomNav (mobile), dan BannerCarousel
	setara AdSlider; PillSearch hanya jika keputusan M0 menyetujuinya.
- Ubah AppShell: pada mobile pakai pola header biru + sheet putih + bottom nav; pada desktop
	pertahankan sidebar sesuai keputusan M0 (D7) tetapi pakai token baru.
- Jangan mengubah route, hook, service, store, skema, atau behavior; hanya markup/class/token.

Validasi: npm run lint, npm run build, dan npm test di frontend/ lulus; test yang menyentuh
markup shell/router diperbarui bila perlu.
```

**Checkpoint:** seluruh test hijau (termasuk `router.test.jsx`, `AppShell.test.jsx`, access tes per role); primitif dipakai minimal oleh AppShell sehingga perubahan benar-benar terlihat.

## 6. Fase M3 — Repaint Halaman Auth dan Siswa

```text
Repaint halaman auth dan siswa di frontend/ (workdir = frontend) sehingga sama persis dengan
golden master (bagian 5 dan 10 PLAN_MERGE_UI.md).

Scope:
- Auth: LoginPage, ForgotPasswordPage, NotFoundPage → layout = golden master (/login, /404).
- Siswa: StudentDashboardPage (beranda), StudentSchedulePage (jadwal + aksi "Absen sekarang"),
	StudentScanPage beserta QrScannerFrame/ScanResultPanel/ManualScanForm/ScanPrecheck,
	StudentHistoryPage beserta HistoryViews, dan ProfilePage.
- Semua data tetap dari React Query/service; semua state (loading, empty, error, offline,
	duplicate, expired session) tetap berjalan — hanya lapisan presentasi yang disesuaikan.
- Gunakan label PRD yang sama (Hadir/Terlambat/Tidak Hadir/Bisa absen/Belum dibuka/Selesai).
- Ikon mengikuti keputusan M0 (D1).

Validasi: lint/build/test hijau; bandingkan screenshot dengan golden master (lihat bagian 10
PLAN_MERGE_UI.md) untuk login, beranda, jadwal, scan, hasil, riwayat, dan 404 di viewport
320/390/768/1440.
```

**Checkpoint:** setiap layar di atas tidak memiliki perbedaan visual bermakna terhadap golden master; test scan/duplicate/permission dan role access tetap hijau.

## 7. Fase M4 — Repaint Workspace Guru dan Admin

```text
Repaint workspace guru dan admin di frontend/ (workdir = frontend) berdasarkan referensi yang
sudah ada di golden master (Fase M1) dan keputusan desktop M0 (D7).

Scope:
- Guru: TeacherDashboardPage, AssignmentsPage, CreateSessionPage (form buat sesi), SessionsPage,
	SessionQrPage (QR display + window waktu), ClassAttendancePage (rekap + export).
- Admin: AdminDashboardPage, BannersPage, UsersPage, AcademicPage, PlottingPage, ReportsPage.
- Tabel tetap tabel (aksesibel, caption, pagination) tetapi restyle memakai token golden master;
	form, tombol, header, dan empty/error/loading state mengikuti primitif baru.
- Export XLSX tidak berubah: binary response + nama dari Content-Disposition; UI menampilkan
	loading/error/empty.

Validasi: lint/build/test hijau; role access test dan export test tetap hijau.
```

**Checkpoint:** tidak ada halaman produksi yang tersisa memakai token lama secara visual mencolok; semua aksi guru/admin berfungsi sama seperti sebelum repaint.

## 8. Fase M5 — Visual Regression dan Release Readiness

```text
Audit parity penuh antara frontend/ dan golden master sesuai bagian 10 PLAN_MERGE_UI.md.

Scope:
- Jalankan kedua dev server (frontend_new/ dan frontend/) dan ambil screenshot layar yang sama
	di viewport 320/390/768/1440: login, beranda, jadwal, scan, hasil, riwayat, 404, dan layar
	guru/admin yang tersedia.
- Bandingkan kontrak visual bagian 3: warna, radius, spacing, typography, bentuk ikon, dan
	posisi tiap blok. Gunakan diff gambar bila memungkinkan; selisih default 0 untuk layar yang
	existedan tidak punya konten dinamis.
- Perbaiki temuan dengan aturan: keputusan visual diperbaiki di golden master dahulu, lalu
	dirontokkan; bug/behavior diperbaiki langsung di frontend/.
- Perbarui frontend/GUIDE.md: daftar primitif baru, kebijakan ikon, dan aturan "perubahan
	visual wajib melewati golden master".
- Audit aksesibilitas & states: focus-visible, label, kontras, reduced motion, dan tidak ada
	token/PII di DOM/console. Uji keyboard flow dan viewport 320px tidak terpotong.

Validasi: lint/build/test hijau di frontend_new/ dan frontend/; laporan parity per layar
terdokumentasi bersama residual risk.
```

**Checkpoint:** semua layar golden master terwakili di `frontend/` tanpa beda bermakna (mobile); desktop beda hanya pada hal yang D7 tetapkan; tidak ada state loading/empty/error/offline yang hilang.

## 9. Prompt Review Akhir

```text
Lakukan final review sebagai reviewer teknis untuk MERGE UI. Prioritaskan:
1. Parity visual dengan golden master (docs/PLAN_MERGE_UI.md bagian 3 dan 10) — temuan utara
2. Regresi behavior: role guard, 401/403, scan idempotency, invalidate query, export file.
3. Aksesibilitas: focus-visible, label, kontras, reduced motion, keyboard flow.
4. Konsistensi token: tidak ada hex acak di luar token/index.css.
5. Dokumentasi: DESIGN_BRIEF, DECISIONS, GUIDE sinkron.

Periksa terhadap PRD, DESIGN_BRIEF, frontend/GUIDE.md, docs/DECISIONS.md, dan PLAN_MERGE_UI.md.
Tampilkan temuan berdasarkan severity dengan file yang terdampak, bukti, dampak, dan perbaikan
minimal. Setelah itu tampilkan test/lint/build yang sudah lulus dan residual risk.
Jangan melakukan refactor atau edit sebelum daftar temuan disetujui.
```

## 10. Pola Prompt Perbaikan Ketika Parity atau Test Gagal

```text
Berikut gagal: [command/cek parity dan output ringkas].

Kerjakan diagnosis pada slice yang sama. Hipotesis mana yang bisa menjelaskan perbedaan visual
atau test yang gagal? Untuk perbedaan visual, tentukan dulu apakah akar masalahnya keputusan
visual (perbaiki di frontend_new/ dulu lalu rontokkan) atau bug presentasi frontend/ (perbaiki
langsung). Untuk test, baca implementasi dan test yang gagal, lalu lakukan perubahan terkecil
yang membedakan hipotesis.

Jangan memperluas scope atau mengubah kontrak API tanpa bukti. Jalankan ulang cek yang sama
sebelum cek lain. Laporkan root cause, file yang berubah, hasil rerun, dan apakah perlu update
dokumentasi/contract.
```

## 11. Checklist Handoff Antar Fase

### Golden master (`frontend_new/`) ke produksi (`frontend/`)

- [ ] `docs/PLAN_MERGE_UI.md` dan keputusan M0 (D1–D8) tersedia dan disetujui.
- [ ] `frontend_new/` hanya berisi fitur absen; lint + build hijau.
- [ ] Layar referensi absen (login, beranda, jadwal, scan, hasil, riwayat, 404, guru) lengkap dengan mock data.
- [ ] Kontrak visual bagian 3 didokumentasikan dan tidak kontradiktif dengan `DESIGN_BRIEF.md`.

### Produksi (`frontend/`) ke release

- [ ] Token & primitif golden master terpasang dan dipakai di seluruh halaman.
- [ ] Auth, siswa, guru, admin tampil sama persis sesuai matriks parity (M5).
- [ ] Semua behavior produksi (role guard, scan idempotency, invalidate, export) tetap hijau.
- [ ] Lint, build, dan test hijau di `frontend/` dan `frontend_new/`.
- [ ] UI diuji pada 320, 390, 768, dan 1440 px; keyboard, focus, label, kontras OK.
- [ ] `frontend/GUIDE.md` diperbarui (primitif, ikon, aturan visual golden master).

## 12. Prinsip Penting

- Satu fase = satu scope yang dapat diuji.
- Golden master diputuskan lebih dulu; `frontend/` meniru, bukan berinovasi visual.
- Perubahan visual yang perlu produk → catat ke `DECISIONS.md` sebelum diputuskan agent.
- Jangan merusak behavior produksi saat repaint; token & primitif menjadi satu-satunya jalan styling.
- Parity diukur dengan screenshot per viewport, bukan hanya "secara konseptual sama".
- Test boundary/regresi lebih penting daripada demo happy path.
- Agent berhenti pada blocker nyata dan minta keputusan, bukan menebak requirement.