import React from "react";
import Link from "next/link";
import { LogoHand } from "@/components/site/line-art";
import { LoginForm } from "./components/LoginForm";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel kiri */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div className="absolute -right-10 -top-10 h-48 w-48 text-primary-foreground/15">
          <LogoHand className="h-full w-full" strokeWidth={2} />
        </div>
        <div className="absolute -bottom-12 left-8 h-40 w-40 text-primary-foreground/10">
          <LogoHand className="h-full w-full" strokeWidth={2} />
        </div>

        <header className="relative flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-foreground/15">
            <LogoHand className="h-6 w-6" strokeWidth={2.5} />
          </span>
          <div className="leading-tight">
            <p className="font-display text-lg font-extrabold">Sesuatu DariKota Malang</p>
            <p className="text-sm text-primary-foreground/70">Admin Panel</p>
          </div>
        </header>

        <div className="relative max-w-sm">
          <h2 className="font-display text-2xl font-bold leading-snug">
            Kelola toko, pesanan, dan kreator dari satu tempat.
          </h2>
          <p className="mt-3 text-sm text-primary-foreground/70">
            Dashboard internal untuk tim toko Kayutangan Heritage.
          </p>
        </div>

        <footer className="relative text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} Sesuatu DariKota Malang
        </footer>
      </section>

      {/* Form panel kanan */}
      <section className="flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm">
          {/* Mobile Header Logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <LogoHand className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <span className="font-display font-bold text-foreground">Admin Panel</span>
          </div>

          <header>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Masuk ke Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Gunakan akun admin toko untuk melanjutkan.
            </p>
          </header>

          {/* Form Komponen Interaktif */}
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
