import type { Metadata } from "next";
import { LoginBrandPanel } from "./components/LoginBrandPanel";
import { LoginForm } from "./components/LoginForm";

export const metadata: Metadata = {
  title: "Masuk — Panel Admin Sesuatu DariKota Malang",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col lg:grid lg:grid-cols-[1.1fr_1fr]">
      <LoginBrandPanel />

      <section className="relative -mt-8 flex flex-1 items-start justify-center rounded-t-[2rem] bg-background px-6 pb-10 pt-10 lg:mt-0 lg:items-center lg:rounded-none lg:p-12">
        <div className="w-full max-w-sm">
          <header>
            <h1 className="font-display text-2xl font-extrabold sm:text-3xl leading-tight text-foreground">
              Masuk ke panel admin
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Gunakan akun admin toko untuk melanjutkan.
            </p>
          </header>

          <LoginForm />

          <div className="mt-8 border-t border-border pt-5">
            <p className="text-sm text-muted-foreground">
              Halaman ini khusus admin toko. Pembeli dan kreator masuk lewat aplikasi
              mobile.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              © {new Date().getFullYear()} Sesuatu DariKota Malang
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}