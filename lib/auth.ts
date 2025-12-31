import { sanitizeInput } from "@/lib/sanitize"
import type { NextAuthOptions } from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import { createAdminClient } from "@/lib/supabase/server"
import { SUPABASE_CONFIG } from "@/lib/supabase/config"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      userId?: string
      discordId?: string
      name?: string | null
      email?: string | null
      image?: string | null
      coins?: number
      membership?: string
      isAdmin?: boolean
    }
  }
  interface JWT {
    userId?: string
    discordId?: string
    coins?: number
    membership?: string
    isAdmin?: boolean
    lastSync?: number
  }
}

function getProviders() {
  const providers: any[] = []

  if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
    providers.push(
      DiscordProvider({
        clientId: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        authorization: { params: { scope: "identify email" } },
      }),
    )
  }

  return providers
}

export const authOptions: NextAuthOptions = {
  providers: getProviders(),
  secret: process.env.NEXTAUTH_SECRET!,
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error: (code, metadata) => {
      console.error('[NextAuth Error]', code, metadata)
    },
    warn: (code) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[NextAuth Warning]', code)
      }
    },
    debug: (code, metadata) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[NextAuth Debug]', code, metadata)
      }
    },
  },
  callbacks: {
    async jwt({ token, account, profile, trigger }) {

      // Only sync with database on sign in, not on every token refresh
      if (account?.provider === "discord" && profile) {
        const discordId = sanitizeInput((profile as any).id)
        const isAdminUser = discordId === process.env.ADMIN_DISCORD_ID

        try {
          const supabase = createAdminClient()
          const avatarUrl = (profile as any).avatar
            ? `https://cdn.discordapp.com/avatars/${discordId}/${sanitizeInput((profile as any).avatar)}.png`
            : null

          // Check if user exists
          const { data: existingUser } = await supabase.from("users").select("*").eq("discord_id", discordId).single()

          let dbUser

          if (existingUser) {
            // Update existing user
            const { data: updatedUser, error: updateError } = await supabase
              .from("users")
              .update({
                username: sanitizeInput((profile as any).username),
                email: token.email,
                avatar: avatarUrl,
                is_admin: isAdminUser || existingUser.is_admin,
                membership: isAdminUser ? "admin" : existingUser.membership,
                last_seen: new Date().toISOString(),
              })
              .eq("discord_id", discordId)
              .select()
              .single()

            if (updateError) throw updateError
            dbUser = updatedUser
          } else {
            // Create new user
            const { data: newUser, error: insertError } = await supabase
              .from("users")
              .insert({
                discord_id: discordId,
                username: sanitizeInput((profile as any).username),
                email: token.email,
                avatar: avatarUrl,
                coins: isAdminUser ? 999999 : 100,
                is_admin: isAdminUser,
                membership: isAdminUser ? "admin" : "free",
              })
              .select()
              .single()

            if (insertError) throw insertError
            dbUser = newUser
          }

          token.userId = dbUser.id
          token.discordId = dbUser.discord_id
          token.coins = dbUser.coins
          token.membership = dbUser.membership
          token.isAdmin = dbUser.is_admin
          token.sub = dbUser.discord_id
          token.lastSync = Date.now()
        } catch (dbError: any) {
                    console.error("[NextAuth] Database error:", dbError)
          // Set defaults even on error
          token.discordId = discordId
          token.coins = 100
          token.membership = "free"
          token.isAdmin = isAdminUser
          token.lastSync = Date.now()
        }
      } else if (token.discordId && trigger === "update") {
        // Only refresh from DB when explicitly triggered (manual refresh)
        try {
          const supabase = createAdminClient()
          const { data: dbUser } = await supabase
            .from("users")
            .select("coins, membership, is_admin")
            .eq("discord_id", token.discordId as string)
            .single()

          if (dbUser) {
            token.coins = dbUser.coins
            token.membership = dbUser.membership
            token.isAdmin = dbUser.is_admin
            token.lastSync = Date.now()
          }
        } catch (error) {
          // Keep existing token data on error
        }
      }
      // For normal token refresh, just return existing token data (no DB call)
      return token
    },
    async session({ session, token }) {
      // Use token data directly - no database call needed
      if (token.discordId) {
        session.user.id = token.discordId as string
        session.user.userId = token.userId as string | undefined
        session.user.discordId = token.discordId as string
        session.user.coins = token.coins as number
        session.user.membership = token.membership as string
        session.user.isAdmin = token.isAdmin as boolean
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/",
    error: "/",
  },
}
