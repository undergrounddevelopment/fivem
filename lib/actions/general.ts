"use server"

import { createClient } from "@/lib/supabase/server"

async function getUser() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error("[getUser] Error:", error)
    return null
  }
}

export async function getNotifications() {
  try {
    const user = await getUser()
    if (!user) return []

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("[getNotifications] Error:", error)
    return []
  }
}

export async function markNotificationRead(notificationId: string) {
  try {
    const user = await getUser()
    if (!user) throw new Error("Unauthorized")

    const supabase = await createClient()
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId)
      .eq("user_id", user.id)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error("[markNotificationRead] Error:", error)
    return { success: false }
  }
}

export async function markAllNotificationsRead() {
  try {
    const user = await getUser()
    if (!user) throw new Error("Unauthorized")

    const supabase = await createClient()
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error("[markAllNotificationsRead] Error:", error)
    return { success: false }
  }
}

export async function getAnnouncements() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("[getAnnouncements] Error:", error)
    return []
  }
}

export async function getTestimonials() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("[getTestimonials] Error:", error)
    return []
  }
}

export async function getBanners() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("[getBanners] Error:", error)
    return []
  }
}

export async function getAssets(category?: string) {
  try {
    const supabase = await createClient()
    let query = supabase
      .from("assets")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(100)

    if (category) {
      query = query.eq("category", category)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  } catch (error) {
    console.error("[getAssets] Error:", error)
    return []
  }
}

export async function getSiteSettings() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("site_settings").select("*").limit(1).single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("[getSiteSettings] Error:", error)
    return null
  }
}

export async function getCoinTransactions(limit = 50) {
  try {
    const user = await getUser()
    if (!user) return []

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("coin_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("[getCoinTransactions] Error:", error)
    return []
  }
}

export async function getUserProfile(userId?: string) {
  try {
    const user = await getUser()
    const targetUserId = userId || user?.id

    if (!targetUserId) return null

    const supabase = await createClient()
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("discord_id, username, email, avatar, membership, coins, created_at")
      .eq("discord_id", targetUserId)
      .single()

    if (userError) throw userError
    if (!userData) return null

    const [threadsResult, repliesResult, spinsResult] = await Promise.all([
      supabase.from("forum_threads").select("*", { count: "exact", head: true }).eq("author_id", targetUserId),
      supabase.from("forum_replies").select("*", { count: "exact", head: true }).eq("author_id", targetUserId),
      supabase.from("spin_wheel_history").select("*", { count: "exact", head: true }).eq("user_id", targetUserId),
    ])

    return {
      ...userData,
      stats: {
        threads: threadsResult.count || 0,
        replies: repliesResult.count || 0,
        spins: spinsResult.count || 0,
      },
    }
  } catch (error) {
    console.error("[getUserProfile] Error:", error)
    return null
  }
}

export async function updateUserProfile(data: { username?: string; email?: string }) {
  try {
    const user = await getUser()
    if (!user) throw new Error("Unauthorized")

    const updates: any = { updated_at: new Date().toISOString() }
    if (data.username) updates.username = data.username
    if (data.email) updates.email = data.email

    const supabase = await createClient()
    const { error } = await supabase.from("users").update(updates).eq("discord_id", user.id)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error("[updateUserProfile] Error:", error)
    return { success: false }
  }
}

export async function getStats() {
  try {
    const supabase = await createClient()

    const [usersResult, threadsResult, repliesResult, assetsResult, onlineResult] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("forum_threads").select("*", { count: "exact", head: true }),
      supabase.from("forum_replies").select("*", { count: "exact", head: true }),
      supabase.from("assets").select("*", { count: "exact", head: true }).eq("status", "approved"),
      supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .gte("last_seen", new Date(Date.now() - 5 * 60 * 1000).toISOString()),
    ])

    return {
      totalUsers: usersResult.count || 0,
      totalThreads: threadsResult.count || 0,
      totalPosts: repliesResult.count || 0,
      totalAssets: assetsResult.count || 0,
      onlineUsers: onlineResult.count || 0,
    }
  } catch (error) {
    console.error("[getStats] Error:", error)
    throw error
  }
}

export async function updateUserHeartbeat() {
  try {
    const user = await getUser()
    if (!user) return { success: false }

    const supabase = await createClient()
    const { error } = await supabase
      .from("users")
      .update({ last_seen: new Date().toISOString() })
      .eq("discord_id", user.id)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error("[updateUserHeartbeat] Error:", error)
    return { success: false }
  }
}

export async function getPublicAnnouncements() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(5)

    if (error) {
      console.error("[getPublicAnnouncements] Database error:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("[getPublicAnnouncements] Error:", error)
    throw error
  }
}
