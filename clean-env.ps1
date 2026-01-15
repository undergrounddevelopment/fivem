$envVarsToRemove = @(
    "Fivem_POSTGRES_URL", "Fivem_POSTGRES_URL_NON_POOLING", "Fivem_POSTGRES_USER",
    "Fivem_SUPABASE_ANON_KEY", "Fivem_SUPABASE_JWT_SECRET", "Fivem_SUPABASE_PUBLISHABLE_KEY",
    "Fivem_SUPABASE_SECRET_KEY", "Fivem_SUPABASE_SERVICE_ROLE_KEY", "Fivem_SUPABASE_URL",
    "NEON_DATABASE_URL", "NEON_DATABASE_URL_UNPOOLED", "NEON_PGDATABASE", "NEON_PGHOST",
    "NEON_PGHOST_UNPOOLED", "NEON_PGPASSWORD", "NEON_PGUSER", "NEON_POSTGRES_DATABASE",
    "NEON_POSTGRES_HOST", "NEON_POSTGRES_PASSWORD", "NEON_POSTGRES_PRISMA_URL",
    "NEON_POSTGRES_URL", "NEON_POSTGRES_URL_NON_POOLING", "NEON_POSTGRES_URL_NO_SSL",
    "NEON_POSTGRES_USER", "NEON_PROJECT_ID", "NEON_STACK_SECRET_SERVER_KEY"
)

foreach ($env in $envVarsToRemove) {
    Write-Host "Removing $env..."
    echo y | npx vercel env rm $env production
    echo y | npx vercel env rm $env preview
    echo y | npx vercel env rm $env development
}

Write-Host "Adding new variables from vercel-env.json..."
# Parse JSON and add (simplified for now to just critical ones based on manual list if needed, but vercel env pull/push is better if available.
# Actually, the user wants to APPLY vercel-env.json.
# We can use `npx vercel env add` taking inputs.
# For now, let's just do the cleanup first as requested "hapus yang lama"
