import * as Sentry from "@sentry/nextjs"

const DEFAULT_DSN =
  "https://28f4f9545467ddcfb8d709e583bcc282@o4510607747579904.ingest.us.sentry.io/4510607750070272"
let initialized = false

function sanitizeEvent(event: Sentry.ErrorEvent) {
  if (event.request?.headers) {
    delete event.request.headers["authorization"]
    delete event.request.headers["cookie"]
  }

  if (event.request?.query_string) {
    const qs = event.request.query_string

    if (typeof qs === "string") {
      event.request.query_string = qs
        .replace(/token=[^&]*/g, "token=[REDACTED]")
        .replace(/key=[^&]*/g, "key=[REDACTED]")
    } else if (Array.isArray(qs)) {
      event.request.query_string = qs.map(([k, v]) => {
        if (k === "token") return [k, "[REDACTED]"]
        if (k === "key") return [k, "[REDACTED]"]
        return [k, v]
      }) as any
    }
  }

  return event
}

function initSentry() {
  if (initialized) return

  Sentry.init({
    dsn: process.env.SENTRY_DSN || DEFAULT_DSN,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: process.env.NODE_ENV,
    release: process.env.VERCEL_GIT_COMMIT_SHA,
    enabled: process.env.NODE_ENV === "production",
    debug: false,
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "Non-Error promise rejection captured",
      "Network request failed",
    ],
    beforeSend: (event) => sanitizeEvent(event as Sentry.ErrorEvent),
  })

  initialized = true
}

export function register() {
  initSentry()
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart