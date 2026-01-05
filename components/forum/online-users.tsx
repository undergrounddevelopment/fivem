"use client"

import { useState, useEffect } from "react"
import { Users, Circle, Crown, Shield, Star } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface OnlineUser {
  id: string
  username: string
  avatar: string | null
  membership: string
  isOnline?: boolean
  status?: "online" | "away" | "busy"
}

const membershipConfig: Record<string, { color: string; icon: any; label: string }> = {
  admin: { color: "text-red-400", icon: Shield, label: "Admin" },
  owner: { color: "text-amber-400", icon: Crown, label: "Owner" },
  premium: { color: "text-purple-400", icon: Star, label: "Premium" },
  vip: { color: "text-cyan-400", icon: Star, label: "VIP" },
  member: { color: "text-emerald-400", icon: null, label: "Member" },
  free: { color: "text-gray-400", icon: null, label: "Member" },
}

function UserAvatar({ user, size = "md" }: { user: OnlineUser; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-11 w-11"
  }

  const statusSize = {
    sm: "h-2 w-2",
    md: "h-2.5 w-2.5",
    lg: "h-3 w-3"
  }

  return (
    <div className="relative">
      <div className={cn("rounded-full overflow-hidden bg-secondary shrink-0", sizeClasses[size])}>
        {user.avatar ? (
          <img 
            src={user.avatar} 
            alt={user.username} 
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`
            }}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/30 to-accent/30 text-xs font-bold text-white">
            {user.username?.charAt(0)?.toUpperCase() || "?"}
          </div>
        )}
      </div>
      {/* Online indicator */}
      <div className={cn(
        "absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-background",
        statusSize[size],
        user.status === "away" ? "bg-yellow-400" : 
        user.status === "busy" ? "bg-orange-400" : "bg-emerald-400"
      )} />
    </div>
  )
}

export function OnlineUsersList({ className }: { className?: string }) {
  const [users, setUsers] = useState<OnlineUser[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const fetchOnlineUsers = async () => {
      try {
        const res = await fetch("/api/realtime/online-users")
        const data = await res.json()
        if (data.success && data.data) {
          setUsers(data.data)
        } else if (Array.isArray(data)) {
          setUsers(data)
        }
      } catch (error) {
        console.error("Failed to fetch online users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOnlineUsers()
    const interval = setInterval(fetchOnlineUsers, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const displayUsers = expanded ? users : users.slice(0, 8)
  const hasMore = users.length > 8

  return (
    <div className={cn("bg-card rounded-2xl p-5", className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <div className="relative">
            <Users className="h-5 w-5 text-emerald-400" />
            <Circle className="absolute -top-0.5 -right-0.5 h-2 w-2 fill-emerald-400 text-emerald-400 animate-pulse" />
          </div>
          Online Now
        </h2>
        <span className="text-sm font-medium px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400">
          {users.length} online
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="h-9 w-9 rounded-full bg-secondary/50" />
              <div className="flex-1">
                <div className="h-3.5 w-24 bg-secondary/50 rounded" />
                <div className="h-2.5 w-16 bg-secondary/30 rounded mt-1.5" />
              </div>
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-6">
          <Users className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">No users online</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {displayUsers.map((user) => {
              const config = membershipConfig[user.membership] || membershipConfig.member
              const MemberIcon = config.icon

              return (
                <Link
                  key={user.id}
                  href={`/profile/${user.id}`}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/50 transition-colors group"
                >
                  <UserAvatar user={user} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        "font-medium text-sm truncate group-hover:text-primary transition-colors",
                        config.color
                      )}>
                        {user.username}
                      </span>
                      {MemberIcon && (
                        <MemberIcon className={cn("h-3.5 w-3.5 shrink-0", config.color)} />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {user.status === "away" ? "Away" : user.status === "busy" ? "Busy" : "Active now"}
                    </p>
                  </div>

                  <div className={cn(
                    "h-2 w-2 rounded-full shrink-0",
                    user.status === "away" ? "bg-yellow-400" : 
                    user.status === "busy" ? "bg-orange-400" : "bg-emerald-400"
                  )} />
                </Link>
              )
            })}
          </div>

          {hasMore && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full mt-3 py-2 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              {expanded ? "Show less" : `Show ${users.length - 8} more`}
            </button>
          )}
        </>
      )}
    </div>
  )
}

// Compact version for sidebar
export function OnlineUsersCompact({ className }: { className?: string }) {
  const [users, setUsers] = useState<OnlineUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOnlineUsers = async () => {
      try {
        const res = await fetch("/api/forum/online-users")
        const data = await res.json()
        setUsers(Array.isArray(data) ? data : data.data || [])
      } catch (error) {
        console.error("Failed to fetch online users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOnlineUsers()
    const interval = setInterval(fetchOnlineUsers, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-7 w-7 rounded-full bg-secondary/50 border-2 border-background animate-pulse" />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">Loading...</span>
      </div>
    )
  }

  const displayUsers = users.slice(0, 5)
  const remaining = users.length - 5

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex -space-x-2">
        {displayUsers.map((user) => (
          <Link
            key={user.id}
            href={`/profile/${user.id}`}
            className="relative group"
            title={user.username}
          >
            <div className="h-7 w-7 rounded-full overflow-hidden border-2 border-background bg-secondary hover:z-10 hover:scale-110 transition-transform">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.username} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/30 to-accent/30 text-[10px] font-bold text-white">
                  {user.username?.charAt(0)?.toUpperCase() || "?"}
                </div>
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 border border-background" />
          </Link>
        ))}
        {remaining > 0 && (
          <div className="h-7 w-7 rounded-full bg-secondary/80 border-2 border-background flex items-center justify-center text-[10px] font-medium text-muted-foreground">
            +{remaining}
          </div>
        )}
      </div>
      <span className="text-xs text-muted-foreground">
        {users.length} online
      </span>
    </div>
  )
}
