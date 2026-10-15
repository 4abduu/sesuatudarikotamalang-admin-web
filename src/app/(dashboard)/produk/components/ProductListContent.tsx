"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { PackageOpen, AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/app/(dashboard)/components/admin-ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiError } from "@/lib/api";
import { Product, Category } from "@/lib/types";

import { ProductToolbar } from "./ProductToolbar";
import { ProductTable } from "./ProductTable";

export function ProductListContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [togglingId, setTogglingId] = useState<number | string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch produk admin dan daftar kategori secara paralel
      const [prodRes, catRes] = await Promise.all([
        apiFetch<{ products: Product[] }>("/api/admin/products"),
        apiFetch<{ categories: Category[] }>("/api/categories"),
      ]);
      setProducts(prodRes.products || []);
      setCategories(catRes.categories || []);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Gagal memuat data produk dari server");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleActive = async (id: number | string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    setTogglingId(id);
    try {
      const res = await apiFetch<{ message: string; product: Product }>(
        `/api/admin/products/${id}/active`,
        {
          method: "PATCH",
          body: JSON.stringify({ isActive: nextStatus }),
        }
      );
      toast.success(res.message || `Status produk diperbarui`);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: nextStatus } : p))
      );
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Gagal mengubah status produk");
      }
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteSuccess = (deletedId: number | string) => {
    setProducts((prev) => prev.filter((p) => p.id !== deletedId));
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (categoryId !== "all" && String(p.categoryId) !== String(categoryId)) {
        return false;
      }
      if (q) {
        const nameMatch = p.name.toLowerCase().includes(q);
        const descMatch = (p.shortDescription || "").toLowerCase().includes(q);
        const artisanMatch = (p.artisan?.brandName || "").toLowerCase().includes(q);
        if (!nameMatch && !descMatch && !artisanMatch) return false;
      }
      return true;
    });
  }, [products, search, categoryId]);

  if (loading) {
    return (
      <div className="grid min-h-[350px] place-items-center rounded-xl border border-border bg-card p-12">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Memuat data produk…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid min-h-[300px] place-items-center rounded-xl border border-destructive/30 bg-destructive/5 p-12 text-center">
        <div className="flex flex-col items-center gap-4 max-w-md">
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <div>
            <h3 className="text-base font-bold text-foreground">Gagal Memuat Produk</h3>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          </div>
          <Button onClick={fetchData} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar Filter & Pencarian */}
      <ProductToolbar
        search={search}
        onSearchChange={setSearch}
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
        categories={categories}
        totalFiltered={filtered.length}
      />

      {/* List / Table Produk */}
      {filtered.length === 0 ? (
        <Card className="p-0">
          <EmptyState
            icon={PackageOpen}
            title="Belum ada produk"
            description="Belum ada produk di etalase atau tidak ditemukan dengan kata kunci ini."
          />
        </Card>
      ) : (
        <ProductTable
          products={filtered}
          onDeleteSuccess={handleDeleteSuccess}
          onToggleActive={handleToggleActive}
          togglingId={togglingId}
        />
      )}
    </div>
  );
}
