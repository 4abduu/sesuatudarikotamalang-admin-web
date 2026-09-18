"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import type { Product } from "@/data/products";
import {
  ProductFormFields,
  type ProductFormInitialValues,
} from "../../product-form-fields";

export function ProductForm({
  product,
  mode,
}: {
  product: Product;
  mode: "edit";
}) {
  // `mode` is reserved for future branches (e.g. "view"). Currently only "edit".
  void mode;

  const initialValues: ProductFormInitialValues = {
    name: product.name,
    categoryId: product.categoryId,
    price: String(product.price),
    shortDesc: product.shortDesc,
    description: product.description,
    limited: product.badge === "limited",
    singleStock:
      product.variantOptions.length === 0
        ? String(product.variants[0]?.stock ?? "")
        : "",
    variantOptions: product.variantOptions.map((o) => ({
      name: o.name,
      valuesText: o.values.join(", "),
    })),
    variantStocks: Object.fromEntries(
      product.variants.map((v) => [v.options.join(" / "), String(v.stock)]),
    ),
    hasStory: !!product.story,
    story: {
      title: product.story?.title ?? "",
      body: product.story?.body ?? "",
      process: product.story?.process ?? "",
    },
  };

  return (
    <div>
      <Link
        href="/admin/produk"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke daftar produk
      </Link>
      <AdminPageHeader
        title={`Edit: ${product.name}`}
        description="Ubah detail produk dan simpan."
      />
      <ProductFormFields
        initialValues={initialValues}
        submitLabel="Simpan Perubahan"
        onSubmit={() => toast.success("Perubahan disimpan (dummy)")}
      />
    </div>
  );
}
