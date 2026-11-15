/**
 * Link marketplace (olshop) di admin web.
 * Validasi di sini HANYA untuk kenyamanan (pesan galat cepat). Yang menentukan tetap backend
 * (backend/src/lib/olshop.ts): HTTPS + domain resmi + pemeriksaan link pendek.
 */

export type OlshopPlatform = "shopee" | "tokopedia" | "tiktokshop";
export type OlshopMode = "tidak" | "toko" | "khusus";
export type OlshopConfig = { mode: OlshopMode; url: string };
export type OlshopFormState = Record<OlshopPlatform, OlshopConfig>;

export const OLSHOP_PLATFORMS: OlshopPlatform[] = ["shopee", "tokopedia", "tiktokshop"];

export const OLSHOP_META: Record<
  OlshopPlatform,
  { label: string; initial: string; color: string; placeholder: string; roots: string[] }
> = {
  shopee: {
    label: "Shopee",
    initial: "S",
    color: "#EE4D2D",
    placeholder: "https://shopee.co.id/...",
    roots: ["shopee.co.id", "shp.ee"],
  },
  tokopedia: {
    label: "Tokopedia",
    initial: "T",
    color: "#03AC0E",
    placeholder: "https://www.tokopedia.com/...",
    roots: ["tokopedia.com", "tokopedia.link"],
  },
  tiktokshop: {
    label: "TikTok Shop",
    initial: "TT",
    color: "#111111",
    placeholder: "https://www.tiktok.com/...",
    roots: ["tiktok.com"],
  },
};

/** Mengembalikan pesan galat, atau null bila URL lolos pemeriksaan sisi klien. */
export function validateOlshopUrlClient(platform: OlshopPlatform, raw: string): string | null {
  const value = raw.trim();
  const meta = OLSHOP_META[platform];
  if (!value) return "Link wajib diisi";
  if (value.length > 500) return "Maksimal 500 karakter";
  if (/\s/.test(value)) return "Link tidak boleh mengandung spasi";
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return "Format link salah";
  }
  if (url.protocol !== "https:") return "Link harus diawali https://";
  if (url.username || url.password) return "Link tidak boleh mengandung nama pengguna/kata sandi";
  if (url.port) return "Link tidak boleh memakai port khusus";
  const host = url.hostname.toLowerCase();
  if (/^[\d.]+$/.test(host) || host.startsWith("[")) return "Link tidak boleh berupa alamat IP";
  if (host.includes("xn--")) return "Domain tidak dikenali";
  if (!meta.roots.some((root) => host === root || host.endsWith(`.${root}`))) {
    return `Domain harus milik ${meta.label} (${meta.roots.join(", ")})`;
  }
  return null;
}

export function emptyOlshopState(): OlshopFormState {
  return {
    shopee: { mode: "tidak", url: "" },
    tokopedia: { mode: "tidak", url: "" },
    tiktokshop: { mode: "tidak", url: "" },
  };
}

/** Petakan data produk dari API (olshop mentah, atau shopeeUrl lama) menjadi state form. */
export function olshopStateFromProduct(product: {
  olshop?: Partial<Record<OlshopPlatform, { mode?: OlshopMode; url?: string | null }>> | null;
  shopeeUrl?: string | null;
}): OlshopFormState {
  const state = emptyOlshopState();
  for (const platform of OLSHOP_PLATFORMS) {
    const cfg = product.olshop?.[platform];
    if (cfg?.mode) state[platform] = { mode: cfg.mode, url: cfg.url ?? "" };
  }
  if (!product.olshop && product.shopeeUrl) state.shopee = { mode: "khusus", url: product.shopeeUrl };
  return state;
}

export function olshopStateEqual(a: OlshopFormState, b: OlshopFormState): boolean {
  return OLSHOP_PLATFORMS.every(
    (p) => a[p].mode === b[p].mode && (a[p].mode !== "khusus" || a[p].url.trim() === b[p].url.trim()),
  );
}

/** Bentuk body request: { olshop: { shopee: {mode, url?}, ... } } */
export function olshopPayload(state: OlshopFormState): { olshop: Record<OlshopPlatform, { mode: OlshopMode; url?: string }> } {
  const olshop = {} as Record<OlshopPlatform, { mode: OlshopMode; url?: string }>;
  for (const p of OLSHOP_PLATFORMS) {
    olshop[p] = state[p].mode === "khusus" ? { mode: "khusus", url: state[p].url.trim() } : { mode: state[p].mode };
  }
  return { olshop };
}
