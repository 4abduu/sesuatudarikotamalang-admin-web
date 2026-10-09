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
}

export interface Artisan {
  id: number | string;
  userId: number | string;
  brandName: string;
  bio?: string | null;
  avatarUrl?: string | null;
  status: ArtisanStatus;
  createdAt: string;
  updatedAt: string;
  products?: Product[];
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
  whatsappAdminNumber: string;
  notificationEmail: string;
  updatedAt: string;
}

export interface DashboardData {
  ordersToday: number;
  readyForPickup: number;
  pendingApplications: number;
  lowStockCount: number;
  revenue7Days: number;
  statusDistribution: {
    status: OrderStatus;
    count: number;
  }[];
  topSellingProducts: {
    id: number | string;
    name: string;
    totalSold: number;
    totalRevenue: number;
  }[];
}
