"use client";

import { useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronLeft, ChevronRight, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  PHOTO_ACCEPT,
  deleteUploaded,
  prepareImageFile,
  uploadFiles,
  validatePhotoFile,
  validatePhotoType,
} from "@/lib/upload";

// ============================================================================
// MODEL DAN FUNGSI BANTU
// ============================================================================

export interface ImageVariantLink {
  url: string;
  option: string;
  value: string;
}

/** Satu opsi varian beserta nilainya, untuk menautkan foto. */
export interface VariantChoice {
  option: string;
  values: string[];
}

/** Satu foto di editor: foto lama (url) atau foto baru yang belum diunggah (file). */
export interface PhotoItem {
  id: string;
  /** URL untuk <img>: url server, atau blob URL untuk foto baru. */
  previewUrl: string;
  url?: string;
  file?: File;
  variantOption?: string | null;
  variantValue?: string | null;
}

let seq = 0;
const nextId = () => `photo-${++seq}`;

export const isLinked = (i: PhotoItem) => !!i.variantOption && !!i.variantValue;

/** Membangun daftar dari respons API (`images` + `imageVariants`), sudah dinormalkan. */
export function createPhotoItems(images: string[], links: ImageVariantLink[] = []): PhotoItem[] {
  const byUrl = new Map(links.map((l) => [l.url, l] as const));
  return normalizePhotoOrder(
    images.map((url) => {
      const link = byUrl.get(url);
      return {
        id: nextId(),
        previewUrl: url,
        url,
        variantOption: link?.option ?? null,
        variantValue: link?.value ?? null,
      };
    }),
  );
}

/** Foto tanpa tautan lebih dulu, foto bertautan di akhir (sama dengan normalisasi backend). */
export function normalizePhotoOrder(items: PhotoItem[]): PhotoItem[] {
  return [...items.filter((i) => !isLinked(i)), ...items.filter(isLinked)];
}

/** Benar bila kedua daftar identik (id, urutan, tautan). Untuk `dirty`. */
export function photoListsEqual(a: PhotoItem[], b: PhotoItem[]): boolean {
  if (a.length !== b.length) return false;
  return a.every(
    (item, i) =>
      item.id === b[i].id &&
      (item.variantOption ?? null) === (b[i].variantOption ?? null) &&
      (item.variantValue ?? null) === (b[i].variantValue ?? null),
  );
}

/** Lepaskan blob URL foto baru (panggil saat daftar dibuang atau dikembalikan ke awal). */
export function revokePreviews(items: PhotoItem[]) {
  items.forEach((i) => {
    if (i.file) URL.revokeObjectURL(i.previewUrl);
  });
}

export interface PhotoSyncResult {
  /** Daftar lengkap URL `images` sesuai urutan editor. */
  images: string[];
  /** Daftar lengkap `imageVariants` untuk foto yang bertautan. */
  imageVariants: ImageVariantLink[];
  /** URL yang baru diunggah (untuk rollback bila penyimpanan gagal: `rollbackUploads`). */
  newlyUploaded: string[];
}

/**
 * Mengunggah semua foto baru (urutan terjaga) lalu menyusun `images` dan `imageVariants`.
 * Melempar galat bila unggah gagal; tidak ada berkas yang tertinggal.
 */
export async function syncPhotos(items: PhotoItem[]): Promise<PhotoSyncResult> {
  const fresh = items.filter((i): i is PhotoItem & { file: File } => !!i.file);
  const uploaded = fresh.length > 0 ? await uploadFiles(fresh.map((i) => i.file)) : [];
  let cursor = 0;
  const images: string[] = [];
  const imageVariants: ImageVariantLink[] = [];
  for (const item of items) {
    const url = item.file ? uploaded[cursor++] : (item.url as string);
    images.push(url);
    if (isLinked(item)) {
      imageVariants.push({
        url,
        option: item.variantOption as string,
        value: item.variantValue as string,
      });
    }
  }
  return { images, imageVariants, newlyUploaded: uploaded };
}

/** Hapus unggahan baru bila penyimpanan produk gagal setelah `syncPhotos` sukses. */
export async function rollbackUploads(urls: string[]) {
  if (urls.length > 0) await deleteUploaded(urls);
}

// ============================================================================
// TILE
// ============================================================================

interface TileProps {
  item: PhotoItem;
  position: number;
  isMain: boolean;
  canLeft: boolean;
  canRight: boolean;
  canMakeMain: boolean;
  disabled?: boolean;
  variantChoices?: VariantChoice[];
  onRemove: () => void;
  onShift: (delta: -1 | 1) => void;
  onMakeMain: () => void;
  onVariant: (choice: { option: string; value: string } | null) => void;
}

function stop(e: { stopPropagation: () => void }) {
  e.stopPropagation();
}

function SortableTile({
  item,
  position,
  isMain,
  canLeft,
  canRight,
  canMakeMain,
  disabled,
  variantChoices,
  onRemove,
  onShift,
  onMakeMain,
  onVariant,
}: TileProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const selectedKey = (() => {
    if (!variantChoices || !isLinked(item)) return "none";
    for (let ci = 0; ci < variantChoices.length; ci++) {
      const vi = variantChoices[ci].values.indexOf(item.variantValue as string);
      if (variantChoices[ci].option === item.variantOption && vi >= 0) return `${ci}:${vi}`;
    }
    return "none";
  })();

  const iconButton =
    "absolute flex size-6 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80 disabled:opacity-30 disabled:hover:bg-black/60";

  return (
    <div ref={setNodeRef} style={style} className="w-28 shrink-0 sm:w-32">
      <div
        className={cn(
          "relative aspect-square overflow-hidden rounded-xl border bg-muted touch-none",
          disabled ? "cursor-default" : "cursor-grab active:cursor-grabbing",
        )}
        {...attributes}
        {...listeners}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.previewUrl}
          alt={`Foto produk ${position + 1}`}
          draggable={false}
          className="h-full w-full object-cover"
        />
        {isMain && (
          <span className="absolute left-1.5 top-1.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
            Utama
          </span>
        )}
        {!disabled && (
          <>
            <button
              type="button"
              aria-label="Hapus foto"
              className={cn(iconButton, "right-1.5 top-1.5")}
              onPointerDown={stop}
              onKeyDown={stop}
              onClick={onRemove}
            >
              <X className="size-3.5" />
            </button>
            <button
              type="button"
              aria-label="Geser ke kiri"
              disabled={!canLeft}
              className={cn(iconButton, "left-1 top-1/2 -translate-y-1/2")}
              onPointerDown={stop}
              onKeyDown={stop}
              onClick={() => onShift(-1)}
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Geser ke kanan"
              disabled={!canRight}
              className={cn(iconButton, "right-1 top-1/2 -translate-y-1/2")}
              onPointerDown={stop}
              onKeyDown={stop}
              onClick={() => onShift(1)}
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        )}
      </div>

      {!disabled && (canMakeMain || (variantChoices && variantChoices.length > 0)) && (
        <div className="mt-1.5 space-y-1">
          {canMakeMain && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-full px-1 text-xs"
              onClick={onMakeMain}
            >
              Jadikan utama
            </Button>
          )}
          {variantChoices && variantChoices.length > 0 && (
            <Select
              value={selectedKey}
              onValueChange={(v) => {
                if (v === "none") return onVariant(null);
                const [ci, vi] = v.split(":").map(Number);
                const choice = variantChoices[ci];
                if (choice && choice.values[vi] !== undefined) {
                  onVariant({ option: choice.option, value: choice.values[vi] });
                }
              }}
            >
              <SelectTrigger size="sm" className="h-7 w-full px-2 text-xs">
                <SelectValue placeholder="Varian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tanpa varian</SelectItem>
                {variantChoices.map((choice, ci) =>
                  choice.values.map((value, vi) => (
                    <SelectItem key={`${ci}:${vi}`} value={`${ci}:${vi}`}>
                      {choice.option}: {value}
                    </SelectItem>
                  )),
                )}
              </SelectContent>
            </Select>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EDITOR
// ============================================================================

interface PhotoManagerProps {
  items: PhotoItem[];
  onChange: (items: PhotoItem[]) => void;
  max?: number;
  inputId?: string;
  label?: string;
  /** Bila diisi, tiap foto dapat ditautkan ke satu nilai varian. */
  variantChoices?: VariantChoice[];
  /** Tombol "Batalkan perubahan" tampil bila dirty dan onReset ada. */
  dirty?: boolean;
  onReset?: () => void;
  disabled?: boolean;
}

/**
 * Editor foto: tambah, hapus (ikon X), urutkan (seret dengan mouse/sentuhan/keyboard, atau
 * tombol geser), jadikan utama, dan tautkan ke varian. Semua perubahan hanya di daftar lokal;
 * tidak ada yang dikirim ke server sebelum pemanggil menyimpan (gunakan `syncPhotos`).
 */
export function PhotoManager({
  items,
  onChange,
  max = 10,
  inputId = "photo-manager-input",
  label = "Foto produk",
  variantChoices,
  dirty = false,
  onReset,
  disabled = false,
}: PhotoManagerProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const variantMode = !!variantChoices && variantChoices.length > 0;
  const plain = items.filter((i) => !isLinked(i));
  const linked = items.filter(isLinked);
  const showTitles = variantMode && plain.length > 0 && linked.length > 0;
  const activeItem = items.find((i) => i.id === activeId) ?? null;

  async function handleFiles(list: FileList | null) {
    if (!list || list.length === 0 || disabled) return;
    const files = Array.from(list);
    const remaining = max - items.length;
    if (remaining <= 0) {
      toast.error(`Maksimal ${max} foto.`);
      return;
    }
    const accepted: PhotoItem[] = [];
    const errors: string[] = [];
    setAdding(true);
    try {
      for (const file of files.slice(0, remaining)) {
        const typeError = validatePhotoType(file);
        if (typeError) {
          errors.push(`${file.name}: ${typeError}`);
          continue;
        }
        try {
          const prepared = await prepareImageFile(file);
          const sizeError = validatePhotoFile(prepared);
          if (sizeError) {
            errors.push(`${file.name}: ${sizeError}`);
            continue;
          }
          accepted.push({ id: nextId(), previewUrl: URL.createObjectURL(prepared), file: prepared });
        } catch (err) {
          errors.push(`${file.name}: ${err instanceof Error ? err.message : "Foto tidak dapat diproses."}`);
        }
      }
    } finally {
      setAdding(false);
    }
    if (files.length > remaining) errors.push(`Maksimal ${max} foto. Sisanya diabaikan.`);
    if (accepted.length > 0) onChange(normalizePhotoOrder([...items, ...accepted]));
    errors.slice(0, 3).forEach((m) => toast.error(m));
    if (errors.length > 3) toast.error(`Dan ${errors.length - 3} pesan galat lainnya.`);
  }

  function remove(item: PhotoItem) {
    if (item.file) URL.revokeObjectURL(item.previewUrl);
    onChange(items.filter((i) => i.id !== item.id));
  }

  function shift(item: PhotoItem, delta: -1 | 1) {
    const from = items.findIndex((i) => i.id === item.id);
    const to = from + delta;
    if (from < 0 || to < 0 || to >= items.length) return;
    if (isLinked(items[to]) !== isLinked(item)) return;
    onChange(arrayMove(items, from, to));
  }

  function makeMain(item: PhotoItem) {
    if (isLinked(item)) return;
    onChange([item, ...items.filter((i) => i.id !== item.id)]);
  }

  function setVariant(item: PhotoItem, choice: { option: string; value: string } | null) {
    onChange(
      normalizePhotoOrder(
        items.map((i) =>
          i.id === item.id
            ? { ...i, variantOption: choice?.option ?? null, variantValue: choice?.value ?? null }
            : i,
        ),
      ),
    );
  }

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => i.id === active.id);
    const to = items.findIndex((i) => i.id === over.id);
    if (from < 0 || to < 0) return;
    // Hanya di dalam kelompoknya; menjatuhkan di kelompok lain membatalkan perpindahan.
    if (isLinked(items[from]) !== isLinked(items[to])) return;
    onChange(arrayMove(items, from, to));
  }

  function renderTile(item: PhotoItem) {
    const index = items.findIndex((i) => i.id === item.id);
    const group = isLinked(item);
    const first = plain[0];
    return (
      <SortableTile
        key={item.id}
        item={item}
        position={index}
        isMain={!group && first?.id === item.id}
        canLeft={index > 0 && isLinked(items[index - 1]) === group}
        canRight={index < items.length - 1 && isLinked(items[index + 1]) === group}
        canMakeMain={!group && !!first && first.id !== item.id}
        disabled={disabled}
        variantChoices={variantMode ? variantChoices : undefined}
        onRemove={() => remove(item)}
        onShift={(d) => shift(item, d)}
        onMakeMain={() => makeMain(item)}
        onVariant={(c) => setVariant(item, c)}
      />
    );
  }

  const full = items.length >= max;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {items.length}/{max} foto
          </span>
          {dirty && onReset && (
            <Button type="button" variant="ghost" size="sm" onClick={onReset} disabled={disabled}>
              Batalkan perubahan
            </Button>
          )}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        {showTitles && <p className="text-xs font-medium text-muted-foreground">Foto umum</p>}
        <SortableContext items={plain.map((i) => i.id)} strategy={rectSortingStrategy}>
          <div className="flex flex-wrap gap-3">
            {plain.map(renderTile)}
            <label
              htmlFor={inputId}
              className={cn(
                "flex aspect-square w-28 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed text-xs text-muted-foreground transition hover:border-primary hover:text-primary sm:w-32",
                (full || disabled || adding) && "pointer-events-none opacity-40",
              )}
            >
              <ImagePlus className="size-6" />
              {adding ? "Memproses..." : "Tambah foto"}
            </label>
          </div>
        </SortableContext>

        {linked.length > 0 && (
          <>
            {showTitles && (
              <p className="pt-1 text-xs font-medium text-muted-foreground">Foto per varian</p>
            )}
            <SortableContext items={linked.map((i) => i.id)} strategy={rectSortingStrategy}>
              <div className="flex flex-wrap gap-3">{linked.map(renderTile)}</div>
            </SortableContext>
          </>
        )}

        <DragOverlay>
          {activeItem ? (
            <div className="aspect-square w-28 overflow-hidden rounded-xl border-2 border-primary shadow-lg sm:w-32">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeItem.previewUrl}
                alt=""
                className="h-full w-full object-cover"
                draggable={false}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={PHOTO_ACCEPT}
        multiple
        className="sr-only"
        disabled={full || disabled || adding}
        onChange={async (e) => {
          const target = e.target;
          await handleFiles(target.files);
          target.value = "";
        }}
      />
    </div>
  );
}
