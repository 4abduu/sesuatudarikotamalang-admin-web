"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  User,
  Mail,
  Phone,
  Package,
  Clock,
  Sparkles,
  Users,
  Loader2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { AppStatusBadge } from "@/app/(dashboard)/components/admin-ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { apiFetch, ApiError } from "@/lib/api";
import { ArtisanApplication } from "@/lib/types";

function toWaLink(raw: string) {
  const digits = raw.replace(/[^\d]/g, "");
  const normalized = digits.startsWith("0") ? "62" + digits.slice(1) : digits;
  return `https://wa.me/${normalized}`;
}

function formatDateID(iso: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ApplicationDetail({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [application, setApplication] = useState<ArtisanApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [processing, setProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [brandConflictError, setBrandConflictError] = useState<string | null>(null);

  const fetchApplication = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ applications: ArtisanApplication[] }>("/api/admin/applications");
      const found = res.applications.find((a) => String(a.id) === String(applicationId));
      if (!found) {
        setError("Pengajuan tidak ditemukan");
      } else {
        setApplication(found);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memuat data pengajuan");
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const handleApprove = async () => {
    if (!application || processing) return;
    setProcessing(true);
    setBrandConflictError(null);
    try {
      await apiFetch(`/api/admin/applications/${application.id}/approve`, {
        method: "POST",
      });
      toast.success("Pengajuan disetujui. Pemohon kini berperan sebagai kreator.");
      router.push("/kreator");
    } catch (err) {
      if (err instanceof ApiError && (err.code === "BRAND_NAME_TAKEN" || err.status === 409)) {
        setBrandConflictError(
          err.message || "Nama brand sudah dipakai kreator lain atau sedang diajukan. Gunakan nama lain."
        );
      } else {
        toast.error(err instanceof ApiError ? err.message : "Gagal menyetujui pengajuan");
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!application || processing) return;
    setProcessing(true);
    try {
      const trimmed = rejectReason.trim();
      await apiFetch(`/api/admin/applications/${application.id}/reject`, {
        method: "POST",
        body: JSON.stringify(trimmed ? { reason: trimmed } : {}),
      });
      toast.success("Pengajuan ditolak.");
      setRejectDialogOpen(false);
      router.push("/kreator");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal menolak pengajuan");
    } finally {
      setProcessing(false);
    }
  };

  const openRejectWithConflictReason = () => {
    setRejectReason("Nama brand sudah dipakai. Silakan ajukan ulang dengan nama brand lain.");
    setRejectDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="grid min-h-[400px] place-items-center rounded-xl border border-border bg-card p-12">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Memuat data pengajuan…</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="grid min-h-[300px] place-items-center rounded-xl border border-destructive/30 bg-destructive/5 p-12 text-center">
        <div className="flex flex-col items-center gap-4 max-w-md">
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <div>
            <h3 className="text-base font-bold text-foreground">Pengajuan Tidak Ditemukan</h3>
            <p className="mt-1 text-sm text-muted-foreground">{error ?? "Data tidak tersedia"}</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/kreator">Kembali ke Daftar Kreator</Link>
          </Button>
        </div>
      </div>
    );
  }

  const samplePhotos = application.samplePhotos ?? (application.sampleFileUrl ? [application.sampleFileUrl] : []);

  return (
    <div>
      {/* Back link */}
      <Link
        href="/kreator"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke daftar pengajuan
      </Link>

      {/* Header */}
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-display text-2xl font-bold text-foreground md:text-[28px]">
              {application.applicantName}
            </h1>
            <AppStatusBadge status={application.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Brand: <span className="font-medium text-foreground">{application.brandName}</span>
            <span className="mx-2 text-border">·</span>
            <Clock className="mr-1 inline h-3.5 w-3.5" />
            Diajukan: {formatDateID(application.submittedAt)}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_22rem]">
        {/* ============================== MAIN COLUMN ============================== */}
        <div className="flex flex-col gap-6">
          {/* Data Diri */}
          <Card className="gap-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
                <User className="h-4 w-4 text-primary" />
                Data Diri
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-lg border border-border bg-background/60 p-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-accent/15 text-accent">
                  <User className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">Nama Pemohon</p>
                  <p className="truncate text-sm font-semibold text-foreground">
                    {application.applicantName}
                  </p>
                </div>
              </div>
              <a
                href={toWaLink(application.contact)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 rounded-lg border border-border bg-background/60 p-3 transition-colors hover:border-primary/40 hover:bg-secondary/40"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-accent/15 text-accent">
                  <Phone className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">WhatsApp</p>
                  <p className="truncate text-sm font-semibold text-foreground">
                    {application.contact}
                  </p>
                </div>
              </a>
              {application.user?.email && (
                <a
                  href={`mailto:${application.user.email}`}
                  className="flex items-start gap-3 rounded-lg border border-border bg-background/60 p-3 transition-colors hover:border-primary/40 hover:bg-secondary/40 sm:col-span-2"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary/15 text-primary">
                    <Mail className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">Email</p>
                    <p className="truncate text-sm font-semibold text-foreground">
                      {application.user.email}
                    </p>
                  </div>
                </a>
              )}
            </CardContent>
          </Card>

          {/* Tentang Karya */}
          <Card className="gap-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
                <Package className="h-4 w-4 text-primary" />
                Tentang Karya
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Nama Brand</p>
                  <p className="text-sm font-semibold text-foreground">
                    {application.brandName}
                  </p>
                </div>
                <div className="ml-auto">
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Kategori</p>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {application.category?.name || "Kategori Umum"}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Deskripsi</p>
                <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                  {application.description}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Foto Sampel Karya */}
          <Card className="gap-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
                <Sparkles className="h-4 w-4 text-primary" />
                Foto Sampel Karya
              </CardTitle>
            </CardHeader>
            <CardContent>
              {samplePhotos.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {samplePhotos.map((src, i) => (
                    <a
                      key={i}
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative block aspect-square w-full overflow-hidden rounded-xl border border-border bg-secondary"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={`Sampel ${i + 1}`}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                      <span className="absolute bottom-2 right-2 rounded bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Pemohon tidak menyertakan foto sampel karya.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ============================== SIDEBAR ============================== */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Card className="gap-0">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base font-bold">Aksi Kurasi</CardTitle>
            </CardHeader>
            <CardContent>
              {brandConflictError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Nama Brand Bentrok (409)</AlertTitle>
                  <AlertDescription className="mt-1 space-y-2 text-xs">
                    <p>{brandConflictError}</p>
                    <p className="text-muted-foreground">
                      Tolak pengajuan ini dengan alasan agar pemohon mengajukan ulang dengan nama brand lain.
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="mt-2 w-full text-xs"
                      onClick={openRejectWithConflictReason}
                    >
                      Tolak dengan alasan ini
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {application.status === "pending" ? (
                <div className="flex flex-col gap-3">
                  <Button
                    type="button"
                    size="lg"
                    className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={processing}
                    onClick={handleApprove}
                  >
                    {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                    Setujui Pengajuan
                  </Button>

                  <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        size="lg"
                        variant="outline"
                        className="w-full gap-2 border-destructive/40 text-destructive hover:bg-destructive hover:text-white"
                        disabled={processing}
                      >
                        <XCircle className="h-5 w-5" />
                        Tolak Pengajuan
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Tolak pengajuan ini?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Alasan penolakan opsional (maksimal 500 karakter). Alasan akan membantu pemohon memahami keputusan kurasi.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <Label htmlFor="reject-reason" className="text-xs">
                            Alasan penolakan
                          </Label>
                          <span>{rejectReason.length}/500</span>
                        </div>
                        <Textarea
                          id="reject-reason"
                          placeholder="Contoh: foto sampel kurang jelas, kategori sudah penuh."
                          value={rejectReason}
                          maxLength={500}
                          onChange={(e) => setRejectReason(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={processing}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-white hover:bg-destructive/90"
                          disabled={processing || rejectReason.length > 500}
                          onClick={handleReject}
                        >
                          {processing ? "Memproses…" : "Ya, tolak pengajuan"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Setelah disetujui, pemohon otomatis berubah peran menjadi{" "}
                    <span className="font-semibold text-foreground">kreator</span> dan profil tokonya aktif.
                  </p>
                </div>
              ) : application.status === "diterima" ? (
                <div className="flex flex-col items-center gap-3 py-2 text-center">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-accent/15 text-accent">
                    <CheckCircle2 className="h-8 w-8" />
                  </span>
                  <div>
                    <p className="font-display text-base font-bold text-foreground">Pengajuan Disetujui</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {application.decidedAt ? `Diputuskan pada ${formatDateID(application.decidedAt)}` : "Status: Diterima"}
                    </p>
                  </div>
                  <Button asChild className="mt-1 w-full gap-2">
                    <Link href="/kreator">
                      <Users className="h-4 w-4" />
                      Lihat Daftar Kreator
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-2 text-center">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-destructive/15 text-destructive">
                    <XCircle className="h-8 w-8" />
                  </span>
                  <div>
                    <p className="font-display text-base font-bold text-foreground">Pengajuan Ditolak</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {application.decidedAt ? `Diputuskan pada ${formatDateID(application.decidedAt)}` : "Status: Ditolak"}
                    </p>
                  </div>
                  {application.rejectReason && (
                    <div className="w-full rounded-md border border-border bg-muted/40 p-3 text-left text-xs text-foreground/80">
                      <span className="font-semibold text-foreground">Alasan: </span>
                      {application.rejectReason}
                    </div>
                  )}
                  <Button asChild variant="outline" className="mt-1 w-full gap-2">
                    <Link href="/kreator">
                      <ArrowLeft className="h-4 w-4" />
                      Kembali ke daftar
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
