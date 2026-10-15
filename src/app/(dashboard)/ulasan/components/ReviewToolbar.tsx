import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ReviewVisibilityFilter = "all" | "tampil" | "disembunyikan";

interface ReviewToolbarProps {
  query: string;
  onQueryChange: (val: string) => void;
  statusFilter: ReviewVisibilityFilter;
  onStatusChange: (val: ReviewVisibilityFilter) => void;
  ratingFilter: string;
  onRatingChange: (val: string) => void;
}

export function ReviewToolbar({
  query,
  onQueryChange,
  statusFilter,
  onStatusChange,
  ratingFilter,
  onRatingChange,
}: ReviewToolbarProps) {
  return (
    <Card className="mt-6">
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Cari pembeli / komentar…"
            className="pl-9"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* Filter Rating */}
          <Select value={ratingFilter} onValueChange={onRatingChange}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Semua Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Bintang</SelectItem>
              <SelectItem value="5">⭐⭐⭐⭐⭐ (5)</SelectItem>
              <SelectItem value="4">⭐⭐⭐⭐ (4)</SelectItem>
              <SelectItem value="3">⭐⭐⭐ (3)</SelectItem>
              <SelectItem value="2">⭐⭐ (2)</SelectItem>
              <SelectItem value="1">⭐ (1)</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter Status Tampil / Sembunyi */}
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="tampil">Tampil di Toko</SelectItem>
              <SelectItem value="disembunyikan">Disembunyikan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
