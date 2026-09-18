"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  User,
  Mail,
  Phone,
  Package,
  Clock,
  ImageOff,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { AppStatusBadge } from "@/components/admin/admin-ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { ArtImage } from "@/components/site/art-image";
import { useUserAuth } from "@/lib/user-auth";
import { useUserApplications } from "@/lib/user-applications";
import { categories } from "@/data/categories";
import type { Application, ApplicationStatus } from "@/data/admin/applications";

const categoryByName: Record<string, string> = Object.fromEntries(
  categories.map((c) => [c.name, c.id]),
);

function toWaLink(raw: string) {
  const digits = raw.replace(/[^\d]/g, "");
  const normalized = digits.startsWith("0")
    ? "62" + digits.slice(1)
    : digits;
  return `https://wa.me/${normalized}`;
}

export function ApplicationDetail({ application }: { application: Application }) {
  // Initialize local status from prop — no setState-in-effect needed (lint-clean).
  const [status, setStatus] = useState<ApplicationStatus>(application.status);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  const categoryId = categoryByName[application.category];

  const handleAccept = () => {
    // Derive a creatorId from the application (slug from brandName or applicantName).
    // For user-submitted applications (from /daftar-kreator) the id will match
    // the user applications store; for the admin's static seed applications
    // (app1..app5) it won't — but the bridge calls below are harmless no-ops.
    const creatorId = application.brandName
      ? application.brandName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      : `creator-${application.id}`;
    // Bridge to the user session (works if admin & user share the browser —
    // prototype only; in a real app the backend would sync).
    useUserApplications.getState().approve(application.id); // no-op if not in user store
    useUserAuth.getState().becomeCreator(creatorId);
    setStatus("approved");
    toast.success("Pengajuan diterima! Kreator dipindahkan ke list aktif.");
  };

  const handleReject = () => {
    // Bridge to user applications store (no-op if not in user store — prototype only).
    useUserApplications.getState().reject(application.id, rejectReason || undefined);
    setStatus("rejected");
    setRejectDialogOpen(false);
    toast(
      rejectReason
        ? `Pengajuan ditolak: ${rejectReason.slice(0, 60)}`
        : "Pengajuan ditolak",
    );
  };

  return (
    <div>
      {/* Back link */}
      <Link
        href="/admin/kreator"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Semua pengajuan
      </Link>

      {/* Header */}
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-display text-2xl font-bold text-foreground md:text-[28px]">
              {application.applicantName}
            </h1>
            <AppStatusBadge status={status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Brand: <span className="font-medium text-foreground">{application.brandName}</span>
            <span className="mx-2 text-border">·</span>
            <Clock className="mr-1 inline h-3.5 w-3.5" />
            {application.submittedAt}
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
              <a
                href={`mailto:${application.email}`}
                className="flex items-start gap-3 rounded-lg border border-border bg-background/60 p-3 transition-colors hover:border-primary/40 hover:bg-secondary/40 sm:col-span-2"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary/15 text-primary">
                  <Mail className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">Email</p>
                  <p className="truncate text-sm font-semibold text-foreground">
                    {application.email}
                  </p>
                </div>
              </a>
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
                    {application.category}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                  Deskripsi
                </p>
                <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm leading-relaxed text-foreground/90">
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
              {application.samplePhotos.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {application.samplePhotos.map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={src}
                      alt={`Sampel ${i + 1}`}
                      className="aspect-square w-full rounded-xl object-cover"
                    />
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {[1, 2, 3].map((n) => (
                      <ArtImage
                        key={n}
                        variant="product"
                        seed={`${application.id}-${n}`}
                        categoryId={categoryId}
                        label={`Sampel ${n}`}
                        className="aspect-square w-full rounded-xl"
                      />
                    ))}
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1.5 text-xs text-muted-foreground">
                    <ImageOff className="h-3.5 w-3.5" />
                    Sampel belum diunggah — tampilan ilustrasi.
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ============================== SIDEBAR ============================== */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Card className="gap-0">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base font-bold">
                Aksi Kurasi
              </CardTitle>
            </CardHeader>
            <CardContent>
              {status === "pending" && (
                <div className="flex flex-col gap-3">
                  <Button
                    type="button"
                    size="lg"
                    className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={handleAccept}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    Terima Pengajuan
                  </Button>

                  <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        size="lg"
                        variant="outline"
                        className="w-full gap-2 border-destructive/40 text-destructive hover:bg-destructive hover:text-white"
                      >
                        <XCircle className="h-5 w-5" />
                        Tolak Pengajuan
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Tolak pengajuan ini?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Kreator akan menerima notifikasi penolakan via WhatsApp. Alasan
                          opsional — membantu kreator memperbaiki pengajuan berikutnya.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="space-y-1.5">
                        <Label htmlFor="reject-reason" className="text-xs">
                          Alasan penolakan (opsional)
                        </Label>
                        <Textarea
                          id="reject-reason"
                          placeholder="Contoh: foto sampel kurang jelas, kategori sudah terlalu banyak."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-white hover:bg-destructive/90"
                          onClick={handleReject}
                        >
                          Ya, tolak pengajuan
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Setelah diterima, kreator akan masuk ke list{" "}
                    <span className="font-semibold text-foreground">
                      &quot;Kreator Aktif&quot;
                    </span>{" "}
                    dan bisa mulai mengunggah produk.
                  </p>
                </div>
              )}

              {status === "approved" && (
                <div className="flex flex-col items-center gap-3 py-2 text-center">
                  <span className="animate-in zoom-in-95 grid h-14 w-14 place-items-center rounded-full bg-accent/15 text-accent duration-300">
                    <CheckCircle2 className="h-8 w-8" />
                  </span>
                  <div>
                    <p className="font-display text-base font-bold text-foreground">
                      Pengajuan Diterima
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Kreator dipindahkan ke list aktif.
                    </p>
                  </div>
                  <Button asChild className="mt-1 w-full gap-2">
                    <Link href="/admin/kreator">
                      <Users className="h-4 w-4" />
                      Lihat Kreator Aktif
                    </Link>
                  </Button>
                </div>
              )}

              {status === "rejected" && (
                <div className="flex flex-col items-center gap-3 py-2 text-center">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-destructive/15 text-destructive">
                    <XCircle className="h-8 w-8" />
                  </span>
                  <div>
                    <p className="font-display text-base font-bold text-foreground">
                      Pengajuan Ditolak
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Status pengajuan: ditolak.
                    </p>
                  </div>
                  {rejectReason && (
                    <div className="w-full rounded-md border border-border bg-muted/40 p-3 text-left text-xs text-foreground/80">
                      <span className="font-semibold text-foreground">Alasan: </span>
                      {rejectReason}
                    </div>
                  )}
                  <Button asChild variant="outline" className="mt-1 w-full gap-2">
                    <Link href="/admin/kreator">
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
