"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Download, Star, Eye, Package, User, FileText, Coins, Crown, Shield, Calendar,
    Tag, ArrowLeft, Loader2, MessageSquare, Lock, Unlock, Sparkles, AlertTriangle,
    Heart, Share2, Copy, Check, ExternalLink, Code, Zap, TrendingUp, Clock,
    CheckCircle, Server, Cpu, HardDrive, GitBranch, Play, Image as ImageIcon
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { AssetComments } from "@/components/asset-comments"
import { FormattedText } from "@/components/formatted-text"
import { cn } from "@/lib/utils"

interface Asset {
    id: string
    title: string
    description: string
    features?: string
    installation?: string
    changelog?: string
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
    author_id?: string
    authorData?: {
        id?: string
        username?: string
        avatar?: string
        membership?: string
        xp?: number
        level?: number
    }
}

interface AssetDetailClientProps {
    initialAsset: Asset | null
    id: string
}

export function AssetDetailClient({ initialAsset, id }: AssetDetailClientProps) {
    const { data: session } = useSession()
    const [asset, setAsset] = useState<Asset | null>(initialAsset)
    const [loading, setLoading] = useState(!initialAsset)
    const [downloading, setDownloading] = useState(false)
    const [userBalance, setUserBalance] = useState(0)
    const [hasUserCommented, setHasUserCommented] = useState(false)
    const [checkingComment, setCheckingComment] = useState(false)
    const [activeTab, setActiveTab] = useState("description")
    const [isLiked, setIsLiked] = useState(false)
    const [copied, setCopied] = useState(false)
    const [imageLoaded, setImageLoaded] = useState(false)
    const [showFullImage, setShowFullImage] = useState(false)

    const fetchAsset = useCallback(async () => {
        try {
            const response = await fetch(`/api/assets/${id}`)
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
    }, [id])

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
        if (!session?.user?.id || !id) return
        setCheckingComment(true)
        try {
            const response = await fetch(`/api/assets/${id}/comments`)
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
    }, [session?.user?.id, id])

    useEffect(() => {
        if (!initialAsset) {
            fetchAsset()
        }
        if (session?.user) {
            fetchUserBalance()
            checkUserComment()
        }
    }, [id, session, fetchAsset, fetchUserBalance, checkUserComment, initialAsset])

    const handleCommentPosted = useCallback(() => {
        setHasUserCommented(true)
        toast.success('🎉 Download unlocked! You can now download this asset.')
    }, [])

    const handleShare = async () => {
        const url = window.location.href
        try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            toast.success('Link copied to clipboard!')
            setTimeout(() => setCopied(false), 2000)
        } catch {
            toast.error('Failed to copy link')
        }
    }

    const toggleLike = () => {
        setIsLiked(!isLiked)
        toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites')
    }

    async function handleDownload() {
        if (!session?.user) {
            toast.error('Please login to download')
            return
        }
        const assetPrice = asset?.coin_price || asset?.coinPrice || 0
        const isFreeAsset = assetPrice === 0

        if (isFreeAsset && !hasUserCommented) {
            toast.error('Please leave a comment first to download this free asset', {
                description: 'Scroll down to the comments section and share your thoughts!',
                duration: 5000,
                icon: <MessageSquare className="h-5 w-5" />
            })
            document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })
            return
        }

        if (assetPrice > 0 && userBalance < assetPrice) {
            toast.error(`Insufficient coins. You need ${assetPrice} coins but only have ${userBalance}`)
            return
        }

        setDownloading(true)
        try {
            const response = await fetch(`/api/assets/${id}/download`, { method: 'POST' })
            if (response.ok) {
                const data = await response.json()
                const downloadUrl = data.downloadUrl || asset?.download_url || asset?.downloadLink
                if (downloadUrl) {
                    window.open(downloadUrl, '_blank')
                    toast.success('Download started!')
                    fetchAsset()
                    if (assetPrice > 0) fetchUserBalance()
                } else {
                    toast.error('Download link not available')
                }
            } else {
                const error = await response.json()
                if (error.requireComment) {
                    toast.error('Comment required!', { description: 'Please leave a comment before downloading.' })
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

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen bg-background relative overflow-hidden">
                <div className="container mx-auto p-4 md:p-6 lg:p-8 relative z-10 space-y-8">
                    <Skeleton className="h-6 w-64 bg-white/5" />
                    <div className="grid lg:grid-cols-2 gap-0 glass rounded-2xl overflow-hidden border-white/10">
                        <Skeleton className="min-h-[400px] w-full bg-white/5" />
                        <div className="p-6 lg:p-8 flex flex-col space-y-6">
                            <div className="space-y-4">
                                <Skeleton className="h-10 w-3/4 bg-white/5" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-6 w-20 bg-white/5" />
                                    <Skeleton className="h-6 w-20 bg-white/5" />
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl bg-white/5" />)}
                            </div>
                            <div className="mt-auto space-y-2">
                                <Skeleton className="h-12 w-full rounded-xl bg-white/5" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Not Found State
    if (!asset) {
        return (
            <div className="min-h-screen bg-background relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5" />
                <div className="container mx-auto p-4 md:p-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md mx-auto mt-20"
                    >
                        <Card className="glass border-red-500/20 text-center p-8">
                            <div className="h-20 w-20 rounded-3xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                                <Package className="h-10 w-10 text-red-400" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Asset Not Found</h3>
                            <p className="text-muted-foreground mb-6">The asset you're looking for doesn't exist or has been removed.</p>
                            <Link href="/assets">
                                <Button className="gap-2 w-full" size="lg">
                                    <ArrowLeft className="h-4 w-4" />
                                    Browse Assets
                                </Button>
                            </Link>
                        </Card>
                    </motion.div>
                </div>
            </div>
        )
    }

    const isPremium = (asset?.coin_price || asset?.coinPrice || 0) > 0
    const assetPrice = asset?.coin_price || asset?.coinPrice || 0
    const canAfford = userBalance >= assetPrice
    const isFreeAsset = !isPremium
    const ratingPercent = ((asset.rating || 0) / 5) * 100
    const thumbnailUrl = asset.thumbnail_url || asset.thumbnail

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/5 to-pink-500/5 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto p-4 md:p-6 lg:p-8 relative z-10">
                {/* Breadcrumb */}
                <motion.nav
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-sm mb-6 overflow-x-auto pb-2"
                >
                    <Link href="/assets" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-primary transition-all shrink-0">
                        <ArrowLeft className="h-4 w-4" />
                        <span>Assets</span>
                    </Link>
                    <span className="text-white/20">/</span>
                    <Badge variant="outline" className="capitalize shrink-0">{asset.category}</Badge>
                    <span className="text-white/20">/</span>
                    <span className="text-foreground truncate max-w-[200px]">{asset.title}</span>
                </motion.nav>

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative mb-8"
                >
                    <Card className="glass overflow-hidden border-white/10">
                        <div className="grid lg:grid-cols-2 gap-0">
                            {/* Image Section */}
                            <div className="relative aspect-video lg:aspect-auto lg:min-h-[400px] bg-gradient-to-br from-primary/10 to-purple-500/10">
                                {thumbnailUrl ? (
                                    <>
                                        <motion.img
                                            src={thumbnailUrl}
                                            alt={asset.title}
                                            className={cn(
                                                "w-full h-full object-cover transition-all duration-500 cursor-pointer",
                                                imageLoaded ? "opacity-100" : "opacity-0"
                                            )}
                                            onLoad={() => setImageLoaded(true)}
                                            onClick={() => setShowFullImage(true)}
                                        />
                                        {!imageLoaded && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <ImageIcon className="h-16 w-16 text-muted-foreground/20 animate-pulse" />
                                            </div>
                                        )}
                                        {/* Image Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                                            <Button variant="secondary" size="sm" className="gap-2" onClick={() => setShowFullImage(true)}>
                                                <Eye className="h-4 w-4" />
                                                View Full Image
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <Package className="h-20 w-20 text-muted-foreground/20 mx-auto mb-4" />
                                            <p className="text-muted-foreground/50">No preview available</p>
                                        </div>
                                    </div>
                                )}

                                {/* Badges Overlay */}
                                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                    {asset.is_featured && (
                                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg shadow-amber-500/30">
                                            <Crown className="w-3 h-3 mr-1" />
                                            Featured
                                        </Badge>
                                    )}
                                    {asset.is_verified && (
                                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg shadow-green-500/30">
                                            <Shield className="w-3 h-3 mr-1" />
                                            Verified
                                        </Badge>
                                    )}
                                </div>

                                {/* Price Badge */}
                                <div className="absolute top-4 right-4">
                                    <Badge className={cn(
                                        "text-lg px-4 py-2 font-bold shadow-lg",
                                        isPremium
                                            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/30"
                                            : "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-500/30"
                                    )}>
                                        {isPremium ? (
                                            <span className="flex items-center gap-1.5">
                                                <Coins className="h-4 w-4" />
                                                {assetPrice}
                                            </span>
                                        ) : (
                                            "FREE"
                                        )}
                                    </Badge>
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="p-6 lg:p-8 flex flex-col">
                                {/* Title & Actions */}
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-2xl lg:text-3xl font-bold mb-2 line-clamp-2">{asset.title}</h1>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant="secondary" className="capitalize bg-primary/10 text-primary border-primary/20">
                                                {asset.category}
                                            </Badge>
                                            <Badge variant="outline" className="capitalize border-white/10">
                                                <Code className="w-3 h-3 mr-1" />
                                                {asset.framework}
                                            </Badge>
                                            <Badge variant="outline" className="border-white/10">
                                                <GitBranch className="w-3 h-3 mr-1" />
                                                v{asset.version || '1.0.0'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5" onClick={toggleLike}>
                                            <Heart className={cn("h-5 w-5 transition-colors", isLiked ? "fill-red-500 text-red-500" : "")} />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5" onClick={handleShare}>
                                            {copied ? <Check className="h-5 w-5 text-green-400" /> : <Share2 className="h-5 w-5" />}
                                        </Button>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                                        <Download className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                                        <div className="text-lg font-bold">{(asset.downloads || 0).toLocaleString()}</div>
                                        <div className="text-xs text-muted-foreground">Downloads</div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                                        <Eye className="h-5 w-5 text-green-400 mx-auto mb-1" />
                                        <div className="text-lg font-bold">{(asset.views || 0).toLocaleString()}</div>
                                        <div className="text-xs text-muted-foreground">Views</div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                                        <Star className="h-5 w-5 text-amber-400 mx-auto mb-1" />
                                        <div className="text-lg font-bold">{asset.rating || 0}/5</div>
                                        <div className="text-xs text-muted-foreground">{asset.rating_count || 0} reviews</div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                                        <HardDrive className="h-5 w-5 text-purple-400 mx-auto mb-1" />
                                        <div className="text-lg font-bold">{asset.file_size || 'N/A'}</div>
                                        <div className="text-xs text-muted-foreground">File Size</div>
                                    </div>
                                </div>

                                {/* Rating Bar */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-muted-foreground">Overall Rating</span>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star key={star} className={cn("h-4 w-4", star <= (asset.rating || 0) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30")} />
                                            ))}
                                        </div>
                                    </div>
                                    <Progress value={ratingPercent} className="h-2" />
                                </div>

                                {/* Download Section */}
                                <div className="mt-auto space-y-4">
                                    {session?.user ? (
                                        <>
                                            {isFreeAsset && (
                                                <div className={cn(
                                                    "p-3 rounded-xl border flex items-center gap-3",
                                                    hasUserCommented
                                                        ? "bg-green-500/10 border-green-500/30"
                                                        : "bg-amber-500/10 border-amber-500/30"
                                                )}>
                                                    {checkingComment ? (
                                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                                    ) : hasUserCommented ? (
                                                        <>
                                                            <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
                                                            <div>
                                                                <div className="font-medium text-green-400">Download Unlocked!</div>
                                                                <div className="text-xs text-muted-foreground">Thank you for your review</div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Lock className="h-5 w-5 text-amber-400 shrink-0" />
                                                            <div>
                                                                <div className="font-medium text-amber-400">Comment Required</div>
                                                                <div className="text-xs text-muted-foreground">Leave a review to unlock download</div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                            {isPremium && (
                                                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm text-muted-foreground">Your Balance</span>
                                                        <span className="font-bold text-amber-400 flex items-center gap-1">
                                                            <Coins className="h-4 w-4" />
                                                            {userBalance}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-muted-foreground">Required</span>
                                                        <span className="font-bold text-amber-400">{assetPrice} coins</span>
                                                    </div>
                                                    {!canAfford && (
                                                        <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                                                            <AlertTriangle className="h-3 w-3" />
                                                            Insufficient coins
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            <Button
                                                onClick={handleDownload}
                                                disabled={downloading || (isPremium && !canAfford) || (isFreeAsset && !hasUserCommented)}
                                                className={cn(
                                                    "w-full gap-2 h-12 text-base font-semibold rounded-xl transition-all",
                                                    isFreeAsset && !hasUserCommented
                                                        ? "bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30"
                                                        : isPremium
                                                            ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg shadow-amber-500/20"
                                                            : "bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white shadow-lg shadow-primary/20"
                                                )}
                                                size="lg"
                                            >
                                                {isFreeAsset && !hasUserCommented ? (
                                                    <><Lock className="h-5 w-5" /> Comment to Unlock</>
                                                ) : downloading ? (
                                                    <><Loader2 className="h-5 w-5 animate-spin" /> Downloading...</>
                                                ) : isPremium ? (
                                                    canAfford ? <><Download className="h-5 w-5" /> Download for {assetPrice} coins</> : <><AlertTriangle className="h-5 w-5" /> Insufficient coins</>
                                                ) : (
                                                    <><Download className="h-5 w-5" /> Download Free</>
                                                )}
                                            </Button>

                                            {isFreeAsset && !hasUserCommented && (
                                                <Button
                                                    variant="outline"
                                                    className="w-full gap-2 border-primary/30 rounded-xl"
                                                    onClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}
                                                >
                                                    <MessageSquare className="h-4 w-4" />
                                                    Go to Comments
                                                </Button>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
                                            <User className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                                            <p className="text-muted-foreground mb-3">Login required to download</p>
                                            <Link href="/api/auth/signin">
                                                <Button className="w-full gap-2 rounded-xl">
                                                    <User className="h-4 w-4" />
                                                    Login to Download
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Content Grid */}
                <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tabs */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="glass overflow-hidden">
                                <Tabs value={activeTab} onValueChange={setActiveTab}>
                                    <div className="border-b border-white/5 bg-white/[0.02]">
                                        <TabsList className="w-full justify-start h-auto p-0 bg-transparent rounded-none">
                                            <TabsTrigger value="description" className="data-[state=active]:bg-white/5 rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6 py-4 gap-2">
                                                <FileText className="h-4 w-4" />
                                                Description
                                            </TabsTrigger>
                                            {asset.features && (
                                                <TabsTrigger value="features" className="data-[state=active]:bg-white/5 rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6 py-4 gap-2">
                                                    <Sparkles className="h-4 w-4" />
                                                    Features
                                                </TabsTrigger>
                                            )}
                                            {asset.installation && (
                                                <TabsTrigger value="installation" className="data-[state=active]:bg-white/5 rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6 py-4 gap-2">
                                                    <Server className="h-4 w-4" />
                                                    Installation
                                                </TabsTrigger>
                                            )}
                                            {asset.changelog && (
                                                <TabsTrigger value="changelog" className="data-[state=active]:bg-white/5 rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6 py-4 gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    Changelog
                                                </TabsTrigger>
                                            )}
                                        </TabsList>
                                    </div>

                                    <CardContent className="p-6">
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={activeTab}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <TabsContent value="description" className="m-0">
                                                    <FormattedText
                                                        content={asset.description || "No description available."}
                                                        enableYouTube={true}
                                                        enableImages={true}
                                                        enableLinks={true}
                                                    />
                                                </TabsContent>
                                                <TabsContent value="features" className="m-0">
                                                    <FormattedText
                                                        content={asset.features || "No features listed."}
                                                        enableYouTube={true}
                                                        enableImages={true}
                                                        enableLinks={true}
                                                    />
                                                </TabsContent>
                                                <TabsContent value="installation" className="m-0">
                                                    <FormattedText
                                                        content={asset.installation || "No installation guide available."}
                                                        enableYouTube={true}
                                                        enableImages={true}
                                                        enableLinks={true}
                                                    />
                                                </TabsContent>
                                                <TabsContent value="changelog" className="m-0">
                                                    <FormattedText
                                                        content={asset.changelog || "No changelog available."}
                                                        enableYouTube={true}
                                                        enableImages={true}
                                                        enableLinks={true}
                                                    />
                                                </TabsContent>
                                            </motion.div>
                                        </AnimatePresence>
                                    </CardContent>
                                </Tabs>
                            </Card>
                        </motion.div>

                        {/* Tags */}
                        {asset.tags && asset.tags.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Card className="glass">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <Tag className="h-4 w-4 text-purple-400" />
                                            Tags
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="flex flex-wrap gap-2">
                                            {asset.tags.map((tag) => (
                                                <Link key={tag} href={`/assets?tag=${tag}`}>
                                                    <Badge variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/30 transition-colors cursor-pointer">
                                                        #{tag}
                                                    </Badge>
                                                </Link>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Author Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="glass overflow-hidden">
                                <div className="h-16 bg-gradient-to-r from-primary/20 via-pink-500/20 to-purple-500/20" />
                                <CardContent className="pt-0 -mt-8">
                                    <div className="flex items-end gap-4 mb-4">
                                        <div className="relative">
                                            {asset.authorData?.avatar ? (
                                                <img
                                                    src={asset.authorData.avatar}
                                                    alt={asset.authorData.username || 'Author'}
                                                    className="w-16 h-16 rounded-2xl ring-4 ring-background object-cover"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 rounded-2xl ring-4 ring-background bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
                                                    <User className="h-8 w-8 text-white" />
                                                </div>
                                            )}
                                            {asset.authorData?.membership === 'vip' && (
                                                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center ring-2 ring-background">
                                                    <Crown className="h-3 w-3 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 pb-1">
                                            <h3 className="font-bold truncate">{asset.authorData?.username || asset.author || 'Unknown'}</h3>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs capitalize border-white/10">
                                                    {asset.authorData?.membership || 'free'}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Zap className="h-3 w-3 text-primary" />
                                                    Lv.{asset.authorData?.level || 1}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {asset.authorData?.xp !== undefined && (
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-muted-foreground">Experience</span>
                                                <span className="text-primary font-medium">{(asset.authorData.xp || 0).toLocaleString()} XP</span>
                                            </div>
                                            <Progress value={Math.min(((asset.authorData.xp || 0) / 10000) * 100, 100)} className="h-1.5" />
                                        </div>
                                    )}

                                    {asset.author_id && (
                                        <Link href={`/profile/${asset.author_id}`}>
                                            <Button variant="outline" className="w-full mt-4 gap-2 rounded-xl border-white/10">
                                                <User className="h-4 w-4" />
                                                View Profile
                                            </Button>
                                        </Link>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Info Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="glass">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Calendar className="h-4 w-4 text-blue-400" />
                                        Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm pt-0">
                                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            Created
                                        </span>
                                        <span className="font-medium">{new Date(asset.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4" />
                                            Updated
                                        </span>
                                        <span className="font-medium">{new Date(asset.updated_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <Cpu className="h-4 w-4" />
                                            Framework
                                        </span>
                                        <Badge variant="outline" className="capitalize border-white/10">{asset.framework}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4" />
                                            Status
                                        </span>
                                        <Badge className={cn(
                                            "capitalize",
                                            asset.status === 'active' || asset.status === 'approved'
                                                ? "bg-green-500/10 text-green-400 border-green-500/30"
                                                : "bg-gray-500/10 text-gray-400 border-gray-500/30"
                                        )}>
                                            {asset.status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>

                {/* Modern Asset Comments Section */}
                <AssetComments
                    assetId={id}
                    isFreeAsset={isFreeAsset}
                    onCommentPosted={handleCommentPosted}
                />
            </div>

            {/* Fullscreen Image Modal */}
            <AnimatePresence>
                {showFullImage && thumbnailUrl && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setShowFullImage(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-5xl max-h-[90vh] w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={thumbnailUrl}
                                alt={asset?.title || 'Asset Image'}
                                className="w-full h-full object-contain rounded-lg"
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full"
                                onClick={() => setShowFullImage(false)}
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </Button>
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 rounded-full text-white text-sm">
                                Click outside or press X to close
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
