"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ImagePlus,
  Plus,
  Trash2,
  Save,
  X,
  Loader2,
  Sparkles,
  RefreshCw,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  CloudOff,
  ChevronRight,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch, ApiError } from "@/lib/api";
import { Category } from "@/lib/types";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Cartesian product helper (sebelumnya dari @/data/products) */
function cartesian(arrays: string[][]): string[][] {
  return arrays.reduce<string[][]>(
    (acc, curr) => acc.flatMap((a) => curr.map((b) => [...a, b])),
    [[]]
  );
}

export type ProductFormInitialValues = {
  name: string;
  categoryId: string;
  price: string;
  shortDesc: string;
  description: string;
  limited: boolean;
  shopeeUrl?: string;
  singleStock: string;
  variantOptions: { name: string; valuesText: string }[];
  variantStocks: Record<string, string>;
  variantIds?: Record<string, string>;
  hasStory: boolean;
  story: { title: string; body: string; process: string };
  existingImages?: string[];
};

export const emptyInitialValues: ProductFormInitialValues = {
  name: "",
  categoryId: "",
  price: "",
  shortDesc: "",
  description: "",
  limited: false,
  shopeeUrl: "",
  singleStock: "",
  variantOptions: [],
  variantStocks: {},
  variantIds: {},
  hasStory: false,
  story: { title: "", body: "", process: "" },
  existingImages: [],
};

type Errors = {
  name?: string;
  price?: string;
};

export function ProductFormFields({
  initialValues,
  submitLabel,
  submitting = false,
  onSubmit,
  mode = "create",
}: {
  initialValues: ProductFormInitialValues;
  submitLabel: string;
  submitting?: boolean;
  onSubmit: (values: ProductFormInitialValues) => void;
  mode?: "create" | "edit";
}) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    apiFetch<{ categories: Category[] }>("/api/categories")
      .then((res) => setCategories(res.categories || []))
      .catch(() => {/* kategori gagal dimuat — select tetap bisa diisi manual */});
  }, []);
  const router = useRouter();
  const [name, setName] = useState(initialValues.name);
  const [categoryId, setCategoryId] = useState(initialValues.categoryId);
  const [price, setPrice] = useState(initialValues.price);
  const [shortDesc, setShortDesc] = useState(initialValues.shortDesc);
  const [description, setDescription] = useState(initialValues.description);
  const [limited, setLimited] = useState(initialValues.limited);
  const [singleStock, setSingleStock] = useState(initialValues.singleStock);
  const [variantOptions, setVariantOptions] = useState(
    initialValues.variantOptions,
  );
  const [variantStocks, setVariantStocks] = useState(initialValues.variantStocks);
  const [hasStory, setHasStory] = useState(initialValues.hasStory);
  const [storyTitle, setStoryTitle] = useState(initialValues.story.title);
  const [storyBody, setStoryBody] = useState(initialValues.story.body);
  const [storyProcess, setStoryProcess] = useState(
    initialValues.story.process,
  );
  const [photos, setPhotos] = useState<File[]>([]);
  const [processPhotos, setProcessPhotos] = useState<File[]>([]);
  const [errors, setErrors] = useState<Errors>({});

  function addOption() {
    if (variantOptions.length >= 3) return;
    setVariantOptions((prev) => [...prev, { name: "", valuesText: "" }]);
  }

  function removeOption(idx: number) {
    setVariantOptions((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateOption(
    idx: number,
    field: "name" | "valuesText",
    value: string,
  ) {
    setVariantOptions((prev) =>
      prev.map((o, i) => (i === idx ? { ...o, [field]: value } : o)),
    );
  }

  // Derive valid option axes + their cartesian product of combinations.
  const parsedOptions = useMemo(
    () =>
      variantOptions.map((o) => ({
        name: o.name.trim(),
        values: o.valuesText
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
      })),
    [variantOptions],
  );
  const optionsComplete =
    parsedOptions.length > 0 &&
    parsedOptions.every((o) => o.name.length > 0 && o.values.length > 0);
  const combos = useMemo(
    () => (optionsComplete ? cartesian(parsedOptions.map((o) => o.values)) : []),
    [parsedOptions, optionsComplete],
  );

  function handlePhotos(list: FileList | null) {
    if (!list) return;
    setPhotos(Array.from(list));
  }

  function handleProcessPhotos(list: FileList | null) {
    if (!list) return;
    setProcessPhotos(Array.from(list));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (!name.trim()) next.name = "Nama produk wajib diisi";
    if (!price.trim() || Number(price) <= 0)
      next.price = "Harga wajib diisi";
    setErrors(next);
    if (Object.keys(next).length > 0) {
      toast.error("Lengkapi isian yang wajib diisi");
      return;
    }
    onSubmit({
      name,
      categoryId,
      price,
      shortDesc,
      description,
      limited,
      shopeeUrl: initialValues.shopeeUrl,
      singleStock,
      variantOptions,
      variantStocks,
      variantIds: initialValues.variantIds,
      hasStory,
      story: { title: storyTitle, body: storyBody, process: storyProcess },
      existingImages: initialValues.existingImages,
    });
  }

  const priceNum = Number(price);
  const showPriceHint = price.trim() !== "" && priceNum > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ===== Informasi Dasar ===== */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-base font-bold">
            Informasi Dasar
          </CardTitle>
          <CardDescription className="text-xs">
            Detail utama produk yang tayang di toko.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>
                Nama Produk <span className="text-destructive">*</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Postcard Jendela Kayutangan"
                className={cn(errors.name && "border-destructive")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Kategori</Label>
              <Select value={categoryId} onValueChange={(v) => setCategoryId(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>
                Harga <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-2.5 text-sm text-muted-foreground">
                  Rp
                </span>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  className={cn("pl-9", errors.price && "border-destructive")}
                />
              </div>
              {errors.price && (
                <p className="text-xs text-destructive">{errors.price}</p>
              )}
              {showPriceHint && (
                <p className="text-[11px] text-muted-foreground">
                  Format: {formatRupiah(priceNum)}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Deskripsi Singkat</Label>
              <Input
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="Satu kalimat penjelas produk"
              />
              <p className="text-[11px] text-muted-foreground">
                Dipakai di kartu produk & hasil pencarian.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Deskripsi Lengkap</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Bahan, ukuran, keunikan, cara perawatan, dll."
              className="min-h-28"
            />
          </div>

          {/* Limited toggle */}
          <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-4">
            <Switch
              checked={limited}
              onCheckedChange={(v) => setLimited(v === true)}
              className="mt-0.5"
            />
            <div>
              <p className="text-sm font-semibold text-foreground">
                Produk Limited Edition
              </p>
              <p className="text-xs text-muted-foreground">
                Tandai sebagai edisi terbatas (badge &ldquo;limited&rdquo; muncul
                di kartu produk).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== Foto Produk ===== */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-base font-bold">
            Foto Produk
          </CardTitle>
          <CardDescription className="text-xs">
            Upload foto utama dan tambahan. Visual saja — belum tersimpan ke
            server.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PhotoDropzone
            id="product-photos"
            files={photos}
            onChange={handlePhotos}
            onRemove={(i) =>
              setPhotos((prev) => prev.filter((_, idx) => idx !== i))
            }
          />
        </CardContent>
      </Card>

      {/* ===== Varian & Stok ===== */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-base font-bold">
            Varian &amp; Stok
          </CardTitle>
          <CardDescription className="text-xs">
            Kalau produk punya varian (mis. motif × ukuran), tambahkan sumbu
            opsinya di sini. Stok dihitung per kombinasi.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {variantOptions.length === 0 ? (
            <div className="space-y-1.5">
              <Label>Stok Tunggal</Label>
              <Input
                type="number"
                value={singleStock}
                onChange={(e) => setSingleStock(e.target.value)}
                placeholder="0"
                className="max-w-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Produk tanpa varian. Klik &ldquo;Tambah Opsi&rdquo; kalau produk
                punya motif/ukuran/warna berbeda.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground">
                Tentukan sumbu varian. Contoh: opsi &ldquo;Motif&rdquo; dengan
                nilai &ldquo;Ubin, Sulur&rdquo;, lalu tambah opsi
                &ldquo;Ukuran&rdquo; dengan &ldquo;S, M, L&rdquo;. Stok dihitung
                per kombinasi.
              </p>
              {variantOptions.map((o, i) => (
                <div
                  key={i}
                  className="grid items-end gap-3 sm:grid-cols-[160px_1fr_auto]"
                >
                  <div className="space-y-1.5">
                    <Label>Nama Opsi</Label>
                    <Input
                      value={o.name}
                      onChange={(e) => updateOption(i, "name", e.target.value)}
                      placeholder="Contoh: Motif"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Nilai (pisahkan koma)</Label>
                    <Input
                      value={o.valuesText}
                      onChange={(e) =>
                        updateOption(i, "valuesText", e.target.value)
                      }
                      placeholder="Contoh: Ubin, Sulur"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeOption(i)}
                    aria-label="Hapus opsi"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addOption}
            disabled={variantOptions.length >= 3}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Tambah Opsi
            {variantOptions.length > 0 && ` (${variantOptions.length}/3)`}
          </Button>

          {/* Combination stock matrix */}
          {variantOptions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">
                  Stok per Kombinasi
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  {combos.length} kombinasi
                </span>
              </div>
              {!optionsComplete ? (
                <p className="rounded-lg border border-dashed border-border bg-secondary/30 px-3 py-2 text-[11px] text-muted-foreground">
                  Lengkapi nama opsi dan minimal 1 nilai di tiap opsi untuk
                  membuat matriks stok.
                </p>
              ) : (
                <div className="max-h-72 overflow-y-auto scroll-soft rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-card">
                      <tr className="border-b border-border text-left">
                        <th className="px-3 py-2 font-medium text-muted-foreground">
                          Kombinasi
                        </th>
                        <th className="w-32 px-3 py-2 text-right font-medium text-muted-foreground">
                          Stok
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {combos.map((combo) => {
                        const key = combo.join(" / ");
                        return (
                          <tr
                            key={key}
                            className="border-b border-border/60 last:border-0"
                          >
                            <td className="px-3 py-2 font-medium text-foreground">
                              {key}
                            </td>
                            <td className="px-3 py-2 text-right">
                              <Input
                                type="number"
                                value={variantStocks[key] ?? ""}
                                onChange={(e) =>
                                  setVariantStocks((prev) => ({
                                    ...prev,
                                    [key]: e.target.value,
                                  }))
                                }
                                placeholder="0"
                                className="ml-auto h-9 w-24 text-right"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ===== Behind the Design ===== */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="font-display text-base font-bold">
                Behind the Design
              </CardTitle>
              <CardDescription className="text-xs">
                Tambahkan cerita di balik produk. Muncul di halaman detail
                produk.
              </CardDescription>
            </div>
            <Switch
              checked={hasStory}
              onCheckedChange={(v) => setHasStory(v === true)}
              className="mt-1"
            />
          </div>
        </CardHeader>
        {hasStory && (
          <CardContent className="space-y-5">
            {/* ===== Bantu Tulis dengan AI (opsional) ===== */}
            <StoryAiHelperButton
              productName={name}
              category={categories.find((c) => String(c.id) === categoryId)?.name}
              onApplyDraft={(draft) => {
                setStoryTitle(draft.title);
                setStoryBody(draft.body);
              }}
              hasExistingContent={
                storyTitle.trim().length > 0 || storyBody.trim().length > 0
              }
            />

            <div className="space-y-1.5">
              <Label>Judul Cerita</Label>
              <Input
                value={storyTitle}
                onChange={(e) => setStoryTitle(e.target.value)}
                placeholder="Contoh: Jendela yang Nggak Pernah Ketutup"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Cerita</Label>
              <Textarea
                value={storyBody}
                onChange={(e) => setStoryBody(e.target.value)}
                placeholder="Cerita inspirasi di balik karya ini…"
                className="min-h-28"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Proses Pembuatan (ringkas)</Label>
              <Textarea
                value={storyProcess}
                onChange={(e) => setStoryProcess(e.target.value)}
                placeholder="Contoh: Sketsa pensil → pensil warna → pindai → cetak digital."
                className="min-h-20"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Foto Proses</Label>
              <PhotoDropzone
                id="process-photos"
                files={processPhotos}
                onChange={handleProcessPhotos}
                onRemove={(i) =>
                  setProcessPhotos((prev) => prev.filter((_, idx) => idx !== i))
                }
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* ===== Sticky action bar ===== */}
      <div className="sticky bottom-0 z-10 -mx-4 flex flex-col-reverse items-stretch gap-3 border-t border-border bg-card/95 px-4 py-3 backdrop-blur sm:flex-row sm:items-center sm:justify-end md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/produk")}
          className="gap-1.5"
          disabled={submitting}
        >
          <ArrowLeft className="h-4 w-4" />
          Batal
        </Button>
        <Button type="submit" className="gap-2" disabled={submitting}>
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

/* ---- subcomponent: photo dropzone ---- */
function PhotoDropzone({
  id,
  files,
  onChange,
  onRemove,
}: {
  id: string;
  files: File[];
  onChange: (list: FileList | null) => void;
  onRemove: (idx: number) => void;
}) {
  return (
    <div className="space-y-3">
      <label
        htmlFor={id}
        className="group flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background px-4 py-6 text-center transition-colors hover:border-primary/50 hover:bg-secondary/40"
      >
        <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-primary transition-transform group-hover:scale-110">
          <ImagePlus className="h-5 w-5" />
        </span>
        <span className="text-sm font-medium text-foreground">
          Klik untuk unggah foto
        </span>
        <span className="text-[11px] text-muted-foreground">
          Bisa pilih banyak · JPG/PNG · visual saja
        </span>
        <input
          id={id}
          type="file"
          multiple
          accept="image/*"
          className="sr-only"
          onChange={(e) => onChange(e.target.files)}
        />
      </label>
      {files.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs"
            >
              <span className="max-w-40 truncate">{f.name}</span>
              <button
                type="button"
                aria-label={`Hapus ${f.name}`}
                onClick={() => onRemove(i)}
                className="grid h-4 w-4 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bantu Tulis dengan AI — tombol opsional + dialog 4-state           */
/*                                                                    */
/* Menggunakan endpoint resmi: POST /api/ai/story-draft               */
/* AI TIDAK PERNAH menyimpan otomatis ke server. Hanya mengisi        */
/* Judul + Cerita di form parent via `onApplyDraft`.                  */
/* ------------------------------------------------------------------ */

type StoryAiDraft = {
  title: string;
  body: string;
};

type StoryAiState = "idle" | "loading" | "result" | "error";

type StoryAiError = {
  message: string;
  code?: string;
};

function StoryAiHelperButton({
  productName,
  category,
  onApplyDraft,
  hasExistingContent,
}: {
  productName?: string;
  category?: string;
  onApplyDraft: (draft: StoryAiDraft) => void;
  hasExistingContent: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex w-full items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/10"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-foreground">
            Bantu Tulis dengan AI
          </span>
          <span className="block text-xs text-muted-foreground">
            Isi poin singkat, AI susun draft ceritanya.
          </span>
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 text-primary" />
      </button>

      <StoryAiDialog
        open={open}
        onOpenChange={setOpen}
        productName={productName}
        category={category}
        onApplyDraft={onApplyDraft}
        hasExistingContent={hasExistingContent}
      />
    </>
  );
}

function StoryAiDialog({
  open,
  onOpenChange,
  productName,
  category,
  onApplyDraft,
  hasExistingContent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName?: string;
  category?: string;
  onApplyDraft: (draft: StoryAiDraft) => void;
  hasExistingContent: boolean;
}) {
  const [aiState, setAiState] = useState<StoryAiState>("idle");
  const [draft, setDraft] = useState<StoryAiDraft | null>(null);
  const [error, setError] = useState<StoryAiError | null>(null);

  const [motif, setMotif] = useState("");
  const [process, setProcess] = useState("");
  const [inspiration, setInspiration] = useState("");

  const validPoints = [motif.trim(), process.trim(), inspiration.trim()].filter(
    (p) => p.length > 0 && p.length <= 300
  );
  const totalChars = validPoints.reduce((sum, p) => sum + p.length, 0);
  const canGenerate = validPoints.length > 0 && totalChars >= 30;

  function handleOpenChange(next: boolean) {
    if (!next) {
      setTimeout(() => {
        setAiState("idle");
        setDraft(null);
        setError(null);
      }, 200);
    }
    onOpenChange(next);
  }

  async function handleGenerate() {
    if (!canGenerate) return;
    setAiState("loading");
    setError(null);

    try {
      const res = await apiFetch<{
        draft: { judul: string; isi: string };
        meta?: { aiGenerated: boolean };
      }>("/api/ai/story-draft", {
        method: "POST",
        body: JSON.stringify({
          productName: productName?.trim() || undefined,
          category: category?.trim() || undefined,
          motif: motif.trim() || undefined,
          process: process.trim() || undefined,
          inspiration: inspiration.trim() || undefined,
        }),
      });

      if (res?.draft?.judul && res?.draft?.isi) {
        setDraft({
          title: res.draft.judul,
          body: res.draft.isi,
        });
        setAiState("result");
      } else {
        throw new Error("Draft tidak valid dari bantuan AI");
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError({
          message: err.message || "Bantuan AI sedang tidak tersedia",
          code: err.code,
        });
      } else if (err instanceof Error) {
        setError({ message: err.message });
      } else {
        setError({ message: "Terjadi kesalahan saat memproses permintaan AI" });
      }
      setAiState("error");
    }
  }

  function handleUseDraft() {
    if (!draft) return;
    if (hasExistingContent) {
      const ok = window.confirm(
        "Isi cerita saat ini akan diganti dengan draft AI. Lanjut?"
      );
      if (!ok) return;
    }
    onApplyDraft(draft);
    handleOpenChange(false);
    toast.success("Draft dimasukkan ke form. Jangan lupa simpan produk ya.");
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            Bantu Tulis dengan AI
          </DialogTitle>
          <DialogDescription>
            AI hanya memakai poin yang kamu tulis, tidak mengarang fakta.
          </DialogDescription>
        </DialogHeader>

        {/* === State: idle === */}
        {aiState === "idle" && (
          <div className="space-y-4">
            <StoryAiPointField
              label="Motif / objek yang digambar"
              placeholder="Contoh: Singa dengan latar arsitektur heritage Kayutangan"
              value={motif}
              onChange={setMotif}
            />
            <StoryAiPointField
              label="Proses pembuatan"
              placeholder="Contoh: Sketsa tangan manual lalu didigitalkan dan dicetak di kertas bertekstur"
              value={process}
              onChange={setProcess}
            />
            <StoryAiPointField
              label="Inspirasi di baliknya"
              placeholder="Contoh: Suasana sore jalan Basuki Rahmat di kala lampu jalan mulai menyala"
              value={inspiration}
              onChange={setInspiration}
            />
            {!canGenerate && (
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                Isi minimal satu poin singkat dengan total minimal 30 karakter ya (saat ini: {totalChars}/30).
              </p>
            )}
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Buat Draft
            </Button>
          </div>
        )}

        {/* === State: loading === */}
        {aiState === "loading" && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2 text-primary">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
              <span className="text-sm font-semibold">
                AI lagi merangkai ceritamu…
              </span>
            </div>
            <div className="space-y-2">
              <div className="h-3.5 w-32 animate-pulse rounded bg-muted" />
              <div className="h-2.5 w-full animate-pulse rounded bg-muted" />
              <div className="h-2.5 w-[92%] animate-pulse rounded bg-muted" />
              <div className="h-2.5 w-[85%] animate-pulse rounded bg-muted" />
              <div className="mt-3 h-3.5 w-28 animate-pulse rounded bg-muted" />
              <div className="h-2.5 w-full animate-pulse rounded bg-muted" />
              <div className="h-2.5 w-[90%] animate-pulse rounded bg-muted" />
            </div>
          </div>
        )}

        {/* === State: result === */}
        {aiState === "result" && draft && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-amber-700 dark:text-amber-300">
              <Eye className="h-4 w-4 shrink-0" />
              <span className="text-xs font-semibold">
                Draft dari AI — periksa dulu sebelum disimpan
              </span>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Judul Cerita
              </Label>
              <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm font-semibold text-foreground">
                {draft.title}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Isi Cerita
              </Label>
              <div className="max-h-60 overflow-y-auto scroll-soft rounded-lg border border-border bg-muted/40 p-3 text-sm leading-relaxed text-foreground whitespace-pre-line">
                {draft.body}
              </div>
            </div>
            <Button
              type="button"
              onClick={handleUseDraft}
              className="w-full gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Gunakan Draft Ini
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleGenerate}
                className="gap-1.5"
              >
                <RefreshCw className="h-4 w-4" />
                Buat Ulang
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="gap-1.5"
              >
                <Edit3 className="h-4 w-4" />
                Tulis Sendiri
              </Button>
            </div>
          </div>
        )}

        {/* === State: error === */}
        {aiState === "error" && error && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <CloudOff className="h-4 w-4" />
              <AlertTitle>Yah, ada kendala</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
            <Button
              type="button"
              onClick={handleGenerate}
              className="w-full gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Coba Lagi
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="w-full gap-1.5"
            >
              <Edit3 className="h-4 w-4" />
              Tulis Sendiri
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function StoryAiPointField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const over = value.length > 300;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        <span
          className={cn(
            "text-[11px] tabular-nums",
            over ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {value.length}/300
        </span>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, 300))}
        placeholder={placeholder}
        rows={2}
        className="resize-none"
      />
    </div>
  );
}
