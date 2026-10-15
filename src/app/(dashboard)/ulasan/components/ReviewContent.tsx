"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { MessageSquareQuote, AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/app/(dashboard)/components/admin-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiError } from "@/lib/api";
import { Review } from "@/lib/types";

import { ReviewSummary } from "./ReviewSummary";
import { ReviewToolbar, ReviewVisibilityFilter } from "./ReviewToolbar";
import { ReviewTable } from "./ReviewTable";

interface ReviewApiResponse {
  reviews: Review[];
  summary: {
    avgRating: number;
    visibleCount: number;
    hiddenCount: number;
    totalReviews: number;
  };
}

export function ReviewContent() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState({
    avgRating: 0,
    visibleCount: 0,
    hiddenCount: 0,
    totalReviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReviewVisibilityFilter>("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [actionLoadingId, setActionLoadingId] = useState<number | string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<ReviewApiResponse>("/api/admin/reviews");
      setReviews(res.reviews || []);
      if (res.summary) {
        setSummary(res.summary);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Gagal memuat daftar ulasan dari server");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Toggle Sembunyikan/Tampilkan Ulasan (PATCH /api/admin/reviews/:id/hide)
  const handleToggleHide = async (review: Review) => {
    const nextStatus = review.status === "tampil" ? "disembunyikan" : "tampil";
    setActionLoadingId(review.id);
    try {
      const res = await apiFetch<{ message: string; review: Review }>(
        `/api/admin/reviews/${review.id}/hide`,
        { method: "PATCH" }
      );
      toast.success(res.message || "Status ulasan berhasil diperbarui");
      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, status: nextStatus } : r))
      );
      setSummary((prev) => ({
        ...prev,
        visibleCount: nextStatus === "tampil" ? prev.visibleCount + 1 : prev.visibleCount - 1,
        hiddenCount: nextStatus === "disembunyikan" ? prev.hiddenCount + 1 : prev.hiddenCount - 1,
      }));
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Gagal mengubah visibilitas ulasan");
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  // Hapus Ulasan (DELETE /api/admin/reviews/:id)
  const handleDeleteReview = async (review: Review) => {
    setActionLoadingId(review.id);
    try {
      const res = await apiFetch<{ message: string }>(
        `/api/admin/reviews/${review.id}`,
        { method: "DELETE" }
      );
      toast.success(res.message || "Ulasan berhasil dihapus");
      setReviews((prev) => prev.filter((r) => r.id !== review.id));
      setSummary((prev) => ({
        ...prev,
        totalReviews: Math.max(0, prev.totalReviews - 1),
        visibleCount: review.status === "tampil" ? Math.max(0, prev.visibleCount - 1) : prev.visibleCount,
        hiddenCount: review.status === "disembunyikan" ? Math.max(0, prev.hiddenCount - 1) : prev.hiddenCount,
      }));
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Gagal menghapus ulasan");
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter ulasan di klien
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reviews.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) {
        return false;
      }
      if (ratingFilter !== "all" && String(r.rating) !== ratingFilter) {
        return false;
      }
      if (q) {
        const authorMatch = (r.user?.name || "").toLowerCase().includes(q);
        const commentMatch = (r.comment || "").toLowerCase().includes(q);
        const productMatch = (r.product?.name || "").toLowerCase().includes(q);
        if (!authorMatch && !commentMatch && !productMatch) return false;
      }
      return true;
    });
  }, [reviews, statusFilter, ratingFilter, query]);

  if (loading) {
    return (
      <div className="grid min-h-[350px] place-items-center rounded-xl border border-border bg-card p-12">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Memuat ulasan pembeli…</p>
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
            <h3 className="text-base font-bold text-foreground">Gagal Memuat Ulasan</h3>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          </div>
          <Button onClick={fetchReviews} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Kartu Ringkasan Rating & Jumlah */}
      <ReviewSummary
        avgRating={summary.avgRating}
        totalReviews={summary.totalReviews}
        visibleCount={summary.visibleCount}
        hiddenCount={summary.hiddenCount}
      />

      {/* Toolbar Filter */}
      <ReviewToolbar
        query={query}
        onQueryChange={setQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        ratingFilter={ratingFilter}
        onRatingChange={setRatingFilter}
      />

      {/* Info Jumlah Hasil */}
      <div className="mt-4 flex items-center justify-between px-1">
        <p className="text-sm text-muted-foreground">
          Menampilkan{" "}
          <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
          dari {reviews.length} ulasan
        </p>
      </div>

      {/* Tabel Ulasan */}
      {filtered.length === 0 ? (
        <Card className="mt-3">
          <CardContent>
            <EmptyState
              icon={MessageSquareQuote}
              title="Tidak ada ulasan ditemukan"
              description="Coba ubah pencarian atau filter status untuk melihat ulasan lain."
            />
          </CardContent>
        </Card>
      ) : (
        <ReviewTable
          reviews={filtered}
          onToggleHide={handleToggleHide}
          onDelete={handleDeleteReview}
          actionLoadingId={actionLoadingId}
        />
      )}
    </div>
  );
}
