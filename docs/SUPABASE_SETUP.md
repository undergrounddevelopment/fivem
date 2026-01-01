# Supabase Integration Guide

## Overview

This application uses Supabase for:
- Database (PostgreSQL)
- Authentication (via NextAuth with Discord OAuth)
- Real-time subscriptions
- Row Level Security (RLS)

## Environment Variables

Required environment variables (see `.env.example`):

\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
\`\`\`

## Client Types

### 1. Browser Client (`createClient()` from `@/lib/supabase/client`)
- Used in Client Components
- Respects RLS policies
- Uses anon key
- Automatically handles session cookies

### 2. Server Client (`createClient()` from `@/lib/supabase/server`)
- Used in Server Components and Route Handlers
- Respects RLS policies based on authenticated user
- Handles cookies for session management
- **Important**: Create new instance in each function

### 3. Admin Client (`createAdminClient()` from `@/lib/supabase/server`)
- Bypasses RLS policies
- Uses service role key
- **Only for admin operations**
- Never expose to frontend

## Usage Examples

### Client Component
\`\`\`tsx
"use client"
import { createClient } from "@/lib/supabase/client"

export function MyComponent() {
  const supabase = createClient()
  
  async function fetchData() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
  }
}
\`\`\`

### Server Component
\`\`\`tsx
import { createClient } from "@/lib/supabase/server"

export default async function Page() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }
  
  return <div>Welcome {user.email}</div>
}
\`\`\`

### API Route (Admin)
\`\`\`tsx
import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = createAdminClient()
  
  // This bypasses RLS
  const { data, error } = await supabase
    .from('users')
    .select('*')
    
  return NextResponse.json({ data })
}
\`\`\`

## Middleware

The middleware automatically refreshes Supabase sessions on every request. This is **critical** for maintaining auth state.

Location: `middleware.ts` and `lib/supabase/middleware.ts`

## Row Level Security (RLS)

All tables should have RLS enabled. Example policies are in `scripts/` directory.

### Example RLS Policy
\`\`\`sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid()::text = discord_id);

CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (auth.uid()::text = discord_id);
\`\`\`

## Authentication Flow

This app uses NextAuth with Discord OAuth, storing user data in Supabase:

1. User signs in with Discord via NextAuth
2. NextAuth callback creates/updates user in Supabase
3. Session is maintained via NextAuth JWT
4. Supabase operations use admin client (bypassing RLS) since auth is handled by NextAuth

## Database Schema

Run the SQL scripts in the `scripts/` directory to set up your database:

\`\`\`bash
# Run these in order
001_create_tables.sql
002_enable_rls.sql
003_create_policies.sql
\`\`\`

## Troubleshooting

### Session Issues
- Ensure middleware is running on all routes
- Check that cookies are being set properly
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set

### RLS Issues
- Verify user is authenticated before operations
- Check that RLS policies are correctly configured
- Use admin client for system operations

### Performance
- Create indexes on frequently queried columns
- Use select('specific, columns') instead of select('*')
- Implement caching where appropriate

## Security Best Practices

1. **Never** expose service role key to frontend
2. **Always** enable RLS on user-accessible tables
3. **Validate** all inputs before database operations
4. **Use** parameterized queries (Supabase does this automatically)
5. **Implement** rate limiting on sensitive operations
6. **Audit** admin operations regularly
