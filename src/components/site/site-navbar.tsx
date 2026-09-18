"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, User, Menu, LogIn, Search } from "lucide-react";
import { LeafSprig } from "./line-art";
import { unreadCount } from "@/data/notifications";
import { useUserAuth } from "@/lib/user-auth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Beranda" },
  { href: "/katalog", label: "Katalog" },
  { href: "/kreator", label: "Meet The Artisans" },
  { href: "/daftar-kreator", label: "Jadi Kreator" },
];

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-2", className)}>
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-primary-foreground sticker-shadow transition-transform duration-300 group-hover:rotate-6">
        <LeafSprig className="h-6 w-6" strokeWidth={2.5} />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-extrabold tracking-tight text-foreground">
          Sesuatu
        </span>
        <span className="font-display text-sm font-semibold text-primary">
          DariKota Malang
        </span>
      </span>
    </Link>
  );
}

export function SiteNavbar({ onMenu }: { onMenu?: () => void }) {
  const pathname = usePathname();
  const user = useUserAuth((s) => s.user);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Logo />
        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/70 hover:bg-secondary hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-1 md:ml-2">
          <Link
            href="/pencarian"
            aria-label="Cari"
            className="grid h-10 w-10 place-items-center rounded-full text-foreground/70 transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Search className="h-5 w-5" />
          </Link>
          <Link
            href="/notifikasi"
            aria-label="Notifikasi"
            className="relative grid h-10 w-10 place-items-center rounded-full text-foreground/70 transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                {unreadCount}
              </span>
            )}
          </Link>
          <Link
            href={user ? "/akun" : "/login"}
            aria-label={user ? "Akun" : "Masuk"}
            className="relative grid h-10 w-10 place-items-center rounded-full text-foreground/70 transition-colors hover:bg-secondary hover:text-foreground"
          >
            {user ? (
              <User className="h-5 w-5" />
            ) : (
              <LogIn className="h-5 w-5" />
            )}
            {user?.role === "creator" && (
              <span className="absolute -bottom-0.5 -right-0.5 grid h-3.5 w-3.5 place-items-center rounded-full bg-accent text-[8px] font-bold text-accent-foreground ring-2 ring-background">
                K
              </span>
            )}
          </Link>
          {onMenu && (
            <button
              onClick={onMenu}
              aria-label="Menu"
              className="grid h-10 w-10 place-items-center rounded-full text-foreground/70 transition-colors hover:bg-secondary hover:text-foreground md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
