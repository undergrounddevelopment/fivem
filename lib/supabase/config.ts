export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  databaseUrl: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  jwtSecret: process.env.SUPABASE_JWT_SECRET,
  secretKey: process.env.SUPABASE_SECRET_KEY,
}
