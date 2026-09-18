export type Category = {
  id: string;
  name: string;
  blurb: string;
  /** lucide icon name handled in component */
  icon: string;
};

export const categories: Category[] = [
  { id: "postcard", name: "Postcard", blurb: "Kartu pos ilustrasi tangan", icon: "mail" },
  { id: "pin-enamel", name: "Pin Enamel", blurb: "Pin kecil bertema lokal", icon: "circle-dot" },
  { id: "apparel", name: "Apparel", blurb: "Kaos & kaos tangan", icon: "shirt" },
  { id: "stiker", name: "Stiker", blurb: "Stiker vinyl ornamen", icon: "sticker" },
  { id: "kriya-kayu", name: "Kriya Kayu", blurb: "Gantungan & hiasan kayu", icon: "tree-pine" },
  { id: "tote-bag", name: "Tote Bag", blurb: "Tas kanvas hasil sablon", icon: "shopping-bag" },
  { id: "keramik", name: "Keramik", blurb: "Mug & pinjtan tanah liat", icon: "coffee" },
  { id: "zine", name: "Zine", blurb: "Buku kecil cerita kota", icon: "book-open" },
];

export const categoryMap: Record<string, Category> = Object.fromEntries(
  categories.map((c) => [c.id, c]),
);
