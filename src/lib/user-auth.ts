"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "buyer" | "creator" | "admin";

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  /** id of the creator record, if role === "creator" */
  creatorId?: string;
  /** application id when this user has a pending konsinyasi application */
  applicationId?: string;
  avatarUrl?: string | null;
};

type UserAuthState = {
  /** The single source of truth for the logged-in session (buyer/creator/admin). */
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  /** Promote a buyer to a creator (after admin approval). */
  becomeCreator: (creatorId: string) => void;
  /** Track a konsinyasi application id for this user (pending). */
  setApplication: (applicationId: string) => void;
  /** Patch profile fields (name / avatar). */
  updateProfile: (patch: Partial<Pick<User, "name" | "avatarUrl">>) => void;
  changeEmail: (newEmail: string) => void;
  changePassword: (newPassword: string) => void;
};

/**
 * Dummy client-side user auth, persisted to localStorage. A SINGLE store for
 * all roles (buyer / creator / admin) — NOT real security, this is a UI
 * prototype only. A fresh browser / cleared storage = logged out.
 */
export const useUserAuth = create<UserAuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
      becomeCreator: (creatorId) =>
        set((s) =>
          s.user
            ? { user: { ...s.user, role: "creator", creatorId, applicationId: undefined } }
            : s,
        ),
      setApplication: (applicationId) =>
        set((s) => (s.user ? { user: { ...s.user, applicationId } } : s)),
      updateProfile: (patch) =>
        set((s) => (s.user ? { user: { ...s.user, ...patch } } : s)),
      changeEmail: (newEmail) =>
        set((s) => (s.user ? { user: { ...s.user, email: newEmail } } : s)),
      changePassword: (newPassword) =>
        set((s) => (s.user ? { user: { ...s.user, password: newPassword } } : s)),
    }),
    { name: "sdkm-user-auth" },
  ),
);

/* Pre-baked demo accounts (used by the demo-login buttons on /login and
   /admin/login). Admin shares the same store — there is no separate admin
   auth. */
export const demoUsers: Record<
  string,
  { label: string; description: string; user: User }
> = {
  buyer: {
    label: "Pembeli",
    description: "User biasa — bisa beli & kasih ulasan",
    user: {
      id: "u-buyer-demo",
      name: "Maya Anggraini",
      email: "maya@email.com",
      password: "demo1234",
      role: "buyer",
    },
  },
  creator: {
    label: "Kreator",
    description: "Pembeli + akses dashboard kreator",
    user: {
      id: "u-creator-demo",
      name: "Dini Aulia",
      email: "dini.draws@gmail.com",
      password: "demo1234",
      role: "creator",
      creatorId: "dini-aulia",
    },
  },
  admin: {
    label: "Admin",
    description: "Akses panel admin toko",
    user: {
      id: "u-admin-demo",
      name: "Admin Toko",
      email: "admin@darikotamalang.id",
      password: "admin1234",
      role: "admin",
    },
  },
};
