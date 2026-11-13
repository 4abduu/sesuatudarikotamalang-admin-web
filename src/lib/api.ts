const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }

  get requestId(): string | undefined {
    if (this.data && typeof this.data === "object" && "requestId" in this.data) {
      const id = (this.data as { requestId?: unknown }).requestId;
      return typeof id === "string" ? id : undefined;
    }
    return undefined;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {
    ...((options.body && !(options.body instanceof FormData)) ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      if (window.location.pathname !== "/login") {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = "/login";
      }
    }
  }

  if (!res.ok) {
    let msg = data.error;
    if (!msg) {
      if (res.status >= 500) {
        const reqId = typeof data.requestId === "string" ? data.requestId : undefined;
        msg = reqId
          ? `Terjadi kesalahan pada server. Kode: ${reqId}`
          : "Terjadi kesalahan pada server.";
      } else {
        msg = "Request gagal";
      }
    }
    throw new ApiError(res.status, msg, data.code, data);
  }

  return data as T;
}
