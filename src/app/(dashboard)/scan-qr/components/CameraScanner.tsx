"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Loader2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraScannerProps {
  onScan: (code: string) => void;
  disabled?: boolean;
}

export function CameraScanner({ onScan, disabled = false }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopCamera = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  };

  const startCamera = async () => {
    setErrorMessage(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCamera(false);
        setErrorMessage("Browser tidak mendukung akses kamera atau sedang diakses lewat HTTP.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
      }

      setIsStreaming(true);
      setHasCamera(true);

      // Gunakan BarcodeDetector native jika didukung browser
      if ("BarcodeDetector" in window) {
        // @ts-expect-error - BarcodeDetector API
        const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
        intervalRef.current = setInterval(async () => {
          if (disabled || !videoRef.current) return;
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const rawValue = barcodes[0].rawValue;
              if (rawValue) {
                onScan(rawValue);
              }
            }
          } catch {
            // Ignore frame detection errors
          }
        }, 500);
      }
    } catch (err: unknown) {
      setHasCamera(false);
      const msg = err instanceof Error ? err.message : "Tidak dapat membuka kamera";
      if (msg.includes("Permission denied") || msg.includes("NotAllowedError")) {
        setErrorMessage("Izin kamera ditolak. Berikan izin kamera di pengaturan browser.");
      } else {
        setErrorMessage("Kamera tidak ditemukan atau sedang digunakan aplikasi lain.");
      }
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Video Stream Element */}
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        muted
        playsInline
      />

      {/* Dark Backdrop saat kamera mati */}
      {!isStreaming && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-secondary/80 to-muted/90 p-6 text-center">
          {errorMessage ? (
            <>
              <span className="grid h-14 w-14 place-items-center rounded-full bg-destructive/10 text-destructive">
                <CameraOff className="h-7 w-7" />
              </span>
              <p className="font-display text-sm font-semibold text-foreground">
                Kamera Tidak Tersedia
              </p>
              <p className="text-xs text-muted-foreground max-w-xs">{errorMessage}</p>
            </>
          ) : (
            <>
              <span className="grid h-14 w-14 place-items-center rounded-full bg-card/80 text-muted-foreground shadow-sm">
                <Camera className="h-7 w-7" />
              </span>
              <p className="font-display text-sm font-semibold text-foreground">
                Kamera Belum Aktif
              </p>
              <p className="text-xs text-muted-foreground">
                Klik tombol di bawah untuk menyalakan kamera pemindai QR.
              </p>
            </>
          )}

          <Button
            type="button"
            onClick={startCamera}
            size="sm"
            className="mt-2 gap-2"
          >
            <Camera className="h-4 w-4" />
            Aktifkan Kamera
          </Button>
        </div>
      )}

      {/* Scanner frame corners & overlay */}
      {isStreaming && (
        <div className="pointer-events-none absolute inset-8">
          <span className="absolute left-0 top-0 h-10 w-10 border-l-4 border-t-4 border-primary" />
          <span className="absolute right-0 top-0 h-10 w-10 border-r-4 border-t-4 border-primary" />
          <span className="absolute bottom-0 left-0 h-10 w-10 border-b-4 border-l-4 border-primary" />
          <span className="absolute bottom-0 right-0 h-10 w-10 border-b-4 border-r-4 border-primary" />

          {/* Pulsing scan line */}
          <div className="absolute left-2 right-2 top-1/2 h-0.5 -translate-y-1/2 overflow-hidden">
            <span
              className="block h-full w-full animate-[scanline_2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-primary to-transparent"
              style={{ boxShadow: "0 0 12px 2px #A8452B88" }}
            />
          </div>
        </div>
      )}

      {/* Status Badge */}
      <div className="absolute left-1/2 top-3 -translate-x-1/2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1 text-[11px] font-semibold text-muted-foreground shadow-sm">
          <QrCode className="h-3.5 w-3.5" />
          {isStreaming ? "Kamera Aktif — Arahkan ke QR" : "Scanner Siap"}
        </span>
      </div>
    </div>
  );
}
