import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { SUPABASE_CONFIG } from "./config"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_CONFIG.url
  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL")
  }
  return url
}

function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_CONFIG.anonKey
  if (!key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY")
  }
  return key
}

function getSupabaseServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_CONFIG.serviceRoleKey
  if (!key) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY")
  }
  return key
}

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Server Component - ignore
        }
      },
    },
  })
}

export function createAdminClient() {
  return createSupabaseClient<Database>(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export const getSupabaseServerClient = createClient
export const getSupabaseAdminClient = createAdminClient