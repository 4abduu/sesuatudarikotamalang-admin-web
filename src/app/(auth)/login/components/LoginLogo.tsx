import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Logo "Sesuatu DariKota Malang" (PNG transparan di public/brand).
 * Atur ukuran lewat `className` (misalnya `w-40`); tinggi mengikuti rasio gambar.
 */
export function LoginLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/logo-sesuatu-darikota.png"
      alt="Sesuatu DariKota Malang"
      width={560}
      height={495}
      priority
      className={cn("h-auto", className)}
    />
  );
}