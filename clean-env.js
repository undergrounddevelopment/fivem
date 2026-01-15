const { execSync } = require('child_process');

const envVarsToRemove = [
    "Fivem_POSTGRES_URL", "Fivem_POSTGRES_URL_NON_POOLING", "Fivem_POSTGRES_USER",
    "Fivem_SUPABASE_ANON_KEY", "Fivem_SUPABASE_JWT_SECRET", "Fivem_SUPABASE_PUBLISHABLE_KEY",
    "Fivem_SUPABASE_SECRET_KEY", "Fivem_SUPABASE_SERVICE_ROLE_KEY", "Fivem_SUPABASE_URL",
    "NEON_DATABASE_URL", "NEON_DATABASE_URL_UNPOOLED", "NEON_PGDATABASE", "NEON_PGHOST",
    "NEON_PGHOST_UNPOOLED", "NEON_PGPASSWORD", "NEON_PGUSER", "NEON_POSTGRES_DATABASE",
    "NEON_POSTGRES_HOST", "NEON_POSTGRES_PASSWORD", "NEON_POSTGRES_PRISMA_URL",
    "NEON_POSTGRES_URL", "NEON_POSTGRES_URL_NON_POOLING", "NEON_POSTGRES_URL_NO_SSL",
    "NEON_POSTGRES_USER", "NEON_PROJECT_ID", "NEON_STACK_SECRET_SERVER_KEY"
];

console.log('Starting environment cleanup...');

envVarsToRemove.forEach(env => {
    try {
        console.log(`Removing ${env}...`);
        execSync(`npx vercel env rm ${env} production -y`, { stdio: 'inherit' });
        // execSync(`npx vercel env rm ${env} preview -y`, { stdio: 'inherit' });
        // execSync(`npx vercel env rm ${env} development -y`, { stdio: 'inherit' });
    } catch (error) {
        console.log(`Failed to remove ${env}:`, error.message);
    }
});

console.log('Cleanup complete. Please manually run: npx vercel env pull .env.local (if needed) or push new ones.');
