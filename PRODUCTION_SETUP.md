# Production Deployment Guide - FiveM Tools V7

## ✅ Pre-configured Settings

The following are already configured and ready for production:

### Supabase Database
- **URL**: `https://linnqtixdfjwbrixitrb.supabase.co`
- **Anon Key**: Already set in code
- **Service Role Key**: Already set in code
- **Database Connection**: Already configured

### Admin Account
- **Discord ID**: `1047719075322810378`
- This Discord account will have admin privileges

---

## 🔧 Required Configuration Steps

### 1. Discord OAuth Application Setup

**You MUST create a Discord OAuth application to enable login:**

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Name it "FiveM Tools V7" or similar
4. Go to "OAuth2" section
5. Add Redirect URLs:
   - Development: `http://localhost:3000/api/auth/callback/discord`
   - Production: `https://fivemtools.net/api/auth/callback/discord`
6. Copy the **Client ID** and **Client Secret**

### 2. Vercel Deployment

#### Environment Variables to Set in Vercel:

\`\`\`bash
# Supabase (Already configured - use these exact values)
NEXT_PUBLIC_SUPABASE_URL=https://linnqtixdfjwbrixitrb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTI4NTIsImV4cCI6MjA4MDc4ODg1Mn0.7Mm9XtHZzWC4K4iHuPBCxIWoUJAVqqsD4ph0mwUbFrU
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTIxMjg1MiwiZXhwIjoyMDgwNzg4ODUyfQ.Rri9zq0S-Y4nRpwkuiHp1GsZJXAsL-6-xpqJ1fAP3KE

# NextAuth (Generate secure random strings)
NEXTAUTH_SECRET=your-secure-random-string-min-32-characters
NEXTAUTH_URL=https://fivemtools.net

# Discord OAuth (From Step 1 above)
DISCORD_CLIENT_ID=paste-your-discord-client-id-here
DISCORD_CLIENT_SECRET=paste-your-discord-client-secret-here

# Admin
ADMIN_DISCORD_ID=1047719075322810378

# Session
SESSION_SECRET=another-secure-random-string-min-32-characters

# Site
NEXT_PUBLIC_SITE_URL=https://fivemtools.net
\`\`\`

#### How to Add Environment Variables in Vercel:

1. Go to your Vercel project dashboard
2. Click "Settings" tab
3. Click "Environment Variables" in sidebar
4. Add each variable above
5. Select "Production", "Preview", and "Development" for each
6. Click "Save"

### 3. Generate Secure Secrets

Use these commands to generate secure random strings:

\`\`\`bash
# For NEXTAUTH_SECRET
openssl rand -base64 32

# For SESSION_SECRET
openssl rand -base64 32
\`\`\`

Or use online generator: https://generate-secret.vercel.app/32

### 4. Domain Configuration

1. In Vercel, go to your project settings
2. Click "Domains"
3. Add `fivemtools.net`
4. Follow DNS configuration instructions
5. Wait for SSL certificate to be issued

---

## 🚀 Deployment Checklist

- [ ] Discord OAuth application created
- [ ] Discord Client ID obtained
- [ ] Discord Client Secret obtained
- [ ] Discord redirect URLs configured
- [ ] NEXTAUTH_SECRET generated
- [ ] SESSION_SECRET generated
- [ ] All environment variables added to Vercel
- [ ] Domain configured in Vercel
- [ ] DNS records updated
- [ ] Deploy triggered

---

## ✅ What's Already Working

1. **Database**: Fully configured and connected to linnqtixdfjwbrixitrb.supabase.co
2. **API Routes**: All database queries use correct column names (`is_active`, not `active`)
3. **Error Handling**: Comprehensive error boundaries and fallbacks
4. **Admin Access**: Discord ID 1047719075322810378 automatically gets admin privileges
5. **Security**: Row Level Security policies, CSRF protection, rate limiting

---

## 🧪 Testing After Deployment

### 1. Test Database Connection
Visit: `https://fivemtools.net/api/test-auth`
Should return: Database connection status and table info

### 2. Test Discord Login
1. Visit: `https://fivemtools.net`
2. Click "Login with Discord"
3. Authorize the application
4. Should redirect back logged in

### 3. Test Admin Access
1. Login with Discord ID: 1047719075322810378
2. Visit: `https://fivemtools.net/admin`
3. Should have access to admin dashboard

---

## 🐛 Troubleshooting

### Discord Login Not Working
- Verify `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` are correct
- Check redirect URLs in Discord Developer Portal match exactly
- Ensure `NEXTAUTH_URL` matches your production domain

### Database Errors
- All Supabase credentials are pre-configured, no changes needed
- If issues persist, check Supabase dashboard for API errors

### 500 Errors
- Check Vercel function logs for specific error messages
- Verify all required environment variables are set
- Check that secrets are at least 32 characters long

---

## 📞 Support

If you encounter issues:
1. Check Vercel function logs
2. Check browser console for errors
3. Verify all environment variables are set correctly
4. Ensure Discord OAuth app is configured properly

---

## 🔒 Security Notes

- Never commit `.env` files to git
- Rotate secrets periodically
- Use different secrets for production and development
- Monitor Supabase dashboard for unusual activity
- Keep Discord OAuth credentials secure
\`\`\`

\`\`\`typescript file="" isHidden
