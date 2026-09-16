siswa
- login: siswa buat sendiri (pake usn & pw), berhasil = redirect ke beranda, salah = tampilin error, lupa pw = input email & tanggal lahir + pw baru & konfir pw
- absen: scan barcode -> tampilan berhasil/terima kasih -> lihat riwayat. absen dibuka 15 sebelum pembelajaran dimulai + selama jam pembelajaran. ada status: hadir, terlambat, tidak hadir. kasi info waktu terlambat berapa menit (hitung selisih jam waktu absen dengan jam masuk). 15 menit setelah masuk tidak dihitung absen terlambat.

guru
- login: sama kaya siswa alurnya
- tampilan dashboard mirip siswa tapi itu "buat absen". cek figma kak lia
- ada tanda qr code di list mapel guru buat munculin qr code. 
- ada tanda mata untuk lihat riawayat
- tiap pertemuan bikin absen baru
- di riwayat absen ada tombol rekap: bentuk excel

SISTEM:
- BANNER EVENT SEKOLAH (ADMIN YANG NGATUR)
- NOTIF GAUSA 
- PROFIL USER BISA DIUBAH SAMA MEREKA

admin
- reset pw user
- lihat keseluruhan riwayat absen (bisa expor rekap juga kaya guru)
- bikin kelas

siswa:
- nama 
- username
- password
- asal sekolah
- jenjang
- kelas
- email
- no wa
- tgl lahir

guru:
- nama
- mapel (bisa lebih dari 1)
- jenjang (bisa lebih dari 1)
- kelas (kelas yang dia ajar)
- sisanya kurleb kaya siswa