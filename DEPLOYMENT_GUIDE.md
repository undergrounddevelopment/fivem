# FiveM Tools - Complete Deployment Guide

## Environment Variables Required

Add these to your Vercel project or `.env.local`:

```env
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# NextAuth Configuration (REQUIRED)
NEXTAUTH_SECRET=generate_random_32_char_string
NEXTAUTH_URL=https://fivemtools.net

# Discord OAuth (REQUIRED for login)
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret

# Admin Configuration
ADMIN_DISCORD_ID=1047719075322810378
```

## Deployment Steps

### 1. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel --prod
```

### 2. Configure Environment Variables

In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add all variables listed above
3. Redeploy the project

### 3. Setup Discord OAuth

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create new application or select existing
3. Go to OAuth2 → Add redirect URL: `https://your-domain.com/api/auth/callback/discord`
4. Copy Client ID and Client Secret to environment variables

### 4. Database Setup (Supabase)

The app is pre-configured to connect to:
- URL: `https://your-project.supabase.co`
- Key: `your_anon_key_here`

If you need to use a different Supabase instance:
1. Create project at [supabase.com](https://supabase.com)
2. Run database migrations from `/scripts` folder
3. Update environment variables with your credentials

### 5. Verify Deployment

Visit your deployed site and check:
- [ ] Homepage loads without errors
- [ ] Discord login works
- [ ] Database queries return data
- [ ] Admin panel accessible (if admin user)

## Troubleshooting

### Error: "Missing Supabase configuration"
- Check environment variables are set in Vercel
- Ensure `NEXT_PUBLIC_` prefix for client-side variables
- Redeploy after adding variables

### Error: "NextAuth CLIENT_FETCH_ERROR"
- Set `NEXTAUTH_URL` to your production domain
- Generate new `NEXTAUTH_SECRET` (use: `openssl rand -base64 32`)
- Verify Discord redirect URLs match your domain

### Database Connection Issues
- Verify Supabase project is not paused
- Check service role key has correct permissions
- Test connection in Supabase dashboard

## Production Checklist

- [ ] All environment variables set
- [ ] Discord OAuth configured
- [ ] Database migrations applied
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Analytics enabled (optional)
- [ ] Error tracking configured (optional)

## Support

For issues:
1. Check browser console for errors
2. Check Vercel deployment logs
3. Verify all environment variables
4. Test database connection in Supabase dashboard
