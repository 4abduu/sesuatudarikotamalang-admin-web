export type VariantOption = {
  /** e.g. "Motif", "Ukuran", "Warna" */
  name: string;
  /** e.g. ["Ubin", "Sulur"] */
  values: string[];
};

export type Variant = {
  /** ordered tuple of option values, matching `variantOptions` order */
  options: string[];
  stock: number;
};

export type ProductStory = {
  title: string;
  body: string;
  process: string; // ringkasan proses pembuatan
};

export type Product = {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  creatorId: string;
  shortDesc: string;
  description: string;
  /** null => render art placeholder */
  image: string | null;
  /** seeds for the gallery (extra angles) */
  gallery: string[];
  /** axis definition for variants; empty = single-stock product */
  variantOptions: VariantOption[];
  /** one entry per combination (cartesian product of variantOptions) */
  variants: Variant[];
  badge: "limited" | "story" | "bestseller" | null;
  story: ProductStory | null;
  rating: number;
  reviewCount: number;
  soldCount: number;
  createdAt: string; // ISO date for sorting "terbaru"
  shopeeUrl: string;
};

export const products: Product[] = [
  {
    id: "postcard-jendela-kayutangan",
    name: "Postcard Jendela Kayutangan",
    categoryId: "postcard",
    price: 12000,
    creatorId: "dini-aulia",
    shortDesc: "Kartu pos ilustrasi jendela kayu heritage",
    description:
      "Postcard digambar tangan pakai pensil warna, lalu dipindai dan dicetak di kertas art paper tebal 300gsm. Cocok buat dikirim ke teman yang lagi kangen Malang.",
    image: null,
    gallery: [],
    variantOptions: [{ name: "Motif", values: ["Jendela", "Pintu", "Set 3 Motif"] }],
    variants: [
      { options: ["Jendela"], stock: 24 },
      { options: ["Pintu"], stock: 12 },
      { options: ["Set 3 Motif"], stock: 6 },
    ],
    badge: "story",
    story: {
      title: "Jendela yang Nggak Pernah Ketutup",
      body: "Dini ngelukis jendela ini pas sore, pas cahaya masuk miring dan bikin debu kelihatan kayak bintang. 'Kayutangan itu selalu ada cerita di balik tiap jendela,' katanya.",
      process: "Sketsa pensil → pensil warna → pindai → cetak digital.",
    },
    rating: 4.9,
    reviewCount: 47,
    soldCount: 312,
    createdAt: "2024-11-02",
    shopeeUrl: "https://shopee.co.id/sesuatu-darikota-malang",
  },
  {
    id: "pin-enamel-apel-malang",
    name: "Pin Enamel Apel Malang",
    categoryId: "pin-enamel",
    price: 35000,
    creatorId: "bagas-pratama",
    shortDesc: "Pin enamel apel khas Malang",
    description:
      "Pin enamel keras dengan warna terakota dan krem. Belakangnya ada peniti kupu-kupu yang aman dipakai di tas atau topi.",
    image: null,
    gallery: [],
    variantOptions: [{ name: "Warna", values: ["Terakota", "Krem"] }],
    variants: [
      { options: ["Terakota"], stock: 18 },
      { options: ["Krem"], stock: 9 },
    ],
    badge: "bestseller",
    story: null,
    rating: 4.8,
    reviewCount: 63,
    soldCount: 540,
    createdAt: "2024-12-15",
    shopeeUrl: "https://shopee.co.id/sesuatu-darikota-malang",
  },
  {
    id: "kaos-heritage-kayutangan",
    name: "Kaos Heritage Kayutangan",
    categoryId: "apparel",
    price: 89000,
    creatorId: "rara-kamila",
    shortDesc: "Kaos katun sablon manual motif ubin",
    description:
      "Kaos katun combed 24s, sablon manual plastisol motif ornamen ubin era kolonial. Tersedia dua motif (Ubin & Sulur) dan empat ukuran. Sablon satu-satu, jadi tiap kaos punya sedikit perbedaan yang bikin unik.",
    image: null,
    gallery: [],
    variantOptions: [
      { name: "Motif", values: ["Ubin", "Sulur"] },
      { name: "Ukuran", values: ["S", "M", "L", "XL"] },
    ],
    variants: [
      { options: ["Ubin", "S"], stock: 4 },
      { options: ["Ubin", "M"], stock: 8 },
      { options: ["Ubin", "L"], stock: 3 },
      { options: ["Ubin", "XL"], stock: 2 },
      { options: ["Sulur", "S"], stock: 3 },
      { options: ["Sulur", "M"], stock: 6 },
      { options: ["Sulur", "L"], stock: 2 },
      { options: ["Sulur", "XL"], stock: 1 },
    ],
    badge: "limited",
    story: {
      title: "Dari Ubin yang Nyaris Hilang",
      body: "Motif kaos ini diambil dari ubin lantai sebuah toko tua yang mau direnovasi. Rara sempat memotret dan menyalin ornamennya sebelum ubinnya dibongkar.",
      process: "Pemotretan ubin → redrawing ornamen → film sablon → cetak manual.",
    },
    rating: 4.9,
    reviewCount: 38,
    soldCount: 211,
    createdAt: "2025-01-10",
    shopeeUrl: "https://shopee.co.id/sesuatu-darikota-malang",
  },
  {
    id: "gantungan-kayu-daun",
    name: "Gantungan Kunci Kayu Daun",
    categoryId: "kriya-kayu",
    price: 28000,
    creatorId: "pak-tarjo",
    shortDesc: "Gantungan kunci kayu jati motif daun",
    description:
      "Dipotong dari kayu jati sisa, dipoles halus, lalu diukir motif daun sederhana. Tiap potong diberi inisial Pak Tarjo di belakang.",
    image: null,
    gallery: [],
    variantOptions: [{ name: "Motif", values: ["Daun Jati", "Daun Sirih", "Polos"] }],
    variants: [
      { options: ["Daun Jati"], stock: 20 },
      { options: ["Daun Sirih"], stock: 14 },
      { options: ["Polos"], stock: 25 },
    ],
    badge: "story",
    story: {
      title: "Sisa Kayu Jadi Hiasan",
      body: "Pak Tarjo ngumpulin sisa kayu dari proyek mebel besar. 'Sayang dibuang, masih bisa jadi sesuatu,' ujarnya sambil ngukir.",
      process: "Pemotongan → amplas halus → ukir tangan → pelitur.",
    },
    rating: 5.0,
    reviewCount: 29,
    soldCount: 178,
    createdAt: "2024-10-20",
    shopeeUrl: "https://shopee.co.id/sesuatu-darikota-malang",
  },
  {
    id: "tote-bag-kayutangan",
    name: "Tote Bag Kayutangan Heritage",
    categoryId: "tote-bag",
    price: 69000,
    creatorId: "nina-hartanto",
    shortDesc: "Tote kanvas sablon blok kayu",
    description:
      "Tote bag kanvas tebal 10oz, disablon pakai blok kayu motif ornamen. Sablon blok kayu bikin motifnya sedikit organik, nggak terlalu sempurna — itulah pesona manual.",
    image: null,
    gallery: [],
    variantOptions: [{ name: "Motif", values: ["Ubin", "Sulur"] }],
    variants: [
      { options: ["Ubin"], stock: 10 },
      { options: ["Sulur"], stock: 8 },
    ],
    badge: "story",
    story: {
      title: "Sablon Blok Kayu Pertama",
      body: "Nina belajar sablon blok kayu dari ibunya. Tote bag ini motif pertama yang berhasil rapi — meski masih ada titik-titik tak sengaja yang malah jadi pesona.",
      process: "Ukir blok kayu → campur tinta → cap manual ke kanvas → kering angin.",
    },
    rating: 4.7,
    reviewCount: 52,
    soldCount: 388,
    createdAt: "2024-12-01",
    shopeeUrl: "https://shopee.co.id/sesuatu-darikota-malang",
  },
  {
    id: "stiker-pack-ornamen",
    name: "Stiker Pack Ornamen Malang",
    categoryId: "stiker",
    price: 25000,
    creatorId: "yoga-mahendra",
    shortDesc: "Set 8 stiker vinyl ornamen jadul",
    description:
      "Pack berisi 8 lembar stiker vinyl waterproof dengan ornamen terinspirasi dari gerbang dan jendela tua Malang. Tahan air, cocok buat nge-decor laptop atau botol minum.",
    image: null,
    gallery: [],
    variantOptions: [{ name: "Pack", values: ["Ornamen", "Huruf"] }],
    variants: [
      { options: ["Ornamen"], stock: 30 },
      { options: ["Huruf"], stock: 22 },
    ],
    badge: "story",
    story: {
      title: "Ornamen dari Gang Sempit",
      body: "Yoga jalan sore di gang sempit belakang Kayutangan, nemu ornamen gerbang tua yang nyaris dilupain orang. Ia foto, ubah jadi stiker, supaya ornamen itu bisa dibawa pulang banyak orang.",
      process: "Foto ornamen → vektorisasi digital → cutting vinyl waterproof.",
    },
    rating: 4.8,
    reviewCount: 41,
    soldCount: 295,
    createdAt: "2025-01-22",
    shopeeUrl: "https://shopee.co.id/sesuatu-darikota-malang",
  },
  {
    id: "zine-sudut-kota",
    name: "Zine 'Sudut Kota'",
    categoryId: "zine",
    price: 45000,
    creatorId: "dini-aulia",
    shortDesc: "Zine 24 halaman sketsa sudut Malang",
    description:
      "Zine berisi 24 halaman sketsa tangan sudut-sudut Malang: gang sempit, warung, sampai atap genteng. Dicetak hitam-putih di kertas krem dengan cover warna.",
    image: null,
    gallery: [],
    variantOptions: [{ name: "Cover", values: ["Terakota", "Krem"] }],
    variants: [
      { options: ["Terakota"], stock: 15 },
      { options: ["Krem"], stock: 9 },
    ],
    badge: "limited",
    story: {
      title: "Berjalan, Berhenti, Menggambar",
      body: "Zine ini dibikin selama dua bulan Dini keliling Malang pagi-pagi. Tiap sudut yang bikin dia berhenti, dia sketsa di tempat.",
      process: "Sketsa di lokasi → ink → scan → layout → cetak risograph.",
    },
    rating: 4.9,
    reviewCount: 23,
    soldCount: 134,
    createdAt: "2025-02-05",
    shopeeUrl: "https://shopee.co.id/sesuatu-darikota-malang",
  },
  {
    id: "mug-keramik-tangan",
    name: "Mug Keramik Glazur Madu",
    categoryId: "keramik",
    price: 79000,
    creatorId: "rara-kamila",
    shortDesc: "Mug tanah liat glazur warna madu",
    description:
      "Mug tanah liat dibentuk tangan dengan glazur warna madu hangat. Setiap mug punya bentuk sedikit berbeda karena buatan manual, bukan cetakan massal.",
    image: null,
    gallery: [],
    variantOptions: [{ name: "Glazur", values: ["Madu", "Terakota"] }],
    variants: [
      { options: ["Madu"], stock: 8 },
      { options: ["Terakota"], stock: 6 },
    ],
    badge: "story",
    story: {
      title: "Dari Tanah yang Dipijat",
      body: "Rara belajar keramik dari seorang tetangga tua. 'Tanah itu mau diajak ngobrol,' kata sang tetangga. Sekarang Rara ngobrol sama tanah tiap akhir pekan.",
      process: "Pijit tanah liat → bentuk → kering → glazur → bakar tungku.",
    },
    rating: 4.8,
    reviewCount: 19,
    soldCount: 96,
    createdAt: "2025-01-28",
    shopeeUrl: "https://shopee.co.id/sesuatu-darikota-malang",
  },
  {
    id: "pin-enamel-toko-oen",
    name: "Pin Enamel Toko Oen",
    categoryId: "pin-enamel",
    price: 38000,
    creatorId: "bagas-pratama",
    shortDesc: "Pin enamel ikonik Toko Oen",
    description:
      "Pin enamel bertema bangunan ikonik Toko Oen, restoran tua legendaris Malang. Warna krem dan hijau tua, ada logo kecil di belakang.",
    image: null,
    gallery: [],
    variantOptions: [{ name: "Warna", values: ["Krem", "Hijau"] }],
    variants: [
      { options: ["Krem"], stock: 14 },
      { options: ["Hijau"], stock: 7 },
    ],
    badge: "story",
    story: {
      title: "Toko Oen yang Masih Ramai",
      body: "Bagas bikin pin ini dari memori sore di Toko Oen — suara sendok piring, tawa, dan kipas langit-langit yang berputar. 'Tokonya tua, tapi orangnya nggak pernah berhenti datang,' katanya.",
      process: "Foto bangunan → sketsa digital → pewarnaan → cetak enamel.",
    },
    rating: 4.9,
    reviewCount: 55,
    soldCount: 402,
    createdAt: "2024-11-18",
    shopeeUrl: "https://shopee.co.id/sesuatu-darikota-malang",
  },
  {
    id: "kaos-ubin-klojen",
    name: "Kaos Ubin Klojen",
    categoryId: "apparel",
    price: 95000,
    creatorId: "rara-kamila",
    shortDesc: "Kaos sablon motif ubin Klojen",
    description:
      "Kaos katun premium sablon manual motif ubin dari kawasan Klojen. Warnanya pudar lembut, seperti sudah dipakai bertahun-tahun.",
    image: null,
    gallery: [],
    variantOptions: [{ name: "Ukuran", values: ["S", "M", "L"] }],
    variants: [
      { options: ["S"], stock: 4 },
      { options: ["M"], stock: 9 },
      { options: ["L"], stock: 6 },
    ],
    badge: null,
    story: null,
    rating: 4.7,
    reviewCount: 31,
    soldCount: 187,
    createdAt: "2024-09-30",
    shopeeUrl: "https://shopee.co.id/sesuatu-darikota-malang",
  },
  {
    id: "coaster-kayu-set",
    name: "Coaster Kayu Set 4",
    categoryId: "kriya-kayu",
    price: 52000,
    creatorId: "pak-tarjo",
    shortDesc: "Set 4 coaster kayu jati",
    description:
      "Set 4 coaster kayu jati dengan motif yang berbeda-beda. Dipoles halus dan dilapiri pelitur makanan aman. Cocok buat meja tamu atau hadiah.",
    image: null,
    gallery: [],
    variantOptions: [{ name: "Motif", values: ["Geometris", "Daun"] }],
    variants: [
      { options: ["Geometris"], stock: 11 },
      { options: ["Daun"], stock: 7 },
    ],
    badge: null,
    story: null,
    rating: 4.9,
    reviewCount: 24,
    soldCount: 143,
    createdAt: "2024-12-22",
    shopeeUrl: "https://shopee.co.id/sesuatu-darikota-malang",
  },
  {
    id: "tote-bag-sulur",
    name: "Tote Bag Sulur",
    categoryId: "tote-bag",
    price: 72000,
    creatorId: "nina-hartanto",
    shortDesc: "Tote kanvas motif sulur tanaman",
    description:
      "Tote bag kanvas dengan motif sulur tanaman yang dirajut tangan lalu disablon. Muat laptop 13 inci dan buku-buku tebal.",
    image: null,
    gallery: [],
    variantOptions: [{ name: "Warna", values: ["Hijau", "Terakota"] }],
    variants: [
      { options: ["Hijau"], stock: 9 },
      { options: ["Terakota"], stock: 5 },
    ],
    badge: "limited",
    story: null,
    rating: 4.8,
    reviewCount: 27,
    soldCount: 156,
    createdAt: "2025-02-12",
    shopeeUrl: "https://shopee.co.id/sesuatu-darikota-malang",
  },
];

export const productMap: Record<string, Product> = Object.fromEntries(
  products.map((p) => [p.id, p]),
);

export function productsByCreator(creatorId: string) {
  return products.filter((p) => p.creatorId === creatorId);
}

export function productsByCategory(categoryId: string) {
  return products.filter((p) => p.categoryId === categoryId);
}

export function relatedProducts(product: Product, limit = 4) {
  return products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, limit);
}

/* ------------------------------------------------------------------ */
/* Variant helpers (multi-axis, Shopify-style)                        */
/* ------------------------------------------------------------------ */

/** Total stock across all combinations. */
export function totalStock(product: Product): number {
  return product.variants.reduce((sum, v) => sum + v.stock, 0);
}

/** Any combination below threshold? */
export function isLowStock(product: Product, threshold = 6): boolean {
  return product.variants.some((v) => v.stock < threshold);
}

/** List of combinations below threshold. */
export function lowStockVariants(product: Product, threshold = 6): Variant[] {
  return product.variants.filter((v) => v.stock < threshold);
}

/**
 * Given a selection (one value per axis, or null = not chosen), find the
 * matching variant. Returns undefined if no complete/valid match.
 */
export function findVariant(
  product: Product,
  selected: (string | null)[],
): Variant | undefined {
  if (product.variantOptions.length === 0) return product.variants[0];
  if (selected.length !== product.variantOptions.length) return undefined;
  if (selected.some((s) => s === null || s === undefined || s === "")) {
    return undefined;
  }
  return product.variants.find((v) =>
    v.options.every((val, i) => val === selected[i]),
  );
}

/** Compact label for a combination, e.g. "Ubin / M". */
export function comboLabel(values: string[]): string {
  return values.join(" / ");
}

/** Full descriptive label, e.g. "Motif: Ubin, Ukuran: M". */
export function describeVariant(product: Product, variant?: Variant): string {
  if (!variant) return "—";
  if (product.variantOptions.length === 0) return "Standar";
  return product.variantOptions
    .map((o, i) => `${o.name}: ${variant.options[i] ?? "—"}`)
    .join(", ");
}

/** Greedy default selection: first available value per axis (always valid). */
export function defaultSelection(product: Product): (string | null)[] {
  const opts = product.variantOptions;
  const sel: (string | null)[] = opts.map(() => null);
  const available = (i: number, val: string, cur: (string | null)[]) =>
    product.variants.some(
      (v) =>
        v.options[i] === val &&
        cur.every((s, j) => s === null || v.options[j] === s),
    );
  for (let i = 0; i < opts.length; i++) {
    for (const val of opts[i].values) {
      if (available(i, val, sel)) {
        sel[i] = val;
        break;
      }
    }
  }
  return sel;
}

/** Is `value` choosable on axis `optionIndex` given current selection? */
export function isValueAvailable(
  product: Product,
  optionIndex: number,
  value: string,
  selected: (string | null)[],
): boolean {
  return product.variants.some(
    (v) =>
      v.options[optionIndex] === value &&
      selected.every(
        (s, j) => s === null || j === optionIndex || v.options[j] === s,
      ),
  );
}

/**
 * Apply a choice on axis `i` and greedily re-derive subsequent axes so the
 * selection always resolves to a valid combination.
 */
export function selectOption(
  product: Product,
  selected: (string | null)[],
  i: number,
  value: string,
): (string | null)[] {
  const opts = product.variantOptions;
  const next = [...selected];
  next[i] = value;
  for (let j = i + 1; j < opts.length; j++) {
    next[j] = null;
    const found = opts[j].values.find((v) =>
      isValueAvailable(product, j, v, next),
    );
    next[j] = found ?? null;
  }
  return next;
}

/** Cartesian product helper for the admin matrix builder. */
export function cartesian(values: string[][]): string[][] {
  if (values.length === 0) return [[]];
  return values.reduce<string[][]>(
    (acc, curr) =>
      acc.flatMap((row) => curr.map((v) => [...row, v])),
    [[]],
  );
}
