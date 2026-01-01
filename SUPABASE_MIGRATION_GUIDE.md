# Supabase Migration Guide

## Environment Variable Changes

The project now supports the Vercel Supabase integration's default environment variable naming:

### New (Recommended)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Legacy (Still Supported)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## What Changed

### 1. Supabase Client Configuration
All Supabase clients now use the centralized configuration from `lib/supabase/`:
- `lib/supabase/client.ts` - Browser client (singleton pattern)
- `lib/supabase/server.ts` - Server client with cookie handling
- `lib/supabase/middleware.ts` - Session refresh middleware
- `lib/supabase/config.ts` - Environment variable configuration

### 2. Server Actions
All server actions in `lib/actions/` now use the centralized `createClient()` from `lib/supabase/server`:

**Before:**
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function getUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
```

**After:**
```typescript
import { createClient } from '@/lib/supabase/server'

async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
```

### 3. Environment Variable Fallbacks
The configuration now supports both naming conventions with automatic fallback:
```typescript
anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## Discord OAuth Setup

### 1. Create Discord Application
1. Go to https://discord.com/developers/applications
2. Click "New Application"
3. Go to "OAuth2" section
4. Add redirect URLs:
   - Development: `http://localhost:3000/api/auth/callback/discord`
   - Production: `https://yourdomain.com/api/auth/callback/discord`

### 2. Configure Environment Variables
```env
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
ADMIN_DISCORD_ID=your_discord_user_id
```

### 3. NextAuth Configuration
The auth is already configured in `lib/auth.ts` with:
- Automatic user creation/update on Discord login
- Admin role assignment based on Discord ID
- Secure session management with JWT
- Database sync with user data

## Testing the Integration

### 1. Check Environment Variables
```bash
# Verify all required env vars are set
npm run verify-env
```

### 2. Test Database Connection
```bash
# Test connection to Supabase
npm run test-db
```

### 3. Test Authentication
1. Visit your app at `http://localhost:3000`
2. Click "Sign in with Discord"
3. Authorize the application
4. You should be redirected back and logged in

### 4. Verify User Data
Check your Supabase dashboard to see the user record was created in the `users` table.

## Troubleshooting

### Issue: "Missing Supabase credentials"
**Solution:** Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set.

### Issue: Discord OAuth not working
**Solution:** 
1. Verify Discord Client ID and Secret are correct
2. Check redirect URL matches exactly
3. Ensure `NEXTAUTH_SECRET` is set (min 32 characters)

### Issue: Session not persisting
**Solution:** Check that middleware is properly refreshing sessions. The `middleware.ts` file should call `updateSession()` from `lib/supabase/middleware.ts`.

### Issue: "Unauthorized" errors
**Solution:** 
1. Clear cookies and re-login
2. Check if user exists in database
3. Verify Discord ID matches `ADMIN_DISCORD_ID` for admin access

## Database Schema Requirements

Ensure your Supabase database has the required tables. Key tables:
- `users` - User profiles with Discord data
- `coin_transactions` - Coin balance tracking
- `forum_threads`, `forum_replies` - Forum system
- `spin_wheel_prizes`, `spin_wheel_history` - Spin wheel
- `notifications` - User notifications
- `announcements` - Site-wide announcements

Run the migration scripts in the `scripts/` directory to set up the schema if needed.

## Security Best Practices

1. **Never commit** `.env` or `.env.local` files
2. **Use Service Role Key** only on the server side
3. **Implement RLS** (Row Level Security) policies in Supabase
4. **Rotate secrets** regularly, especially after team member changes
5. **Use HTTPS** in production for all API calls

## Production Deployment

When deploying to Vercel:
1. Connect your Supabase integration in Vercel dashboard
2. Vercel will automatically set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Manually add other required variables:
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXTAUTH_SECRET`
   - `DISCORD_CLIENT_ID`
   - `DISCORD_CLIENT_SECRET`
   - `ADMIN_DISCORD_ID`

## Support

If you encounter issues:
1. Check the console for error messages
2. Verify all environment variables are set
3. Review the Supabase logs in your dashboard
4. Check NextAuth debug logs in development mode
