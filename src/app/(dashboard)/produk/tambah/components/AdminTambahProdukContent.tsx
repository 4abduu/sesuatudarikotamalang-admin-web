"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/app/(dashboard)/components/admin-ui";
import {
  ProductFormFields,
  emptyInitialValues,
} from "@/app/(dashboard)/produk/components/product-form-fields";

/**
 * Tambah Produk page BODY — admin form for adding a new product.
 * Extracted from `produk/tambah/page.tsx` so the same body can be rendered
 * inside the export-figma combo page (without AdminShell).
 */
export function AdminTambahProdukContent() {
  const router = useRouter();

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
        title="Tambah Produk Baru"
        description="Isi detail produk untuk menayangkan di toko."
      />
      <ProductFormFields
        initialValues={emptyInitialValues}
        submitLabel="Simpan Produk"
        onSubmit={() => {
          toast.success("Produk ditambahkan (dummy)");
          router.push("/produk");
        }}
      />
    </div>
  );
}
