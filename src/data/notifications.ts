export type AppNotification = {
  id: string;
  type: "order" | "review" | "system" | "creator";
  title: string;
  body: string;
  date: string;
  read: boolean;
};

export const notifications: AppNotification[] = [
  {
    id: "n1",
    type: "creator",
    title: "Pengajuan konsinyasi diterima!",
    body: "Karya 'Pin Enamel Apel Malang' sudah lolos kurasi dan tayang di katalog. Selamat!",
    date: "1 jam lalu",
    read: false,
  },
  {
    id: "n2",
    type: "review",
    title: "Produkmu mendapat review baru",
    body: "Kartika memberi bintang 5 untuk Postcard Jendela Kayutangan: 'Kertasnya tebal dan ilustrasinya cantik.'",
    date: "5 jam lalu",
    read: false,
  },
  {
    id: "n3",
    type: "order",
    title: "Reservasi pickup menunggu",
    body: "Pesanan #SDK-0241 menunggu konfirmasi pembayaran. Stok di-hold 30 menit.",
    date: "kemarin",
    read: true,
  },
  {
    id: "n4",
    type: "system",
    title: "Selamat datang, kreator!",
    body: "Akun kreator kamu sudah aktif. Yuk lengkapi profil dan tambahkan produk pertamamu.",
    date: "2 hari lalu",
    read: true,
  },
  {
    id: "n5",
    type: "order",
    title: "Pesananmu sudah diambil",
    body: "Pesanan #SDK-0238 sudah diambil di toko. Terima kasih sudah berbelanja lokal!",
    date: "3 hari lalu",
    read: true,
  },
];

export const unreadCount = notifications.filter((n) => !n.read).length;
