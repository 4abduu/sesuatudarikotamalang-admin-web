export function formatRupiah(value: number) {
  return "Rp" + value.toLocaleString("id-ID");
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Semua jam kelipatan `step` menit pada rentang [from, to) dalam format HH:MM. */
export function buildTimeOptions(from: string, to: string, step: number): string[] {
  const out: string[] = [];
  for (let t = timeToMinutes(from); t < timeToMinutes(to); t += step) out.push(minutesToTime(t));
  return out;
}

/** Pilihan jam buka/tutup: 00:00 sampai 23:30 per 30 menit. */
export const ALL_HALF_HOURS: string[] = buildTimeOptions("00:00", "24:00", 30);

export const LEAD_OPTIONS: number[] = [0, 15, 30, 45, 60, 90, 120];

/** "2026-10-27" menjadi "Sel, 27 Okt 2026" (tanggal kalender WIB, tanpa pergeseran zona). */
export function formatDateId(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
