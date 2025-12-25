"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  CreditCard,
  Trash2,
  Camera,
  Crown,
  Check,
  Loader2,
  Save,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { CoinIcon } from "@/components/coin-icon"

interface NotificationSettings {
  emailNotifications: boolean
  forumReplies: boolean
  newDownloads: boolean
  promotions: boolean
}

export default function SettingsPage() {
  const { user, isLoading, refreshUser } = useAuth()
  const router = useRouter()

  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form states - realtime sync with user data
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    forumReplies: true,
    newDownloads: false,
    promotions: false,
  })

  // Sync form with user data when loaded
  useEffect(() => {
    if (user) {
      setUsername(user.username || "")
      setBio(user.bio || "")
      setAvatarUrl(user.avatar || "")
    }
  }, [user])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  const handleSaveProfile = async () => {
    if (!user) return

    setIsSaving(true)
    setError(null)
    setSaveSuccess(false)

    try {
      const res = await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          username,
          bio,
          avatar: avatarUrl,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to save profile")
      }

      setSaveSuccess(true)
      // Refresh user data
      if (refreshUser) {
        await refreshUser()
      }

      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    if (!user) return

    setIsSaving(true)
    setError(null)

    try {
      const res = await fetch("/api/profile/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          ...notifications,
        }),
      })

      if (!res.ok) throw new Error("Failed to save notifications")

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="md:ml-72 transition-all duration-300">
        <Header />
        <div className="p-6 max-w-4xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-foreground">Settings</span>
          </div>

          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            {saveSuccess && (
              <Badge className="bg-success/20 text-success border-success/30 gap-1">
                <Check className="h-3 w-3" />
                Saved successfully
              </Badge>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive">
              {error}
            </div>
          )}

          {/* Profile Settings */}
          <div className="glass rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Profile Settings</h2>
            </div>

            <div className="flex items-center gap-6 mb-6">
              <div className="relative group">
                <div className="relative h-20 w-20 rounded-2xl overflow-hidden ring-2 ring-border">
                  <Image
                    src={avatarUrl || user.avatar || "/placeholder.svg?height=80&width=80&query=user avatar"}
                    alt={user.username}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <button className="absolute inset-0 rounded-2xl bg-background/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="h-6 w-6 text-foreground" />
                </button>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-foreground mb-2">Avatar URL</label>
                <Input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.png"
                  className="h-11 bg-secondary/50 border-border/50 rounded-xl"
                />
                <p className="text-xs text-muted-foreground mt-1">Or use your Discord avatar by default</p>
              </div>
            </div>

            <div className="grid gap-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Username</label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="max-w-md h-11 bg-secondary/50 border-border/50 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <Input
                  value={user.email || ""}
                  type="email"
                  className="max-w-md h-11 bg-secondary/50 border-border/50 rounded-xl"
                  disabled
                />
                <p className="text-xs text-muted-foreground mt-1">Email is linked to your Discord account</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Discord ID</label>
                <Input
                  value={user.discordId || user.id || ""}
                  className="max-w-md h-11 bg-secondary/50 border-border/50 rounded-xl font-mono"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full max-w-md h-24 rounded-xl border border-border/50 bg-secondary/50 p-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="bg-primary hover:bg-primary/90 rounded-xl glow-sm gap-2"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setUsername(user.username || "")
                  setBio(user.bio || "")
                  setAvatarUrl(user.avatar || "")
                }}
                className="rounded-xl bg-transparent gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="glass rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-warning/20 flex items-center justify-center">
                <Bell className="h-5 w-5 text-warning" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
            </div>

            <div className="space-y-1">
              {[
                {
                  key: "emailNotifications",
                  label: "Email notifications",
                  description: "Receive email notifications for important updates",
                },
                {
                  key: "forumReplies",
                  label: "Forum replies",
                  description: "Get notified when someone replies to your posts",
                },
                {
                  key: "newDownloads",
                  label: "New downloads",
                  description: "Get notified about new resources in your favorite categories",
                },
                {
                  key: "promotions",
                  label: "Promotions",
                  description: "Receive promotional emails and special offers",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between py-4 border-b border-border/30 last:border-0"
                >
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications[item.key as keyof NotificationSettings]}
                      onChange={(e) =>
                        setNotifications((prev) => ({
                          ...prev,
                          [item.key]: e.target.checked,
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Button
                onClick={handleSaveNotifications}
                disabled={isSaving}
                className="bg-primary hover:bg-primary/90 rounded-xl glow-sm gap-2"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Notifications
              </Button>
            </div>
          </div>

          {/* Security */}
          <div className="glass rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-success/20 flex items-center justify-center">
                <Shield className="h-5 w-5 text-success" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Security</h2>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between py-4 border-b border-border/30">
                <div>
                  <p className="font-medium text-foreground">Discord Connection</p>
                  <p className="text-sm text-muted-foreground">Connected as {user.username}</p>
                </div>
                <Badge className="bg-success/20 text-success border-success/30">
                  <Check className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              </div>
              <div className="flex items-center justify-between py-4 border-b border-border/30">
                <div>
                  <p className="font-medium text-foreground">Account Status</p>
                  <p className="text-sm text-muted-foreground">Your account is in good standing</p>
                </div>
                <Badge
                  className={
                    user.membership === "admin"
                      ? "bg-destructive/20 text-destructive border-destructive/30"
                      : user.membership === "vip"
                        ? "bg-primary/20 text-primary border-primary/30"
                        : "bg-secondary text-muted-foreground"
                  }
                >
                  {user.membership === "admin" && <Shield className="h-3 w-3 mr-1" />}
                  {user.membership === "vip" && <Crown className="h-3 w-3 mr-1" />}
                  {user.membership.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium text-foreground">Coins Balance</p>
                  <p className="text-sm text-muted-foreground">Your current coin balance</p>
                </div>
                <Badge className="bg-warning/20 text-warning border-warning/30 text-lg px-3 flex items-center gap-2">
                  <CoinIcon size="sm" />
                  {user.coins || 0} Coins
                </Badge>
              </div>
            </div>
          </div>

          {/* Billing */}
          <div className="glass rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-accent" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Membership</h2>
            </div>

            <div
              className={`flex items-center justify-between p-5 rounded-xl border ${
                user.membership === "vip" || user.membership === "admin"
                  ? "bg-primary/10 border-primary/30"
                  : "bg-secondary/30 border-border/50"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                    user.membership === "admin"
                      ? "bg-destructive/20"
                      : user.membership === "vip"
                        ? "bg-primary/20"
                        : "bg-secondary/50"
                  }`}
                >
                  {user.membership === "admin" ? (
                    <Shield className="h-6 w-6 text-destructive" />
                  ) : (
                    <Crown className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {user.membership === "admin"
                      ? "Administrator"
                      : user.membership === "vip"
                        ? "VIP Membership"
                        : "Free Member"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {user.membership === "admin"
                      ? "Full access to all features"
                      : user.membership === "vip"
                        ? "Premium benefits active"
                        : "Upgrade for more features"}
                  </p>
                </div>
              </div>
              {user.membership === "free" && (
                <Button className="bg-primary hover:bg-primary/90 rounded-xl glow-sm">Upgrade to VIP</Button>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="glass rounded-2xl p-6 border-destructive/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-destructive/20 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Danger Zone</h2>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Delete Account</p>
                <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
              </div>
              <Button variant="destructive" size="sm" className="rounded-xl">
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
