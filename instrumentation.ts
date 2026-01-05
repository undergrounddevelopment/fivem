export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

export async function onRequestError(err: unknown, request: Request) {
  try {
    const { captureRequestError } = await import('@sentry/nextjs')

    const urlString = (request as any)?.url
    let pathname = 'unknown'
    try {
      if (typeof urlString === 'string' && urlString.length > 0) {
        pathname = new URL(urlString).pathname || 'unknown'
      }
    } catch {
      pathname = 'unknown'
    }

    const method = (request as any)?.method || 'UNKNOWN'
    const headersObj =
      (request as any)?.headers?.entries ? Object.fromEntries((request as any).headers.entries()) : {}

    await captureRequestError(
      err,
      {
        path: pathname,
        method,
        headers: headersObj,
      } as any,
      {
        routerKind: 'app',
        routePath: pathname,
        routeType: 'route',
      } as any,
    )
  } catch {
    // Intentionally swallow instrumentation errors to avoid breaking the request lifecycle.
  }
}
