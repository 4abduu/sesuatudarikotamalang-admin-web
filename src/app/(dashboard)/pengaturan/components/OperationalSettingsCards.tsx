"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Loader2, PackageMinus, Percent, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch, ApiError } from "@/lib/api";
import type { OperationalSettings } from "@/lib/types-operasional";

type SettingsResponse = { settings: Partial<OperationalSettings> & Record<string, unknown> };

/**
 * Dua pengaturan baru: batas stok menipis dan persentase bagian kreator (default).
 * Mengambil GET /api/admin/settings sendiri dan menyimpan HANYA field miliknya lewat PUT /api/admin/settings,
 * jadi tidak mengubah alur simpan kartu pengaturan lain.
 */
export function OperationalSettingsCards() {
  const [loaded, setLoaded] = useState<OperationalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [threshold, setThreshold] = useState("5");
  const [share, setShare] = useState("70");
  const [savingThreshold, setSavingThreshold] = useState(false);
  const [savingShare, setSavingShare] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<SettingsResponse>("/api/admin/settings");
      const s = res.settings ?? {};
      const next: OperationalSettings = {
        lowStockThreshold: Number(s.lowStockThreshold ?? 5),
        defaultCreatorSharePercent: Number(s.defaultCreatorSharePercent ?? 70),
      };
      setLoaded(next);
      setThreshold(String(next.lowStockThreshold));
      setShare(String(next.defaultCreatorSharePercent));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memuat pengaturan operasional");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(payload: Partial<OperationalSettings>, setBusy: (b: boolean) => void) {
    setBusy(true);
    try {
      const res = await apiFetch<{ message?: string; settings?: SettingsResponse["settings"] }>(
        "/api/admin/settings",
        { method: "PUT", body: JSON.stringify(payload) }
      );
      toast.success(res.message || "Pengaturan disimpan");
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal menyimpan pengaturan");
    } finally {
      setBusy(false);
    }
  }

  function saveThreshold() {
    const n = Number(threshold);
    if (!Number.isInteger(n) || n < 1 || n > 100) {
      toast.error("Batas stok menipis harus bilangan bulat 1 sampai 100");
      return;
    }
    void save({ lowStockThreshold: n }, setSavingThreshold);
  }

  function saveShare() {
    const n = Number(share);
    if (!Number.isFinite(n) || n < 0 || n > 100) {
      toast.error("Persentase harus antara 0 sampai 100");
      return;
    }
    void save({ defaultCreatorSharePercent: n }, setSavingShare);
  }

  if (loading) {
    return (
      <div className="flex h-24 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !loaded) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" className="gap-2" onClick={() => void load()}>
          <RefreshCw className="h-4 w-4" />
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent/15 text-accent">
              <PackageMinus className="h-4 w-4" />
            </span>
            Batas Stok Menipis
          </CardTitle>
          <CardDescription>
            Stok di bawah atau sama dengan angka ini dianggap menipis. Dipakai untuk kartu stok menipis di dashboard
            dan notifikasi ke kreator.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="low-stock">Batas stok (pcs)</Label>
            <Input
              id="low-stock"
              type="number"
              inputMode="numeric"
              min={1}
              max={100}
              className="w-[200px]"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              disabled={savingThreshold}
            />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={saveThreshold}
              disabled={savingThreshold || Number(threshold) === loaded.lowStockThreshold}
              className="gap-2"
            >
              {savingThreshold ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Simpan Batas Stok
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <Percent className="h-4 w-4" />
            </span>
            Bagi Hasil Utama
          </CardTitle>
          <CardDescription>
            Persentase omzet yang menjadi bagian kreator. Angka ini asumsi dan dipakai semua kreator yang tidak punya
            persentase sendiri. Persentase per kreator diatur di halaman Kreator.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="creator-share">Bagian kreator (%)</Label>
            <Input
              id="creator-share"
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step="0.5"
              className="w-[200px]"
              value={share}
              onChange={(e) => setShare(e.target.value)}
              disabled={savingShare}
            />
            <p className="text-xs text-muted-foreground">
              Sisanya menjadi bagian toko. Contoh: 70 berarti kreator 70% dan toko 30%.
            </p>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={saveShare}
              disabled={savingShare || Number(share) === loaded.defaultCreatorSharePercent}
              className="gap-2"
            >
              {savingShare ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Simpan Bagi Hasil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

