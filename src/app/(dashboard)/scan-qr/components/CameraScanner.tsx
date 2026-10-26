"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Camera, CameraOff, Loader2, QrCode, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraScannerProps {
  /** Dipanggil saat QR terbaca (teks mentah). */
  onScan: (code: string) => void;
  /** Saat true, kamera tetap hidup tetapi hasil decode diabaikan (mis. request sedang berjalan). */
  disabled?: boolean;
  /** Bila true, kamera dinyalakan otomatis saat komponen dipasang (dipakai setelah "Scan lagi"). */
  autoStart?: boolean;
  /** Memberi tahu induk bahwa kamera sedang aktif atau tidak. */
  onActiveChange?: (active: boolean) => void;
}

type Status = "idle" | "starting" | "scanning" | "error";

interface BarcodeDetectorLike {
  detect: (source: CanvasImageSource) => Promise<Array<{ rawValue?: string }>>;
}

const SCAN_INTERVAL_MS = 120; // ±8 frame per detik cukup untuk QR dan hemat CPU
const MAX_DECODE_WIDTH = 640; // kecilkan frame sebelum jsQR supaya ringan
const DUPLICATE_WINDOW_MS = 3000; // QR yang sama dalam jendela ini diabaikan

export function CameraScanner({
  onScan,
  disabled = false,
  autoStart = false,
  onActiveChange,
}: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const detectorRef = useRef<BarcodeDetectorLike | null>(null);
  const mountedRef = useRef(true);
  const startingRef = useRef(false);
  const decodingRef = useRef(false);
  const lastTickRef = useRef(0);
  const lastScanRef = useRef<{ code: string; at: number } | null>(null);

  // Simpan callback/props terbaru di ref agar loop scan tidak memakai closure usang.
  const onScanRef = useRef(onScan);
  const disabledRef = useRef(disabled);
  const onActiveChangeRef = useRef(onActiveChange);
  useEffect(() => {
    onScanRef.current = onScan;
    disabledRef.current = disabled;
    onActiveChangeRef.current = onActiveChange;
  });

  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const stopCamera = useCallback((notify = true) => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.onended = null;
        track.stop();
      });
      streamRef.current = null;
    }
    const video = videoRef.current;
    if (video) {
      video.onerror = null;
      video.pause();
      video.srcObject = null;
    }
    decodingRef.current = false;
    if (mountedRef.current) {
      setStatus("idle");
      if (notify) onActiveChangeRef.current?.(false);
    }
  }, []);

  const failWith = useCallback(
    (message: string) => {
      stopCamera(false);
      if (mountedRef.current) {
        setErrorMessage(message);
        setStatus("error");
        onActiveChangeRef.current?.(false);
      }
    },
    [stopCamera]
  );

  // Membaca satu frame: BarcodeDetector bila ada (cepat), jsQR sebagai cadangan yang jalan di semua browser.
  const decodeFrame = useCallback(async (video: HTMLVideoElement): Promise<string | null> => {
    if (detectorRef.current) {
      try {
        const codes = await detectorRef.current.detect(video);
        const value = codes.find((c) => c.rawValue)?.rawValue;
        if (value) return value;
      } catch {
        // lanjut ke jsQR bila detector gagal pada frame ini
      }
    }
    const canvas = canvasRef.current;
    if (!canvas || !video.videoWidth || !video.videoHeight) return null;
    const scale = Math.min(1, MAX_DECODE_WIDTH / video.videoWidth);
    const width = Math.max(1, Math.floor(video.videoWidth * scale));
    const height = Math.max(1, Math.floor(video.videoHeight * scale));
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, width, height);
    const image = ctx.getImageData(0, 0, width, height);
    const result = jsQR(image.data, width, height, { inversionAttempts: "attemptBoth" });
    return result?.data || null;
  }, []);

  const tick = useCallback(
    (timestamp: number) => {
      rafRef.current = requestAnimationFrame(tick);
      if (timestamp - lastTickRef.current < SCAN_INTERVAL_MS) return;
      lastTickRef.current = timestamp;

      const video = videoRef.current;
      // Jangan memproses saat dijeda induk, video belum siap, atau decode sebelumnya belum selesai.
      if (!video || disabledRef.current || decodingRef.current || video.readyState < 2) return;

      decodingRef.current = true;
      decodeFrame(video)
        .then((code) => {
          if (!code || disabledRef.current || !mountedRef.current) return;
          const now = Date.now();
          const last = lastScanRef.current;
          if (last && last.code === code && now - last.at < DUPLICATE_WINDOW_MS) return;
          lastScanRef.current = { code, at: now };
          onScanRef.current(code);
        })
        .catch(() => {
          // abaikan galat decode per frame
        })
        .finally(() => {
          decodingRef.current = false;
        });
    },
    [decodeFrame]
  );

  const startCamera = useCallback(async () => {
    // Cegah sesi ganda: jangan membuat getUserMedia baru bila sesi lama masih ada.
    if (startingRef.current || streamRef.current) return;
    startingRef.current = true;
    setErrorMessage(null);
    setStatus("starting");

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        failWith("Browser tidak mendukung kamera, atau halaman dibuka lewat HTTP. Gunakan HTTPS atau localhost.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });

      // Komponen sudah dilepas saat menunggu izin kamera: matikan stream yang baru didapat.
      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      stream.getVideoTracks().forEach((track) => {
        track.onended = () => failWith("Kamera terputus. Tekan Aktifkan Kamera untuk memulai ulang.");
      });

      const video = videoRef.current;
      if (!video) {
        stopCamera();
        return;
      }
      video.muted = true;
      video.setAttribute("playsinline", "true");
      video.onerror = () => failWith("Video kamera bermasalah. Tekan Aktifkan Kamera untuk memulai ulang.");
      video.srcObject = stream;
      await video.play();

      const Detector = (window as unknown as { BarcodeDetector?: new (opts: { formats: string[] }) => BarcodeDetectorLike })
        .BarcodeDetector;
      detectorRef.current = Detector ? new Detector({ formats: ["qr_code"] }) : null;

      lastScanRef.current = null;
      setStatus("scanning");
      onActiveChangeRef.current?.(true);
      rafRef.current = requestAnimationFrame(tick);
    } catch (err: unknown) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        failWith("Izin kamera ditolak. Berikan izin kamera di pengaturan browser, atau pakai input nomor pesanan manual.");
      } else if (name === "NotFoundError" || name === "OverconstrainedError") {
        failWith("Kamera tidak ditemukan. Pakai input nomor pesanan manual.");
      } else if (name === "NotReadableError" || name === "AbortError") {
        failWith("Kamera sedang dipakai aplikasi lain. Tutup aplikasi itu lalu coba lagi.");
      } else {
        failWith("Tidak dapat membuka kamera. Pakai input nomor pesanan manual.");
      }
    } finally {
      startingRef.current = false;
    }
  }, [failWith, stopCamera, tick]);

  // Matikan kamera saat tab disembunyikan (browser sering menghentikan track sendiri dan membuat video hitam).
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && streamRef.current) {
        failWith("Kamera dihentikan karena halaman tidak aktif. Tekan Aktifkan Kamera untuk memulai ulang.");
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [failWith]);

  // Siklus hidup: mount -> (autoStart) -> unmount selalu mematikan kamera.
  useEffect(() => {
    mountedRef.current = true;
    if (autoStart) void startCamera();
    return () => {
      mountedRef.current = false;
      stopCamera(false);
    };
    // Hanya dijalankan saat mount/unmount; startCamera dan stopCamera stabil.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isScanning = status === "scanning";

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Video selalu ada di DOM supaya srcObject tidak terputus saat state berubah */}
      <video ref={videoRef} className="h-full w-full object-cover" autoPlay muted playsInline />
      <canvas ref={canvasRef} className="hidden" />

      {/* Lapisan saat kamera belum aktif */}
      {!isScanning && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-secondary/80 to-muted/90 p-6 text-center">
          {status === "starting" ? (
            <>
              <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
              <p className="font-display text-sm font-semibold text-foreground">Membuka kamera...</p>
            </>
          ) : status === "error" && errorMessage ? (
            <>
              <span className="grid h-14 w-14 place-items-center rounded-full bg-destructive/10 text-destructive">
                <CameraOff className="h-7 w-7" />
              </span>
              <p className="font-display text-sm font-semibold text-foreground">Kamera Tidak Tersedia</p>
              <p className="max-w-xs text-xs text-muted-foreground">{errorMessage}</p>
            </>
          ) : (
            <>
              <span className="grid h-14 w-14 place-items-center rounded-full bg-card/80 text-muted-foreground shadow-sm">
                <Camera className="h-7 w-7" />
              </span>
              <p className="font-display text-sm font-semibold text-foreground">Kamera Belum Aktif</p>
              <p className="text-xs text-muted-foreground">Klik tombol di bawah untuk menyalakan kamera pemindai QR.</p>
            </>
          )}

          <Button
            type="button"
            onClick={() => void startCamera()}
            size="sm"
            className="mt-2 gap-2"
            disabled={status === "starting"}
          >
            <Camera className="h-4 w-4" />
            {status === "error" ? "Coba Lagi" : "Aktifkan Kamera"}
          </Button>
        </div>
      )}

      {/* Bingkai pemindai */}
      {isScanning && (
        <div className="pointer-events-none absolute inset-8">
          <span className="absolute left-0 top-0 h-10 w-10 border-l-4 border-t-4 border-primary" />
          <span className="absolute right-0 top-0 h-10 w-10 border-r-4 border-t-4 border-primary" />
          <span className="absolute bottom-0 left-0 h-10 w-10 border-b-4 border-l-4 border-primary" />
          <span className="absolute bottom-0 right-0 h-10 w-10 border-b-4 border-r-4 border-primary" />
          <div className="absolute left-2 right-2 top-1/2 h-0.5 -translate-y-1/2 overflow-hidden">
            <span
              className="block h-full w-full animate-[scanline_2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-primary to-transparent"
              style={{ boxShadow: "0 0 12px 2px #A8452B88" }}
            />
          </div>
        </div>
      )}

      {/* Tombol matikan kamera */}
      {isScanning && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
          <Button type="button" size="sm" variant="secondary" className="gap-1.5" onClick={() => stopCamera()}>
            Matikan Kamera
          </Button>
        </div>
      )}

      {/* Lencana status */}
      <div className="absolute left-1/2 top-3 -translate-x-1/2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1 text-[11px] font-semibold text-muted-foreground shadow-sm">
          <QrCode className="h-3.5 w-3.5" />
          {isScanning ? (disabled ? "Memproses..." : "Kamera Aktif — Arahkan ke QR") : "Scanner Siap"}
        </span>
      </div>
    </div>
  );
}