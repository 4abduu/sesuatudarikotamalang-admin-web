/**
 * Mock AI story-draft generator — prototype only.
 *
 * Di versi final, ini akan dipindahkan ke backend Express →
 * Gemini API (POST /api/ai/story-draft). Untuk prototype ini, kita
 * menyusun draft **dari isian user** di sisi client dengan delay ±1.5 detik
 * agar terasa realistis saat didemokan.
 *
 * Lihat: // TODO: ganti dengan POST /api/ai/story-draft
 *
 * Trigger demo state error:
 *   - isian mengandung `demo-error`  → 503 (AI tidak tersedia)
 *   - isian mengandung `demo-limit`  → 429 (terlalu sering)
 *   - isian mengandung `demo-blokir` → 422 (diblokir filter)
 */

export type StoryAiState = "idle" | "loading" | "result" | "error";

export type StoryAiErrorKind =
  | "unavailable" // 503 — AI tidak tersedia / timeout
  | "rateLimited" // 429 — terlalu sering mencoba
  | "blocked"; // 422 — diblokir filter konten

export type StoryAiError = {
  kind: StoryAiErrorKind;
  message: string;
};

export type StoryAiDraft = {
  title: string;
  body: string;
};

export type StoryAiInput = {
  motif: string;
  process: string;
  inspiration: string;
};

/** Total panjang karakter gabungan (dipakai untuk validasi minimal 30). */
export function totalInputLength(input: StoryAiInput): number {
  return input.motif.length + input.process.length + input.inspiration.length;
}

/**
 * Generate draft cerita orang pertama "aku/kami" dari poin singkat user.
 * Bahasa Indonesia hangat, tanpa emoji, tanpa harga/kontak, tanpa
 * fakta karangan — hanya merangkai kata-kata user sendiri.
 *
 * `variation` mengubah pilihan template agar "Buat Ulang" menghasilkan
 * teks berbeda dengan input yang sama.
 */
export function composeDraft(
  input: StoryAiInput,
  variation: number,
): StoryAiDraft {
  const motif = input.motif.trim();
  const process = input.process.trim();
  const inspiration = input.inspiration.trim();

  // Fallback aman jika salah satu field kosong.
  const motifPhrase = motif.length === 0 ? "karya ini" : motif;
  const processPhrase =
    process.length === 0
      ? "proses yang meneliti setiap detailnya"
      : process;
  const inspirationPhrase =
    inspiration.length === 0
      ? "lingkungan sekitar yang kaya cerita"
      : inspiration;

  const titles = [
    `Cerita di Balik ${motifPhrase}`,
    `Menggarap ${motifPhrase}`,
    `Lahir dari ${inspirationPhrase}`,
  ];

  const openings = [
    `Aku mulai menggarap ${motifPhrase} dari rasa penasaran sederhana.`,
    `Semua berawal dari ${inspirationPhrase} — sebuah suasana yang susah aku lupakan.`,
    `Ada momen yang bikin aku pengen mendokumentasikan ${motifPhrase} ini.`,
  ];

  const middles = [
    `Prosesnya sendiri ${processPhrase}. Aku sengaja mengambil waktu supaya tiap detailnya terasa tepat, bukan buru-buru selesai.`,
    `Lewat ${processPhrase}, aku belajar banyak hal kecil yang akhirnya bikin karya ini jadi apa adanya sekarang.`,
    `Aku nggak mau terburu — ${processPhrase} butuh kesabaran, dan rasa sabar itu justru yang bikin hasilnya bermakna.`,
  ];

  const closings = [
    `Kalau ada satu hal yang aku pengen orang lain tangkap dari karya ini, ya rasa tenang yang sama aku rasakan pas bikin.`,
    `Harapannya, siapa pun yang lihat ${motifPhrase} ini bisa ngerasain sedikit dari suasana yang menggerakkan aku.`,
    `Selesai sudah. Aku cuma berharap karya ini jadi jendela kecil ke cerita yang sebenernya lebih besar dari diriku.`,
  ];

  const v = ((variation % 3) + 3) % 3;
  const body = `${openings[v]}\n\n${middles[v]}\n\n${closings[v]}`;
  return { title: titles[v], body };
}

/**
 * Generate draft asynchronously (simulasi latensi jaringan).
 * Resolves ke draft bila sukses, throws StoryAiError bila gagal.
 *
 * TODO: ganti dengan POST /api/ai/story-draft (backend Express → Gemini API)
 */
export async function generateStoryDraft(
  input: StoryAiInput,
  variation = 0,
): Promise<StoryAiDraft> {
  // Simulasi latensi jaringan ke backend AI.
  await new Promise((r) => setTimeout(r, 1500));

  // Cek trigger error demo (hanya prototype).
  const all = `${input.motif}\n${input.process}\n${input.inspiration}`.toLowerCase();
  if (all.includes("demo-error")) {
    throw {
      kind: "unavailable",
      message: "Bantuan AI sedang tidak tersedia. Kamu bisa menulis sendiri.",
    } satisfies StoryAiError;
  }
  if (all.includes("demo-limit")) {
    throw {
      kind: "rateLimited",
      message: "Kamu sudah terlalu sering mencoba. Coba lagi nanti ya.",
    } satisfies StoryAiError;
  }
  if (all.includes("demo-blokir")) {
    throw {
      kind: "blocked",
      message: "Coba ubah poin-poinnya sedikit.",
    } satisfies StoryAiError;
  }

  return composeDraft(input, variation);
}