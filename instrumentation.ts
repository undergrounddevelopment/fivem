export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

export async function onRequestError(err: unknown, request: Request) {
  const { captureRequestError } = await import('@sentry/nextjs')
  captureRequestError(err, {
    path: new URL(request.url).pathname,
    method: request.method,
    headers: Object.fromEntries(request.headers),
  }, {
    routerKind: 'app',
    routePath: new URL(request.url).pathname,
    routeType: 'middleware',
  })
}
