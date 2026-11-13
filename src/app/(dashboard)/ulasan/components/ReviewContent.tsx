"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { MessageSquareQuote, AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/app/(dashboard)/components/admin-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiError } from "@/lib/api";
import { Review } from "@/lib/types";
import { PaginationBar } from "@/components/shared/PaginationBar";

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
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
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
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReviewVisibilityFilter>("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [actionLoadingId, setActionLoadingId] = useState<number | string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce pencarian ±400ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [query]);

  const fetchReviews = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(pageSize));

    if (debouncedQuery.trim()) params.set("q", debouncedQuery.trim());
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (ratingFilter !== "all") params.set("rating", ratingFilter);

    try {
      const res = await apiFetch<ReviewApiResponse>(`/api/admin/reviews?${params.toString()}`, {
        signal: controller.signal,
      });

      setReviews(res.reviews || []);
      if (res.summary) {
        setSummary(res.summary);
      }
      if (res.pagination) {
        setTotal(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      } else {
        setTotal(res.reviews?.length || 0);
        setTotalPages(1);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Gagal memuat daftar ulasan dari server");
      }
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedQuery, statusFilter, ratingFilter]);

  useEffect(() => {
    void fetchReviews();
  }, [fetchReviews]);

  // Toggle Sembunyikan/Tampilkan Ulasan (PATCH /api/admin/reviews/:id/hide)
  const handleToggleHide = async (review: Review) => {
    setActionLoadingId(review.id);
    try {
      const res = await apiFetch<{ message: string; review: Review }>(
        `/api/admin/reviews/${review.id}/hide`,
        { method: "PATCH" }
      );
      toast.success(res.message || "Status ulasan berhasil diperbarui");
      await fetchReviews();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Gagal mengubah status ulasan");
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
      // Jika setelah hapus halaman jadi kosong dan page > 1, mundur 1 halaman
      if (reviews.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        await fetchReviews();
      }
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

  if (loading && reviews.length === 0) {
    return (
      <div className="grid min-h-[350px] place-items-center rounded-xl border border-border bg-card p-12">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Memuat data ulasan…</p>
        </div>
      </div>
    );
  }

  if (error && reviews.length === 0) {
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
        onQueryChange={(q) => {
          setQuery(q);
        }}
        statusFilter={statusFilter}
        onStatusChange={(s) => {
          setStatusFilter(s);
          setPage(1);
        }}
        ratingFilter={ratingFilter}
        onRatingChange={(r) => {
          setRatingFilter(r);
          setPage(1);
        }}
      />

      {/* Tabel Ulasan */}
      {reviews.length === 0 ? (
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
        <div className="space-y-4 mt-3">
          <ReviewTable
            reviews={reviews}
            onToggleHide={handleToggleHide}
            onDelete={handleDeleteReview}
            actionLoadingId={actionLoadingId}
          />
          <PaginationBar
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 20, 50]}
          />
        </div>
      )}
    </div>
  );
}
