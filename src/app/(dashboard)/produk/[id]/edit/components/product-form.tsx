"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/app/(dashboard)/components/admin-ui";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiError } from "@/lib/api";
import { Product } from "@/lib/types";
import {
  ProductFormFields,
  type ProductFormInitialValues,
} from "@/app/(dashboard)/produk/components/product-form-fields";

/* ─────────────────────────────────────────────────────────────────────── *
 *  ProductEditContent — fetch produk dari API lalu tampilkan form edit
 * ─────────────────────────────────────────────────────────────────────── */
export function ProductEditContent({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Admin bisa akses produk nonaktif via GET /api/admin/products,
      // tapi GET /api/products/:id hanya mengembalikan produk aktif.
      // Kita gunakan /api/admin/products lalu filter by id.
      const res = await apiFetch<{ products: Product[] }>("/api/admin/products");
      const found = res.products.find((p) => String(p.id) === String(productId));
      if (!found) {
        setError("Produk tidak ditemukan");
      } else {
        setProduct(found);
      }
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Gagal memuat data produk"
      );
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  if (loading) {
    return (
      <div className="grid min-h-[400px] place-items-center rounded-xl border border-border bg-card p-12">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Memuat data produk…</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="grid min-h-[300px] place-items-center rounded-xl border border-destructive/30 bg-destructive/5 p-12 text-center">
        <div className="flex flex-col items-center gap-4 max-w-md">
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <div>
            <h3 className="text-base font-bold text-foreground">
              Gagal Memuat Produk
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {error ?? "Produk tidak ditemukan"}
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={fetchProduct} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Coba Lagi
            </Button>
            <Button asChild variant="ghost">
              <Link href="/produk">Kembali ke Daftar</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <ProductEditForm product={product} />;
}

/* ─────────────────────────────────────────────────────────────────────── *
 *  ProductEditForm — form edit terhubung ke PUT /api/products/:id
 * ─────────────────────────────────────────────────────────────────────── */
function ProductEditForm({ product }: { product: Product }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Petakan data API → format yang dipakai ProductFormFields
  const initialValues: ProductFormInitialValues = {
    name: product.name,
    categoryId: String(product.categoryId),
    price: String(product.price),
    shortDesc: product.shortDescription ?? "",
    description: product.description ?? "",
    limited: product.isLimited,
    shopeeUrl: product.shopeeUrl ?? "",
    // Produk tanpa varian: 1 varian dengan combination []
    singleStock:
      !product.variants || product.variants.length === 0
        ? ""
        : product.variants.length === 1 &&
          product.variants[0].combination.length === 0
        ? String(product.variants[0].stock)
        : "",
    variantOptions: product.variantOptions
      ? product.variantOptions.map((o) => ({
          name: o.name,
          valuesText: o.values.join(", "),
        }))
      : [],
    variantStocks: product.variants
      ? Object.fromEntries(
          product.variants.map((v) => [
            v.combination.join(" / ") || "(default)",
            String(v.stock),
          ])
        )
      : {},
    // variantIds untuk dikirim saat PUT (stok per variantId)
    variantIds: product.variants
      ? Object.fromEntries(
          product.variants.map((v) => [
            v.combination.join(" / ") || "(default)",
            String(v.id),
          ])
        )
      : {},
    hasStory: !!product.story,
    story: {
      title: product.story?.title ?? "",
      body: product.story?.content ?? "",
      process: "",
    },
    existingImages: product.images ?? [],
  };

  const handleSubmit = async (values: ProductFormInitialValues) => {
    setSubmitting(true);
    try {
      // PUT /api/products/:id — hanya field yang didukung kontrak
      // (variantOptions tidak bisa diubah, hanya stok per variant via variantStocks[{id,stock}])
      const variantStocksPayload = product.variants
        ?.map((v) => {
          const key = v.combination.join(" / ") || "(default)";
          const stockStr = values.variantStocks[key];
          return { id: v.id, stock: Number(stockStr ?? 0) };
        })
        .filter((v) => !isNaN(v.stock));

      await apiFetch(`/api/products/${product.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: values.name.trim(),
          categoryId: values.categoryId,
          price: Number(values.price),
          shortDescription: values.shortDesc.trim() || undefined,
          description: values.description.trim() || undefined,
          isLimited: values.limited,
          shopeeUrl: values.shopeeUrl?.trim() || undefined,
          variantStocks: variantStocksPayload,
        }),
      });

      // Simpan cerita (POST /api/products/:id/story) jika aktif
      if (values.hasStory && values.story.title && values.story.body) {
        await apiFetch(`/api/products/${product.id}/story`, {
          method: "POST",
          body: JSON.stringify({
            title: values.story.title.trim(),
            content: values.story.body.trim(),
            process: values.story.process?.trim() || undefined,
          }),
        });
      }

      toast.success("Produk berhasil diperbarui", {
        description: `${values.name} telah disimpan.`,
      });
      router.push("/produk");
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Gagal menyimpan produk";
      toast.error("Gagal menyimpan", { description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Link
        href="/produk"
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
        submitLabel={submitting ? "Menyimpan…" : "Simpan Perubahan"}
        submitting={submitting}
        onSubmit={handleSubmit}
        mode="edit"
      />
    </div>
  );
}
