import React from "react";
import Link from "next/link";
import { ClipboardCheck, Plus, TrendingDown } from "lucide-react";
import { AdminPageHeader } from "@/app/(dashboard)/components/admin-ui";
import { Button } from "@/components/ui/button";
import { ProductListContent } from "./components/ProductListContent";

export default function ProdukAdminPage() {
  return (
    <div>
      {/* Header Halaman Produk */}
      <AdminPageHeader
        title="Kelola Produk"
        description="Kelola semua produk yang tayang di toko."
      >
        <Button asChild className="gap-1.5">
          <Link href="/produk/tambah">
            <Plus className="h-4 w-4" />
            Tambah Produk Baru
          </Link>
        </Button>
        <Button asChild variant="outline" className="gap-1.5">
          <Link href="/produk/persetujuan">
            <ClipboardCheck className="h-4 w-4" />
            Persetujuan
          </Link>
        </Button>
        <Button asChild variant="outline" className="gap-1.5">
          <Link href="/produk/lambat-laku">
            <TrendingDown className="h-4 w-4" />
            Lambat Laku
          </Link>
        </Button>
      </AdminPageHeader>

      {/* Konten Modular List Produk Terhubung API */}
      <ProductListContent />
    </div>
  );
}
