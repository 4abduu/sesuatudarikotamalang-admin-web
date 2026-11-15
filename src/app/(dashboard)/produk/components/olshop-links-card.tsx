"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { OlshopPlatformBadge } from "@/components/site/olshop-platform-badge";
import {
  OLSHOP_META,
  OLSHOP_PLATFORMS,
  type OlshopFormState,
  type OlshopMode,
  type OlshopPlatform,
} from "@/lib/olshop";

type StoreUrls = Partial<Record<OlshopPlatform, string | null>>;

const MODE_LABEL: Record<OlshopMode, string> = {
  tidak: "Tidak dijual di sini",
  toko: "Pakai link toko",
  khusus: "Link khusus produk",
};

export function OlshopLinksCard({
  value,
  onChange,
  errors,
  disabled = false,
}: {
  value: OlshopFormState;
  onChange: (next: OlshopFormState) => void;
  errors?: Partial<Record<OlshopPlatform, string>>;
  disabled?: boolean;
}) {
  // null = belum diketahui / gagal dimuat (opsi "link toko" tidak dikunci, backend yang memutuskan)
  const [stores, setStores] = useState<StoreUrls | null>(null);

  useEffect(() => {
    let alive = true;
    apiFetch<{ settings?: { olshopStores?: StoreUrls } }>("/api/settings/public")
      .then((res) => {
        if (alive) setStores(res.settings?.olshopStores ?? {});
      })
      .catch(() => {
        /* gagal memuat: biarkan null */
      });
    return () => {
      alive = false;
    };
  }, []);

  function setMode(platform: OlshopPlatform, mode: OlshopMode) {
    onChange({ ...value, [platform]: { ...value[platform], mode } });
  }

  function setUrl(platform: OlshopPlatform, url: string) {
    onChange({ ...value, [platform]: { ...value[platform], url } });
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="font-display text-base font-bold">Link Marketplace (opsional)</CardTitle>
        <CardDescription className="text-xs">
          Atur produk ini dijual di marketplace mana. Di aplikasi, tombol pembelian hanya muncul untuk marketplace
          yang diaktifkan di sini.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {OLSHOP_PLATFORMS.map((platform) => {
          const meta = OLSHOP_META[platform];
          const cfg = value[platform];
          const storeUrl = stores?.[platform] ?? null;
          const storeMissing = stores !== null && !storeUrl;
          const error = errors?.[platform];
          return (
            <div key={platform} className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-3">
                <OlshopPlatformBadge platform={platform} />
                <p className="text-sm font-semibold text-foreground">{meta.label}</p>
              </div>

              <div role="radiogroup" aria-label={`Pengaturan ${meta.label}`} className="mt-3 grid gap-2 sm:grid-cols-3">
                {(["tidak", "toko", "khusus"] as OlshopMode[]).map((mode) => {
                  const locked = mode === "toko" && storeMissing;
                  const active = cfg.mode === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      disabled={disabled || locked}
                      onClick={() => setMode(platform, mode)}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors",
                        active
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-card text-muted-foreground hover:bg-secondary/40",
                        (disabled || locked) && "cursor-not-allowed opacity-50 hover:bg-card",
                      )}
                    >
                      {MODE_LABEL[mode]}
                    </button>
                  );
                })}
              </div>

              {storeMissing && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Opsi &ldquo;Pakai link toko&rdquo; terkunci karena link toko {meta.label} belum diisi.{" "}
                  <Link href="/pengaturan" className="font-medium text-primary underline underline-offset-2">
                    Isi di Pengaturan
                  </Link>
                </p>
              )}

              {cfg.mode === "toko" && storeUrl && (
                <p className="mt-2 break-all text-xs text-muted-foreground">
                  Pembeli diarahkan ke halaman toko: <span className="font-medium text-foreground">{storeUrl}</span>.
                  Di aplikasi akan muncul peringatan bahwa produk ini tidak punya link khusus.
                </p>
              )}

              {cfg.mode === "khusus" && (
                <div className="mt-3 space-y-1.5">
                  <Input
                    value={cfg.url}
                    onChange={(e) => setUrl(platform, e.target.value)}
                    placeholder={meta.placeholder}
                    inputMode="url"
                    autoComplete="off"
                    disabled={disabled}
                    aria-invalid={error ? true : undefined}
                    aria-label={`Link produk di ${meta.label}`}
                  />
                  {error ? (
                    <p className="text-xs font-medium text-destructive">{error}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Tempel link produk dari {meta.label}. Hanya domain resmi {meta.label} yang diterima; link pendek
                      diperiksa dan diganti tujuan akhirnya.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
