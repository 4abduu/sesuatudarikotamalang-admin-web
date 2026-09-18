"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { useUserAuth, demoUsers } from "@/lib/user-auth";
import { LeafSprig } from "@/components/site/line-art";
import Link from "next/link";

/**
 * Admin Login page BODY (without any chrome/wrapper).
 *
 * Extracted from `app/admin/login/page.tsx` so the same content can be
 * rendered inside the AdminShell-less export-figma combo page. The original
 * route wraps this with no shell (login is outside (authed)/layout.tsx).
 */
export function AdminLoginContent() {
  const router = useRouter();
  const login = useUserAuth((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Isi email dan password dulu ya");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      // Match admin demo by email/password; otherwise accept any as admin.
      const admin =
        email.trim() === demoUsers.admin.user.email
          ? demoUsers.admin.user
          : {
              id: `u-admin-${Date.now()}`,
              name: "Admin Toko",
              email,
              password,
              role: "admin" as const,
            };
      login(admin);
      toast.success("Berhasil masuk. Selamat datang, Admin!");
      router.push("/admin");
    }, 700);
  };

  const demoAdmin = () => {
    login(demoUsers.admin.user);
    toast.success("Masuk sebagai Admin");
    router.push("/admin");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div className="absolute -right-10 -top-10 h-48 w-48 text-primary-foreground/15">
          <LeafSprig className="h-full w-full" strokeWidth={2} />
        </div>
        <div className="absolute -bottom-12 left-8 h-40 w-40 text-primary-foreground/10">
          <LeafSprig className="h-full w-full" strokeWidth={2} />
        </div>
        <div className="relative flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-foreground/15">
            <LeafSprig className="h-6 w-6" strokeWidth={2.5} />
          </span>
          <div className="leading-tight">
            <p className="font-display text-lg font-extrabold">Sesuatu DariKota Malang</p>
            <p className="text-sm text-primary-foreground/70">Admin Panel</p>
          </div>
        </div>
        <div className="relative max-w-sm">
          <p className="font-display text-2xl font-bold leading-snug">
            Kelola toko, pesanan, dan kreator dari satu tempat.
          </p>
          <p className="mt-3 text-sm text-primary-foreground/70">
            Dashboard internal untuk tim toko Kayutangan Heritage.
          </p>
        </div>
        <p className="relative text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} Sesuatu DariKota Malang
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <LeafSprig className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <span className="font-display font-bold text-foreground">Admin Panel</span>
          </div>

          <h1 className="font-display text-2xl font-bold text-foreground">
            Masuk ke Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gunakan akun admin toko untuk melanjutkan.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email / Username
              </label>
              <input
                id="email"
                type="text"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@darikotamalang.id"
                className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-lg border border-input bg-card px-3 pr-11 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Sembunyikan password" : "Tampilkan password"}
                  className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-105 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {loading ? "Memproses…" : "Masuk"}
            </button>
          </form>

          <div className="mt-6 rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Demo</p>
            <p className="mt-0.5">
              Klik tombol di bawah untuk masuk sebagai admin demo, atau isi
              email/password apa saja.
            </p>
          </div>

          <button
            type="button"
            onClick={demoAdmin}
            className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 text-sm font-semibold text-primary transition hover:border-primary/60 hover:bg-primary/10"
          >
            <LogIn className="h-4 w-4" />
            Masuk sebagai Admin (demo)
          </button>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-xs font-medium text-muted-foreground hover:text-primary"
            >
              ← Kembali ke toko
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
