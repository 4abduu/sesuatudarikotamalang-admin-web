"use client";

import { useState } from "react";
import { Info, Loader2, Mail, Pencil, Phone, Save } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AppSettings } from "@/lib/types";

const MAX_ABOUT = 3000;

interface AboutSettingsCardProps {
  settings: AppSettings;
  /** Simpan sebagian pengaturan (PUT /api/admin/settings). Mengembalikan true bila berhasil. */
  onSave: (patch: Record<string, unknown>) => Promise<boolean>;
}

export function AboutSettingsCard({ settings, onSave }: AboutSettingsCardProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState("");
  const [emailDraft, setEmailDraft] = useState("");

  const description = settings.aboutDescription ?? "";
  const email = settings.contactEmail ?? "";
  const whatsapp = settings.whatsappAdminNumber ?? "";

  function startEdit() {
    setDraft(description);
    setEmailDraft(email);
    setEditing(true);
  }

  async function handleSave() {
    const nextEmail = emailDraft.trim();
    if (nextEmail && (nextEmail.length > 191 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail))) {
      toast.error("Format email kontak tidak valid");
      return;
    }
    if (draft.length > MAX_ABOUT) {
      toast.error(`Deskripsi maksimal ${MAX_ABOUT} karakter`);
      return;
    }
    setSaving(true);
    const ok = await onSave({ aboutDescription: draft.trim(), contactEmail: nextEmail });
    setSaving(false);
    if (ok) setEditing(false);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#6B7A3D]/15 text-accent">
                <Info className="h-4 w-4" />
              </span>
              Halaman Tentang Kami
            </CardTitle>
            <CardDescription className="mt-1.5">
              Deskripsi dan email kontak yang tampil di halaman &ldquo;Tentang Kami&rdquo; pada aplikasi mobile.
            </CardDescription>
          </div>
          {!editing && (
            <Button variant="outline" size="sm" className="gap-2" onClick={startEdit}>
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {editing ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="about-description">Deskripsi</Label>
              <Textarea
                id="about-description"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={12}
                className="min-h-56"
                placeholder="Ceritakan tentang toko. Pisahkan paragraf dengan satu baris kosong."
                disabled={saving}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Teks biasa. Baris kosong dipakai sebagai pemisah paragraf.</span>
                <span className={draft.length > MAX_ABOUT ? "font-semibold text-destructive" : undefined}>
                  {draft.length}/{MAX_ABOUT}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-email" className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Email kontak
              </Label>
              <Input
                id="contact-email"
                type="email"
                value={emailDraft}
                onChange={(e) => setEmailDraft(e.target.value)}
                placeholder="halo@sesuatudarikota.com"
                className="w-full sm:max-w-[320px]"
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground">
                Email ini tampil ke publik. Beda dengan &ldquo;Email Notifikasi Admin&rdquo; yang hanya dipakai server.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="ghost" onClick={() => setEditing(false)} disabled={saving}>
                Batal
              </Button>
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Simpan
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-lg border border-border bg-secondary/30 p-4">
              {description ? (
                <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{description}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Belum ada deskripsi. Klik &ldquo;Edit&rdquo; untuk menulisnya.
                </p>
              )}
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <dt className="sr-only">Email kontak</dt>
                <dd className={email ? "text-foreground" : "text-muted-foreground"}>{email || "Email belum diisi"}</dd>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <dt className="sr-only">Nomor WhatsApp</dt>
                <dd className={whatsapp ? "text-foreground" : "text-muted-foreground"}>
                  {whatsapp || "WhatsApp belum diisi"}
                </dd>
              </div>
            </dl>
            <p className="text-xs text-muted-foreground">
              Nomor WhatsApp diambil dari kartu &ldquo;Kontak Toko &amp; Notifikasi&rdquo; di atas, jadi satu nomor yang
              sama dipakai di halaman ini dan tombol WhatsApp di detail produk.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
