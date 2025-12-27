import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { SUPABASE_CONFIG } from "./config"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_CONFIG.url
}

function getSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_CONFIG.anonKey
}

function getSupabaseServiceRoleKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_CONFIG.serviceRoleKey
}

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
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
  return createSupabaseClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export const getSupabaseServerClient = createClient
export const getSupabaseAdminClient = createAdminClient