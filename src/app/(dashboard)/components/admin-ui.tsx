import { cn } from "@/lib/utils";
import { OrderStatus } from "@/data/admin/orders";

/** Admin page header — title + optional description + actions slot */
export function AdminPageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground md:text-[28px]">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      )}
    </div>
  );
}

const accentPairs: Record<string, [string, string]> = {
  primary: ["#A8452B", "#FBE9E2"],
  accent: ["#6B7A3D", "#EEF2E2"],
  mustard: ["#C99A2E", "#FAF1DC"],
  brown: ["#8A6A3A", "#F2EADB"],
};

/** Compact stat card for dashboard overview */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "primary",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.FC<{ className?: string }>;
  accent?: keyof typeof accentPairs;
}) {
  const [fg, bg] = accentPairs[accent];
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span
          className="grid h-9 w-9 place-items-center rounded-lg"
          style={{ backgroundColor: bg, color: fg }}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-bold text-foreground">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

const orderStatusStyles: Record<OrderStatus, string> = {
  "Menunggu Bayar": "bg-[#C99A2E]/15 text-[#8a6a1a]",
  Lunas: "bg-accent/15 text-accent",
  Selesai: "bg-primary/15 text-primary",
  Dibatalkan: "bg-muted text-muted-foreground",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        orderStatusStyles[status],
      )}
    >
      {status}
    </span>
  );
}

const appStatusStyles: Record<string, string> = {
  pending: "bg-[#C99A2E]/15 text-[#8a6a1a]",
  approved: "bg-accent/15 text-accent",
  rejected: "bg-destructive/15 text-destructive",
};

export const appStatusLabel: Record<string, string> = {
  pending: "Menunggu",
  approved: "Diterima",
  rejected: "Ditolak",
};

export function AppStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        appStatusStyles[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {appStatusLabel[status] ?? status}
    </span>
  );
}

/** Simple empty-state for tables */
export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.FC<{ className?: string }>;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground">
        <Icon className="h-6 w-6" />
      </span>
      <p className="font-display text-base font-semibold text-foreground">
        {title}
      </p>
      {description && (
        <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
