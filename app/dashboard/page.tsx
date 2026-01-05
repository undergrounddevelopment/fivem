"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Package, 
  Upload, 
  Download, 
  Star, 
  TrendingUp,
  Plus,
  Edit,
  Eye,
  Zap,
  Trophy,
  Activity,
  Coins
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { redirect } from 'next/navigation'
import { getLevelFromXP, getEarnedBadges, getRarityColor } from '@/lib/xp-badges'
import { createClient } from '@/lib/supabase/client'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [assets, setAssets] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalAssets: 0,
    totalDownloads: 0,
    totalEarnings: 0,
    avgRating: 0
  })
  const [xpData, setXpData] = useState<any>(null)
  const [badges, setBadges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/'
    }
  }, [status])

  useEffect(() => {
    if (!session?.user) return

    const fetchData = async () => {
      try {
        const supabase = createClient()
        
        // Get user assets
        const { data: userAssets } = await supabase
          .from('assets')
          .select('*')
          .eq('creator_id', session.user.id)

        setAssets(userAssets || [])

        // Calculate stats
        const totalDownloads = (userAssets || []).reduce((sum, a) => sum + (a.downloads || 0), 0)
        const totalEarnings = (userAssets || []).reduce((sum, a) => sum + (a.coin_price || 0), 0)
        const avgRating = userAssets?.length ? 
          (userAssets || []).reduce((sum, a) => sum + (a.rating || 0), 0) / userAssets.length : 0

        setStats({
          totalAssets: userAssets?.length || 0,
          totalDownloads,
          totalEarnings,
          avgRating
        })

        // Get user XP data
        const { data: userData } = await supabase
          .from('users')
          .select('xp, level')
          .eq('discord_id', session.user.id)
          .single()

        if (userData) {
          const xp = userData.xp || 0
          const levelInfo = getLevelFromXP(xp)
          setXpData({ ...levelInfo, currentXP: xp })

          // Get badges
          const userStats = {
            level: userData.level || 1,
            posts: 0,
            threads: 0,
            likes_received: 0,
            assets: userAssets?.length || 0,
            asset_downloads: totalDownloads,
            membership: session.user.membership || 'free',
            created_at: new Date().toISOString()
          }
          const earnedBadges = getEarnedBadges(userStats)
          setBadges(earnedBadges)
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Realtime subscription
    const supabase = createClient()
    const channel = supabase
      .channel('dashboard-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assets' }, () => {
        fetchData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        fetchData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session])

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!session?.user) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Blur Orbs Background */}
      <div className="blur-orb" style={{ top: '10%', left: '20%', opacity: 0.3 }} />
      <div className="blur-orb" style={{ top: '60%', right: '10%', opacity: 0.2 }} />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {session.user.name}</p>
          </div>
          <Link href="/upload">
            <Button className="gap-2 bg-gradient-to-r from-primary to-pink-600 hover:opacity-90 glow-sm">
              <Plus className="h-4 w-4" />
              Upload Asset
            </Button>
          </Link>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="glass card-hover border-primary/20 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">My Assets</CardTitle>
            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{stats.totalAssets}</div>
            <p className="text-xs text-muted-foreground mt-1">Total uploaded</p>
          </CardContent>
        </Card>

        <Card className="glass card-hover border-blue-500/20 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Download className="h-5 w-5 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{stats.totalDownloads}</div>
            <p className="text-xs text-muted-foreground mt-1">Total downloads</p>
          </CardContent>
        </Card>

        <Card className="glass card-hover border-amber-500/20 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Coins</CardTitle>
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Coins className="h-5 w-5 text-amber-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-amber-400">{session.user.coins || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Available balance</p>
          </CardContent>
        </Card>

        <Card className="glass card-hover border-purple-500/20 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Star className="h-5 w-5 text-purple-400 fill-purple-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{stats.avgRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">Average rating</p>
          </CardContent>
        </Card>
      </div>

      {/* XP & Badges Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* XP Progress */}
        <Card className="glass border-primary/30 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <span>Level & XP</span>
              </CardTitle>
              {xpData && (
                <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1">
                  Level {xpData.level}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            {xpData ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-semibold">{xpData.title}</span>
                    <span className="text-sm text-muted-foreground">
                      {xpData.currentXP} / {xpData.nextLevelXP} XP
                    </span>
                  </div>
                  <div className="relative h-3 bg-muted/30 rounded-full overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-pink-500 rounded-full transition-all duration-500"
                      style={{ width: `${xpData.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {Math.round(xpData.progress)}% to next level
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/30">
                  <div className="text-center p-3 rounded-xl bg-primary/10">
                    <p className="text-xs text-muted-foreground mb-1">Current XP</p>
                    <p className="text-2xl font-bold text-primary">{xpData.currentXP}</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Next Level</p>
                    <p className="text-2xl font-bold">{xpData.nextLevelXP}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3 animate-pulse" />
                <p className="text-sm text-muted-foreground">Loading XP data...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Badges */}
        <Card className="glass border-amber-500/30 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-amber-400" />
              </div>
              <span>Badges ({badges.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            {badges.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {badges.slice(0, 6).map((badge) => (
                  <div
                    key={badge.id}
                    className={`relative p-4 rounded-xl border-2 bg-gradient-to-br ${getRarityColor(badge.rarity)} hover:scale-105 transition-all cursor-pointer group`}
                    title={badge.description}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">
                        {badge.icon ? (
                          <Image src={badge.icon} alt={badge.name} width={40} height={40} className="mx-auto" unoptimized />
                        ) : (
                          <Trophy className="h-10 w-10 mx-auto text-white" />
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-white truncate">{badge.name}</p>
                    </div>
                    <div className="absolute inset-0 bg-black/90 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3">
                      <p className="text-[10px] text-white text-center leading-tight">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No badges earned yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Keep contributing to unlock badges!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* My Assets */}
        <Card className="glass border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                My Assets
              </CardTitle>
              <Link href="/upload">
                <Button variant="outline" size="sm" className="gap-2 border-primary/30 hover:bg-primary/10">
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assets.slice(0, 5).map((asset) => (
                <div key={asset.id} className="flex items-center justify-between p-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all group">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative h-14 w-20 rounded-lg overflow-hidden bg-muted/30 shrink-0">
                      {asset.thumbnail ? (
                        <Image
                          src={asset.thumbnail}
                          alt={asset.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform"
                          unoptimized
                        />
                      ) : (
                        <div className="h-full w-full bg-muted-foreground/10 flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{asset.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs capitalize border-primary/30">
                          {asset.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {asset.downloads || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge 
                      variant={
                        asset.status === "active" || asset.status === "approved" ? "default" :
                        asset.status === "pending" ? "secondary" : "destructive"
                      }
                      className="text-xs"
                    >
                      {asset.status}
                    </Badge>
                    <Link href={`/dashboard/edit-asset/${asset.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/asset/${asset.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
              {assets.length === 0 && (
                <div className="text-center py-12">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground mb-4">No assets uploaded yet</p>
                  <Link href="/upload">
                    <Button className="gap-2 bg-gradient-to-r from-primary to-pink-600 hover:opacity-90">
                      <Upload className="h-4 w-4" />
                      Upload Your First Asset
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass border-blue-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-400" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-blue-400" />
              </div>
              <p className="text-muted-foreground">No recent activity</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Your activity will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
  )
}
