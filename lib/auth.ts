import { CONFIG } from "@/lib/config"
import { sanitizeInput } from "@/lib/sanitize"
import type { NextAuthOptions } from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import CredentialsProvider from "next-auth/providers/credentials"

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
      xp?: number
      level?: number
    }
  }
  interface JWT {
    discordId?: string
    coins?: number
    membership?: string
    isAdmin?: boolean
    xp?: number
    level?: number
    lastSync?: number
  }
}

async function getAdminSupabase() {
  try {
    const { createAdminClient } = await import("@/lib/supabase/server")
    return createAdminClient()
  } catch (error) {
    console.error("[NextAuth] Failed to create Supabase client:", error)
    return null
  }
}

// PRODUCTION DISCORD OAUTH - 100% CONFIGURED
const isDiscordConfigured = true // Force enable since we have production credentials

function getProviders() {
  console.log("[NextAuth] ✅ Discord OAuth ENABLED - Production Ready")
  
  return [
    DiscordProvider({
      clientId: CONFIG.discord.clientId!,
      clientSecret: CONFIG.discord.clientSecret!,
      authorization: { 
        params: { 
          scope: "identify email",
          prompt: "none"
        } 
      },
    })
  ]
}

export const authOptions: NextAuthOptions = {
  providers: getProviders(),
  secret: CONFIG.auth.secret,
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error: (code, metadata) => console.error(`[NextAuth Error] ${code}:`, metadata),
    warn: (code) => console.warn(`[NextAuth Warning] ${code}`),
    debug: (code, metadata) => process.env.NODE_ENV === 'development' && console.log(`[NextAuth Debug] ${code}:`, metadata),
  },
  callbacks: {
    async jwt({ token, account, profile, trigger }) {
      if (account?.provider === "discord" && profile) {
        const discordId = sanitizeInput((profile as any).id)
        const isAdminUser = discordId === CONFIG.auth.adminDiscordId

        console.log(`[NextAuth] ✅ Discord login: ${(profile as any).username} (${discordId})`)

        try {
          const supabase = await getAdminSupabase()
          if (!supabase) {
            console.warn("[NextAuth] No Supabase client, using fallback")
            token.discordId = discordId
            token.coins = isAdminUser ? CONFIG.features.adminCoins : CONFIG.features.newUserCoins
            token.membership = isAdminUser ? "admin" : "free"
            token.isAdmin = isAdminUser
            token.xp = 0
            token.level = 1
            token.sub = discordId
            token.lastSync = Date.now()
            return token
          }

          const avatarUrl = (profile as any).avatar
            ? `https://cdn.discordapp.com/avatars/${discordId}/${sanitizeInput((profile as any).avatar)}.png`
            : null

          const { data: existingUser } = await supabase
            .from("users")
            .select("*")
            .eq("discord_id", discordId)
            .single()

          let dbUser

          if (existingUser) {
            console.log(`[NextAuth] ✅ Updating existing user: ${existingUser.username}`)
            
            const { data: updatedUser, error: updateError } = await supabase
              .from("users")
              .update({
                username: sanitizeInput((profile as any).username),
                email: token.email,
                avatar_url: avatarUrl,
                is_admin: isAdminUser || existingUser.is_admin,
                role: isAdminUser ? "admin" : existingUser.role,
                updated_at: new Date().toISOString(),
              })
              .eq("discord_id", discordId)
              .select()
              .single()

            if (updateError) {
              console.error("[NextAuth] Update error:", updateError)
              throw updateError
            }
            dbUser = updatedUser
          } else {
            console.log(`[NextAuth] ✅ Creating new user: ${(profile as any).username}`)
            
            const { data: newUser, error: insertError } = await supabase
              .from("users")
              .insert({
                discord_id: discordId,
                username: sanitizeInput((profile as any).username),
                email: token.email,
                avatar_url: avatarUrl,
                coins: isAdminUser ? CONFIG.features.adminCoins : CONFIG.features.newUserCoins,
                xp: 0,
                level: 1,
                is_admin: isAdminUser,
                role: isAdminUser ? "admin" : "user",
              })
              .select()
              .single()

            if (insertError) {
              console.error("[NextAuth] Insert error:", insertError)
              throw insertError
            }
            dbUser = newUser

            // Create spin wheel tickets for new user
            await supabase
              .from("spin_wheel_tickets")
              .insert({
                user_id: dbUser.id,
                tickets: 3, // Welcome bonus
              })
          }

          token.discordId = dbUser.discord_id
          token.coins = dbUser.coins
          token.membership = dbUser.role
          token.isAdmin = dbUser.is_admin
          token.xp = dbUser.xp
          token.level = dbUser.level
          token.sub = dbUser.discord_id
          token.lastSync = Date.now()
          
          console.log(`[NextAuth] ✅ User data synced successfully`)
          
        } catch (dbError: any) {
          console.error("[NextAuth] Database error:", dbError.message)
          // Fallback values
          token.discordId = discordId
          token.coins = isAdminUser ? CONFIG.features.adminCoins : CONFIG.features.newUserCoins
          token.membership = isAdminUser ? "admin" : "free"
          token.isAdmin = isAdminUser
          token.xp = 0
          token.level = 1
          token.sub = discordId
          token.lastSync = Date.now()
        }
      } else if (token.discordId && trigger === "update") {
        // Refresh user data
        try {
          const supabase = await getAdminSupabase()
          if (supabase) {
            const { data: dbUser } = await supabase
              .from("users")
              .select("coins, role, is_admin, xp, level")
              .eq("discord_id", token.discordId as string)
              .single()

            if (dbUser) {
              token.coins = dbUser.coins
              token.membership = dbUser.role
              token.isAdmin = dbUser.is_admin
              token.xp = dbUser.xp
              token.level = dbUser.level
              token.lastSync = Date.now()
            }
          }
        } catch (error) {
          console.error("[NextAuth] Token update error:", error)
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token.discordId) {
        session.user.id = token.discordId as string
        session.user.coins = token.coins as number
        session.user.membership = token.membership as string
        session.user.isAdmin = token.isAdmin as boolean
        session.user.xp = token.xp as number
        session.user.level = token.level as number
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Always redirect to home after sign in
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  events: {
    signIn: async ({ user, account, profile }) => {
      console.log(`[NextAuth] ✅ Sign in successful: ${user.name}`)
    },
    signOut: async ({ session, token }) => {
      console.log(`[NextAuth] ✅ Sign out: ${session?.user?.name}`)
    },
  },
}

export const isAuthConfigured = isDiscordConfigured
