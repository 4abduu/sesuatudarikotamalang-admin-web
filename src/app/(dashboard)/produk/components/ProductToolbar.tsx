import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category } from "@/lib/types";

interface ProductToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  categoryId: string;
  onCategoryChange: (value: string) => void;
  categories: Category[];
  totalFiltered: number;
}

export function ProductToolbar({
  search,
  onSearchChange,
  categoryId,
  onCategoryChange,
  categories,
  totalFiltered,
}: ProductToolbarProps) {
  return (
    <Card className="mb-4 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari produk atau deskripsi singkat…"
            className="pl-9"
          />
        </div>
        <Select value={categoryId} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Semua kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground sm:w-24 sm:text-right">
          {totalFiltered} produk
        </span>
      </div>
    </Card>
  );
}
