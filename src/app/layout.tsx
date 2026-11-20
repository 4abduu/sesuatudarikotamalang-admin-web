import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Sesuatu DariKota Malang — Oleh-Oleh Artisan Kayutangan Heritage",
  description:
    "Toko oleh-oleh artisan & creative market di kawasan Kayutangan Heritage, Malang. Postcard, pin enamel, kriya kayu, tote bag, dan karya kreatif lokal lainnya.",
  robots: {
    index: false,
    follow: false,
  },
  keywords: [
    "Malang",
    "Kayutangan",
    "oleh-oleh Malang",
    "artisan",
    "creative market",
    "kriya",
  ],
  authors: [{ name: "Sesuatu DariKota Malang" }],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className="antialiased bg-background text-foreground min-h-screen"
      >
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
