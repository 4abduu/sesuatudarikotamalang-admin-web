"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useUserAuth } from "@/lib/user-auth";
import { AdminShell } from "./components/admin-shell";
import { Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { User } from "@/lib/types";

/** Wait for zustand-persist to rehydrate before deciding redirects. */
function useAuthHydrated() {
  return useSyncExternalStore(
    (cb) => useUserAuth.persist.onFinishHydration(() => cb()),
    () => useUserAuth.persist.hasHydrated(),
    () => false,
  );
}

export default function AuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useUserAuth((s) => s.user);
  const login = useUserAuth((s) => s.login);
  const hydrated = useAuthHydrated();
  const router = useRouter();
  const [checkingServer, setCheckingServer] = useState(true);

  useEffect(() => {
    if (!hydrated) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token || !user || user.role !== "admin") {
      router.replace("/login");
      return;
    }

    // Verify session with backend
    let isSubscribed = true;
    apiFetch<{ user: User }>("/api/auth/me")
      .then((data) => {
        if (!isSubscribed) return;
        if (data.user.role !== "admin") {
          localStorage.removeItem("token");
          router.replace("/login");
        } else {
          login(data.user);
          setCheckingServer(false);
        }
      })
      .catch(() => {
        if (!isSubscribed) return;
        // If API fails or backend offline, still allow if local state says admin (or redirect if 401 handled by apiFetch)
        setCheckingServer(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [hydrated, user, router, login]);

  if (!hydrated || checkingServer || !user || user.role !== "admin") {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/40">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm">Memeriksa sesi admin…</p>
        </div>
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
