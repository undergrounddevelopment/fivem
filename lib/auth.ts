import { CONFIG } from "@/lib/config"
import { sanitizeInput } from "@/lib/sanitize"
import type { NextAuthOptions } from "next-auth"
import DiscordProvider from "next-auth/providers/discord"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      coins?: number
      membership?: string
      isAdmin?: boolean
    }
  }
  interface JWT {
    discordId?: string
    coins?: number
    membership?: string
    isAdmin?: boolean
  }
}

async function getAdminSupabase() {
  const { createClient } = await import("@supabase/supabase-js")
  
  if (!CONFIG.supabase.url || !CONFIG.supabase.serviceKey) {
    throw new Error("Missing Supabase configuration")
  }

  return createClient(CONFIG.supabase.url, CONFIG.supabase.serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

function getProviders() {
  const providers = []

  if (CONFIG.discord.clientId && CONFIG.discord.clientSecret) {
    providers.push(
      DiscordProvider({
        clientId: CONFIG.discord.clientId,
        clientSecret: CONFIG.discord.clientSecret,
        authorization: { params: { scope: "identify email" } },
      }),
    )
  }

  return providers
}

export const authOptions: NextAuthOptions = {
  providers: getProviders(),
  secret: CONFIG.auth.secret,
  debug: true, // Enable debug mode to see errors
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === "discord" && profile) {
        const discordId = sanitizeInput((profile as any).id)
        const isAdminUser = discordId === CONFIG.auth.adminDiscordId

        try {
          const supabase = await getAdminSupabase()
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
                coins: isAdminUser ? CONFIG.features.adminCoins : CONFIG.features.newUserCoins,
                is_admin: isAdminUser,
                membership: isAdminUser ? "admin" : "free",
              })
              .select()
              .single()

            if (insertError) throw insertError
            dbUser = newUser
          }

          token.discordId = dbUser.discord_id
          token.coins = dbUser.coins
          token.membership = dbUser.membership
          token.isAdmin = dbUser.is_admin
          token.sub = dbUser.discord_id
        } catch (dbError: any) {
          console.error("[NextAuth] Database error:", dbError)
          // Set defaults even on error
          token.discordId = discordId
          token.coins = 100
          token.membership = "free"
          token.isAdmin = isAdminUser
        }
      } else if (token.discordId) {
        // Refresh token data from database
        try {
          const supabase = await getAdminSupabase()
          const { data: dbUser } = await supabase
            .from("users")
            .select("*")
            .eq("discord_id", token.discordId as string)
            .single()

          if (dbUser) {
            token.coins = dbUser.coins
            token.membership = dbUser.membership
            token.isAdmin = dbUser.is_admin
          }
        } catch (error) {
          // Keep existing token data on error
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token.discordId) {
        try {
          const supabase = await getAdminSupabase()
          const { data: dbUser } = await supabase
            .from("users")
            .select("*")
            .eq("discord_id", token.discordId as string)
            .single()

          if (dbUser) {
            session.user.id = dbUser.discord_id
            session.user.coins = dbUser.coins
            session.user.membership = dbUser.membership
            session.user.isAdmin = dbUser.is_admin
          }
        } catch (error) {
          // Use token data as fallback
          session.user.id = token.discordId
          session.user.coins = token.coins
          session.user.membership = token.membership
          session.user.isAdmin = token.isAdmin
        }
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
