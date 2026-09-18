"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  QrCode,
  Users,
  Star,
  Settings,
  LogOut,
  Menu,
  Store,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useUserAuth } from "@/lib/user-auth";
import { cn } from "@/lib/utils";
import { LeafSprig } from "@/components/site/line-art";

const navItems = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/produk", label: "Produk", Icon: Package },
  { href: "/admin/pesanan", label: "Pesanan", Icon: ShoppingCart },
  { href: "/admin/scan-qr", label: "Scan QR", Icon: QrCode },
  { href: "/admin/kreator", label: "Kreator", Icon: Users },
  { href: "/admin/ulasan", label: "Ulasan", Icon: Star },
  { href: "/admin/pengaturan", label: "Pengaturan", Icon: Settings },
];

function AdminLogo() {
  return (
    <Link href="/admin" className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
        <LeafSprig className="h-5 w-5" strokeWidth={2.5} />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-sm font-bold text-foreground">
          DariKota Malang
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Admin Panel
        </span>
      </span>
    </Link>
  );
}

function NavLink({
  href,
  label,
  Icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  Icon: React.FC<{ className?: string }>;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-foreground/70 hover:bg-secondary hover:text-foreground",
      )}
    >
      <Icon className="h-[18px] w-[18px]" />
      {label}
    </Link>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useUserAuth((s) => s.logout);
  const adminName = useUserAuth((s) => s.user?.name) ?? "Admin";
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  const navList = (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => (
        <NavLink
          key={item.href}
          href={item.href}
          label={item.label}
          Icon={item.Icon}
          active={isActive(item.href)}
          onClick={() => setMobileNavOpen(false)}
        />
      ))}
    </nav>
  );

  return (
    <div className="paper-texture min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(168,69,43,0.08),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(107,122,61,0.08),_transparent_30%),linear-gradient(180deg,_#f7efdf_0%,_#f3ead7_48%,_#ede0c7_100%)] text-foreground">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border/80 bg-card/95 shadow-[8px_0_30px_rgba(43,33,26,0.06)] backdrop-blur md:flex">
        <div className="border-b border-border/80 p-4">
          <AdminLogo />
        </div>
        <div className="flex-1 overflow-y-auto p-3">{navList}</div>
        <div className="border-t border-border/80 p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/75 transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Store className="h-[18px] w-[18px]" />
            Lihat Toko
          </Link>
        </div>
      </aside>

      {/* Mobile sidebar (Sheet) */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-72 bg-card p-0">
          <SheetHeader className="border-b border-border/80 bg-card/95">
            <SheetTitle className="font-display">
              <AdminLogo />
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-3">{navList}</div>
        </SheetContent>
      </Sheet>

      {/* Main column */}
      <div className="md:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border/80 bg-card/90 px-4 backdrop-blur md:px-6">
          <button
            onClick={() => setMobileNavOpen(true)}
            aria-label="Buka menu"
            className="grid h-9 w-9 place-items-center rounded-lg text-foreground/70 hover:bg-secondary/80 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden md:block">
            <p className="font-display text-sm font-semibold text-foreground">
              Panel Admin
            </p>
            <p className="text-[11px] text-muted-foreground">
              Kelola toko & konsinyasi Kayutangan
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-semibold text-foreground">
                {adminName || "Admin"}
              </p>
              <p className="text-[10px] text-muted-foreground">Administrator</p>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/10">
              <Users className="h-4 w-4" />
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card px-3 py-2 text-xs font-semibold text-foreground/80 transition-colors hover:bg-secondary/80 hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </header>

        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
