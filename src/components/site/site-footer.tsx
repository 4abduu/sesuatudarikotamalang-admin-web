import Link from "next/link";
import { MapPin, Clock, Instagram, Mail } from "lucide-react";
import { OrnamentDivider, LeafSprig } from "./line-art";
import { Logo } from "./site-navbar";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-secondary/50">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <OrnamentDivider className="mb-8" />
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Logo />
            <p className="mt-3 text-sm text-muted-foreground">
              Toko oleh-oleh artisan & creative market dari kawasan Kayutangan
              Heritage, Malang. Setiap karya punya tangan dan cerita di baliknya.
            </p>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
              Jelajah
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link className="hover:text-primary" href="/katalog">Katalog Produk</Link></li>
              <li><Link className="hover:text-primary" href="/kreator">Meet The Artisans</Link></li>
              <li><Link className="hover:text-primary" href="/daftar-kreator">Jadi Kreator</Link></li>
              <li><Link className="hover:text-primary" href="/dashboard-kreator">Dashboard Kreator</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
              Kunjungi Toko
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Jl. Jenderal Basuki Rahmat No. 45, Kawasan Kayutangan Heritage, Kota Malang
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0 text-primary" />
                Senin–Minggu, 10.00 – 21.00 WIB
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
              Sapa Kami
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Instagram className="h-4 w-4 shrink-0 text-primary" />
                @sesuatu.darikota.mlg
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                halo@darikotamalang.id
              </li>
            </ul>
            <div className="mt-4 flex gap-2">
              <LeafSprig className="h-5 w-5 text-primary/40" strokeWidth={2} />
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Sesuatu DariKota Malang. Dibuat dengan tangan di Malang.</p>
          <p className="flex items-center gap-1">
            Prototype UI/UX · data dummy ·{" "}
            <Link
              href="/export-figma"
              className="font-medium text-primary hover:underline"
            >
              Lihat Mode Export Desain
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
