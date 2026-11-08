import type { Instrumentation } from "next";

export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  // Hanya metadata aman. Jangan mencatat header, cookie, token, atau body.
  console.error(
    JSON.stringify({
      level: "error",
      message: err instanceof Error ? err.message : "Kesalahan tidak diketahui",
      digest: (err as { digest?: string }).digest,
      method: request.method,
      path: request.path,
      routePath: context.routePath,
      routeType: context.routeType,
    })
  );
};

