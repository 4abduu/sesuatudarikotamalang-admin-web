"use client";

import { useState } from "react";
import { SiteNavbar } from "./site-navbar";
import { BottomNav } from "./bottom-nav";
import { SiteFooter } from "./site-footer";
import { AuthGateDialog } from "./auth-gate";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Beranda" },
  { href: "/katalog", label: "Katalog" },
  { href: "/kreator", label: "Meet The Artisans" },
  { href: "/daftar-kreator", label: "Jadi Kreator" },
  { href: "/login", label: "Masuk / Daftar" },
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Admin routes render their own shell — pass through without customer chrome.
  if (pathname.startsWith("/admin")) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  // Export-figma pages render their own full layout — pass through without
  // the customer navbar/footer/bottom-nav.
  if (pathname.startsWith("/export-figma")) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  // Auth / account pages render full-screen without the customer navbar/footer.
  const isChromeless =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/lupa-password";
  if (isChromeless) {
    return (
      <div className="min-h-screen bg-background">
        {children}
        <AuthGateDialog />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col paper-texture">
      <SiteNavbar onMenu={() => setMenuOpen(true)} />
      <main className="flex-1 pb-24 md:pb-0">{children}</main>
      <SiteFooter />
      <BottomNav />
      <AuthGateDialog />

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" className="w-72 bg-background">
          <SheetHeader>
            <SheetTitle className="font-display text-left">Menu</SheetTitle>
          </SheetHeader>
          <nav className="mt-4 flex flex-col gap-1">
            {navItems.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/80 hover:bg-secondary",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
