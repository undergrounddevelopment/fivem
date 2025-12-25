"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, Settings, LogOut, User, Sparkles, Crown, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/auth-provider"
import { useNotificationStore } from "@/lib/store"
import { GlobalSearch } from "@/components/global-search"
import { LanguageSelector } from "@/components/language-selector"
import Link from "next/link"

export function Header() {
  const router = useRouter()
  const { user, isLoading, login, logout } = useAuth()
  const { notifications, unreadCount, setNotifications } = useNotificationStore()

  const [userCoins, setUserCoins] = useState(0)
  const [userTickets, setUserTickets] = useState(0)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications")
        if (res.ok) {
          const data = await res.json()
          setNotifications(data)
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
      }
    }

    if (user) {
      fetchNotifications()
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [user, setNotifications])

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return
      try {
        const res = await fetch("/api/user/coins")
        if (res.ok) {
          const data = await res.json()
          setUserCoins(data.coins || 0)
          setUserTickets(data.tickets || 0)
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error)
      }
    }

    if (user) {
      fetchUserData()
      const interval = setInterval(fetchUserData, 10000)
      return () => clearInterval(interval)
    }
  }, [user])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border glass px-6">
      <GlobalSearch />

      {/* Actions */}
      <div className="flex items-center gap-2 ml-6">
        <LanguageSelector />

        {user && (
          <>
            <Link href="/spin-wheel">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <svg
                  className="h-4 w-4 text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span className="font-semibold">{userTickets}</span>
                <span className="text-xs">Tickets</span>
              </Button>
            </Link>

            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <svg className="h-4 w-4 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" fill="none" stroke="white" strokeWidth="1.5" />
                <text x="12" y="15" fontSize="8" fill="white" textAnchor="middle" fontWeight="bold">
                  C
                </text>
              </svg>
              <span className="font-semibold">{userCoins}</span>
              <span className="text-xs">Coins</span>
            </Button>
          </>
        )}

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground hover:text-foreground"
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 glass">
              <div className="p-3 border-b border-border">
                <h3 className="font-semibold text-foreground">Notifications</h3>
                <p className="text-xs text-muted-foreground">
                  {unreadCount > 0 ? `You have ${unreadCount} unread messages` : "No new notifications"}
                </p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">No notifications yet</div>
                ) : (
                  notifications.slice(0, 5).map((notif) => (
                    <DropdownMenuItem key={notif.id} className="p-3 cursor-pointer">
                      <div className="flex gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{notif.title}</p>
                          <p className="text-xs text-muted-foreground">{notif.message}</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {isLoading ? (
          <div className="h-10 w-24 bg-secondary/50 animate-pulse rounded-xl" />
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="rounded-xl h-10 px-3 gap-2 hover:bg-secondary/50"
                aria-label={`User menu for ${user.username}`}
              >
                <img
                  src={user.avatar || "/placeholder.svg"}
                  alt={user.username}
                  className="h-7 w-7 rounded-full object-cover ring-2 ring-primary/20"
                />
                <span className="hidden sm:inline font-medium">{user.username}</span>
                {user.membership === "admin" && <Shield className="h-4 w-4 text-destructive" />}
                {user.membership === "vip" && <Crown className="h-4 w-4 text-primary" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass">
              <div className="p-3 border-b border-border">
                <p className="font-semibold text-foreground">{user.username}</p>
                <p className="text-xs text-primary capitalize">{user.membership} Member</p>
              </div>
              <Link href="/dashboard">
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <User className="h-4 w-4" /> Dashboard
                </DropdownMenuItem>
              </Link>
              <Link href="/dashboard/settings">
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <Settings className="h-4 w-4" /> Settings
                </DropdownMenuItem>
              </Link>
              {user.membership === "admin" && (
                <>
                  <DropdownMenuSeparator />
                  <Link href="/admin">
                    <DropdownMenuItem className="gap-2 cursor-pointer text-destructive">
                      <Shield className="h-4 w-4" /> Admin Panel
                    </DropdownMenuItem>
                  </Link>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="gap-2 cursor-pointer text-destructive">
                <LogOut className="h-4 w-4" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={login} className="bg-[#5865F2] hover:bg-[#4752C4] text-white gap-2 rounded-xl h-10 px-4">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.076.076 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.077.077 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            <span className="hidden sm:inline">Login with Discord</span>
          </Button>
        )}
      </div>
    </header>
  )
}
