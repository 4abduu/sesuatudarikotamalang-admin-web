"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getAdminSettings } from "@/lib/admin-settings";

export type UserOrderStatus =
  | "Menunggu Bayar"
  | "Lunas"
  | "Selesai"
  | "Dibatalkan"
  | "Kedaluwarsa"
  | "Lewat Batas Pengambilan";

/** Stored status (the literal value persisted). Computed statuses
 *  (Lewat Batas Pengambilan, Kedaluwarsa) are derived at read time via
 *  `computeOrderStatus`. */
export type StoredOrderStatus = Exclude<
  UserOrderStatus,
  "Lewat Batas Pengambilan" | "Kedaluwarsa"
>;

export type UserOrder = {
  id: string;
  orderNumber: string;
  userId: string;
  productId: string;
  productName: string;
  variantLabel: string;
  pickupDate: string; // ISO date (yyyy-mm-dd)
  pickupSlot: string;
  paymentMethod: "Midtrans" | "Cash/QRIS";
  status: StoredOrderStatus;
  total: number;
  createdAt: string; // ISO
  /** true once the buyer has submitted a review for this order */
  reviewed?: boolean;
  /** Cash/QRIS only — when the temporary stock hold expires (ISO). */
  holdExpiresAt?: string;
  /** Cash/QRIS only — accumulated total hold-extension minutes (for 2-day cap). */
  holdExtendedMinutes?: number;
  /** Midtrans only — deadline to pick up (ISO), = pickupDate + pickupDeadlineDays. */
  pickupDeadline?: string;
};

type OrdersState = {
  orders: UserOrder[];
  addOrder: (order: UserOrder) => void;
  setStatus: (id: string, status: StoredOrderStatus) => void;
  markReviewed: (id: string) => void;
  /** Extend the hold on a Cash/QRIS order. Validates the accumulated extension
   *  does not exceed 2 days (2880 min) since the order was created. Returns
   *  the new holdExpiresAt or null if the extension is rejected. */
  extendHold: (orderId: string, additionalMinutes: number) => string | null;
};

const today = new Date().toISOString().slice(0, 10);
const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10);
const tenDaysAgo = new Date(Date.now() - 10 * 86400000).toISOString().slice(0, 10);

/** Compute the ISO deadline for a Midtrans (Lunas) order given settings. */
export function computePickupDeadline(
  pickupDateISO: string,
  pickupDeadlineDays: number,
): string {
  const d = new Date(pickupDateISO + "T00:00:00.000Z");
  d.setUTCDate(d.getUTCDate() + pickupDeadlineDays);
  return d.toISOString();
}

/** Seed past orders so the history page isn't empty for demo accounts.
 *  Includes a Lunas order past its pickup deadline (→ Lewat Batas Pengambilan)
 *  and an expired Cash hold (→ Kedaluwarsa) to showcase computed statuses. */
const seedOrders: UserOrder[] = [
  {
    id: "uo-seed-1",
    orderNumber: "SDK-0231",
    userId: "u-buyer-demo",
    productId: "pin-enamel-apel-malang",
    productName: "Pin Enamel Apel Malang",
    variantLabel: "Warna: Terakota",
    pickupDate: yesterday,
    pickupSlot: "15:00",
    paymentMethod: "Midtrans",
    status: "Selesai",
    total: 35000,
    createdAt: twoDaysAgo,
    reviewed: true,
    pickupDeadline: computePickupDeadline(yesterday, 14),
  },
  {
    id: "uo-seed-2",
    orderNumber: "SDK-0238",
    userId: "u-buyer-demo",
    productId: "postcard-jendela-kayutangan",
    productName: "Postcard Jendela Kayutangan",
    variantLabel: "Motif: Jendela",
    pickupDate: today,
    pickupSlot: "10:00",
    paymentMethod: "Cash/QRIS",
    status: "Menunggu Bayar",
    total: 12000,
    createdAt: yesterday,
    holdExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    holdExtendedMinutes: 0,
  },
  // Lunas order whose pickup deadline has passed → computed "Lewat Batas Pengambilan"
  {
    id: "uo-seed-4",
    orderNumber: "SDK-0215",
    userId: "u-buyer-demo",
    productId: "stiker-pack-ornamen",
    productName: "Stiker Pack Ornamen Malang",
    variantLabel: "Pack: Ornamen",
    pickupDate: tenDaysAgo,
    pickupSlot: "11:00",
    paymentMethod: "Midtrans",
    status: "Lunas",
    total: 25000,
    createdAt: tenDaysAgo,
    reviewed: false,
    pickupDeadline: computePickupDeadline(tenDaysAgo, 7), // 7-day deadline, already past
  },
  {
    id: "uo-seed-3",
    orderNumber: "SDK-0210",
    userId: "u-creator-demo",
    productId: "gantungan-kayu-daun",
    productName: "Gantungan Kunci Kayu Daun",
    variantLabel: "Motif: Daun Jati",
    pickupDate: yesterday,
    pickupSlot: "11:00",
    paymentMethod: "Midtrans",
    status: "Selesai",
    total: 28000,
    createdAt: twoDaysAgo,
    reviewed: false,
    pickupDeadline: computePickupDeadline(yesterday, 14),
  },
];

/** Maximum total hold-extension minutes (2 days) since the order was created. */
export const MAX_HOLD_EXTENSION_MINUTES = 2 * 24 * 60; // 2880

export const useUserOrders = create<OrdersState>()(
  persist(
    (set) => ({
      orders: seedOrders,
      addOrder: (order) => set((s) => ({ orders: [order, ...s.orders] })),
      setStatus: (id, status) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        })),
      markReviewed: (id) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, reviewed: true } : o)),
        })),
      extendHold: (orderId, additionalMinutes) => {
        let result: string | null = null;
        set((s) => ({
          orders: s.orders.map((o) => {
            if (o.id !== orderId) return o;
            const createdMs = new Date(o.createdAt).getTime();
            const elapsedSinceCreatedMin =
              (Date.now() - createdMs) / 60000;
            const alreadyExtended = o.holdExtendedMinutes ?? 0;
            const wouldExceed =
              elapsedSinceCreatedMin + alreadyExtended + additionalMinutes >
              MAX_HOLD_EXTENSION_MINUTES;
            if (wouldExceed) return o; // reject silently
            const base = o.holdExpiresAt
              ? new Date(o.holdExpiresAt).getTime()
              : Date.now();
            const next = new Date(base + additionalMinutes * 60000).toISOString();
            result = next;
            return {
              ...o,
              holdExpiresAt: next,
              holdExtendedMinutes: alreadyExtended + additionalMinutes,
            };
          }),
        }));
        return result;
      },
    }),
    { name: "sdkm-user-orders" },
  ),
);

/** Orders belonging to a user, newest first. */
export function ordersForUser(userId: string, orders: UserOrder[]): UserOrder[] {
  return orders
    .filter((o) => o.userId === userId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function makeOrderNumber(): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `SDK-${n}`;
}

/* ------------------------------------------------------------------ */
/* Computed status helpers (frontend-only — no background job)        */
/* ------------------------------------------------------------------ */

/** Has the Midtrans (Lunas) order passed its pickup deadline? */
export function isPastPickupDeadline(order: UserOrder): boolean {
  if (order.paymentMethod !== "Midtrans" || order.status !== "Lunas") return false;
  const deadline = order.pickupDeadline;
  if (!deadline) return false;
  return new Date(deadline).getTime() < Date.now();
}

/** Has the Cash/QRIS hold expired? */
export function isHoldExpired(order: UserOrder): boolean {
  if (order.paymentMethod !== "Cash/QRIS" || order.status !== "Menunggu Bayar")
    return false;
  const exp = order.holdExpiresAt;
  if (!exp) return false;
  return new Date(exp).getTime() < Date.now();
}

/**
 * The EFFECTIVE status of an order, computed from the stored status + current
 * time + admin settings. This is what every UI should display.
 *
 *  - Lunas + past pickupDeadline → "Lewat Batas Pengambilan"
 *  - Menunggu Bayar + hold expired + autoCancel on → "Kedaluwarsa"
 *  - otherwise → the stored status
 *
 * NOTE: computed statuses are NOT persisted — they are derived every render.
 */
export function computeOrderStatus(order: UserOrder): UserOrderStatus {
  if (isPastPickupDeadline(order)) return "Lewat Batas Pengambilan";
  if (isHoldExpired(order)) {
    const settings = getAdminSettings();
    if (settings.autoCancelCash) return "Kedaluwarsa";
  }
  return order.status;
}

/** Remaining hold time (ms) for a Cash/QRIS order, or null. */
export function holdRemainingMs(order: UserOrder): number | null {
  if (!order.holdExpiresAt) return null;
  return Math.max(0, new Date(order.holdExpiresAt).getTime() - Date.now());
}

/** Remaining pickup-deadline time (ms) for a Midtrans order, or null. */
export function pickupDeadlineRemainingMs(order: UserOrder): number | null {
  if (!order.pickupDeadline) return null;
  return new Date(order.pickupDeadline).getTime() - Date.now();
}

/** Accumulated hold-extension minutes used so far (for the 2-day cap UI). */
export function holdExtendedTotal(order: UserOrder): number {
  return order.holdExtendedMinutes ?? 0;
}

/** Remaining extension quota (minutes) given the 2-day cap. */
export function holdExtensionQuotaMin(order: UserOrder): number {
  const createdMs = new Date(order.createdAt).getTime();
  const elapsedSinceCreatedMin = (Date.now() - createdMs) / 60000;
  const used = (order.holdExtendedMinutes ?? 0) + elapsedSinceCreatedMin;
  return Math.max(0, MAX_HOLD_EXTENSION_MINUTES - used);
}
