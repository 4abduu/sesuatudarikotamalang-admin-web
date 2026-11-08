/**
 * Tipe data fitur operasional: libur pickup, persetujuan produk, produk lambat laku,
 * riwayat stok, pengaturan baru, dan laporan bulanan.
 * Bentuk datanya mengikuti API_CONTRACT (bagian "Operasional toko").
 */

/* ---------------------------- Libur pickup ---------------------------- */

/** Hari mengikuti ISO: 1 = Senin ... 7 = Minggu. */
export type WeeklyOff = { enabled: boolean; days: number[] };

export type HolidaySchedule = {
  id: string;
  /** YYYY-MM-DD (tanggal kalender WIB). */
  startDate: string;
  /** YYYY-MM-DD, sama dengan startDate untuk libur satu hari. */
  endDate: string;
  reason: string;
  /** Jumlah pesanan aktif yang jadwal pickup-nya jatuh di rentang ini. */
  affectedOrders?: number;
  createdAt?: string;
};

export type PickupHolidaysResponse = {
  weeklyOff: WeeklyOff;
  holidays: HolidaySchedule[];
};

/** Isi `impact` pada respons 409 CONFIRMATION_REQUIRED untuk libur. */
export type HolidayImpact = {
  affectedOrders: number;
  dates: { date: string; count: number }[];
};

/* ------------------------ Status & persetujuan produk ------------------------ */

export type ProductDisplayStatus =
  | "menunggu"
  | "aktif"
  | "ditolak"
  | "ditarik"
  | "disembunyikan";

export type WithdrawnItem = { id: string; name: string; withdrawnAt: string };

export type ApprovalProduct = {
  id: string;
  name: string;
  price: number;
  images: string[];
  shortDescription?: string | null;
  createdAt: string;
  displayStatus: ProductDisplayStatus;
  statusNote?: string | null;
  artisan: { id: string; brandName: string };
  category?: { id: string; name: string } | null;
  /** Diisi bila produk ini diajukan sebagai pengganti produk yang ditarik. */
  replacesProduct?: { id: string; name: string } | null;
  /** Riwayat produk milik kreator yang sama yang pernah ditarik (maksimal 5 terbaru). */
  artisanWithdrawn: WithdrawnItem[];
};

export type SlowMoverProduct = {
  id: string;
  name: string;
  price: number;
  totalStock: number;
  artisan: { id: string; brandName: string };
  /** Tanggal acuan hitungan: ditambahkan, atau penjualan terakhir bila pernah terjual. */
  referenceDate: string;
  referenceType: "ditambahkan" | "terjual_terakhir";
  monthsIdle: number;
  daysIdle: number;
  /** peringatan = sudah masuk bulan ke-5; tarik = sudah 6 bulan atau lebih. */
  level: "peringatan" | "tarik";
};

export type SlowMoversResponse = {
  warnMonths: number;
  withdrawMonths: number;
  salesSource: "aplikasi";
  products: SlowMoverProduct[];
};

/* ------------------------------- Stok ------------------------------- */

export type StockReason =
  | "barang_masuk"
  | "opname"
  | "terjual_kasir"
  | "rusak_hilang"
  | "koreksi"
  | "pesanan";

export const STOCK_REASON_LABEL: Record<StockReason, string> = {
  barang_masuk: "Barang masuk",
  opname: "Hasil opname",
  terjual_kasir: "Terjual di kasir",
  rusak_hilang: "Rusak atau hilang",
  koreksi: "Koreksi",
  pesanan: "Pesanan aplikasi",
};

/** Alasan yang boleh dipilih admin saat menyesuaikan stok (tanpa "pesanan", itu otomatis). */
export const ADJUST_REASONS: StockReason[] = [
  "barang_masuk",
  "opname",
  "terjual_kasir",
  "rusak_hilang",
  "koreksi",
];

export type StockMovement = {
  id: string;
  productId: string;
  productName: string;
  variantId: string | null;
  variantLabel: string | null;
  delta: number;
  stockAfter: number;
  reason: StockReason;
  note: string | null;
  actorName: string | null;
  orderNumber: string | null;
  createdAt: string;
};

export type StockMovementsResponse = {
  movements: StockMovement[];
  page: number;
  limit: number;
  total: number;
};

/* --------------------------- Pengaturan baru --------------------------- */

export type OperationalSettings = {
  /** Stok di bawah atau sama dengan angka ini dianggap menipis. */
  lowStockThreshold: number;
  /** Persentase bagian kreator (default), 0 sampai 100. */
  defaultCreatorSharePercent: number;
};

export type CreatorShareInfo = {
  id: string | number;
  brandName: string;
  /** null = ikut persentase utama. */
  creatorSharePercent: number | null;
  effectiveCreatorSharePercent: number;
};

/* ------------------------------ Laporan ------------------------------ */

export type ReportSaleLine = {
  productId: string;
  productName: string;
  variantLabel: string | null;
  quantity: number;
  price: number;
  revenue: number;
};

export type ReportStockLine = {
  productId: string;
  productName: string;
  variantLabel: string | null;
  stock: number;
};

export type CreatorMonthlyReport = {
  artisanId: string;
  brandName: string;
  itemsSold: number;
  revenue: number;
  sharePercent: number;
  creatorShare: number;
  storeShare: number;
  sales: ReportSaleLine[];
  stock: ReportStockLine[];
};

export type MonthlyReport = {
  /** YYYY-MM */
  month: string;
  status: "draf" | "final";
  finalizedAt: string | null;
  salesSource: "aplikasi";
  totals: {
    itemsSold: number;
    revenue: number;
    creatorShare: number;
    storeShare: number;
  };
  creators: CreatorMonthlyReport[];
};

