import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: "https://28f4f9545467ddcfb8d709e583bcc282@o4510607747579904.ingest.us.sentry.io/4510607750070272",
  
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  environment: process.env.NODE_ENV,
  
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    'Network request failed',
  ],
  
  beforeSend(event) {
    if (event.request?.headers) {
      delete event.request.headers['authorization']
      delete event.request.headers['cookie']
    }
    
    if (event.request?.query_string) {
      event.request.query_string = String(event.request.query_string)
        .replace(/token=[^&]*/g, 'token=[REDACTED]')
        .replace(/key=[^&]*/g, 'key=[REDACTED]')
    }
    
    return event
  },
})
