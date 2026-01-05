"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CoinIcon } from "@/components/coin-icon"
import { BadgesDisplay, LevelBadge } from "@/components/badges-display"
import { getLevelFromXP } from "@/lib/xp-badges"
import {
  ArrowLeft,
  MessageSquare,
  Download,
  Star,
  Calendar,
  Crown,
  Shield,
  Heart,
  FileCode,
  MapPin,
  Car,
  Shirt,
  Trophy,
  Zap,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"

interface ProfileData {
  user: {
    id: string
    discordId: string
    username: string
    email: string
    avatar: string
    membership: string
    coins: number
    reputation: number
    isAdmin: boolean
    isBanned: boolean
    createdAt: string
    lastSeen: string
    xp: number
    level: number
    current_badge: string
  }
  assets: Array<{
    id: string
    title: string
    category: string
    downloads: number
    created_at: string
    thumbnail: string
  }>
  threads: Array<{
    id: string
    title: string
    likes: number
    replies_count: number
    created_at: string
  }>
  stats: {
    totalUploads: number
    totalDownloads: number
    totalPosts: number
    coins: number
    membership: string
    joinedAt: string
  }
  downloadCount: number
  postCount: number
  likeCount: number
  points: number
  badges?: {
    earned: Array<{
      id: string
      name: string
      description: string
      image_url: string
      min_xp: number
      max_xp?: number
      color: string
      tier: number
    }>
    equipped: Array<any>
    all: Array<any>
  }
}

export default function ProfilePage() {
  const params = useParams()
  const userId = (params?.id as string) || ""

  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"posts" | "assets" | "badges">("posts")

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/profile/${userId}`)
        if (!res.ok) throw new Error("Failed to fetch user")
        const profileData = await res.json()
        setData(profileData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile")
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchProfile()
    }
  }, [userId])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "scripts":
        return <FileCode className="h-4 w-4" />
      case "mlo":
        return <MapPin className="h-4 w-4" />
      case "vehicles":
        return <Car className="h-4 w-4" />
      case "clothing":
        return <Shirt className="h-4 w-4" />
      default:
        return <FileCode className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-24 mb-6" />
        <div className="rounded-xl border border-border bg-card p-6 mb-6">
          <div className="flex items-start gap-6">
            <Skeleton className="h-28 w-28 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-96" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">User Not Found</h2>
          <p className="text-muted-foreground mb-4">{error || "This user does not exist."}</p>
          <Link href="/forum">
            <Button>Back to Forum</Button>
          </Link>
        </div>
      </div>
    )
  }

  const { user, assets, threads, stats, downloadCount, postCount, likeCount, points } = data

  const levelInfo = getLevelFromXP(user.xp || 0)

  const achievements = [
    { id: "1", name: "First Download", icon: "🏆", unlocked: downloadCount > 0 },
    { id: "2", name: "First Post", icon: "💬", unlocked: postCount > 0 },
    { id: "3", name: "Asset Creator", icon: "📦", unlocked: stats.totalUploads > 0 },
    { id: "4", name: "Helpful Member", icon: "❤️", unlocked: likeCount >= 10 },
    { id: "5", name: "VIP Member", icon: "👑", unlocked: user.membership === "vip" },
    { id: "6", name: "Admin", icon: "🛡️", unlocked: user.isAdmin },
  ].filter((a) => a.unlocked)

  return (
    <div className="p-4 md:p-6">
          <Link
            href="/forum"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <div className="rounded-xl border border-border bg-card p-6 mb-6">
            <div className="flex items-start gap-6">
              <div className="relative">
                <Image
                  src={user.avatar || "/placeholder.svg"}
                  alt={user.username}
                  width={112}
                  height={112}
                  className="h-28 w-28 rounded-full object-cover border-4 border-primary/20"
                  unoptimized
                />
                {user.membership === "vip" && (
                  <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                    <Crown className="h-4 w-4 text-white" />
                  </div>
                )}
                {user.isAdmin && (
                  <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-destructive flex items-center justify-center">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-foreground">{user.username}</h1>
                  {user.membership === "vip" && (
                    <Badge className="bg-primary/20 text-primary">
                      <Crown className="h-3 w-3 mr-1" />
                      VIP
                    </Badge>
                  )}
                  {user.isAdmin && (
                    <Badge className="bg-destructive/20 text-destructive">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                  {user.isBanned && <Badge variant="destructive">Banned</Badge>}
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground mt-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    {user.reputation || 0} reputation
                  </span>
                  <span className="flex items-center gap-1">
                    <CoinIcon size="xs" />
                    {points || 0} coins
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-primary" />
                    {user.xp || 0} XP
                  </span>
                </div>
                {/* Level Badge */}
                <div className="mt-3">
                  <LevelBadge 
                    level={user.level || 1} 
                    title={getLevelFromXP(user.xp || 0).title} 
                    size="md" 
                  />
                </div>

                {/* XP Progress Bar (Profile Only) */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5 text-primary" />
                      XP Progress
                    </span>
                    <span className="text-muted-foreground">
                      {Math.round(levelInfo.progress)}% • Next at {levelInfo.nextLevelXP.toLocaleString()} XP
                    </span>
                  </div>
                  <div className="relative h-3 rounded-full overflow-hidden bg-black/20 border border-white/10 backdrop-blur">
                    <div
                      className="h-full bg-gradient-to-r from-primary via-pink-500 to-purple-500"
                      style={{ width: `${Math.min(levelInfo.progress, 100)}%` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-pulse" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{(user.xp || 0).toLocaleString()} XP</span>
                    <span>Level {levelInfo.level}</span>
                  </div>
                </div>
              </div>
              <Link href={`/messages?to=${user.discordId}`}>
                <Button className="bg-primary hover:bg-primary/90 gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Send Message
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-1 space-y-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="font-semibold text-foreground mb-4">Statistics</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Downloads
                    </span>
                    <span className="font-semibold text-foreground">{stats.totalDownloads}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Forum Posts
                    </span>
                    <span className="font-semibold text-foreground">{stats.totalPosts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <FileCode className="h-4 w-4" />
                      Assets Uploaded
                    </span>
                    <span className="font-semibold text-foreground">{stats.totalUploads}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Likes Given
                    </span>
                    <span className="font-semibold text-foreground">{likeCount}</span>
                  </div>
                </div>
              </div>

              {achievements.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="font-semibold text-foreground mb-4">Achievements</h2>
                  <div className="flex flex-wrap gap-2">
                    {achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2"
                        title={achievement.name}
                      >
                        <span className="text-lg">{achievement.icon}</span>
                        <span className="text-sm text-foreground">{achievement.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="col-span-1 lg:col-span-2">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-4 mb-4 border-b border-border pb-4">
                  <button
                    onClick={() => setActiveTab("posts")}
                    className={`font-semibold transition-colors ${
                      activeTab === "posts" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Recent Posts ({threads.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("assets")}
                    className={`font-semibold transition-colors ${
                      activeTab === "assets" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Uploaded Assets ({assets.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("badges")}
                    className={`font-semibold transition-colors flex items-center gap-1 ${
                      activeTab === "badges" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Trophy className="h-4 w-4" />
                    Badges & XP
                  </button>
                </div>

                {activeTab === "posts" && (
                  <div className="space-y-4">
                    {threads.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No posts yet.</p>
                    ) : (
                      threads.map((post) => (
                        <Link
                          key={post.id}
                          href={`/forum/thread/${post.id}`}
                          className="block rounded-lg bg-secondary/30 p-4 hover:bg-secondary/50 transition-colors"
                        >
                          <h3 className="font-medium text-foreground mb-2">{post.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              {post.likes || 0} likes
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              {post.replies_count || 0} replies
                            </span>
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                )}

                {activeTab === "assets" && (
                  <div className="space-y-4">
                    {assets.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No assets uploaded yet.</p>
                    ) : (
                      assets.map((asset) => (
                        <Link
                          key={asset.id}
                          href={`/asset/${asset.id}`}
                          className="block rounded-lg bg-secondary/30 p-4 hover:bg-secondary/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            {getCategoryIcon(asset.category)}
                            <h3 className="font-medium text-foreground">{asset.title}</h3>
                            <Badge variant="outline" className="capitalize">
                              {asset.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Download className="h-4 w-4" />
                              {asset.downloads || 0} downloads
                            </span>
                            <span>{new Date(asset.created_at).toLocaleDateString()}</span>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                )}

                {activeTab === "badges" && (
                  <div className="space-y-6">
                    {/* XP Progress */}
                    <div className="glass rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <Trophy className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">Level {user.level || 1}</h3>
                            <p className="text-sm text-muted-foreground">{user.current_badge || 'Beginner'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{(user.xp || 0).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Total XP</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progress to next level</span>
                          <span className="text-muted-foreground">
                            {Math.round(levelInfo.progress)}% • {levelInfo.nextLevelXP.toLocaleString()} XP
                          </span>
                        </div>
                        <div className="relative h-3 rounded-full overflow-hidden bg-black/20 border border-white/10 backdrop-blur">
                          <div
                            className="h-full bg-gradient-to-r from-primary via-pink-500 to-purple-500"
                            style={{ width: `${Math.min(levelInfo.progress, 100)}%` }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-pulse" />
                        </div>
                      </div>
                    </div>

                    {/* Badges from Database */}
                    <div className="glass rounded-2xl p-6">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Star className="h-5 w-5 text-primary" />
                        Badges ({data?.badges?.earned?.length || 0} / {data?.badges?.all?.length || 0})
                      </h3>
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                        {(data?.badges?.all || []).map((badge) => {
                          const isEarned = (data?.badges?.earned || []).some(b => b.id === badge.id)
                          return (
                            <div
                              key={badge.id}
                              className={`relative p-3 rounded-xl border-2 transition-all ${
                                isEarned 
                                  ? 'border-primary/50 bg-primary/10' 
                                  : 'border-border/30 bg-secondary/20 opacity-40 grayscale'
                              }`}
                            >
                              <div className="flex flex-col items-center gap-2">
                                <img
                                  src={badge.image_url || '/badges/badge1.png'}
                                  alt={badge.name}
                                  className="h-12 w-12 rounded-full object-cover"
                                />
                                <p className="text-xs font-medium text-center">{badge.name}</p>
                                <p className="text-[10px] text-muted-foreground">{badge.min_xp} XP</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* XP Activity Guide */}
                    <div className="glass rounded-2xl p-6">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        Earn XP
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          { action: "Create Thread", xp: 50, icon: "📝" },
                          { action: "Post Reply", xp: 20, icon: "💬" },
                          { action: "Upload Asset", xp: 100, icon: "📦" },
                          { action: "Receive Like", xp: 10, icon: "❤️" },
                          { action: "Daily Login", xp: 10, icon: "🌟" },
                          { action: "Asset Downloaded", xp: 15, icon: "⬇️" },
                        ].map((item) => (
                          <div key={item.action} className="flex items-center gap-2 p-3 rounded-xl bg-secondary/30">
                            <span className="text-xl">{item.icon}</span>
                            <div>
                              <p className="text-sm font-medium">{item.action}</p>
                              <p className="text-xs text-primary font-bold">+{item.xp} XP</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
    </div>
  )
}
