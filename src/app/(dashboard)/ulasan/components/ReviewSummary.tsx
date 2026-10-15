import { Star, MessageSquareQuote } from "lucide-react";
import { StatCard } from "@/app/(dashboard)/components/admin-ui";

interface ReviewSummaryProps {
  avgRating: number;
  totalReviews: number;
  visibleCount: number;
  hiddenCount: number;
}

export function ReviewSummary({
  avgRating,
  totalReviews,
  visibleCount,
  hiddenCount,
}: ReviewSummaryProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Rata-rata Rating"
        value={Number(avgRating || 0).toFixed(1)}
        hint="Dari seluruh ulasan produk toko"
        icon={Star}
        accent="mustard"
      />
      <StatCard
        label="Total Ulasan"
        value={totalReviews}
        hint={`${visibleCount} tampil · ${hiddenCount} disembunyikan`}
        icon={MessageSquareQuote}
        accent="primary"
      />
    </div>
  );
}
