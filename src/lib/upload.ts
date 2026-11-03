import { apiFetch } from "@/lib/api";

/**
 * Unggah dan hapus berkas (API_CONTRACT v1.7, Bagian 8).
 * Aturan: hanya JPEG/PNG/WebP, maksimal 2 MB per berkas, maksimal 10 berkas per panggilan.
 * Foto yang lebih besar dikecilkan otomatis di browser sebelum diunggah.
 */

export const PHOTO_MAX_BYTES = 2 * 1024 * 1024;
export const PHOTO_MAX_PER_CALL = 10;
export const PHOTO_MAX_SIDE = 1600;
export const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXT = ["jpg", "jpeg", "png", "webp"];

function extensionOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

/** Hanya memeriksa tipe berkas. Mengembalikan pesan galat Indonesia atau null. */
export function validatePhotoType(file: File): string | null {
  const typeOk = file.type
    ? ALLOWED_TYPES.includes(file.type)
    : ALLOWED_EXT.includes(extensionOf(file.name));
  return typeOk ? null : "Format foto tidak didukung. Gunakan JPG, PNG, atau WebP.";
}

/** Memeriksa tipe dan ukuran (panggil SETELAH prepareImageFile). */
export function validatePhotoFile(file: File): string | null {
  const typeError = validatePhotoType(file);
  if (typeError) return typeError;
  if (file.size > PHOTO_MAX_BYTES) return "Ukuran foto maksimal 2 MB.";
  return null;
}

/**
 * Mengecilkan foto di browser bila perlu: sisi terpanjang 1600 px, JPEG kualitas 0,82,
 * latar putih bila PNG transparan. Foto yang sudah di bawah 2 MB dan sisinya tidak lebih
 * dari 1600 px dikembalikan apa adanya.
 */
export async function prepareImageFile(file: File): Promise<File> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" } as ImageBitmapOptions);
  } catch {
    throw new Error("Foto tidak dapat dibaca.");
  }
  const longest = Math.max(bitmap.width, bitmap.height);
  if (file.size <= PHOTO_MAX_BYTES && longest <= PHOTO_MAX_SIDE) {
    bitmap.close();
    return file;
  }
  const scale = Math.min(1, PHOTO_MAX_SIDE / longest);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Foto tidak dapat diproses.");
  }
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
  if (!blob) throw new Error("Foto tidak dapat diproses.");
  const base = file.name.replace(/\.[^.]+$/, "") || "foto";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
}

/** Unggah satu foto, mengembalikan URL-nya. */
export async function uploadOne(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await apiFetch<{ url?: string }>("/api/upload/single", { method: "POST", body: form });
  if (!res.url) throw new Error("Respons unggah tidak valid");
  return res.url;
}

/**
 * Unggah banyak foto (dipecah per 10 berkas). URL dikembalikan dengan urutan yang sama
 * dengan [files]. Bila satu panggilan gagal, URL yang sudah terunggah pada panggilan
 * sebelumnya dihapus (best effort) lalu galat dilempar ulang.
 */
export async function uploadFiles(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  try {
    for (let i = 0; i < files.length; i += PHOTO_MAX_PER_CALL) {
      const chunk = files.slice(i, i + PHOTO_MAX_PER_CALL);
      const form = new FormData();
      chunk.forEach((f) => form.append("files", f));
      const res = await apiFetch<{ urls?: string[] }>("/api/upload/multiple", {
        method: "POST",
        body: form,
      });
      if (!res.urls || res.urls.length !== chunk.length) {
        throw new Error("Respons unggah tidak valid");
      }
      urls.push(...res.urls);
    }
  } catch (err) {
    if (urls.length > 0) await deleteUploaded(urls);
    throw err;
  }
  return urls;
}

/**
 * Hapus unggahan yang BELUM terpasang (untuk rollback). Best effort: kegagalan diabaikan.
 * Jangan dipakai untuk foto yang sudah terpasang di produk/profil; backend yang menghapusnya.
 */
export async function deleteUploaded(urls: string[]): Promise<void> {
  for (const url of urls) {
    try {
      await apiFetch("/api/upload", { method: "DELETE", body: JSON.stringify({ url }) });
    } catch {
      // diabaikan
    }
  }
}
