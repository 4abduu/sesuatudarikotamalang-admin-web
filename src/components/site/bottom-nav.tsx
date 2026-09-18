"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Palette, Bell, User } from "lucide-react";
import { unreadCount } from "@/data/notifications";
import { useUserAuth } from "@/lib/user-auth";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Beranda", Icon: Home },
  { href: "/katalog", label: "Katalog", Icon: LayoutGrid },
  { href: "/kreator", label: "Kreator", Icon: Palette },
  { href: "/notifikasi", label: "Notif", Icon: Bell },
  { href: "/akun", label: "Akun", Icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const user = useUserAuth((s) => s.user);
  const accountHref = user ? "/akun" : "/login";
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-md md:hidden">
      <div
        className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1.5"
        style={{ paddingBottom: "max(0.4rem, env(safe-area-inset-bottom))" }}
      >
        {items.map(({ href, label, Icon }) => {
          const resolvedHref = href === "/akun" ? accountHref : href;
          const active =
            resolvedHref === "/" ? pathname === "/" : pathname.startsWith(resolvedHref);
          const showBadge = resolvedHref === "/notifikasi" && unreadCount > 0;
          return (
            <Link
              key={href}
              href={resolvedHref}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "relative grid h-8 w-8 place-items-center rounded-full transition-colors",
                  active ? "bg-primary/10" : "bg-transparent",
                )}
              >
                <Icon className="h-5 w-5" />
                {showBadge && (
                  <span className="absolute -right-0.5 -top-0.5 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-accent px-1 text-[9px] font-bold text-accent-foreground">
                    {unreadCount}
                  </span>
                )}
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
