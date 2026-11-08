"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, ClipboardCheck, History, Loader2, RefreshCw, XCircle } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/app/(dashboard)/components/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiFetch, ApiError } from "@/lib/api";
import { formatRupiah } from "@/lib/format";
import { formatDateTimeId } from "@/lib/format-operasional";
import type { ApprovalProduct } from "@/lib/types-operasional";
import { ProductActionReasonDialog } from "../../components/ProductActionReasonDialog";

type StatusFilter = "menunggu" | "ditolak";

export function ApprovalContent() {
  const [status, setStatus] = useState<StatusFilter>("menunggu");
  const [products, setProducts] = useState<ApprovalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<ApprovalProduct | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ products: ApprovalProduct[] }>(
        `/api/admin/products/approvals?status=${status}`
      );
      setProducts(res.products || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memuat daftar persetujuan produk");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function approve(p: ApprovalProduct) {
    setApprovingId(p.id);
    try {
      const res = await apiFetch<{ message?: string }>(`/api/admin/products/${p.id}/approve`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      toast.success(res.message || "Produk disetujui");
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal menyetujui produk");
    } finally {
      setApprovingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
          <SelectTrigger className="w-[220px]" aria-label="Filter status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="menunggu">Menunggu persetujuan</SelectItem>
            <SelectItem value="ditolak">Sudah ditolak</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{loading ? "Memuat…" : `${products.length} produk`}</span>
      </div>

      {loading ? (
        <div className="grid min-h-[260px] place-items-center rounded-xl border border-border bg-card">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="grid min-h-[240px] place-items-center rounded-xl border border-destructive/30 bg-destructive/5 p-10 text-center">
          <div className="flex max-w-md flex-col items-center gap-3">
            <AlertTriangle className="h-9 w-9 text-destructive" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" className="gap-2" onClick={() => void load()}>
              <RefreshCw className="h-4 w-4" />
              Coba Lagi
            </Button>
          </div>
        </div>
      ) : products.length === 0 ? (
        <Card className="p-0">
          <EmptyState
            icon={ClipboardCheck}
            title={status === "menunggu" ? "Tidak ada produk menunggu" : "Belum ada produk ditolak"}
            description={
              status === "menunggu"
                ? "Pengajuan produk baru dari kreator akan muncul di sini."
                : "Produk yang kamu tolak akan tercatat di sini."
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <Card key={p.id} className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                {p.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="h-24 w-24 shrink-0 rounded-lg border border-border object-cover"
                  />
                ) : (
                  <div className="grid h-24 w-24 shrink-0 place-items-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
                    Tanpa foto
                  </div>
                )}

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-base font-bold text-foreground">{p.name}</h3>
                    <Badge variant="secondary">{p.artisan.brandName}</Badge>
                    {p.category?.name && <Badge variant="outline">{p.category.name}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatRupiah(p.price)} · diajukan {formatDateTimeId(p.createdAt)}
                  </p>
                  {p.shortDescription && <p className="line-clamp-2 text-sm text-foreground/80">{p.shortDescription}</p>}

                  {p.replacesProduct && (
                    <p className="text-sm">
                      <span className="font-medium text-foreground">Pengganti dari produk:</span>{" "}
                      <span className="text-muted-foreground">{p.replacesProduct.name}</span>
                    </p>
                  )}

                  {p.artisanWithdrawn.length > 0 && (
                    <div className="rounded-lg border border-amber-300/60 bg-amber-50 p-2.5 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                      <p className="mb-1 flex items-center gap-1.5 font-semibold">
                        <History className="h-3.5 w-3.5" />
                        Riwayat produk ditarik milik kreator ini. Cek supaya pengajuan ini bukan produk yang sama.
                      </p>
                      <ul className="list-inside list-disc">
                        {p.artisanWithdrawn.map((w) => (
                          <li key={w.id}>
                            {w.name} (ditarik {formatDateTimeId(w.withdrawnAt)})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {p.displayStatus === "ditolak" && p.statusNote && (
                    <p className="text-sm text-destructive">Alasan penolakan: {p.statusNote}</p>
                  )}
                </div>

                <div className="flex shrink-0 flex-row gap-2 sm:flex-col">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/produk/${p.id}/edit`}>Lihat Detail</Link>
                  </Button>
                  {p.displayStatus === "menunggu" && (
                    <>
                      <Button
                        size="sm"
                        className="gap-1.5"
                        disabled={approvingId === p.id}
                        onClick={() => void approve(p)}
                      >
                        {approvingId === p.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                        Setujui
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-destructive"
                        onClick={() => setRejectTarget(p)}
                      >
                        <XCircle className="h-4 w-4" />
                        Tolak
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ProductActionReasonDialog
        open={rejectTarget !== null}
        mode="reject"
        productId={rejectTarget?.id ?? null}
        productName={rejectTarget?.name ?? ""}
        onClose={() => setRejectTarget(null)}
        onDone={() => {
          const id = rejectTarget?.id;
          setRejectTarget(null);
          if (id) setProducts((prev) => prev.filter((x) => x.id !== id));
        }}
      />
    </div>
  );
}

