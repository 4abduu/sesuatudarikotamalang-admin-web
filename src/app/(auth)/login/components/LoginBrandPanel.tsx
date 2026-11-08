import { LoginLogo } from "./LoginLogo";

/** Siluet tangan (sama dengan `LogoHand` di line-art.tsx), dipakai untuk pola latar. */
const HAND_PATH =
  "M95.9 18.6 C94.2 17.8 91.5 16.7 87.9 18.4 C84.3 20.1 76.6 28.4 74.3 28.7 C72 29 74.4 22.3 73.9 20.3 C73.5 18.2 72.7 17.2 71.5 16.4 C70.4 15.5 68.5 15.2 66.9 15.3 C65.3 15.4 64.7 14.9 62.1 16.9 C59.6 18.9 56.4 21.2 51.6 27.3 C46.8 33.3 37.3 50.3 33.5 53.1 C29.8 55.8 30.3 45.8 28.9 43.7 C27.6 41.6 26.9 41.1 25.4 40.4 C23.9 39.6 21.5 39.1 19.9 39.2 C18.2 39.4 17 39.5 15.5 41.3 C13.9 43 11.6 46.1 10.5 49.8 C9.4 53.4 8.8 58.1 9 63.2 C9.2 68.3 10.1 75.5 11.6 80.4 C13.1 85.3 16 89.9 17.9 92.7 C19.7 95.6 20.6 96.1 22.8 97.5 C25 99 26.5 100.4 31.1 101.6 C35.8 102.8 43.5 104.3 50.9 104.5 C58.2 104.8 68.6 104.3 75.4 102.9 C82.2 101.4 87.1 99.3 91.8 95.9 C96.5 92.5 100.3 87.3 103.4 82.4 C106.6 77.5 109.8 70.1 110.8 66.4 C111.8 62.6 110.8 61.7 109.5 60.1 C108.2 58.5 103.1 59.4 103.1 57 C103 54.5 108.2 48.7 109.2 45.5 C110.1 42.4 109.8 39.9 109 38.1 C108.1 36.4 106.3 35 104 34.8 C101.7 34.7 96.9 37 95.1 37.2 C93.4 37.5 93 38.6 93.5 36.3 C93.9 34 97.5 26.3 97.9 23.4 C98.3 20.4 97.5 19.4 95.9 18.6 Z";

/**
 * Posisi (titik tengah), putaran, dan ukuran tiap jejak tangan dalam satu ubin 240x240.
 * Sengaja dibuat acak tapi merata (bukan kisi) supaya terlihat seperti cap tangan
 * yang tersebar, seperti latar logo asli.
 */
const TILE = 240;
const PRINTS = [
  { x: 92, y: 48, r: -108, s: 28 },
  { x: 111, y: 176, r: -165, s: 26 },
  { x: 22, y: 28, r: 113, s: 28 },
  { x: 216, y: 147, r: -33, s: 32 },
  { x: 34, y: 103, r: -104, s: 22 },
  { x: 159, y: 24, r: 99, s: 24 },
  { x: 121, y: 117, r: -114, s: 24 },
  { x: 208, y: 90, r: -36, s: 22 },
  { x: 188, y: 209, r: -78, s: 24 },
  { x: 25, y: 197, r: -11, s: 26 },
  { x: 77, y: 222, r: 101, s: 24 },
] as const;

/** Pola jejak tangan kecil yang berulang, seperti latar pada logo asli. */
function HandPrintPattern() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 -z-10 h-full w-full text-[#f2e4cc]/20"
    >
      <defs>
        <symbol id="login-hand-print" viewBox="0 0 120 120">
          <path
            d={HAND_PATH}
            fill="none"
            stroke="currentColor"
            strokeWidth={6}
            strokeLinejoin="round"
          />
        </symbol>
        <pattern
          id="login-hand-pattern"
          width={TILE}
          height={TILE}
          patternUnits="userSpaceOnUse"
        >
          {PRINTS.map((p) => (
            <use
              key={`${p.x}-${p.y}`}
              href="#login-hand-print"
              x={p.x - p.s / 2}
              y={p.y - p.s / 2}
              width={p.s}
              height={p.s}
              transform={`rotate(${p.r} ${p.x} ${p.y})`}
            />
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#login-hand-pattern)" />
    </svg>
  );
}

/**
 * Panel brand. Di layar kecil jadi pita di atas form dengan logo di tengah;
 * di layar lebar jadi panel kiri setinggi layar: logo kecil di pojok atas
 * dan pernyataan singkat di bawah. Hanya ada satu instance supaya pola SVG-nya
 * tidak bergantung pada elemen yang disembunyikan.
 */
export function LoginBrandPanel() {
  return (
    <section className="relative isolate flex flex-col items-center justify-center overflow-hidden bg-primary px-6 pb-16 pt-10 lg:min-h-screen lg:items-start lg:justify-between lg:p-12 xl:p-16">
      <HandPrintPattern />

      <LoginLogo className="w-32 animate-in fade-in zoom-in-95 duration-700 motion-reduce:animate-none sm:w-40 lg:w-40 xl:w-48" />

      <div className="hidden max-w-lg lg:block">
        <h2 className="font-display text-4xl font-extrabold leading-tight text-primary-foreground text-balance xl:text-5xl">
          Kelola toko, pesanan, dan kreator dari satu tempat.
        </h2>
        <p className="mt-4 text-base text-primary-foreground/90">
          Dashboard internal untuk tim toko Kayutangan Heritage.
        </p>
      </div>
    </section>
  );
}