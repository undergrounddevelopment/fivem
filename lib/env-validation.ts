// Environment variable validation - called explicitly at runtime only
// DO NOT import this file at module level, only call validateEnvironment() in API routes

interface EnvConfig {
  required: string[]
  optional: string[]
}

const envConfig: EnvConfig = {
  required: [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ],
  optional: [
    "POSTGRES_URL",
    "POSTGRES_PRISMA_URL",
    "POSTGRES_URL_NON_POOLING",
    "SUPABASE_JWT_SECRET",
    "ADMIN_DISCORD_ID",
    "VIRUSTOTAL_API_KEY",
    "UPLOADTHING_SECRET",
    "UPLOADTHING_APP_ID",
    "SESSION_SECRET",
  ],
}

export function validateEnvironment(): { valid: boolean; missing: string[] } {
  if (process.env.NODE_ENV === "production" && typeof window === "undefined" && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    // During build, env vars may not be available - skip validation
    return { valid: true, missing: [] }
  }

  const missing: string[] = []

  for (const key of envConfig.required) {
    if (!process.env[key]) {
      missing.push(key)
    }
  }

  if (missing.length > 0) {
    console.error(`[CRITICAL] Missing required environment variables: ${missing.join(", ")}`)
    return { valid: false, missing }
  }

  return { valid: true, missing: [] }
}
