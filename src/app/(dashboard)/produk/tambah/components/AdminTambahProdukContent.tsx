"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, BadgeCheck, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/app/(dashboard)/components/admin-ui";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiFetch, ApiError } from "@/lib/api";
import {
  ProductFormFields,
  emptyInitialValues,
  type ProductFormExtras,
  type ProductFormInitialValues,
} from "@/app/(dashboard)/produk/components/product-form-fields";
import {
  syncPhotos,
  rollbackUploads,
  type PhotoSyncResult,
} from "@/app/(dashboard)/produk/components/photo-manager";

/** Penjual yang bisa dipilih admin: Official Store atau kreator aktif (GET /api/admin/artisans?status=aktif). */
type Seller = {
  id: string;
  brandName: string;
  isOfficial: boolean;
  status: string;
};

function cartesian(arrays: string[][]): string[][] {
  return arrays.reduce<string[][]>((acc, curr) => acc.flatMap((a) => curr.map((b) => [...a, b])), [[]]);
}

/**
 * Halaman Tambah Produk (admin), terhubung ke API:
 *  1. pilih penjual ("Dijual atas nama", default Official Store)
 *  2. unggah foto -> POST /api/upload/multiple
 *  3. POST /api/products
 *  4. cerita (opsional) -> POST /api/products/:id/story
 */
export function AdminTambahProdukContent() {
  const router = useRouter();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [sellerId, setSellerId] = useState<string>("");
  const [loadingSellers, setLoadingSellers] = useState(true);
  const [sellerError, setSellerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [rejectedPhotoIds, setRejectedPhotoIds] = useState<Set<string>>(new Set());

  const loadSellers = useCallback(async () => {
    setLoadingSellers(true);
    setSellerError(null);
    try {
      const res = await apiFetch<{ artisans: Seller[] }>("/api/admin/artisans?status=aktif");
      const list = res.artisans || [];
      setSellers(list);
      // Default: Official Store bila ada.
      const official = list.find((s) => s.isOfficial);
      setSellerId((current) => current || official?.id || "");
    } catch (err) {
      setSellerError(err instanceof ApiError ? err.message : "Gagal memuat daftar penjual");
    } finally {
      setLoadingSellers(false);
    }
  }, []);

  useEffect(() => {
    void loadSellers();
  }, [loadSellers]);

  const hasOfficial = sellers.some((s) => s.isOfficial);

  const handleSubmit = async (values: ProductFormInitialValues, extras?: ProductFormExtras) => {
    if (submitting) return;

    // ---- Validasi sebelum menyentuh jaringan ----
    if (!sellerId) {
      toast.error("Pilih penjual dulu", { description: 'Isi "Dijual atas nama" sebelum menyimpan.' });
      return;
    }
    if (!values.categoryId) {
      toast.error("Kategori wajib dipilih");
      return;
    }
    if (!values.description.trim()) {
      toast.error("Deskripsi wajib diisi");
      return;
    }
    const photoItems = extras?.photoItems ?? [];
    if (photoItems.length === 0) {
      toast.error("Produk harus punya minimal satu foto");
      return;
    }
    if (photoItems.length > 10) {
      toast.error("Foto produk maksimal 10");
      return;
    }

    const processItems = extras?.processItems ?? [];
    if (values.hasStory && processItems.length > 10) {
      toast.error("Foto proses cerita maksimal 10");
      return;
    }

    const parsedOptions = values.variantOptions.map((o) => ({
      name: o.name.trim(),
      values: o.valuesText.split(",").map((v) => v.trim()).filter(Boolean),
    }));
    const hasOptions = parsedOptions.length > 0;
    if (hasOptions && !parsedOptions.every((o) => o.name && o.values.length > 0)) {
      toast.error("Lengkapi nama dan nilai pada setiap opsi varian");
      return;
    }

    const combos = hasOptions ? cartesian(parsedOptions.map((o) => o.values)) : [];
    const variantStocks = combos.map((combination) => ({
      combination,
      stock: Number(values.variantStocks[combination.join(" / ")] || 0),
    }));
    const singleStock = Number(values.singleStock || 0);
    const stocks = hasOptions ? variantStocks.map((v) => v.stock) : [singleStock];
    if (stocks.some((n) => !Number.isInteger(n) || n < 0)) {
      toast.error("Stok harus berupa angka bulat 0 atau lebih");
      return;
    }

    setSubmitting(true);
    let syncProduct: PhotoSyncResult;
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
        return;
      }
      if (err instanceof ApiError && err.status === 503) {
        toast.error("Pemeriksaan foto sedang tidak tersedia. Coba lagi nanti.");
        return;
      }
      toast.error(err instanceof ApiError ? err.message : "Foto gagal diunggah. Coba lagi.");
      return;
    }

    let createdId: string | null = null;
    try {
      const created = await apiFetch<{ product: { id: string } }>("/api/products", {
        method: "POST",
        body: JSON.stringify({
          name: values.name.trim(),
          categoryId: values.categoryId,
          description: values.description.trim(),
          shortDescription: values.shortDesc.trim() || undefined,
          price: Number(values.price),
          images: syncProduct.images,
          ...(syncProduct.imageVariants.length > 0 ? { imageVariants: syncProduct.imageVariants } : {}),
          isLimited: values.limited,
          shopeeUrl: values.shopeeUrl?.trim() || undefined,
          artisanId: sellerId,
          ...(hasOptions ? { variantOptions: parsedOptions, variantStocks } : { stock: singleStock }),
        }),
      });
      createdId = created.product.id;
    } catch (err) {
      await rollbackUploads(syncProduct.newlyUploaded);
      setSubmitting(false);
      if (err instanceof ApiError && err.code === "OFFICIAL_STORE_MISSING") {
        toast.error("Official Store belum dibuat", {
          description: "Minta pemilik backend menjalankan seed Official Store, lalu coba lagi.",
        });
      } else {
        toast.error("Gagal menyimpan produk", {
          description: err instanceof ApiError ? err.message : "Terjadi kesalahan tak terduga",
        });
      }
      return;
    }

    if (values.hasStory && values.story.title.trim() && values.story.body.trim()) {
      let syncStory: PhotoSyncResult | null = null;
      if (processItems.length > 0) {
        try {
          syncStory = await syncPhotos(processItems);
        } catch (err) {
          toast.warning("Produk tersimpan, tetapi foto proses gagal diunggah", {
            description: err instanceof ApiError ? err.message : "Coba tambahkan foto proses di halaman edit.",
          });
          router.push(`/produk/${createdId}/edit`);
          return;
        }
      }

      try {
        await apiFetch(`/api/products/${createdId}/story`, {
          method: "POST",
          body: JSON.stringify({
            title: values.story.title.trim(),
            content: values.story.body.trim(),
            process: values.story.process?.trim() || undefined,
            ...(syncStory && syncStory.images.length > 0 ? { processImages: syncStory.images } : {}),
          }),
        });
      } catch (err) {
        if (syncStory) {
          await rollbackUploads(syncStory.newlyUploaded);
        }
        toast.warning("Produk tersimpan, tetapi cerita gagal disimpan", {
          description: err instanceof ApiError ? err.message : "Silakan tambahkan cerita lewat halaman edit.",
        });
        router.push(`/produk/${createdId}/edit`);
        return;
      }
    }

    setSubmitting(false);
    toast.success("Produk ditambahkan", { description: `${values.name.trim()} telah disimpan.` });
    router.push("/produk");
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
      <AdminPageHeader title="Tambah Produk Baru" description="Isi detail produk untuk menayangkan di toko." />

      {/* Penjual produk */}
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-base font-bold">Penjual</CardTitle>
          <CardDescription>
            Produk lini toko sendiri dijual atas nama Official Store. Pilih kreator bila kamu menginput atas nama kreator.
            Penjual tidak dapat diganti setelah produk dibuat.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadingSellers ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Memuat daftar penjual…
            </div>
          ) : sellerError ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Daftar penjual gagal dimuat</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>{sellerError}</p>
                <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => void loadSellers()}>
                  <RefreshCw className="h-3.5 w-3.5" />
                  Coba Lagi
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {!hasOfficial && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Official Store belum dibuat</AlertTitle>
                  <AlertDescription>
                    Hubungi pemilik backend untuk menjalankan seed Official Store. Sementara itu kamu masih bisa memilih kreator.
                  </AlertDescription>
                </Alert>
              )}
              <div className="max-w-md space-y-1.5">
                <Label htmlFor="product-seller">Dijual atas nama</Label>
                <Select value={sellerId} onValueChange={setSellerId} disabled={submitting}>
                  <SelectTrigger id="product-seller">
                    <SelectValue placeholder="Pilih penjual" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Official Store paling atas (backend sudah mengurutkannya lebih dulu) */}
                    {sellers.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.isOfficial ? `Official Store (${s.brandName})` : s.brandName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {sellers.find((s) => s.id === sellerId)?.isOfficial && (
                  <p className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Produk akan tampil dengan label Official Store.
                  </p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ProductFormFields
        initialValues={emptyInitialValues}
        submitLabel={submitting ? "Menyimpan…" : "Simpan Produk"}
        submitting={submitting}
        onSubmit={handleSubmit}
        rejectedPhotoIds={rejectedPhotoIds}
      />
    </div>
  );
}