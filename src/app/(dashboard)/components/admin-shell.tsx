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
  UserRound,
  Star,
  Settings,
  Clock,
  ClipboardCheck,
  Hourglass,
  FileBarChart,
  History,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useUserAuth } from "@/lib/user-auth";
import { cn } from "@/lib/utils";
import { LogoHand } from "@/components/site/line-art";

type NavChild = {
  href: string;
  label: string;
  Icon: React.FC<{ className?: string }>;
};

type NavItem = {
  href?: string;
  label: string;
  Icon: React.FC<{ className?: string }>;
  children?: NavChild[];
};

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", Icon: LayoutDashboard },
  {
    label: "Produk",
    Icon: Package,
    children: [
      { href: "/produk", label: "Kelola Produk", Icon: Package },
      { href: "/produk/persetujuan", label: "Persetujuan Produk", Icon: ClipboardCheck },
      { href: "/produk/lambat-laku", label: "Produk Lambat Laku", Icon: Hourglass },
    ],
  },
  { href: "/stok", label: "Riwayat Stok", Icon: History },
  { href: "/pesanan", label: "Pesanan", Icon: ShoppingCart },
  { href: "/scan-qr", label: "Scan QR", Icon: QrCode },
  { href: "/kreator", label: "Kreator", Icon: Users },
  { href: "/pengguna", label: "Pengguna", Icon: UserRound },
  { href: "/ulasan", label: "Ulasan", Icon: Star },
  { href: "/jadwal-pickup", label: "Jadwal Pickup", Icon: Clock },
  { href: "/laporan", label: "Laporan Bulanan", Icon: FileBarChart },
  { href: "/pengaturan", label: "Pengaturan", Icon: Settings },
];

// Semua href (termasuk children) untuk cek spesifisitas isActive
const allHrefs = navItems.flatMap((item) =>
  item.children ? item.children.map((c) => c.href) : item.href ? [item.href] : [],
);

function AdminLogo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
        <LogoHand className="h-5 w-5" strokeWidth={2.5} />
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

  // Auto-expand "Produk" kalau route saat ini di bawah /produk
  const isProductRoute = pathname.startsWith("/produk");
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(() =>
    isProductRoute ? new Set(["Produk"]) : new Set(),
  );

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  // isActive untuk item flat (tanpa submenu)
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (!pathname.startsWith(href)) return false;
    const moreSpecific = allHrefs.some(
      (h) => h !== href && h.startsWith(`${href}/`) && pathname.startsWith(h),
    );
    return !moreSpecific;
  };

  // isActive untuk child di dalam submenu
  // "/produk" hanya aktif kalau exact match (bukan /produk/persetujuan)
  const isChildActive = (href: string) => {
    if (href === "/produk") return pathname === "/produk";
    return pathname.startsWith(href);
  };

  // Cek apakah parent punya child yang aktif
  const isParentActive = (item: NavItem) => {
    if (!item.children) return false;
    return item.children.some((child) => isChildActive(child.href));
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navList = (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        // Item dengan submenu (expandable)
        if (item.children) {
          const isExpanded = expandedMenus.has(item.label);
          const parentActive = isParentActive(item);
          return (
            <div key={item.label}>
              <button
                onClick={() => toggleMenu(item.label)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  parentActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/70 hover:bg-secondary hover:text-foreground",
                )}
              >
                <item.Icon className="h-[18px] w-[18px]" />
                <span className="flex-1 text-left">{item.label}</span>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0" />
                )}
              </button>
              {isExpanded && (
                <div className="ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-border/80 pl-3">
                  {item.children.map((child) => {
                    const childActive = isChildActive(child.href);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setMobileNavOpen(false)}
                        className={cn(
                          "flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                          childActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-foreground/60 hover:bg-secondary hover:text-foreground",
                        )}
                      >
                        <child.Icon className="h-4 w-4 shrink-0" />
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        // Item flat (tanpa submenu)
        return (
          <NavLink
            key={item.label}
            href={item.href!}
            label={item.label}
            Icon={item.Icon}
            active={isActive(item.href!)}
            onClick={() => setMobileNavOpen(false)}
          />
        );
      })}
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