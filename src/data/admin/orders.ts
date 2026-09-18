export type OrderStatus =
  | "Menunggu Bayar"
  | "Lunas"
  | "Selesai"
  | "Dibatalkan";

export type Order = {
  id: string;
  orderNumber: string;
  buyerName: string;
  productId: string;
  productName: string;
  variantName: string;
  pickupDate: string; // ISO date
  pickupSlot: string;
  paymentMethod: "Midtrans" | "Cash/QRIS";
  status: OrderStatus;
  total: number;
  createdAt: string; // ISO
};

const today = new Date().toISOString().slice(0, 10);
const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
const dayAfter = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

export const orders: Order[] = [
  {
    id: "o1",
    orderNumber: "SDK-0241",
    buyerName: "Maya Anggraini",
    productId: "pin-enamel-apel-malang",
    productName: "Pin Enamel Apel Malang",
    variantName: "Terakota",
    pickupDate: today,
    pickupSlot: "15:00",
    paymentMethod: "Midtrans",
    status: "Lunas",
    total: 35000,
    createdAt: yesterday,
  },
  {
    id: "o2",
    orderNumber: "SDK-0242",
    buyerName: "Reza Pradana",
    productId: "postcard-jendela-kayutangan",
    productName: "Postcard Jendela Kayutangan",
    variantName: "Set 3 Motif",
    pickupDate: today,
    pickupSlot: "10:00",
    paymentMethod: "Cash/QRIS",
    status: "Menunggu Bayar",
    total: 36000,
    createdAt: yesterday,
  },
  {
    id: "o3",
    orderNumber: "SDK-0243",
    buyerName: "Sinta Lestari",
    productId: "tote-bag-kayutangan",
    productName: "Tote Bag Kayutangan Heritage",
    variantName: "Motif Ubin",
    pickupDate: today,
    pickupSlot: "17:00",
    paymentMethod: "Midtrans",
    status: "Lunas",
    total: 69000,
    createdAt: yesterday,
  },
  {
    id: "o4",
    orderNumber: "SDK-0244",
    buyerName: "Dimas Saputra",
    productId: "kaos-heritage-kayutangan",
    productName: "Kaos Heritage Kayutangan",
    variantName: "L",
    pickupDate: tomorrow,
    pickupSlot: "13:00",
    paymentMethod: "Midtrans",
    status: "Selesai",
    total: 89000,
    createdAt: yesterday,
  },
  {
    id: "o5",
    orderNumber: "SDK-0245",
    buyerName: "Kartika Dewi",
    productId: "zine-sudut-kota",
    productName: "Zine 'Sudut Kota'",
    variantName: "Cover Terakota",
    pickupDate: tomorrow,
    pickupSlot: "11:00",
    paymentMethod: "Cash/QRIS",
    status: "Lunas",
    total: 45000,
    createdAt: yesterday,
  },
  {
    id: "o6",
    orderNumber: "SDK-0246",
    buyerName: "Bimo Anugerah",
    productId: "mug-keramik-tangan",
    productName: "Mug Keramik Glazur Madu",
    variantName: "Madu",
    pickupDate: dayAfter,
    pickupSlot: "15:00",
    paymentMethod: "Midtrans",
    status: "Dibatalkan",
    total: 79000,
    createdAt: yesterday,
  },
  {
    id: "o7",
    orderNumber: "SDK-0247",
    buyerName: "Anisa Rahmawati",
    productId: "gantungan-kayu-daun",
    productName: "Gantungan Kunci Kayu Daun",
    variantName: "Daun Jati",
    pickupDate: dayAfter,
    pickupSlot: "10:00",
    paymentMethod: "Midtrans",
    status: "Lunas",
    total: 28000,
    createdAt: today,
  },
  {
    id: "o8",
    orderNumber: "SDK-0248",
    buyerName: "Yoga Mahendra",
    productId: "stiker-pack-ornamen",
    productName: "Stiker Pack Ornamen Malang",
    variantName: "Pack Ornamen",
    pickupDate: today,
    pickupSlot: "17:00",
    paymentMethod: "Cash/QRIS",
    status: "Menunggu Bayar",
    total: 25000,
    createdAt: today,
  },
];

export const orderMap: Record<string, Order> = Object.fromEntries(
  orders.map((o) => [o.id, o]),
);

export const orderStatuses: OrderStatus[] = [
  "Menunggu Bayar",
  "Lunas",
  "Selesai",
  "Dibatalkan",
];
