"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Download,
  Star,
  Shield,
  FileText,
  Zap,
  Settings,
  BookOpen,
  ExternalLink,
  Youtube,
  Github,
  Edit,
  Trash2,
  AlertTriangle,
  Flag,
  Share2,
  Calendar,
  HardDrive,
  Package,
  MoreVertical,
  Tag,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { DownloadButton } from "@/components/download-button"
import { CoinIcon } from "@/components/coin-icon"
import { useAuth } from "@/components/auth-provider"
import { toast, Toaster } from "sonner"
import { ReviewForm } from "@/components/review-form"
import { ReportDialog } from "@/components/report-dialog"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

function cleanText(text: string): string {
  if (!text) return ""
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/\s+/g, " ")
    .trim()
}

function ModernDescription({ content, title }: { content: string; title?: string }) {
  if (!content) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No {title?.toLowerCase() || "content"} available.</p>
      </div>
    )
  }

  const cleanedContent = cleanText(content)
  const lines = cleanedContent.split(/\n+/).filter((line) => line.trim())

  const seenLines = new Set<string>()
  const uniqueLines = lines.filter((line) => {
    const normalized = line.toLowerCase().trim()
    if (seenLines.has(normalized)) return false
    seenLines.add(normalized)
    return true
  })

  const renderLine = (line: string, index: number) => {
    const trimmed = line.trim()

    if (trimmed.endsWith(":") || trimmed.startsWith("#")) {
      const headerText = trimmed.replace(/^#+\s*/, "").replace(/:$/, "")
      return (
        <div key={index} className="mt-4 first:mt-0">
          <h4 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            {headerText}
          </h4>
        </div>
      )
    }

    if (trimmed.match(/^[-•*]\s/)) {
      const bulletText = trimmed.replace(/^[-•*]\s+/, "")
      return (
        <div key={index} className="flex items-start gap-3 py-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-primary/60 mt-2 shrink-0" />
          <span className="text-foreground/80">{bulletText}</span>
        </div>
      )
    }

    if (trimmed.match(/^\d+[.)]\s/)) {
      const match = trimmed.match(/^(\d+)[.)]\s*(.*)/)
      if (match) {
        return (
          <div key={index} className="flex items-start gap-3 py-1.5">
            <span className="text-primary font-medium min-w-[24px]">{match[1]}.</span>
            <span className="text-foreground/80">{match[2]}</span>
          </div>
        )
      }
    }

    return (
      <p key={index} className="text-foreground/80 leading-relaxed py-1">
        {trimmed}
      </p>
    )
  }

  return <div className="space-y-1">{uniqueLines.map((line, index) => renderLine(line, index))}</div>
}

function getYouTubeVideoId(url: string): string | null {
  if (!url) return null
  const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/, /^([a-zA-Z0-9_-]{11})$/]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

interface Asset {
  id: string
  title: string
  description: string
  features?: string
  installation?: string
  changelog?: string
  thumbnail?: string
  images?: string[]
  category: string
  framework?: string
  price: string
  downloads: number
  rating?: number
  rating_count?: number
  version?: string
  file_size?: string
  author: string
  author_id: string
  authorAvatar?: string
  authorRole?: string
  is_verified?: boolean
  is_featured?: boolean
  tags?: string[]
  youtube_link?: string
  youtubeLink?: string
  docs_link?: string
  github_link?: string
  download_url?: string
  downloadLink?: string
  created_at: string
  updated_at?: string
  coinPrice?: number
  coin_price?: number
}

interface Review {
  id: string
  user_id: string
  rating: number
  content: string
  created_at: string
  user?: {
    username: string
    avatar: string
  }
}

export default function AssetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()

  const [asset, setAsset] = useState<Asset | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("description")
  const [reviews, setReviews] = useState<Review[]>([])
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const coinPrice = useMemo(() => {
    if (!asset) return 0
    return asset.coinPrice ?? asset.coin_price ?? 0
  }, [asset])

  const priceType = useMemo((): "free" | "premium" => {
    return coinPrice === 0 ? "free" : "premium"
  }, [coinPrice])

  const allImages = useMemo(() => {
    if (!asset) return []
    return [asset.thumbnail, ...(asset.images || [])].filter(Boolean) as string[]
  }, [asset])

  const youtubeVideoId = useMemo(() => {
    if (!asset) return null
    return getYouTubeVideoId(asset.youtube_link || asset.youtubeLink || "")
  }, [asset])

  const isOwner = user && asset && user.id === asset.author_id

  const handleDelete = async () => {
    if (!asset || !confirm("Are you sure you want to delete this asset? This action cannot be undone.")) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/assets/${asset.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete asset")
      toast.success("Asset deleted successfully")
      router.push("/assets")
    } catch (err: any) {
      toast.error(err.message || "Failed to delete asset")
    } finally {
      setDeleting(false)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Link copied to clipboard!")
    } catch {
      toast.info(url)
    }
  }

  const handleReviewSubmitted = () => {
    if (asset?.id) {
      fetch(`/api/assets/${asset.id}/reviews`)
        .then((res) => res.json())
        .then((data) => setReviews(data.reviews || []))
        .catch(console.error)
    }
  }

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/assets/${params.id}`)
        if (!res.ok) throw new Error("Asset not found")
        const data = await res.json()
        setAsset(data)
      } catch (err: any) {
        setError(err.message || "Failed to load asset")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) fetchAsset()
  }, [params.id])

  useEffect(() => {
    const fetchReviews = async () => {
      if (!asset?.id || activeTab !== "reviews") return
      setLoadingReviews(true)
      try {
        const res = await fetch(`/api/assets/${asset.id}/reviews`)
        if (res.ok) {
          const data = await res.json()
          setReviews(data.reviews || [])
        }
      } catch (err) {
        console.error("Failed to fetch reviews:", err)
      } finally {
        setLoadingReviews(false)
      }
    }
    fetchReviews()
  }, [asset?.id, activeTab])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="md:ml-72 transition-all duration-300">
          <Header />
          <div className="p-6">
            <Skeleton className="h-[400px] w-full rounded-2xl mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-64 w-full rounded-xl" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="md:ml-72 transition-all duration-300">
          <Header />
          <div className="p-6 flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Asset Not Found</h2>
              <p className="text-muted-foreground mb-4">{error || "The asset you're looking for doesn't exist."}</p>
              <Button onClick={() => router.push("/assets")}>Browse Assets</Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-0 lg:ml-64">
        <Header />
        <Toaster position="top-center" richColors />

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="relative rounded-2xl overflow-hidden border border-border/50 bg-card">
            <div className="aspect-video relative">
              <Image
                src={asset.thumbnail || "/placeholder.svg?height=720&width=1280&query=fivem asset"}
                alt={asset.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            </div>

            {/* Hero Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-end justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-primary/20 text-primary border border-primary/30">{asset.category}</Badge>
                    {asset.framework && <Badge variant="secondary">{asset.framework}</Badge>}
                    {asset.is_verified && (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <Shield className="h-3 w-3 mr-1" /> Verified
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-4xl font-bold text-white">{asset.title}</h1>
                  <div className="flex items-center gap-4 text-white/80 flex-wrap">
                    <Link
                      href={`/profile/${asset.author_id}`}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      <Avatar className="h-6 w-6 border border-white/20">
                        <AvatarImage src={asset.authorAvatar || "/placeholder.svg"} />
                        <AvatarFallback>{asset.author?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{asset.author}</span>
                    </Link>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-medium">{asset.rating?.toFixed(1) || "5.0"}</span>
                      <span className="text-sm text-white/50">({asset.rating_count || 0})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      <span className="text-sm">{(asset.downloads || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="rounded-full h-10 w-10 bg-white/10 hover:bg-white/20 border-0 shrink-0"
                    >
                      <MoreVertical className="h-5 w-5 text-white" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {isOwner && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/edit-asset/${asset.id}`} className="cursor-pointer">
                            <Edit className="h-4 w-4 mr-2" /> Edit Asset
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={handleDelete}
                          className="text-destructive cursor-pointer"
                          disabled={deleting}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {deleting ? "Deleting..." : "Delete Asset"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    {user && !isOwner && (
                      <>
                        <DropdownMenuItem onClick={() => setShowReportDialog(true)} className="cursor-pointer">
                          <Flag className="h-4 w-4 mr-2" /> Report Asset
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={handleShare} className="cursor-pointer">
                      <Share2 className="h-4 w-4 mr-2" /> Share Asset
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full grid grid-cols-5 bg-card border border-border/50 p-1 rounded-xl">
                  <TabsTrigger
                    value="description"
                    className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Description</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="features"
                    className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Zap className="h-4 w-4" />
                    <span className="hidden sm:inline">Features</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="installation"
                    className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Install</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="changelog"
                    className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span className="hidden sm:inline">Changelog</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="reviews"
                    className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Star className="h-4 w-4" />
                    <span className="hidden sm:inline">Reviews</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="mt-6 space-y-6">
                  <div className="rounded-2xl border border-border/50 bg-card p-6">
                    <ModernDescription content={asset.description} title="Description" />
                  </div>

                  {youtubeVideoId && (
                    <div className="rounded-2xl border border-border/50 bg-card p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Youtube className="h-5 w-5 text-red-500" />
                        Preview Video
                      </h3>
                      <div className="aspect-video rounded-xl overflow-hidden">
                        <iframe
                          src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                          title="YouTube video"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                  )}

                  {allImages.length > 1 && (
                    <div className="rounded-2xl border border-border/50 bg-card p-6">
                      <h3 className="text-lg font-semibold mb-4">Gallery</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {allImages.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setLightboxIndex(idx)
                              setLightboxOpen(true)
                            }}
                            className="aspect-video rounded-xl overflow-hidden bg-secondary/50 hover:ring-2 hover:ring-primary transition-all"
                          >
                            <Image
                              src={img || "/placeholder.svg"}
                              alt={`Gallery ${idx + 1}`}
                              width={400}
                              height={225}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="features" className="mt-6">
                  <div className="rounded-2xl border border-border/50 bg-card p-6">
                    <ModernDescription content={asset.features || ""} title="Features" />
                  </div>
                </TabsContent>

                <TabsContent value="installation" className="mt-6">
                  <div className="rounded-2xl border border-border/50 bg-card p-6">
                    <ModernDescription content={asset.installation || ""} title="Installation" />
                  </div>
                </TabsContent>

                <TabsContent value="changelog" className="mt-6">
                  <div className="rounded-2xl border border-border/50 bg-card p-6">
                    <ModernDescription content={asset.changelog || ""} title="Changelog" />
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="mt-6 space-y-6">
                  {user && !isOwner && (
                    <div className="rounded-2xl border border-border/50 bg-card p-6">
                      <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
                      <ReviewForm assetId={asset.id} onReviewSubmitted={handleReviewSubmitted} />
                    </div>
                  )}

                  <div className="rounded-2xl border border-border/50 bg-card p-6">
                    <h3 className="text-lg font-semibold mb-4">User Reviews ({reviews.length})</h3>
                    {loadingReviews ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-24 rounded-xl" />
                        ))}
                      </div>
                    ) : reviews.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Star className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No reviews yet. Be the first to review!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div key={review.id} className="bg-muted/30 rounded-xl p-4 border border-border/50">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={review.user?.avatar || "/placeholder.svg"} />
                                  <AvatarFallback>{review.user?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{review.user?.username || "Anonymous"}</p>
                                  <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`h-4 w-4 ${star <= review.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground"}`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-foreground/80">{review.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-border/50 bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-muted-foreground">Price</span>
                  {coinPrice === 0 ? (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-lg px-3">
                      FREE
                    </Badge>
                  ) : (
                    <div className="flex items-center gap-1 text-xl font-bold text-primary">
                      <CoinIcon className="h-5 w-5" />
                      {coinPrice}
                    </div>
                  )}
                </div>
                <DownloadButton
                  assetId={asset.id}
                  price={priceType}
                  coinPrice={coinPrice}
                  downloadLink={asset.download_url || asset.downloadLink}
                  className="w-full h-12 text-lg"
                />

                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Package className="h-4 w-4" /> Version
                    </span>
                    <span className="font-medium">{asset.version || "1.0.0"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <HardDrive className="h-4 w-4" /> File Size
                    </span>
                    <span className="font-medium">{asset.file_size || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Download className="h-4 w-4" /> Downloads
                    </span>
                    <span className="font-medium">{(asset.downloads || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Updated
                    </span>
                    <span className="font-medium">
                      {new Date(asset.updated_at || asset.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {(asset.docs_link || asset.github_link) && (
                <div className="rounded-2xl border border-border/50 bg-card p-6">
                  <h3 className="font-semibold mb-4">Resources</h3>
                  <div className="space-y-2">
                    {asset.docs_link && (
                      <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                        <a href={asset.docs_link} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-4 w-4 mr-2" /> Documentation
                          <ExternalLink className="h-3 w-3 ml-auto" />
                        </a>
                      </Button>
                    )}
                    {asset.github_link && (
                      <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                        <a href={asset.github_link} target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4 mr-2" /> Source Code
                          <ExternalLink className="h-3 w-3 ml-auto" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {asset.tags && asset.tags.length > 0 && (
                <div className="rounded-2xl border border-border/50 bg-card p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Tag className="h-4 w-4" /> Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {asset.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-secondary/50">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-border/50 bg-card p-6">
                <h3 className="font-semibold mb-4">Author</h3>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={asset.authorAvatar || "/placeholder.svg"} />
                    <AvatarFallback>{asset.author?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{asset.author}</p>
                    <p className="text-sm text-muted-foreground">{asset.authorRole || "Member"}</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href={`/profile/${asset.author_id}`}>View Profile</Link>
                </Button>
              </div>

              <div className="rounded-2xl border border-border/50 bg-card p-6">
                <Button variant="outline" className="w-full bg-transparent" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" /> Share Asset
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Lightbox */}
        {lightboxOpen && allImages.length > 0 && (
          <div className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center">
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80"
            >
              <X className="h-5 w-5" />
            </button>

            {allImages.length > 1 && (
              <>
                <button
                  onClick={() => setLightboxIndex((prev) => (prev - 1 + allImages.length) % allImages.length)}
                  className="absolute left-4 h-10 w-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setLightboxIndex((prev) => (prev + 1) % allImages.length)}
                  className="absolute right-4 h-10 w-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            <div className="max-w-5xl max-h-[90vh] p-4">
              <Image
                src={allImages[lightboxIndex] || "/placeholder.svg"}
                alt={`Image ${lightboxIndex + 1}`}
                width={1920}
                height={1080}
                className="max-h-[85vh] w-auto object-contain rounded-xl"
              />
              <p className="text-center text-muted-foreground mt-2">
                {lightboxIndex + 1} / {allImages.length}
              </p>
            </div>
          </div>
        )}

        <ReportDialog
          open={showReportDialog}
          onOpenChange={setShowReportDialog}
          contentType="asset"
          contentId={asset.id}
        />
      </main>
    </div>
  )
}
