"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Download, 
  Star, 
  Eye, 
  Package, 
  User, 
  FileText,
  Coins,
  Crown,
  Shield,
  Calendar,
  Tag,
  ArrowLeft,
  Loader2,
  MessageSquare,
  Lock,
  Unlock,
  Sparkles,
  AlertTriangle
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { AssetComments } from "@/components/asset-comments"

interface Asset {
  id: string
  title: string
  description: string
  category: string
  framework: string
  version: string
  coin_price?: number
  coinPrice?: number
  thumbnail_url?: string
  thumbnail?: string
  download_url?: string
  downloadLink?: string
  file_size?: string
  downloads?: number
  views?: number
  rating?: number
  rating_count?: number
  tags?: string[]
  status: string
  is_verified?: boolean
  is_featured?: boolean
  created_at: string
  updated_at: string
  author?: string
  authorData?: {
    username?: string
    avatar?: string
    membership?: string
    xp?: number
    level?: number
  }
}

export default function AssetDetailPage() {
  const params = useParams()
  const { data: session } = useSession()
  const [asset, setAsset] = useState<Asset | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [userBalance, setUserBalance] = useState(0)
  const [hasUserCommented, setHasUserCommented] = useState(false)
  const [checkingComment, setCheckingComment] = useState(false)

  const fetchAsset = useCallback(async () => {
    try {
      const response = await fetch(`/api/assets/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setAsset(data)
      } else {
        toast.error('Asset not found')
      }
    } catch (error) {
      console.error('Error fetching asset:', error)
      toast.error('Failed to load asset')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  const fetchUserBalance = useCallback(async () => {
    try {
      const response = await fetch('/api/user/balance')
      if (response.ok) {
        const data = await response.json()
        setUserBalance(data.coins || 0)
      }
    } catch (error) {
      console.error('Error fetching balance:', error)
    }
  }, [])

  const checkUserComment = useCallback(async () => {
    if (!session?.user?.id || !params.id) return
    
    setCheckingComment(true)
    try {
      const response = await fetch(`/api/assets/${params.id}/comments`)
      if (response.ok) {
        const data = await response.json()
        const userComment = data.comments?.find(
          (c: { user?: { id: string } }) => c.user?.id === session.user.id
        )
        setHasUserCommented(!!userComment)
      }
    } catch (error) {
      console.error('Error checking comment:', error)
    } finally {
      setCheckingComment(false)
    }
  }, [session?.user?.id, params.id])

  useEffect(() => {
    if (params.id) {
      fetchAsset()
      if (session?.user) {
        fetchUserBalance()
        checkUserComment()
      }
    }
  }, [params.id, session, fetchAsset, fetchUserBalance, checkUserComment])

  const handleCommentPosted = useCallback(() => {
    setHasUserCommented(true)
    toast.success('🎉 Download unlocked! You can now download this asset.')
  }, [])

  async function handleDownload() {
    if (!session?.user) {
      toast.error('Please login to download')
      return
    }

    const assetPrice = asset?.coin_price || asset?.coinPrice || 0
    const isFreeAsset = assetPrice === 0

    // Check comment requirement for free assets
    if (isFreeAsset && !hasUserCommented) {
      toast.error('Please leave a comment first to download this free asset', {
        description: 'Scroll down to the comments section and share your thoughts!',
        duration: 5000,
        icon: <MessageSquare className="h-5 w-5" />
      })
      // Scroll to comments section
      document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })
      return
    }

    if (assetPrice > 0 && userBalance < assetPrice) {
      toast.error(`Insufficient coins. You need ${assetPrice} coins but only have ${userBalance}`)
      return
    }

    setDownloading(true)
    try {
      const response = await fetch(`/api/assets/${params.id}/download`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        const downloadUrl = data.downloadUrl || asset?.download_url || asset?.downloadLink
        if (downloadUrl) {
          window.open(downloadUrl, '_blank')
          toast.success('Download started!')
          fetchAsset()
          if (assetPrice > 0) {
            fetchUserBalance()
          }
        } else {
          toast.error('Download link not available')
        }
      } else {
        const error = await response.json()
        if (error.requireComment) {
          toast.error('Comment required!', {
            description: 'Please leave a comment before downloading this free asset.',
            duration: 5000
          })
          document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })
        } else {
          toast.error(error.error || 'Download failed')
        }
      }
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Download failed')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background relative">
        <div className="blur-orb" style={{ top: '10%', left: '10%', opacity: 0.15 }} />
        <div className="blur-orb" style={{ top: '60%', right: '15%', opacity: 0.1 }} />
        
        <div className="container mx-auto p-6 relative z-10">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <p className="text-muted-foreground">Loading asset...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!asset) {
    return (
      <div className="min-h-screen bg-background relative">
        <div className="blur-orb" style={{ top: '20%', left: '15%', opacity: 0.15 }} />
        <div className="blur-orb" style={{ top: '50%', right: '10%', opacity: 0.1 }} />
        
        <div className="container mx-auto p-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl flex flex-col items-center justify-center py-20"
          >
            <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">Asset Not Found</h3>
            <p className="text-muted-foreground mt-1">The asset you're looking for doesn't exist or has been removed.</p>
            <Link href="/assets">
              <Button className="mt-4 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Browse Assets
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  const isPremium = (asset?.coin_price || asset?.coinPrice || 0) > 0
  const assetPrice = asset?.coin_price || asset?.coinPrice || 0
  const canAfford = userBalance >= assetPrice
  const isFreeAsset = !isPremium
  const canDownloadFree = !isFreeAsset || hasUserCommented

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Effects */}
      <div className="blur-orb" style={{ top: '5%', left: '5%', opacity: 0.15 }} />
      <div className="blur-orb" style={{ top: '50%', right: '10%', opacity: 0.1 }} />

      <div className="container mx-auto p-6 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Breadcrumb */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Link href="/assets" className="hover:text-primary transition-colors">Assets</Link>
              <span>/</span>
              <span className="capitalize">{asset.category}</span>
              <span>/</span>
              <span className="truncate max-w-[200px]">{asset.title}</span>
            </motion.div>

            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col sm:flex-row sm:items-start justify-between gap-4"
            >
              <div className="space-y-3">
                <h1 className="text-3xl font-bold">{asset.title}</h1>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="capitalize bg-primary/10 text-primary border-primary/20">
                    {asset.category}
                  </Badge>
                  <Badge variant="outline" className="capitalize border-white/10">
                    {asset.framework}
                  </Badge>
                  {asset.is_verified && (
                    <Badge className="bg-green-500/15 text-green-400 border-green-500/30">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {asset.is_featured && (
                    <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30">
                      <Crown className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-2xl font-bold">
                  {isPremium ? (
                    <span className="text-amber-400 flex items-center gap-1 justify-end">
                      <Coins className="h-5 w-5" />
                      {assetPrice}
                    </span>
                  ) : (
                    <span className="text-green-400">FREE</span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  Version {asset.version || '1.0.0'}
                </div>
              </div>
            </motion.div>

            {/* Image */}
            {(asset.thumbnail_url || asset.thumbnail) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="glass overflow-hidden">
                  <CardContent className="p-0">
                    <img
                      src={asset.thumbnail_url || asset.thumbnail}
                      alt={asset.title}
                      className="w-full h-64 sm:h-80 object-cover"
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {asset.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tags */}
            {asset.tags && asset.tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="h-8 w-8 rounded-lg bg-purple-500/15 flex items-center justify-center">
                        <Tag className="h-4 w-4 text-purple-400" />
                      </div>
                      Tags
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {asset.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="bg-secondary/30 border-white/10">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Download Card */}
            <Card className="glass border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
                    <Download className="h-4 w-4 text-primary" />
                  </div>
                  Download
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {session?.user ? (
                  <>
                    {/* Comment Requirement for Free Assets */}
                    {isFreeAsset && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3 rounded-xl border ${
                          hasUserCommented 
                            ? 'bg-green-500/10 border-green-500/30' 
                            : 'bg-amber-500/10 border-amber-500/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {checkingComment ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : hasUserCommented ? (
                            <>
                              <Unlock className="h-4 w-4 text-green-400" />
                              <span className="text-sm font-medium text-green-400">
                                Download Unlocked!
                              </span>
                            </>
                          ) : (
                            <>
                              <Lock className="h-4 w-4 text-amber-400" />
                              <span className="text-sm font-medium text-amber-400">
                                Comment Required
                              </span>
                            </>
                          )}
                        </div>
                        {!hasUserCommented && !checkingComment && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Leave a review below to unlock download
                          </p>
                        )}
                      </motion.div>
                    )}

                    {isPremium && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Your balance:</span>
                          <span className="font-semibold flex items-center gap-1 text-amber-400">
                            <Coins className="w-4 h-4" />
                            {userBalance}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Required:</span>
                          <span className="font-semibold text-amber-400">
                            {assetPrice}
                          </span>
                        </div>
                        {!canAfford && (
                          <p className="text-xs text-red-400 pt-1">
                            Insufficient coins
                          </p>
                        )}
                      </div>
                    )}

                    <Button
                      onClick={handleDownload}
                      disabled={downloading || (isPremium && !canAfford) || (isFreeAsset && !hasUserCommented)}
                      className={`w-full gap-2 ${
                        isFreeAsset && !hasUserCommented 
                          ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30' 
                          : ''
                      }`}
                      size="lg"
                    >
                      {isFreeAsset && !hasUserCommented ? (
                        <>
                          <Lock className="h-4 w-4" />
                          Comment to Unlock
                        </>
                      ) : downloading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Downloading...
                        </>
                      ) : isPremium ? (
                        canAfford ? (
                          <>
                            <Download className="h-4 w-4" />
                            Download for {assetPrice} coins
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-4 w-4" />
                            Insufficient coins
                          </>
                        )
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          Download Free
                        </>
                      )}
                    </Button>

                    {isFreeAsset && !hasUserCommented && (
                      <Button
                        variant="outline"
                        className="w-full gap-2 border-primary/30"
                        onClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}
                      >
                        <MessageSquare className="h-4 w-4" />
                        Go to Comments
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="text-center space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Login required to download
                    </p>
                    <Link href="/auth/signin">
                      <Button className="w-full gap-2">
                        <User className="h-4 w-4" />
                        Login to Download
                      </Button>
                    </Link>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-white/10">
                  <span>File size:</span>
                  <span className="font-medium">{asset.file_size || 'Unknown'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-blue-500/15 flex items-center justify-center">
                      <Download className="h-4 w-4 text-blue-400" />
                    </div>
                    <span className="text-sm text-muted-foreground">Downloads</span>
                  </div>
                  <span className="font-semibold">{(asset.downloads || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-green-500/15 flex items-center justify-center">
                      <Eye className="h-4 w-4 text-green-400" />
                    </div>
                    <span className="text-sm text-muted-foreground">Views</span>
                  </div>
                  <span className="font-semibold">{(asset.views || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-amber-500/15 flex items-center justify-center">
                      <Star className="h-4 w-4 text-amber-400" />
                    </div>
                    <span className="text-sm text-muted-foreground">Rating</span>
                  </div>
                  <span className="font-semibold">{asset.rating || 0}/5 ({asset.rating_count || 0})</span>
                </div>
              </CardContent>
            </Card>

            {/* Author */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="h-8 w-8 rounded-lg bg-purple-500/15 flex items-center justify-center">
                    <User className="h-4 w-4 text-purple-400" />
                  </div>
                  Author
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  {asset.authorData?.avatar ? (
                    <img
                      src={asset.authorData.avatar}
                      alt={asset.authorData.username || 'Author'}
                      className="w-12 h-12 rounded-full ring-2 ring-primary/20"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <div className="font-semibold">{asset.authorData?.username || asset.author || 'Unknown'}</div>
                    <div className="text-sm text-muted-foreground capitalize flex items-center gap-2">
                      <Badge variant="outline" className="text-xs border-white/10">
                        {asset.authorData?.membership || 'free'}
                      </Badge>
                      <span>Level {asset.authorData?.level || 1}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Meta Info */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-blue-400" />
                  </div>
                  Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{new Date(asset.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Updated</span>
                  <span>{new Date(asset.updated_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge 
                    variant="outline" 
                    className={`capitalize ${
                      asset.status === 'active' || asset.status === 'approved' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/30' 
                        : 'border-white/10'
                    }`}
                  >
                    {asset.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Comments Section */}
        <motion.div
          id="comments-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <AssetComments 
            assetId={asset.id} 
            isFreeAsset={isFreeAsset}
            onCommentPosted={handleCommentPosted}
          />
        </motion.div>
      </div>
    </div>
  )
}
