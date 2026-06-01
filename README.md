# Voicehub.id Wedding Audio Guestbook Website

Website statis responsif untuk bisnis **Wedding Audio Guestbook Rental**. Desain dibuat dengan nuansa wedding marketplace yang clean, editorial, dan conversion-focused, lalu dipadukan dengan visual Spring Bloom dari materi promo Voicehub.id.

## Isi Folder

```text
voicehub-website/
├── index.html          # Struktur halaman website
├── styles.css          # Semua styling/responsive design
├── script.js           # Interaksi: mobile menu, form WhatsApp, estimasi harga, lightbox
└── assets/             # Logo dan gambar dari materi promo
```

## Fitur

- Sticky navigation + mobile menu
- Hero section dengan CTA booking
- Quick availability form
- Section experience/benefit
- Booking process 8 langkah
- Paket Silver, Bronze, Gold
- Add-ons dan delivery fees
- Booking form yang otomatis membuka WhatsApp dengan format pesan lengkap
- Estimasi total otomatis berdasarkan paket, delivery fee, dan add-ons
- Gallery lightbox
- T&C accordion
- Copy nomor rekening
- Floating WhatsApp button
- Responsive untuk desktop, tablet, dan mobile

## Cara Menjalankan

1. Download dan unzip file `voicehub-website.zip`.
2. Buka `index.html` langsung di browser.
3. Untuk preview lokal yang lebih aman, jalankan:

```bash
cd voicehub-website
python -m http.server 8000
```

Lalu buka `http://localhost:8000`.

## Cara Edit Konten

### Mengubah Nomor WhatsApp

Buka `script.js`, ganti:

```js
const WHATSAPP_NUMBER = "6281918992022";
```

Di `index.html`, cari link `wa.me/6281918992022` lalu sesuaikan juga.

### Mengubah Harga Paket

Di `script.js`, ubah angka pada objek:

```js
const packages = {
  silver: { label: "Silver", price: 2_000_000, normal: 2_500_000 },
  bronze: { label: "Bronze", price: 2_500_000, normal: 3_000_000 },
  gold: { label: "Gold", price: 3_500_000, normal: 4_500_000 },
};
```

Lalu edit tampilan harga di `index.html` supaya konsisten.

### Mengganti Foto

Ganti file di folder `assets/` dengan nama file yang sama, atau edit path gambar di `index.html`:

- `assets/logo.png`
- `assets/silver-phone.jpg`
- `assets/bronze-setup.jpg`
- `assets/gold-booth.jpg`
- `assets/gallery-collage.jpg`
- `assets/couple-booth.jpg`

Pastikan Anda memiliki izin untuk memakai foto client sebelum website dipublikasikan.

### Mengubah Warna

Warna utama ada di bagian atas `styles.css`:

```css
:root {
  --hot-pink: #ff1493;
  --magenta: #b8006b;
  --purple: #642cc4;
  --teal: #079d99;
  --yellow: #ffe16a;
}
```

## Deploy Online

Website ini bisa langsung di-upload ke:

- Netlify
- Vercel
- GitHub Pages
- cPanel hosting biasa

Untuk hosting biasa, upload semua isi folder `voicehub-website` ke folder `public_html`.

## Catatan Publikasi

- Periksa kembali T&C dan payment account sebelum website dipublikasikan.
- Gambar demo diambil dari materi promo yang Anda unggah. Ganti dengan foto beresolusi tinggi bila diperlukan.
- Estimasi harga di form hanya kalkulasi awal, bukan invoice final.
