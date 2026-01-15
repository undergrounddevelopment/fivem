"use client"

import { useState, useEffect } from "react"
import { Users, Circle, Crown, Shield, Star } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { OptimizedImage } from "@/components/optimized-image"

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
  guest: { color: "text-slate-500", icon: null, label: "Guest" },
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
    <div className="relative shrink-0">
      <div className={cn("rounded-full overflow-hidden bg-white/5 ring-1 ring-white/10 shrink-0", sizeClasses[size])}>
        <OptimizedImage
          src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`}
          alt={user.username}
          width={40}
          height={40}
          className="h-full w-full object-cover"
        />
      </div>
      {/* Online indicator */}
      <div className={cn(
        "absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-[#1a1a1a]",
        statusSize[size],
        user.status === "away" ? "bg-yellow-400" :
          user.status === "busy" ? "bg-orange-400" : "bg-emerald-400"
      )} />
    </div>
  )
}

interface OnlineUsersListProps {
  className?: string
  variant?: "card" | "list"
}

// 100% REAL DATABASE - No fake users
export function OnlineUsersList({ className, variant = "list" }: OnlineUsersListProps) {
  const [users, setUsers] = useState<OnlineUser[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const fetchOnlineUsers = async () => {
      try {
        const res = await fetch("/api/realtime/online-users")
        const data = await res.json()
        let realUsers: OnlineUser[] = []
        
        if (data.success && data.data) {
          realUsers = data.data
        } else if (Array.isArray(data)) {
          realUsers = data
        }

        // PROTECTION: Ignore empty list if we already have users (prevent flickering)
        if (realUsers.length === 0 && users.length > 0) return

        // 100% REAL - Only show actual online users from database
        setUsers(realUsers.map(u => ({
          ...u,
          status: "online" as const,
          isOnline: true
        })))
        
      } catch (error) {
        console.error("Failed to fetch online users:", error)
        setUsers([]) // No fallback fake users - empty if API fails
      } finally {
        setLoading(false)
      }
    }

    fetchOnlineUsers()
    const interval = setInterval(fetchOnlineUsers, 60000) // Refresh every 60s
    return () => clearInterval(interval)
  }, [])

  // Separate members from guests
  const members = users.filter(u => u.membership !== 'guest')
  const guests = users.filter(u => u.membership === 'guest')
  
  const displayMembers = expanded ? members : members.slice(0, 5)
  const displayGuests = expanded ? guests : guests.slice(0, 5)
  const hasMoreMembers = members.length > 5
  const hasMoreGuests = guests.length > 5

  const UserRow = ({ user }: { user: OnlineUser }) => {
    const config = membershipConfig[user.membership] || membershipConfig.member
    const MemberIcon = config.icon
    const isGuest = user.membership === 'guest'

    return (
      <div
        className={cn(
          "flex items-center gap-3 p-2 rounded-xl transition-colors group",
          isGuest ? "opacity-70" : "hover:bg-white/5"
        )}
      >
        <UserAvatar user={user} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={cn(
              "font-medium text-sm truncate transition-colors",
              config.color,
              !isGuest && "group-hover:text-primary"
            )}>
              {user.username}
            </span>
            {MemberIcon && (
              <MemberIcon className={cn("h-3.5 w-3.5 shrink-0", config.color)} />
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {isGuest ? "Browsing" : user.status === "away" ? "Away" : user.status === "busy" ? "Busy" : "Active now"}
          </p>
        </div>
        <div className={cn(
          "h-2 w-2 rounded-full shrink-0",
          isGuest ? "bg-slate-400" : 
            user.status === "away" ? "bg-yellow-400" :
            user.status === "busy" ? "bg-orange-400" : "bg-emerald-400"
        )} />
      </div>
    )
  }

  const ListContent = (
    <>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="h-9 w-9 rounded-full bg-white/5" />
              <div className="flex-1">
                <div className="h-3.5 w-24 bg-white/5 rounded" />
                <div className="h-2.5 w-16 bg-white/5 rounded mt-1.5" />
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
        <div className="space-y-4">
          {/* Discord Members Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                Discord Members
              </h3>
              <span className="text-xs text-emerald-400/70 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                {members.length}
              </span>
            </div>
            {members.length > 0 ? (
              <div className="space-y-1">
                {displayMembers.map((user) => (
                  <Link key={user.id} href={`/profile/${user.id}`}>
                    <UserRow user={user} />
                  </Link>
                ))}
                {hasMoreMembers && !expanded && (
                  <p className="text-xs text-center text-muted-foreground py-1">
                    +{members.length - 5} more members
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-2">No members online</p>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-white/5" />

          {/* Guests Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Guests (Not Logged In)
              </h3>
              <span className="text-xs text-slate-400/70 bg-slate-500/10 px-2 py-0.5 rounded-full">
                {guests.length}
              </span>
            </div>
            {guests.length > 0 ? (
              <div className="space-y-1">
                {displayGuests.map((user) => (
                  <UserRow key={user.id} user={user} />
                ))}
                {hasMoreGuests && !expanded && (
                  <p className="text-xs text-center text-muted-foreground py-1">
                    +{guests.length - 5} more guests
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-2">No guests browsing</p>
            )}
          </div>

          {/* Expand/Collapse Button */}
          {(hasMoreMembers || hasMoreGuests) && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full py-2 text-xs font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors bg-primary/5 hover:bg-primary/10 rounded-lg"
            >
              {expanded ? "Show less" : "Show all"}
            </button>
          )}
        </div>
      )}
    </>
  )

  if (variant === "card") {
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
        {ListContent}
      </div>
    )
  }

  return <div className={className}>{ListContent}</div>
}

// Compact version for sidebar
export function OnlineUsersCompact({ className }: { className?: string }) {
  const [users, setUsers] = useState<OnlineUser[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOnlineUsers = async () => {
      try {
        const res = await fetch("/api/realtime/online-users") // Use realtime endpoint
        const data = await res.json()
        
        let fetchedUsers = []
        if (data.success && data.data) {
          fetchedUsers = data.data
        } else if (Array.isArray(data)) {
          fetchedUsers = data
        }
        
        // PROTECTION: Ignore 0 if we already have a count
        const count = data.count || fetchedUsers.length
        if (count === 0 && totalCount > 0) return

        setUsers(fetchedUsers)
        setTotalCount(count) // 100% REAL - No fake padding
        
      } catch (error) {
        console.error("Failed to fetch online users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOnlineUsers()
    const interval = setInterval(fetchOnlineUsers, 60000) // 60s sync
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-7 w-7 rounded-full bg-white/5 border-2 border-background animate-pulse" />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">Loading...</span>
      </div>
    )
  }

  const displayUsers = users.slice(0, 5)
  const remaining = Math.max(0, totalCount - 5) // Use totalCount for accurate "+X"

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
              <OptimizedImage
                src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`}
                alt={user.username}
                width={28}
                height={28}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 border border-background" />
          </Link>
        ))}
        {remaining > 0 && (
          <div className="h-7 w-7 rounded-full bg-white/10 border-2 border-background flex items-center justify-center text-[10px] font-medium text-muted-foreground">
            +{remaining > 99 ? '99+' : remaining}
          </div>
        )}
      </div>
      <span className="text-xs text-muted-foreground">
        {totalCount} online
      </span>
    </div>
  )
}
