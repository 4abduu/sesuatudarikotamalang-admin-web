import { formatDateId } from "@/lib/format";

const DAY_NAMES = ["", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

/** Nama hari dari angka ISO (1 = Senin ... 7 = Minggu). */
export function weekdayName(n: number): string {
  return DAY_NAMES[n] ?? String(n);
}

export const WEEKDAY_OPTIONS: { value: number; label: string; short: string }[] = [1, 2, 3, 4, 5, 6, 7].map(
  (n) => ({ value: n, label: DAY_NAMES[n], short: DAY_NAMES[n].slice(0, 3) })
);

/** Tanggal hari ini menurut WIB, format YYYY-MM-DD. */
export function todayWib(): string {
  return new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** Bulan berjalan menurut WIB, format YYYY-MM. */
export function currentMonthWib(): string {
  return todayWib().slice(0, 7);
}

/** Selisih hari inklusif antara dua tanggal YYYY-MM-DD (2026-11-07 sampai 2026-11-09 = 3). */
export function inclusiveDays(start: string, end: string): number {
  const a = Date.parse(`${start}T00:00:00Z`);
  const b = Date.parse(`${end}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.round((b - a) / 86_400_000) + 1;
}

export function formatRangeId(start: string, end: string): string {
  return start === end ? formatDateId(start) : `${formatDateId(start)} sampai ${formatDateId(end)}`;
}

/** "2026-10" menjadi "Oktober 2026". */
export function formatMonthId(month: string): string {
  const [y, m] = month.split("-").map(Number);
  if (!y || !m) return month;
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatDateTimeId(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}

export function formatPercent(n: number): string {
  return `${Number.isInteger(n) ? n : n.toFixed(1)}%`;
}

export function variantText(label: string | null | undefined): string {
  return label && label.trim() ? label : "Tanpa varian";
}

