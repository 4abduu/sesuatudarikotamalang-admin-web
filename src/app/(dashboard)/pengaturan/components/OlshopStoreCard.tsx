"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Store } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { OlshopPlatformBadge } from "@/components/site/olshop-platform-badge";
import { AppSettings } from "@/lib/types";
import { OLSHOP_META, OLSHOP_PLATFORMS, validateOlshopUrlClient, type OlshopPlatform } from "@/lib/olshop";

const KEY: Record<OlshopPlatform, "shopeeStoreUrl" | "tokopediaStoreUrl" | "tiktokshopStoreUrl"> = {
  shopee: "shopeeStoreUrl",
  tokopedia: "tokopediaStoreUrl",
  tiktokshop: "tiktokshopStoreUrl",
};

interface OlshopStoreCardProps {
  settings: AppSettings;
  onSave: (patch: Record<string, unknown>) => Promise<boolean>;
}

export function OlshopStoreCard({ settings, onSave }: OlshopStoreCardProps) {
  const fromSettings = (): Record<OlshopPlatform, string> => ({
    shopee: settings.shopeeStoreUrl ?? "",
    tokopedia: settings.tokopediaStoreUrl ?? "",
    tiktokshop: settings.tiktokshopStoreUrl ?? "",
  });

  const [values, setValues] = useState<Record<OlshopPlatform, string>>(fromSettings);
  const [errors, setErrors] = useState<Partial<Record<OlshopPlatform, string>>>({});
  const [saving, setSaving] = useState(false);

  // Sinkronkan bila pengaturan di server berubah (setelah simpan / muat ulang)
  useEffect(() => {
    setValues(fromSettings());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.shopeeStoreUrl, settings.tokopediaStoreUrl, settings.tiktokshopStoreUrl]);

  const dirty = OLSHOP_PLATFORMS.some((p) => values[p].trim() !== fromSettings()[p]);

  async function handleSave() {
    const nextErrors: Partial<Record<OlshopPlatform, string>> = {};
    for (const p of OLSHOP_PLATFORMS) {
      if (values[p].trim()) {
        const msg = validateOlshopUrlClient(p, values[p]);
        if (msg) nextErrors[p] = msg;
      }
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Periksa link toko yang ditandai");
      return;
    }
    setSaving(true);
    const patch: Record<string, unknown> = {};
    for (const p of OLSHOP_PLATFORMS) patch[KEY[p]] = values[p].trim();
    await onSave(patch);
    setSaving(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#6B7A3D]/15 text-accent">
            <Store className="h-4 w-4" />
          </span>
          Link Toko Marketplace
        </CardTitle>
        <CardDescription>
          Alamat halaman toko di tiap marketplace. Dipakai produk yang memilih &ldquo;Pakai link toko&rdquo;. Kosongkan
          bila toko tidak ada di marketplace itu; produk yang memakainya otomatis tidak menampilkan tombol marketplace
          tersebut.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {OLSHOP_PLATFORMS.map((p) => {
          const meta = OLSHOP_META[p];
          return (
            <div key={p} className="space-y-2">
              <Label htmlFor={`store-${p}`} className="flex items-center gap-2">
                <OlshopPlatformBadge platform={p} />
                Toko di {meta.label}
              </Label>
              <Input
                id={`store-${p}`}
                value={values[p]}
                onChange={(e) => setValues((prev) => ({ ...prev, [p]: e.target.value }))}
                placeholder={meta.placeholder}
                inputMode="url"
                autoComplete="off"
                disabled={saving}
                aria-invalid={errors[p] ? true : undefined}
              />
              {errors[p] && <p className="text-xs font-medium text-destructive">{errors[p]}</p>}
            </div>
          );
        })}
        <p className="text-xs text-muted-foreground">
          Demi keamanan, hanya domain resmi marketplace yang diterima (HTTPS). Link pendek seperti shp.ee diperiksa
          server dan diganti dengan tujuan akhirnya.
        </p>
        <div className="flex justify-end pt-1">
          <Button onClick={handleSave} disabled={saving || !dirty} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Simpan Link Toko
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
