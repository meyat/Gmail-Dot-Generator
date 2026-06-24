# ✦ DotMail Generator

> Generate semua variasi titik (dot) dari satu alamat email — murni HTML, CSS & JavaScript tanpa framework.

![Preview](https://img.shields.io/badge/Status-Ready-6366f1?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)
![Vanilla JS](https://img.shields.io/badge/Vanilla-JS-f59e0b?style=for-the-badge)

---

## 🧠 Cara Kerja

Gmail (dan beberapa layanan email lain) **mengabaikan titik** dalam username. Artinya:

```
johndoe@gmail.com  ==  j.ohndoe@gmail.com  ==  jo.hn.doe@gmail.com
```

Semuanya masuk ke **inbox yang sama**. DotMail Generator menghasilkan **semua 2ⁿ⁻¹ kemungkinan** posisi titik dari sebuah username secara otomatis.

Untuk username dengan **6 karakter** → **32 variasi** email.

---

## ✨ Fitur

| Fitur | Keterangan |
|---|---|
| ⚡ Generate Cepat | Algoritma bitmasking, ribuan email dalam milidetik |
| 📋 Daftar Email | Tampilan daftar lengkap dengan highlight titik berwarna |
| 🔍 Filter Real-time | Cari variasi tertentu langsung dari daftar |
| 📊 Statistik | Tampilkan total, unik, dan jumlah posisi titik |
| 📄 Export CSV | Unduh daftar email dalam format `.csv` |
| 📊 Export Excel | Unduh dalam format `.xlsx` dengan styling header |
| 📋 Export PDF | Unduh PDF multi-halaman siap cetak |
| ⎘ Salin Semua | Salin semua email ke clipboard sekaligus |
| ✉ mailto: | Buka klien email dengan semua variasi sebagai BCC |
| 💬 Share ke WA | Kirim daftar email ke nomor WhatsApp manapun |
| 🕒 Riwayat | Simpan & reload riwayat generate (localStorage) |
| 🌐 Custom Domain | Pilih domain populer atau tambahkan domain sendiri |
| 📱 Responsif | Tampilan optimal di desktop & mobile |

---

## 🚀 Cara Pakai

### Lokal (tanpa server)
```bash
# Clone repo
git clone https://github.com/username/dotmail-generator.git

# Buka langsung di browser
open index.html
# atau klik dua kali file index.html
```

## 🔧 Kustomisasi

### Tambah Domain Baru
Edit bagian `<select id="domainSelect">` di `index.html`:
```html
<option value="@perusahaan.com">@perusahaan.com</option>
```

---

## 📜 Lisensi

MIT License — bebas digunakan, dimodifikasi, dan didistribusikan.

---

<p align="center">Dibuat dengan ♥ menggunakan HTML, CSS & JavaScript murni</p>
