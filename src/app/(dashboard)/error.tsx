"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Kesalahan tampilan dashboard", { digest: error.digest });
  }, [error]);

  return (
    <div className="grid min-h-[320px] place-items-center p-8 text-center">
      <div className="max-w-md space-y-3">
        <h2 className="font-display text-lg font-bold text-foreground">Terjadi kesalahan</h2>
        <p className="text-sm text-muted-foreground">
          Halaman ini gagal dimuat. Coba lagi, dan hubungi tim bila masalah berlanjut.
        </p>
        {error.digest && <p className="text-xs text-muted-foreground">Kode: {error.digest}</p>}
        <Button onClick={reset}>Coba Lagi</Button>
      </div>
    </div>
  );
}

