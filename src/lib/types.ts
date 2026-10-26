export type Role = "buyer" | "creator" | "admin";
export type PaymentMethod = "midtrans" | "cod";
export type OrderStatus =
  | "menunggu_bayar"
  | "lunas"
  | "selesai"
  | "dibatalkan"
  | "kedaluwarsa"
  | "lewat_batas_pengambilan";
export type ApplicationStatus = "pending" | "diterima" | "ditolak";
export type ArtisanStatus = "aktif" | "nonaktif";
export type ReviewStatus = "tampil" | "disembunyikan";
export type NotificationType =
  | "pengajuan_diterima"
  | "pengajuan_ditolak"
  | "ulasan_baru"
  | "pesanan_update"
  | "umum";

export interface User {
  id: number | string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string | null;
}

export interface Category {
  id: number | string;
  name: string;
  slug: string;
  iconName?: string | null;
  blurb?: string | null;
}

export type RefundStatus = "tidak_ada" | "menunggu" | "selesai";
export type CancelReason = "permintaan_pembeli" | "kesalahan_toko";
export type RefundState =
  | "tidak_berlaku"
  | "dalam_batas_waktu"
  | "lewat_batas_waktu"
  | "lewat_batas_pengambilan"
  | "sudah_diambil"
  | "menunggu_refund"
  | "sudah_direfund";

export interface OrderRefundInfo {
  state: RefundState;
  paid: boolean;
  paidAt?: string | null;
  eligibleUntil?: string | null;
  refundWindowDays?: number;
  refundStatus: RefundStatus;
  refundedAt?: string | null;
  canCancelByBuyerRequest: boolean;
  canCancelByStoreFault: boolean;
  canMarkRefunded: boolean;
  disabledReason?: string | null;
}

export interface Artisan {
  id: number | string;
  userId?: number | string | null;
  brandName: string;
  bio?: string | null;
  avatarUrl?: string | null;
  status: ArtisanStatus;
  isOfficial?: boolean;
  createdAt: string;
  updatedAt: string;
  products?: Product[];
  productCount?: number;
  avgRating?: number;
  user?: User;
}

export interface VariantOption {
  id: number | string;
  productId: number | string;
  name: string;
  values: string[];
  sortOrder?: number;
}

export interface Variant {
  id: number | string;
  productId: number | string;
  combination: string[];
  stock: number;
  effectiveStock: number;
}

export interface ProductStory {
  id: number | string;
  productId: number | string;
  title: string;
  content: string;
  coverImageUrl?: string | null;
  processImages?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number | string;
  artisanId: number | string;
  categoryId: number | string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  price: number;
  images: string[];
  isLimited: boolean;
  isActive: boolean;
  soldCount?: number;
  viewCount?: number;
  shopeeUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  artisan?: Artisan;
  variantOptions?: VariantOption[];
  variants?: Variant[];
  story?: ProductStory | null;
}

export interface OrderItem {
  id: number | string;
  orderId: number | string;
  productId: number | string;
  variantId?: number | string | null;
  quantity: number;
  priceSnapshot: number;
  product?: Product;
  variant?: Variant;
}

export interface Payment {
  id: number | string;
  orderId: number | string;
  midtransTransactionId?: string | null;
  status: string;
  paidAt?: string | null;
  createdAt: string;
}

export interface Order {
  id: number | string;
  orderNumber: string;
  userId: number | string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  totalAmount: number;
  pickupDate: string;
  pickupSlot: string;
  holdExpiresAt?: string | null;
  holdExtendedMinutes?: number;
  pickupDeadline?: string | null;
  refundStatus?: RefundStatus;
  refundedAt?: string | null;
  cancelReason?: CancelReason | null;
  refund?: OrderRefundInfo | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  payment?: Payment | null;
  user?: User;
}

export interface Notification {
  id: number | string;
  userId: number | string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface Review {
  id: number | string;
  userId: number | string;
  productId: number | string;
  orderItemId?: number | string | null;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
  user?: {
    id: number | string;
    name: string;
    email?: string;
    avatarUrl?: string | null;
  };
  product?: {
    id: number | string;
    name: string;
  };
}

export interface ArtisanApplication {
  id: number | string;
  userId: number | string;
  applicantName: string;
  contact: string;
  brandName: string;
  categoryId?: number | string | null;
  description: string;
  sampleFileUrl?: string | null;
  status: ApplicationStatus;
  rejectReason?: string | null;
  submittedAt: string;
  decidedAt?: string | null;
  user?: User;
  category?: Category;
}

export interface AppSettings {
  id: number;
  holdDurationMinutes: number;
  autoCancelEnabled: boolean;
  pickupDeadlineDays: number;
  refundWindowDays?: number;
  whatsappAdminNumber: string;
  notificationEmail: string;
  updatedAt: string;
}

export interface PendingRefundItem {
  id: number | string;
  orderNumber: string;
  totalAmount: number;
  buyerName: string;
  paidAt?: string | null;
  cancelReason?: string | null;
  updatedAt: string;
}

export interface DashboardData {
  ordersToday: number;
  readyForPickup: number;
  pendingApplications: number;
  lowStockCount: number;
  revenue7Days: number;
  revenueByDay?: {
    date: string;
    revenue: number;
  }[];
  statusDistribution: {
    status: OrderStatus;
    count: number;
  }[];
  topSellingProducts: {
    id: number | string;
    name: string;
    soldCount?: number;
    totalSold?: number;
    totalRevenue: number;
  }[];
  slotDistribution?: {
    time: string;
    capacity: number;
    booked: number;
  }[];
  upcomingPickups?: {
    id: number | string;
    orderNumber: string;
    pickupDate: string;
    pickupSlot: string;
    user?: { id: number | string; name: string };
    items?: { product?: { id: number | string; name: string } }[];
  }[];
  pendingRefundCount?: number;
  pendingRefunds?: PendingRefundItem[];
}

export type SlotUsage = {
  /** Jumlah pesanan (status apa pun) yang pernah memakai jam ini. > 0 berarti jam terkunci dan tidak bisa dihapus. */
  totalOrders: number;
  /** Pesanan aktif (menunggu_bayar atau lunas) dengan tanggal pickup hari ini atau ke depan. */
  upcomingActiveOrders: number;
};

export type PickupSlot = {
  /** null bila nilai berasal dari cadangan (tabel slot di database masih kosong). */
  id: string | null;
  time: string; // "HH:MM"
  capacity: number;
  isActive: boolean;
  usage: SlotUsage;
};

export type PickupSettings = {
  openTime: string; // "HH:MM"
  closeTime: string; // "HH:MM"
  leadMinutes: number;
};

export type PickupLimits = {
  stepMinutes: number;
  maxActiveSlots: number;
  minCapacity: number;
  maxCapacity: number;
  maxLeadMinutes: number;
};

export type PickupSchedule = {
  source: "database" | "fallback";
  settings: PickupSettings;
  limits: PickupLimits;
  slots: PickupSlot[];
};

export type ImpactType = "DEACTIVATE" | "CAPACITY_BELOW_BOOKED" | "DELETE";

/** Isi `impact` pada respons 409 CONFIRMATION_REQUIRED. */
export type ImpactInfo = {
  type: ImpactType;
  upcomingActiveOrders: number;
  dates: { date: string; booked: number }[]; // maksimal 10 tanggal
  newCapacity?: number;
  lastActiveSlot: boolean;
};
