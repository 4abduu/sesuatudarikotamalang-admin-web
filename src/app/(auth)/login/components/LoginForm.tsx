"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CircleAlert, Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { useUserAuth, demoUsers } from "@/lib/user-auth";
import { apiFetch, ApiError } from "@/lib/api";
import { User } from "@/lib/types";

const inputClass =
  "h-12 w-full rounded-xl border border-input bg-card px-4 text-base text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/20 aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-4 aria-[invalid=true]:ring-destructive/15";

export function LoginForm() {
  const router = useRouter();
  const login = useUserAuth((s) => s.login);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invalid, setInvalid] = useState({ email: false, password: false });

  const clearError = () => {
    if (error) setError(null);
    if (invalid.email || invalid.password) setInvalid({ email: false, password: false });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    const emailValue = email.trim();
    const passwordValue = password.trim();

    if (!emailValue || !passwordValue) {
      setInvalid({ email: !emailValue, password: !passwordValue });
      setError("Isi email dan password dulu ya.");
      (emailValue ? passwordRef : emailRef).current?.focus();
      return;
    }

    clearError();
    setLoading(true);
    let succeeded = false;

    try {
      const data = await apiFetch<{ token: string; user: User }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: emailValue, password: passwordValue }),
      });

      if (data.user.role !== "admin") {
        setError("Akun ini bukan akun admin.");
        return;
      }

      localStorage.setItem("token", data.token);
      login(data.user);
      toast.success("Berhasil masuk. Selamat datang, Admin!");
      succeeded = true;
      router.push("/");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 429) {
          setError("Terlalu banyak percobaan. Tunggu beberapa menit, lalu coba lagi.");
        } else if (err.code === "GOOGLE_ACCOUNT") {
          setError("Akun ini terdaftar lewat Google, jadi tidak bisa masuk dengan password.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Tidak bisa terhubung ke server. Periksa koneksi, lalu coba lagi.");
      }
    } finally {
      // Saat berhasil, tombol tetap nonaktif sampai halaman berpindah.
      if (!succeeded) setLoading(false);
    }
  };

  const demoAdmin = () => {
    login(demoUsers.admin.user);
    toast.success("Masuk sebagai Admin");
    router.push("/");
  };

  return (
    <>
      <form onSubmit={handleSubmit} aria-busy={loading} className="mt-8 space-y-5">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold text-foreground">
            Email atau username
          </label>
          <input
            ref={emailRef}
            id="email"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearError();
            }}
            placeholder="admin@darikotamalang.id"
            aria-invalid={invalid.email}
            aria-describedby={error ? "login-error" : undefined}
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-semibold text-foreground">
            Password
          </label>
          <div className="relative">
            <input
              ref={passwordRef}
              id="password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError();
              }}
              placeholder="••••••••"
              aria-invalid={invalid.password}
              aria-describedby={error ? "login-error" : undefined}
              className={`${inputClass} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Sembunyikan password" : "Tampilkan password"}
              className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div
            id="login-error"
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-sm text-destructive animate-in fade-in duration-200 motion-reduce:animate-none"
          >
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="font-display inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-lg font-bold text-primary-foreground shadow-[0_3px_0_0_#7a301d] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 active:translate-y-0.5 active:shadow-[0_1px_0_0_#7a301d] disabled:pointer-events-none disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <LogIn className="h-5 w-5" aria-hidden="true" />
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