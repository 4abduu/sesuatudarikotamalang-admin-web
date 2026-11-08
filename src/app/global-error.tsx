"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "grid",
          placeItems: "center",
          minHeight: "100vh",
          margin: 0,
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 420, padding: 24 }}>
          <h2>Terjadi kesalahan</h2>
          <p>Aplikasi gagal dimuat. Coba lagi, dan hubungi tim bila masalah berlanjut.</p>
          {error.digest && <p style={{ fontSize: 12, opacity: 0.7 }}>Kode: {error.digest}</p>}
          <button
            onClick={reset}
            style={{
              padding: "8px 16px",
              cursor: "pointer",
              borderRadius: "6px",
              backgroundColor: "#18181b",
              color: "#ffffff",
              border: "none",
            }}
          >
            Coba Lagi
          </button>
        </div>
      </body>
    </html>
  );
}

