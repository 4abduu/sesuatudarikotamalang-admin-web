"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AdminSettings = {
  /** Cash/QRIS hold duration in minutes (default 120 = 2 hours). */
  holdDurationMinutes: number;
  /** Auto-cancel Cash/QRIS orders when hold expires. */
  autoCancelCash: boolean;
  /** Number of days a Midtrans (Lunas) order can be picked up before it
   *  becomes "Lewat Batas Pengambilan". Options: 7 | 14 | 30. Default 14. */
  pickupDeadlineDays: number;
  /** WhatsApp number used by the "Tanya Stok via WhatsApp" button. */
  whatsappAdmin: string;
  /** Email for new-order notifications. */
  emailNotif: string;
};

const defaults: AdminSettings = {
  holdDurationMinutes: 120,
  autoCancelCash: true,
  pickupDeadlineDays: 14,
  whatsappAdmin: "6281234567890",
  emailNotif: "halo@darikotamalang.id",
};

type SettingsState = {
  settings: AdminSettings;
  update: (patch: Partial<AdminSettings>) => void;
};

/**
 * Persisted admin settings. Used cross-page to compute order statuses
 * (pickupDeadline, hold expiry, auto-cancel). Frontend-only — no backend.
 */
export const useAdminSettings = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaults,
      update: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),
    }),
    { name: "sdkm-admin-settings" },
  ),
);

/** Non-reactive accessor for use in pure helpers (e.g. computeOrderStatus). */
export function getAdminSettings(): AdminSettings {
  return useAdminSettings.getState().settings;
}
