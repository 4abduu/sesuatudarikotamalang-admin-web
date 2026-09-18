"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserAuth } from "@/lib/user-auth";
import { useSyncExternalStore } from "react";
import { Loader2 } from "lucide-react";

/**
 * Returns true once zustand-persist has finished rehydrating from storage.
 * Uses useSyncExternalStore (no setState-in-effect) to stay lint-clean.
 */
function useAuthHydrated() {
  return useSyncExternalStore(
    (cb) => {
      // Subscribe to hydration finish; persist emits nothing after hydrate,
      // so we also poll via a microtask on first subscribe.
      const unsub = useUserAuth.persist.onFinishHydration(() => cb());
      return unsub;
    },
    () => useUserAuth.persist.hasHydrated(),
    () => false, // server snapshot
  );
}

/**
 * Client-side route guard for customer pages that require login. Renders a
 * loading state until the persisted auth has hydrated, then either renders
 * the children (if logged in) or redirects to /login with a `next` param.
 */
export function RequireUser({
  children,
  next,
}: {
  children: React.ReactNode;
  next?: string;
}) {
  const user = useUserAuth((s) => s.user);
  const hydrated = useAuthHydrated();
  const router = useRouter();

  useEffect(() => {
    // Only decide once persisted state is available.
    if (!hydrated) return;
    if (user === null) {
      const target = next ? `/login?next=${encodeURIComponent(next)}` : "/login";
      router.replace(target);
    }
  }, [hydrated, user, next, router]);

  if (!hydrated || !user) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm">Memeriksa sesi kamu…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
