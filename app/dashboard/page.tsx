"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  Coins,
  Loader2,
  ChevronRight,
  ArrowUpRight,
  Clock
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getLevelFromXP, getEarnedBadges, getRarityColor } from '@/lib/xp-badges'
import { createClient } from '@/lib/supabase/client'
import { AdminBanner } from '@/components/admin-banner'

interface Asset {
  id: string
  title: string
  category: string
  downloads?: number
  coin_price?: number
  rating?: number
  status: string
  thumbnail?: string
}

interface DownloadHistory {
  id: string
  assetId: string
  title: string
  category: string
  thumbnail: string | null
  downloadedAt: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [assets, setAssets] = useState<Asset[]>([])
  const [stats, setStats] = useState({
    totalAssets: 0,
    totalDownloads: 0,
    totalEarnings: 0,
    avgRating: 0
  })
  const [xpData, setXpData] = useState<any>(null)
  const [badges, setBadges] = useState<any[]>([])
  const [downloadHistory, setDownloadHistory] = useState<DownloadHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(true)

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

        const { data: userAssets } = await supabase
          .from('assets')
          .select('*')
          .eq('author_id', session.user.id)

        setAssets((userAssets || []) as Asset[])

        const totalDownloads = (userAssets || []).reduce((sum: number, a: Asset) => sum + (a.downloads || 0), 0)
        const totalEarnings = (userAssets || []).reduce((sum: number, a: Asset) => sum + (a.coin_price || 0), 0)
        const avgRating = userAssets?.length ?
          (userAssets || []).reduce((sum: number, a: Asset) => sum + (a.rating || 0), 0) / userAssets.length : 0

        setStats({
          totalAssets: userAssets?.length || 0,
          totalDownloads,
          totalEarnings,
          avgRating
        })

        const { data: userData } = await supabase
          .from('users')
          .select('xp, badge_tier, created_at')
          .eq('id', session.user.id)
          .single()

        // Fetch robust key stats from central API 
        // This ensures Dashboard matches Profile/Badges exactly (including likes/downloads logic)
        try {
          const statsRes = await fetch(`/api/xp/stats?userId=${session.user.id}`)
          if (statsRes.ok) {
            const statsData = await statsRes.json()
            const realStats = statsData.userStats
            
            // Update XP visuals
            if (statsData.xp !== undefined) {
               const levelInfo = getLevelFromXP(statsData.xp)
               setXpData({ ...levelInfo, currentXP: statsData.xp })
            } else if (userData) {
               const levelInfo = getLevelFromXP(userData.xp || 0)
               setXpData({ ...levelInfo, currentXP: userData.xp || 0 })
            }

            // Calculate badges using the ROBUST stats (with correct likes/downloads)
            const earnedBadges = getEarnedBadges(realStats)
            setBadges(earnedBadges)
          }
        } catch (apiError) {
           console.error("Dashboard XP Sync Error:", apiError)
           // Fallback to basic if API fails
           if (userData) {
             const levelInfo = getLevelFromXP(userData.xp || 0)
             setXpData({ ...levelInfo, currentXP: userData.xp || 0 })
           }
        }

      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }

      // Fetch Download History
      try {
        setLoadingHistory(true)
        const res = await fetch(`/api/profile/${session.user.id}`)
        if (res.ok) {
          const data = await res.json()
          if (data.downloads && Array.isArray(data.downloads)) {
            const mappedDownloads = data.downloads.slice(0, 5).map((d: any) => ({
              id: d.id || Math.random().toString(),
              assetId: d.assetId || d.asset_id || d.id,
              title: d.asset?.title || "Unknown Asset",
              category: d.asset?.category || "scripts",
              thumbnail: d.asset?.thumbnail || null,
              downloadedAt: d.createdAt || d.created_at || new Date().toISOString(),
            }))
            setDownloadHistory(mappedDownloads)
          }
        }
      } catch (error) {
        console.error('Error fetching download history:', error)
      } finally {
        setLoadingHistory(false)
      }
    }

    fetchData()

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
      <div className="min-h-screen bg-background relative">
        <div className="blur-orb" style={{ top: '10%', left: '10%', opacity: 0.15 }} />
        <div className="blur-orb" style={{ top: '60%', right: '15%', opacity: 0.1 }} />

        <div className="container mx-auto p-6 relative z-10">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!session?.user) return null

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Effects */}
      <div className="blur-orb" style={{ top: '5%', left: '5%', opacity: 0.15 }} />
      <div className="blur-orb" style={{ top: '50%', right: '10%', opacity: 0.1 }} />

      <div className="container mx-auto p-6 relative z-10">
        {/* Dynamic Admin Banner (Top) */}
        <AdminBanner position="top" className="mb-8" />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {session.user.name}</p>
          </div>
          <Link href="/upload">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Upload Asset
            </Button>
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Assets</CardTitle>
              <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalAssets}</div>
              <p className="text-xs text-muted-foreground mt-1">Total uploaded</p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Downloads</CardTitle>
              <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Download className="h-5 w-5 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalDownloads.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Total downloads</p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coins</CardTitle>
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Coins className="h-5 w-5 text-amber-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-400">{(session.user.coins || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Available balance</p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
              <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Star className="h-5 w-5 text-purple-400 fill-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.avgRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground mt-1">Average rating</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* XP & Badges Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6"
        >
          {/* XP Progress */}
          <Card className="glass border-primary/30">
            <CardHeader>
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
            <CardContent>
              {xpData ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-semibold">{xpData.title}</span>
                      <span className="text-sm text-muted-foreground">
                        {xpData.currentXP} / {xpData.nextLevelXP} XP
                      </span>
                    </div>
                    <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-pink-500 rounded-full transition-all duration-500"
                        style={{ width: `${xpData.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {Math.round(xpData.progress)}% to next level
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div className="text-center p-3 rounded-xl bg-primary/10">
                      <p className="text-xs text-muted-foreground mb-1">Current XP</p>
                      <p className="text-2xl font-bold text-primary">{xpData.currentXP}</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-secondary/50">
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
          <Card className="glass border-amber-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-amber-400" />
                </div>
                <span>Badges ({badges.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {badges.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {badges.slice(0, 6).map((badge) => (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`relative p-3 rounded-xl border border-white/10 bg-white/5 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group flex flex-col items-center justify-center`}
                      title={badge.description}
                    >
                      <div className="relative w-12 h-12 mb-2 group-hover:scale-110 transition-transform">
                        <Image 
                          src={badge.icon} 
                          alt={badge.name} 
                          fill 
                          className="object-contain" 
                          unoptimized 
                        />
                      </div>
                      <p className="text-[10px] font-bold text-center uppercase tracking-tighter truncate w-full">
                        {badge.name}
                      </p>
                      
                      {/* Tooltip-like details on hover */}
                      <div className="absolute inset-0 bg-black/95 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center z-20">
                        <p className="text-[10px] text-white leading-tight font-medium uppercase mb-1">{badge.name}</p>
                        <p className="text-[9px] text-muted-foreground leading-none">{badge.description}</p>
                      </div>
                    </motion.div>
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          {/* My Assets */}
          <Card className="glass border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  My Assets
                </CardTitle>
                <Link href="/upload">
                  <Button variant="outline" size="sm" className="gap-2 border-white/10">
                    <Upload className="h-4 w-4" />
                    Upload
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assets.slice(0, 5).map((asset, index) => (
                  <motion.div
                    key={asset.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-xl border border-white/10 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="relative h-14 w-20 rounded-lg overflow-hidden bg-secondary shrink-0">
                        {asset.thumbnail ? (
                          <Image
                            src={asset.thumbnail}
                            alt={asset.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{asset.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs capitalize border-white/10">
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
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/asset/${asset.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
                {assets.length === 0 && (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Package className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-muted-foreground mb-4">No assets uploaded yet</p>
                    <Link href="/upload">
                      <Button className="gap-2">
                        <Upload className="h-4 w-4" />
                        Upload Your First Asset
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Downloads */}
          <Card className="glass border-blue-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-blue-400" />
                  Recent Downloads
                </CardTitle>
                <Link href="/scripts">
                  <Button variant="ghost" size="sm" className="text-primary gap-1">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl bg-secondary/20 p-3 animate-pulse">
                      <div className="h-11 w-11 rounded-xl bg-secondary/50" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-secondary/50 rounded w-3/4" />
                        <div className="h-3 bg-secondary/50 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : downloadHistory.length === 0 ? (
                <div className="text-center py-12">
                  <div className="h-16 w-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                    <Download className="h-8 w-8 text-blue-400" />
                  </div>
                  <p className="text-muted-foreground">No downloads yet</p>
                  <Link href="/scripts">
                    <Button variant="link" className="text-primary mt-2">
                      Browse Resources
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {downloadHistory.map((download, index) => (
                    <motion.div
                      key={download.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={`/asset/${download.assetId}`}
                        className="flex items-center justify-between rounded-xl bg-secondary/30 p-3 hover:bg-secondary/50 transition-colors group border border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative h-11 w-11 rounded-xl bg-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                            {download.thumbnail ? (
                              <Image
                                src={download.thumbnail}
                                alt=""
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <Download className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground text-sm group-hover:text-primary transition-colors truncate">
                              {download.title}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">{download.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[10px] text-muted-foreground hidden sm:inline flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(download.downloadedAt).toLocaleDateString()}
                          </span>
                          <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
