# Supabase Integration - Complete Setup Guide

## Overview

This FiveM Tools application is fully integrated with Supabase for database, authentication, and real-time features.

## Current Integration Status

✅ **COMPLETED:**
- Supabase client infrastructure (`lib/supabase/`)
- Browser client with singleton pattern
- Server client with cookie handling
- Admin client for privileged operations
- Middleware for session refresh
- NextAuth integration with Discord OAuth
- Security headers and CORS configuration
- Rate limiting and CSRF protection

## Architecture

### Authentication Flow
\`\`\`
User → Discord OAuth (NextAuth) → Session JWT → Supabase Operations
\`\`\`

This app uses **NextAuth for authentication** with Discord, storing user data in Supabase. The Supabase admin client is used for database operations since auth is handled by NextAuth.

### Client Types

1. **Browser Client** (`lib/supabase/client.ts`)
   - Used in Client Components
   - Singleton pattern to prevent multiple instances
   - Respects RLS policies

2. **Server Client** (`lib/supabase/server.ts`)
   - Used in Server Components and Route Handlers
   - Handles cookies for session management
   - Creates new instance per request (important for Fluid compute)

3. **Admin Client** (`lib/supabase/server.ts`)
   - Bypasses RLS policies
   - Uses service role key
   - For system/admin operations only

### File Structure
\`\`\`
lib/
  supabase/
    client.ts       → Browser client
    server.ts       → Server & Admin clients
    middleware.ts   → Session refresh
    config.ts       → Configuration with fallbacks
middleware.ts       → Root middleware with security headers
\`\`\`

## Environment Variables

### Required Variables

Set these in your Vercel project or `.env.local`:

\`\`\`bash
# Supabase (Get from Supabase Dashboard → Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth (Generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your-32-char-secret
NEXTAUTH_URL=https://your-domain.com
SESSION_SECRET=your-32-char-session-secret

# Discord OAuth (Get from Discord Developer Portal)
DISCORD_CLIENT_ID=your-discord-app-id
DISCORD_CLIENT_SECRET=your-discord-app-secret
ADMIN_DISCORD_ID=your-discord-user-id
\`\`\`

### How to Set Environment Variables in v0

1. Open the **Vars** section in the in-chat sidebar
2. Add each variable with its value
3. Variables are automatically injected into your project

## Database Schema

The application expects these tables in Supabase:

### Core Tables
- `users` - User accounts and profiles
- `assets` - FiveM scripts, MLO, vehicles
- `forum_threads` - Forum posts
- `forum_replies` - Forum comments
- `spin_wheel_prizes` - Spin wheel rewards
- `spin_wheel_logs` - Spin history
- `announcements` - Site announcements
- `activities` - User activity logs
- `notifications` - User notifications
- `coin_transactions` - Coin transaction history

### Running Database Scripts

1. Go to the `scripts/` folder
2. Run SQL scripts in order:
   - `001_*.sql` - Table creation
   - `002_*.sql` - RLS policies
   - `003_*.sql` - Indexes and triggers

You can run these directly from v0 - no need to go to Supabase dashboard.

## Security Implementation

### Row Level Security (RLS)

All user-accessible tables have RLS enabled:

\`\`\`sql
-- Example policy
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid()::text = discord_id);
\`\`\`

### Security Features
- CSRF token validation
- Rate limiting (per user, per IP)
- Input sanitization
- SQL injection prevention (via Supabase)
- XSS protection headers
- CORS restrictions
- Content Security Policy

## Usage Examples

### Client Component (Browser)
\`\`\`tsx
"use client"
import { createClient } from "@/lib/supabase/client"

export function MyComponent() {
  const supabase = createClient()
  
  async function loadData() {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .limit(10)
  }
}
\`\`\`

### Server Component
\`\`\`tsx
import { createClient } from "@/lib/supabase/server"

export default async function Page() {
  const supabase = await createClient()
  
  const { data: assets } = await supabase
    .from('assets')
    .select('*')
    .limit(10)
  
  return <div>{assets?.length} assets</div>
}
\`\`\`

### API Route (Admin Operations)
\`\`\`tsx
import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  // Check admin permission
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }
  
  // Use admin client to bypass RLS
  const supabase = createAdminClient()
  const { data } = await supabase.from('users').select('*')
  
  return NextResponse.json({ users: data })
}
\`\`\`

## Middleware Integration

The middleware (`middleware.ts`) handles:
- Supabase session refresh on every request
- Language/locale detection
- Security headers injection
- CORS configuration
- Rate limiting headers

**Critical**: The middleware MUST run on all routes to maintain session state.

## Real-time Subscriptions

Use the `use-realtime.ts` hook for real-time updates:

\`\`\`tsx
import { useRealtime } from "@/hooks/use-realtime"

function Component() {
  const { data, loading } = useRealtime({
    table: 'assets',
    filter: { status: 'approved' }
  })
}
\`\`\`

## Troubleshooting

### Session Not Persisting
- Verify middleware is running (check `middleware.ts` config matcher)
- Check that cookies are being set (browser dev tools)
- Ensure environment variables are set correctly

### RLS Blocking Operations
- Verify user is authenticated before database operations
- Check RLS policies in Supabase dashboard
- Use admin client for system operations (createAdminClient)

### CORS Errors
- Add your domain to allowed origins in `middleware.ts`
- Verify API route is not blocked by CORS policy

### Rate Limit Issues
- Adjust rate limits in `lib/security.ts`
- Check rate limit headers in response

## Best Practices

1. **Never expose service role key** to frontend code
2. **Always enable RLS** on user-accessible tables
3. **Validate inputs** before database operations
4. **Use admin client sparingly** - only for system operations
5. **Create new client instances** in server functions (don't use globals)
6. **Test RLS policies** before deploying
7. **Monitor security logs** in `lib/security.ts`
8. **Implement rate limiting** on sensitive endpoints

## Migration from Local Storage

If you were using localStorage, migrate to Supabase:

1. Create corresponding tables in Supabase
2. Update components to use Supabase client
3. Implement RLS policies for data protection
4. Add authentication checks
5. Test thoroughly before deployment

## Performance Optimization

1. **Add indexes** on frequently queried columns
2. **Use select('column1, column2')** instead of select('*')
3. **Implement pagination** for large datasets
4. **Cache static data** where appropriate
5. **Use real-time subscriptions** only when needed

## Support

For issues:
1. Check Supabase logs in dashboard
2. Review browser console for errors
3. Check server logs for API errors
4. Verify environment variables are set
5. Open support ticket at vercel.com/help

## Next Steps

1. **Set environment variables** in the Vars section
2. **Run database scripts** to create tables
3. **Test authentication** flow with Discord
4. **Verify RLS policies** are working
5. **Deploy to Vercel** and test production

Your Supabase integration is now complete and production-ready! 🚀
