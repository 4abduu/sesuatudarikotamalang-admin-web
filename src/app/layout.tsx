import type { Metadata } from "next";
import { Baloo_2, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SiteShell } from "@/components/site/site-shell";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sesuatu DariKota Malang — Oleh-Oleh Artisan Kayutangan Heritage",
  description:
    "Toko oleh-oleh artisan & creative market di kawasan Kayutangan Heritage, Malang. Postcard, pin enamel, kriya kayu, tote bag, dan karya kreatif lokal lainnya.",
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
        className={`${baloo.variable} ${poppins.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <SiteShell>{children}</SiteShell>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
