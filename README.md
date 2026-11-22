# Sesuatu DariKota Malang — Admin Web

> **Release v1.0.0** · Next.js · TypeScript · Tailwind CSS

Dashboard internal untuk mengelola katalog, kreator, produk, stok, pesanan,
ulasan, jadwal pickup, pengajuan konsinyasi, dan pengaturan aplikasi.

> Aplikasi ini bukan storefront publik. Pengguna biasa dan kreator memakai
> aplikasi Flutter; admin memakai dashboard web ini.

## Daftar isi

- [Fitur](#fitur)
- [Menjalankan lokal](#menjalankan-lokal)
- [Konfigurasi](#konfigurasi)
- [Build dan deployment](#build-dan-deployment)
- [Quality checks](#quality-checks)
- [Struktur folder](#struktur-folder)
- [Catatan rilis](#catatan-rilis)

## Fitur

- Dashboard ringkasan operasional.
- CRUD produk, kategori, varian, foto, cerita, dan link marketplace.
- Moderasi/persetujuan produk dan pengajuan kreator.
- Pengelolaan stok dan riwayat pergerakan stok.
- Pengelolaan order, status pickup, refund, dan scan QR.
- Pengelolaan kreator, persentase bagi hasil, status aktif, serta foto profil/toko.
- Pengelolaan ulasan, jadwal pickup, hari libur, dan pengaturan publik.
- Upload foto dengan penanda visual saat file ditolak.
- Layout responsif untuk desktop dan layar lebih kecil.

Backend tetap menjadi sumber kebenaran untuk aturan bisnis, harga, stok, status
order, pembayaran, dan otorisasi.

## Menjalankan lokal

### Prasyarat

- Node.js LTS dan npm.
- Backend API berjalan di lokal atau URL deployment.
- Akses admin yang valid pada backend.

### Instalasi

\`\`\`bash
npm install
\`\`\`

Buat \`.env.local\`:

\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:4000
\`\`\`

Jalankan:

\`\`\`bash
npm run dev
\`\`\`

Buka [http://localhost:3000](http://localhost:3000).

## Konfigurasi

| Variable | Contoh | Keterangan |
|---|---|---|
| \`NEXT_PUBLIC_API_URL\` | \`https://api.sesuatudarikotamalang.my.id\` | Base URL backend tanpa slash terakhir |

Jangan menaruh API key backend, password database, JWT secret, atau kredensial
Midtrans di repo admin-web. Nilai frontend yang diawali \`NEXT_PUBLIC_\` dapat
terlihat di browser dan hanya boleh berisi URL publik/non-secret.

## Alur penggunaan admin

1. Login melalui halaman admin.
2. Verifikasi dashboard dan status koneksi API.
3. Kelola kategori sebelum membuat produk.
4. Buat produk, susun opsi varian, tautkan foto ke kombinasi varian, lalu atur
   stok melalui angka stok pada kartu kombinasi.
5. Tinjau pengajuan kreator dan produk yang menunggu moderasi.
6. Kelola order, pembayaran, pickup, dan status penyelesaian.
7. Cek pengaturan jadwal, batas pickup, refund, dan notifikasi.

Jika upload ditolak backend, foto terkait harus tetap terlihat dengan border merah
dan pesan error spesifik. Jangan menghapus error tersebut dengan fallback
generik karena frontend perlu menunjukkan file mana yang perlu diganti.

## Build dan deployment

Build production:

\`\`\`bash
npm run build
npm run start
\`\`\`

Deployment production memakai Vercel:

1. Import repository admin-web.
2. Set Root Directory ke folder project admin-web.
3. Set Framework Preset ke Next.js.
4. Tambahkan \`NEXT_PUBLIC_API_URL\` pada Environment Variables Production.
5. Deploy branch production.
6. Tambahkan custom domain, misalnya \`admin.sesuatudarikotamalang.my.id\`.
7. Pastikan domain admin ditambahkan ke \`CORS_ALLOWED_ORIGINS\` backend.

Jangan memasukkan secret backend ke Environment Variables Vercel.

## Quality checks

\`\`\`bash
npm run lint
npm run build
\`\`\`

Lint dapat menampilkan warning unused import atau React hook dependency. Warning
tidak menggagalkan build, tetapi sebaiknya dibereskan bertahap.

## Struktur folder

\`\`\`text
src/
├── app/           # route dan halaman Next.js
├── components/    # komponen UI bersama
├── data/          # data demo/statik yang masih dipakai UI tertentu
├── hooks/         # custom React hooks
├── lib/           # API client, tipe, format, dan helper
├── styles/        # stylesheet tambahan
└── fonts/         # font lokal aplikasi
public/
└── brand/         # logo dan aset branding
\`\`\`

## Release v1.0.0

Rilis pertama dashboard internal untuk demo akademik dan operasi dasar toko.
Sebelum penggunaan publik, pastikan auth backend sudah aktif, API URL production
benar, CORS sudah memuat domain admin, dan tidak ada token rahasia di bundle.
