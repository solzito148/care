// Punto unico de captura de errores. Hoy hace logging estructurado; cuando se
// instale `@sentry/nextjs`, reemplazar el cuerpo por `Sentry.captureException`.
// Mantener este wrapper como unico chokepoint evita esparcir el SDK por el codigo.

export function captureError(error: unknown, context?: Record<string, unknown>): void {
  const dsn = process.env.SENTRY_DSN;
  const payload = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
    sentry: Boolean(dsn),
  };
  console.error("[capture]", JSON.stringify(payload));
}
