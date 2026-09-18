"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useUserAuth } from "@/lib/user-auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { Loader2 } from "lucide-react";

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
  const hydrated = useAuthHydrated();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (!user || user.role !== "admin") {
      router.replace("/admin/login");
    }
  }, [hydrated, user, router]);

  if (!hydrated || !user || user.role !== "admin") {
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
