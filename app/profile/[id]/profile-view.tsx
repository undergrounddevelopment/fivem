"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CoinIcon } from "@/components/coin-icon"
import {
  ArrowLeft,
  MessageSquare,
  Download,
  Star,
  Calendar,
  Heart,
  FileCode,
  MapPin,
  Car,
  Shirt,
  Award,
  Trophy,
  Zap,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ForumRankBadge } from "@/components/forum-rank-badge"
import { BadgesDisplay } from "@/components/badges-display"
import { Progress } from "@/components/ui/progress"

export default function ProfileView({ profileData }) {
  const [activeTab, setActiveTab] = useState("posts")
  const [xpStats, setXpStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const { user, assets, threads, stats } = profileData

  // Fetch XP & Badge stats
  useEffect(() => {
    const fetchXPStats = async () => {
      try {
        const res = await fetch(`/api/xp/stats?userId=${user.discord_id}`)
        if (res.ok) {
          const data = await res.json()
          setXpStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch XP stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchXPStats()
  }, [user.discord_id])

  const getCategoryIcon = (category) => {
    switch (category) {
      case "scripts": return <FileCode className="h-4 w-4" />;
      case "mlo": return <MapPin className="h-4 w-4" />;
      case "vehicles": return <Car className="h-4 w-4" />;
      case "clothing": return <Shirt className="h-4 w-4" />;
      default: return <FileCode className="h-4 w-4" />;
    }
  }

  return (
    <div className="p-4 md:p-6">
      <Link href="/forum" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
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
            <div className="absolute -bottom-1 -right-1">
              <ForumRankBadge level={user.level} />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-foreground">{user.username}</h1>
              <Badge className="bg-primary/20 text-primary">{user.rank.name}</Badge>
              {user.isAdmin && <Badge variant="destructive">Admin</Badge>}
            </div>
            <p className="text-muted-foreground mb-4">{user.bio || 'This user has not set a bio.'}</p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Joined {new Date(user.created_at).toLocaleDateString()}</span>
              <span className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500" /> {user.reputation || 0} reputation</span>
              <span className="flex items-center gap-1"><CoinIcon size="xs" /> {user.coins || 0} coins</span>
            </div>
          </div>
          <Link href={`/messages?to=${user.discord_id}`}>
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <MessageSquare className="h-4 w-4" />
              Send Message
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 space-y-4">
          {/* XP & Badge Section */}
          {xpStats && (
            <BadgesDisplay 
              userStats={{
                level: xpStats.level,
                xp: xpStats.xp,
                posts: stats.totalPosts,
                threads: threads.length,
                likes_received: stats.likeCount,
                assets: stats.totalUploads,
                asset_downloads: stats.totalDownloads,
                membership: user.rank?.name || 'member',
                created_at: user.created_at
              }}
              compact={false}
            />
          )}

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold text-foreground mb-4">Statistics</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2"><Download className="h-4 w-4" /> Downloads</span>
                <span className="font-semibold text-foreground">{stats.totalDownloads}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Forum Posts</span>
                <span className="font-semibold text-foreground">{stats.totalPosts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2"><FileCode className="h-4 w-4" /> Assets Uploaded</span>
                <span className="font-semibold text-foreground">{stats.totalUploads}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2"><Heart className="h-4 w-4" /> Likes Received</span>
                <span className="font-semibold text-foreground">{stats.likeCount}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-1 lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-4 mb-4 border-b border-border pb-4">
              <button onClick={() => setActiveTab("posts")} className={`font-semibold transition-colors ${activeTab === "posts" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>Recent Posts ({threads.length})</button>
              <button onClick={() => setActiveTab("assets")} className={`font-semibold transition-colors ${activeTab === "assets" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>Uploaded Assets ({assets.length})</button>
            </div>

            {activeTab === "posts" && (
              <div className="space-y-4">
                {threads.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No posts yet.</p>
                ) : (
                  threads.map((post) => (
                    <Link key={post.id} href={`/forum/thread/${post.id}`} className="block rounded-lg bg-secondary/30 p-4 hover:bg-secondary/50 transition-colors">
                      <h3 className="font-medium text-foreground mb-2">{post.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><MessageSquare className="h-4 w-4" /> {post.reply_count || 0} replies</span>
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
                    <Link key={asset.id} href={`/asset/${asset.id}`} className="block rounded-lg bg-secondary/30 p-4 hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        {getCategoryIcon(asset.category)}
                        <h3 className="font-medium text-foreground">{asset.title}</h3>
                        <Badge variant="outline" className="capitalize">{asset.category}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Download className="h-4 w-4" /> {asset.downloads || 0} downloads</span>
                        <span>{new Date(asset.created_at).toLocaleDateString()}</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
