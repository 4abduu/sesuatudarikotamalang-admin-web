"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserApplicationStatus = "pending" | "approved" | "rejected";

export type UserApplication = {
  id: string;
  userId: string;
  applicantName: string;
  contact: string;
  email: string;
  brandName: string;
  description: string;
  category: string;
  submittedAt: string;
  status: UserApplicationStatus;
  /** set when rejected, optional */
  rejectReason?: string;
};

type ApplicationsState = {
  applications: UserApplication[];
  addApplication: (app: UserApplication) => void;
  approve: (id: string) => void;
  reject: (id: string, reason?: string) => void;
};

export const useUserApplications = create<ApplicationsState>()(
  persist(
    (set) => ({
      applications: [],
      addApplication: (app) =>
        set((s) => ({ applications: [app, ...s.applications] })),
      approve: (id) =>
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === id ? { ...a, status: "approved" } : a,
          ),
        })),
      reject: (id, reason) =>
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === id ? { ...a, status: "rejected", rejectReason: reason } : a,
          ),
        })),
    }),
    { name: "sdkm-user-applications" },
  ),
);

/** The latest application for a user (or undefined). */
export function latestApplication(
  userId: string,
  apps: UserApplication[],
): UserApplication | undefined {
  return apps
    .filter((a) => a.userId === userId)
    .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1))[0];
}
