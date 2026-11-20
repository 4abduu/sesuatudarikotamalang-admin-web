import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const baloo = localFont({
  src: "../fonts/Baloo2-wght.ttf",
  variable: "--font-baloo",
  weight: "500 800",
  display: "swap",
});

const poppins = localFont({
  src: [
    { path: "../fonts/Poppins-Light.ttf", weight: "300", style: "normal" },
    { path: "../fonts/Poppins-Regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/Poppins-Medium.ttf", weight: "500", style: "normal" },
    { path: "../fonts/Poppins-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../fonts/Poppins-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-poppins",
  display: "swap",
});

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
        className={`${baloo.variable} ${poppins.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
