"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { useUserAuth, demoUsers } from "@/lib/user-auth";
import { apiFetch, ApiError } from "@/lib/api";
import { User } from "@/lib/types";

export function LoginForm() {
  const router = useRouter();
  const login = useUserAuth((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Isi email dan password dulu ya");
      return;
    }
    setLoading(true);

    try {
      const data = await apiFetch<{ token: string; user: User }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      if (data.user.role !== "admin") {
        toast.error("Akun ini bukan admin");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      login(data.user);
      toast.success("Berhasil masuk. Selamat datang, Admin!");
      router.push("/");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 429) {
          toast.error("Terlalu banyak percobaan. Silakan tunggu beberapa menit.");
        } else if (err.code === "GOOGLE_ACCOUNT") {
          toast.error("Akun ini hanya terdaftar via Google.");
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error("Gagal terhubung ke server");
      }
    } finally {
      setLoading(false);
    }
  };

  const demoAdmin = () => {
    login(demoUsers.admin.user);
    toast.success("Masuk sebagai Admin");
    router.push("/");
  };

  return (
    <>
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
{/* 
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
      </button> */}
    </>
  );
}
