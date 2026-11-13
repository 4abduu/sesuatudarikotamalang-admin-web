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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ProductActionReasonDialog } from "@/app/(dashboard)/produk/components/ProductActionReasonDialog";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiError } from "@/lib/api";
import { Product } from "@/lib/types";
import {
  ProductFormFields,
  type ProductFormInitialValues,
  type ProductFormExtras,
} from "@/app/(dashboard)/produk/components/product-form-fields";
import {
  photoListsEqual,
  syncPhotos,
  rollbackUploads,
  type PhotoSyncResult,
} from "@/app/(dashboard)/produk/components/photo-manager";

/* ─────────────────────────────────────────────────────────────────────── *
 *  ProductEditContent — fetch produk dari API lalu tampilkan form edit
 * ─────────────────────────────────────────────────────────────────────── */
export function ProductEditContent({
  productId,
  from,
}: {
  productId: string;
  from?: string;
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ product: Product }>(`/api/admin/products/${productId}`);
      if (!res.product) {
        setError("Produk tidak ditemukan");
      } else {
        setProduct(res.product);
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
              <Link href={from === "persetujuan" ? "/produk/persetujuan" : "/produk"}>
                {from === "persetujuan" ? "Kembali ke Persetujuan" : "Kembali ke Daftar"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <ProductEditForm product={product} from={from} onReload={fetchProduct} />;
}

/* ─────────────────────────────────────────────────────────────────────── *
 *  ProductEditForm — form edit terhubung ke PUT /api/products/:id
 * ─────────────────────────────────────────────────────────────────────── */
function ProductEditForm({
  product,
  from,
  onReload,
}: {
  product: Product;
  from?: string;
  onReload: () => Promise<void>;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectedPhotoIds, setRejectedPhotoIds] = useState<Set<string>>(new Set());

  const backHref = from === "persetujuan" ? "/produk/persetujuan" : "/produk";

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

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
    initialImageVariants: product.imageVariants ?? [],
    existingProcessImages: product.story?.processImages ?? [],
  };

  /**
   * Logika penyimpanan utama.
   * Mengembalikan boolean true jika sukses, false jika gagal.
   */
  const executeSave = async (
    values: ProductFormInitialValues,
    extras?: ProductFormExtras
  ): Promise<boolean> => {
    const photoItems = extras?.photoItems ?? [];
    const initialPhotoItems = extras?.initialPhotoItems ?? [];
    const processItems = extras?.processItems ?? [];
    const initialProcessItems = extras?.initialProcessItems ?? [];

    if (photoItems.length === 0) {
      toast.error("Produk harus punya minimal satu foto");
      return false;
    }
    if (photoItems.length > 10) {
      toast.error("Foto produk maksimal 10");
      return false;
    }
    if (values.hasStory && processItems.length > 10) {
      toast.error("Foto proses cerita maksimal 10");
      return false;
    }

    const photosChanged = !photoListsEqual(photoItems, initialPhotoItems);
    const processChanged = !photoListsEqual(processItems, initialProcessItems);

    setSubmitting(true);
    let syncProduct: PhotoSyncResult | null = null;
    if (photosChanged) {
      try {
        syncProduct = await syncPhotos(photoItems);
        setRejectedPhotoIds(new Set());
      } catch (err) {
        setSubmitting(false);
        if (err instanceof ApiError && err.code === "IMAGE_REJECTED") {
          const rejectedIdxs = (err.data as { rejectedIndexes?: number[] })?.rejectedIndexes ?? [];
          const freshItems = photoItems.filter((i) => !!i.file);
          const rejected = new Set<string>();
          rejectedIdxs.forEach((idx) => {
            if (freshItems[idx]) rejected.add(freshItems[idx].id);
          });
          setRejectedPhotoIds(rejected);
          toast.error("Ada foto yang tidak pantas. Hapus foto bertanda merah lalu coba lagi.");
          return false;
        }
        if (err instanceof ApiError && err.status === 503) {
          toast.error("Pemeriksaan foto sedang tidak tersedia. Coba lagi nanti.");
          return false;
        }
        toast.error(err instanceof ApiError ? err.message : "Foto gagal diunggah. Coba lagi.");
        return false;
      }
    }

    try {
      // PUT /api/products/:id — hanya field yang didukung kontrak
      const variantStocksPayload = product.variants
        ?.map((v) => {
          const key = v.combination.join(" / ") || "(default)";
          const stockStr = values.variantStocks[key];
          return { id: v.id, stock: Number(stockStr ?? 0) };
        })
        .filter((v) => !isNaN(v.stock));

      const putBody: Record<string, any> = {
        name: values.name.trim(),
        categoryId: values.categoryId,
        price: Number(values.price),
        shortDescription: values.shortDesc.trim() || undefined,
        description: values.description.trim() || undefined,
        isLimited: values.limited,
        shopeeUrl: values.shopeeUrl?.trim() || undefined,
        variantStocks: variantStocksPayload,
      };

      if (photosChanged && syncProduct) {
        putBody.images = syncProduct.images;
        putBody.imageVariants = syncProduct.imageVariants;
      }

      await apiFetch(`/api/products/${product.id}`, {
        method: "PUT",
        body: JSON.stringify(putBody),
      });
    } catch (err) {
      if (syncProduct) {
        await rollbackUploads(syncProduct.newlyUploaded);
      }
      setSubmitting(false);
      const msg = err instanceof ApiError ? err.message : "Gagal menyimpan produk";
      toast.error("Gagal menyimpan", { description: msg });
      return false;
    }

    // Simpan cerita (POST /api/products/:id/story) jika aktif
    if (values.hasStory && values.story.title && values.story.body) {
      let syncStory: PhotoSyncResult | null = null;
      if (processChanged && processItems.length > 0) {
        try {
          syncStory = await syncPhotos(processItems);
        } catch (err) {
          toast.warning("Produk tersimpan, tetapi foto proses gagal diunggah", {
            description: err instanceof ApiError ? err.message : "Coba simpan ulang cerita.",
          });
          setIsDirty(false);
          setSubmitting(false);
          return true;
        }
      }

      try {
        const storyBody: Record<string, any> = {
          title: values.story.title.trim(),
          content: values.story.body.trim(),
          process: values.story.process?.trim() || undefined,
        };
        if (processChanged) {
          storyBody.processImages = syncStory ? syncStory.images : [];
        }

        await apiFetch(`/api/products/${product.id}/story`, {
          method: "POST",
          body: JSON.stringify(storyBody),
        });
      } catch (err) {
        if (syncStory) {
          await rollbackUploads(syncStory.newlyUploaded);
        }
        toast.warning("Produk tersimpan, tetapi cerita gagal disimpan", {
          description: err instanceof ApiError ? err.message : "Silakan cek kembali cerita di produk ini.",
        });
        setIsDirty(false);
        setSubmitting(false);
        return true;
      }
    }

    setIsDirty(false);
    setSubmitting(false);
    return true;
  };

  const handleRegularSubmit = async (
    values: ProductFormInitialValues,
    extras?: ProductFormExtras,
  ) => {
    const ok = await executeSave(values, extras);
    if (ok) {
      toast.success("Produk berhasil diperbarui", {
        description: `${values.name} telah disimpan.`,
      });
      if (from === "persetujuan") {
        await onReload();
      } else {
        router.push("/produk");
      }
    }
  };

  const handleApproveOnly = async () => {
    if (!product.images || product.images.length === 0) {
      toast.error("Minimal 1 foto produk");
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch<{ message?: string }>(`/api/admin/products/${product.id}/approve`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      toast.success(res.message || "Produk disetujui");
      router.push(backHref);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal menyetujui produk");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAndApprove = async (
    values: ProductFormInitialValues,
    extras?: ProductFormExtras
  ) => {
    const saveOk = await executeSave(values, extras);
    if (!saveOk) return;

    setSubmitting(true);
    try {
      const res = await apiFetch<{ message?: string }>(`/api/admin/products/${product.id}/approve`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      toast.success(res.message || "Produk berhasil disimpan dan disetujui");
      router.push(backHref);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Gagal menyetujui";
      toast.error(`Perubahan tersimpan, tetapi persetujuan gagal: ${msg}`);
      await onReload();
    } finally {
      setSubmitting(false);
    }
  };

  const approvalStatus = product.approvalStatus ?? "disetujui";
  const approvalProps = {
    status: approvalStatus,
    onApprove: handleApproveOnly,
    onSaveAndApprove: handleSaveAndApprove,
    onReject: () => setRejectOpen(true),
    busy: submitting,
    backHref,
  };

  return (
    <div>
      <Link
        href={backHref}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {from === "persetujuan" ? "Kembali ke persetujuan produk" : "Kembali ke daftar produk"}
      </Link>

      {/* Banner status */}
      {approvalStatus === "menunggu" && (
        <Alert className="mb-6 border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="font-semibold">Pengajuan menunggu persetujuan</AlertTitle>
          <AlertDescription className="text-sm mt-1">
            Kreator: <strong>{product.artisan?.brandName || "Kreator"}</strong>
            {product.replacesProduct && (
              <span className="block mt-0.5">
                Pengganti dari produk: <strong>{product.replacesProduct.name}</strong>
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {approvalStatus === "ditolak" && (
        <Alert className="mb-6 border-destructive/30 bg-destructive/10 text-destructive">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertTitle className="font-semibold">Produk ini telah ditolak</AlertTitle>
          <AlertDescription className="text-sm mt-1">
            {product.statusNote ? `Alasan penolakan: ${product.statusNote}` : "Produk tidak memenuhi syarat kurasi."}
          </AlertDescription>
        </Alert>
      )}

      <AdminPageHeader
        title={`Edit: ${product.name}`}
        description="Ubah detail produk dan simpan."
      />
      <ProductFormFields
        initialValues={initialValues}
        submitLabel={submitting ? "Menyimpan…" : "Simpan Perubahan"}
        submitting={submitting}
        onSubmit={handleRegularSubmit}
        mode="edit"
        approval={approvalProps}
        rejectedPhotoIds={rejectedPhotoIds}
      />

      <ProductActionReasonDialog
        open={rejectOpen}
        mode="reject"
        productId={product.id}
        productName={product.name}
        onClose={() => setRejectOpen(false)}
        onDone={() => {
          setRejectOpen(false);
          router.push(backHref);
        }}
      />
    </div>
  );
}
