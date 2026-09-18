"use client";

import { create } from "zustand";
import { usePathname, useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn, Sparkles } from "lucide-react";
import { useUserAuth } from "@/lib/user-auth";

type AuthGateState = {
  open: boolean;
  /** Where to return after a successful login. */
  next?: string;
  /** Friendly context label, shown in the dialog title (e.g. "pesan pickup"). */
  contextLabel?: string;
  openGate: (opts?: { next?: string; contextLabel?: string }) => void;
  close: () => void;
};

/**
 * Global store controlling the AuthGate modal. Call `useAuthGate.getState().openGate(...)`
 * (or the `useAuthGate()` hook) from any guest-only action button to pop the
 * modal instead of a silent redirect. The dialog offers "Masuk / Daftar"
 * (→ /login?next=) or "Nanti dulu" (close). NOT persisted — gate state is
 * ephemeral UI state.
 */
export const useAuthGate = create<AuthGateState>((set) => ({
  open: false,
  next: undefined,
  contextLabel: undefined,
  openGate: (opts) =>
    set({ open: true, next: opts?.next, contextLabel: opts?.contextLabel }),
  close: () => set({ open: false, next: undefined, contextLabel: undefined }),
}));

export function AuthGateDialog() {
  const open = useAuthGate((s) => s.open);
  const next = useAuthGate((s) => s.next);
  const contextLabel = useAuthGate((s) => s.contextLabel);
  const close = useAuthGate((s) => s.close);
  const router = useRouter();
  const pathname = usePathname();
  const user = useUserAuth((s) => s.user);

  // If a logged-in user somehow opens the gate, render nothing — no point
  // prompting them to log in. All hooks above run unconditionally.
  if (user) return null;

  const goLogin = () => {
    const targetPath = next ?? pathname;
    close();
    router.push(`/login?next=${encodeURIComponent(targetPath)}`);
  };

  const title = contextLabel
    ? `Masuk untuk ${contextLabel}`
    : "Masuk dulu yuk!";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-sm rounded-2xl border-border bg-card p-6">
        <DialogHeader>
          <div className="mx-auto mb-2 grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center font-display text-xl font-extrabold text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            Kamu perlu masuk atau daftar dulu untuk melanjutkan aksi ini.
            Tenang, cepat kok.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 flex flex-col gap-2">
          <Button
            onClick={goLogin}
            className="h-11 w-full gap-2 rounded-xl bg-primary text-primary-foreground sticker-shadow transition-all hover:-translate-y-0.5 hover:brightness-105"
          >
            <LogIn className="h-4 w-4" />
            Masuk / Daftar
          </Button>
          <Button
            variant="ghost"
            onClick={close}
            className="h-10 w-full text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            Nanti dulu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
