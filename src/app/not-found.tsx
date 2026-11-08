import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center p-8 text-center">
      <div className="max-w-md space-y-3">
        <h2 className="font-display text-lg font-bold text-foreground">Halaman tidak ditemukan</h2>
        <p className="text-sm text-muted-foreground">Alamat yang kamu buka tidak ada atau sudah dipindahkan.</p>
        <Button asChild>
          <Link href="/">Kembali ke Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

