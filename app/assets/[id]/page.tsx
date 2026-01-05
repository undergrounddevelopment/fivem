"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { FormattedText } from "@/components/formatted-text"
import { Download, Star, Eye, Package, Sparkles, FileText, History, 
  ArrowLeft, Heart, Share2, Shield, Crown, CheckCircle, Clock,
  Users, Zap, ExternalLink, Copy, Check, Coins, Loader2, MessageSquare
} from "lucide-react"
import { CoinIcon, COIN_ICON_URL } from "@/components/coin-icon"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

export default function AssetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [asset, setAsset] = useState<{
    title: string;
    thumbnail?: string;
    category: string;
    framework: string;
    version?: string;
    status: string;
    downloads?: number;
    views?: number;
    rating?: string;
    description?: string;
    features?: string;
    installation?: string;
    changelog?: string;
    coin_price: number;
    author?: { id?: string; username?: string; avatar?: string; membership?: string };
    author_id?: string;
    tags?: string[];
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"description" | "features" | "installation" | "changelog">("description")
  const [isLiked, setIsLiked] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showCommentDialog, setShowCommentDialog] = useState(false)
  const [comment, setComment] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    if (params?.id) {
      setLoading(true)
      fetch(`/api/assets/${params.id}`)
        .then(res => {
          if (!res.ok) throw new Error('Not found')
          return res.json()
        })
        .then(data => {
          if (data.asset) {
            setAsset(data.asset)
          } else {
            setAsset(null)
          }
          setLoading(false)
        })
        .catch(err => {
          console.error('Fetch error:', err)
          setAsset(null)
          setLoading(false)
        })
    }
  }, [params?.id])

  const handleDownload = async () => {
    if (!session) {
      toast.error("Login Required", {
        description: "Please login with Discord to download.",
        duration: 5000,
      })
      return
    }
    
    setDownloading(true)
    try {
      const res = await fetch(`/api/download/${params?.id}`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id })
      })
      
      const data = await res.json()
      
      if (res.status === 403 && data.error === 'Comment required') {
        setDownloading(false)
        setShowCommentDialog(true)
        toast.info("Comment Required", {
          description: "Please leave a comment to download this free asset"
        })
        return
      }
      
      if (res.ok && data.downloadUrl) {
        window.open(data.downloadUrl, "_blank")
        toast.success("Download Started!")
      } else {
        toast.error("Download Failed", {
          description: data.error || "Please try again."
        })
      }
    } catch (error) {
      console.error("Download error:", error)
      toast.error("Download Failed")
    } finally {
      setDownloading(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!comment.trim()) {
      toast.error("Please write a comment")
      return
    }

    setSubmittingComment(true)
    try {
      const res = await fetch(`/api/assets/${params?.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: comment.trim() })
      })

      if (res.ok) {
        toast.success("Comment posted!")
        setShowCommentDialog(false)
        setComment("")
        // Retry download
        handleDownload()
      } else {
        toast.error("Failed to post comment")
      }
    } catch (error) {
      toast.error("Failed to post comment")
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    toast.success("Link copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto" />
            <Package className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-muted-foreground">Loading asset...</p>
        </div>
      </div>
    )
  }

  if (!asset) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full bg-card/50 border-border">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-6">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Asset Not Found</h2>
            <p className="text-muted-foreground mb-6">The asset you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => router.back()} variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isPremium = asset.coin_price > 0

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <CommentDialog 
        open={showCommentDialog}
        onOpenChange={setShowCommentDialog}
        comment={comment}
        setComment={setComment}
        onSubmit={handleSubmitComment}
        submitting={submittingComment}
      />
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/assets" className="hover:text-primary transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5">
          <ArrowLeft className="h-4 w-4" />
          Assets
        </Link>
        <span className="text-white/20">/</span>
        <Link href={`/assets?category=${asset.category}`} className="hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5 capitalize">
          {asset.category}
        </Link>
        <span className="text-white/20">/</span>
        <span className="text-foreground truncate max-w-[200px] px-3 py-1.5 bg-white/5 rounded-lg">{asset.title}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Section */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-card to-card/50 border border-border">
            {/* Cover Image */}
            {asset.thumbnail && (
              <div className="relative aspect-video w-full">
                <Image 
                  src={asset.thumbnail} 
                  alt={asset.title} 
                  fill 
                  className="object-cover" 
                  unoptimized 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                
                {/* Badges on image */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {isPremium && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1.5 px-3 py-1">
                      <Crown className="h-3.5 w-3.5" />
                      Premium
                    </Badge>
                  )}
                  <Badge className="bg-black/50 backdrop-blur-sm text-white border-0 capitalize">
                    {asset.category}
                  </Badge>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold mb-3">{asset.title}</h1>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                      {asset.framework}
                    </Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      v{asset.version || "1.0.0"}
                    </span>
                    {asset.status === "active" && (
                      <span className="text-sm text-green-400 flex items-center gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Active
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-xl bg-transparent border-border hover:border-pink-500/50 hover:text-pink-400"
                    onClick={() => setIsLiked(!isLiked)}
                  >
                    <Heart className={`h-5 w-5 ${isLiked ? "fill-pink-500 text-pink-500" : ""}`} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-xl bg-transparent border-border"
                    onClick={handleShare}
                  >
                    {copied ? <Check className="h-5 w-5 text-green-400" /> : <Share2 className="h-5 w-5" />}
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2 text-sm">
                  <div className="p-1.5 rounded-lg bg-blue-500/10">
                    <Download className="h-4 w-4 text-blue-400" />
                  </div>
                  <span className="font-semibold">{(asset.downloads || 0).toLocaleString()}</span>
                  <span className="text-muted-foreground">downloads</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="p-1.5 rounded-lg bg-purple-500/10">
                    <Eye className="h-4 w-4 text-purple-400" />
                  </div>
                  <span className="font-semibold">{(asset.views || 0).toLocaleString()}</span>
                  <span className="text-muted-foreground">views</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="p-1.5 rounded-lg bg-amber-500/10">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  </div>
                  <span className="font-semibold">{asset.rating || "5.0"}</span>
                  <span className="text-muted-foreground">rating</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Card className="bg-card/50 border-border overflow-hidden">
            <div className="flex border-b border-border/50 overflow-x-auto">
              {[
                { id: "description", label: "Description", icon: FileText },
                { id: "features", label: "Features", icon: Sparkles },
                { id: "installation", label: "Installation", icon: Package },
                { id: "changelog", label: "Changelog", icon: History },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as "description" | "features" | "installation" | "changelog")}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-primary border-b-2 border-primary bg-primary/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            <CardContent className="p-6">
              <div className="prose prose-invert max-w-none">
                {activeTab === "description" && (
                  <FormattedText content={asset.description || "No description available."} />
                )}
                {activeTab === "features" && (
                  <FormattedText content={asset.features || "No features listed."} />
                )}
                {activeTab === "installation" && (
                  <FormattedText content={asset.installation || "No installation instructions."} />
                )}
                {activeTab === "changelog" && (
                  <FormattedText content={asset.changelog || "No changelog available."} />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Download Card - Professional Design */}
          <Card className="bg-gradient-to-br from-card to-card/80 border-border overflow-hidden sticky top-6">
            <CardContent className="p-6">
              {/* Price Display */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 mb-3">
                  <CoinIcon size="lg" />
                  <span className="text-4xl font-bold text-amber-400">{asset.coin_price || 0}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isPremium ? "Coins Required" : "Free Download"}
                </p>
              </div>

              {/* Download Button */}
              <Button 
                onClick={handleDownload}
                disabled={downloading}
                className={`w-full h-14 text-lg font-bold rounded-xl gap-3 transition-all ${
                  isPremium 
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg shadow-amber-500/25"
                    : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white shadow-lg shadow-green-500/25"
                }`}
              >
                {downloading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    {isPremium ? "Get Access" : "Download Free"}
                  </>
                )}
              </Button>

              {/* Quick Info */}
              <div className="mt-6 pt-6 border-t border-border/50 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-muted-foreground">Instant download</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-4 w-4 text-blue-400" />
                  <span className="text-muted-foreground">Verified & secure</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span className="text-muted-foreground">Lifetime updates</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Author Card */}
          {asset.author && (
            <Card className="bg-card/50 border-border">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Author
                </h3>
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-primary to-pink-500 ring-2 ring-border">
                    {asset.author.avatar ? (
                      <Image src={asset.author.avatar} alt="" fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                        {asset.author.username?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{asset.author.username}</p>
                      {asset.author.membership === "vip" && (
                        <Crown className="h-4 w-4 text-primary" />
                      )}
                      {asset.author.membership === "admin" && (
                        <Shield className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground capitalize">{asset.author.membership || "Member"}</p>
                  </div>
                </div>
                <Link href={`/profile/${asset.author.id || asset.author_id}`}>
                  <Button variant="outline" className="w-full mt-4 gap-2 bg-transparent rounded-xl">
                    <ExternalLink className="h-4 w-4" />
                    View Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {asset.tags && asset.tags.length > 0 && (
            <Card className="bg-card/50 border-border">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {asset.tags.map((tag: string, i: number) => (
                    <Badge key={i} variant="secondary" className="px-3 py-1 rounded-lg">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Card */}
          <Card className="bg-card/50 border-border">
            <CardContent className="p-5">
              <h3 className="font-semibold mb-4">Information</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Category</span>
                  <Badge variant="outline" className="capitalize">{asset.category}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Framework</span>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">{asset.framework}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-medium">{asset.version || "1.0.0"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={asset.status === "active" ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}>
                    {asset.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Comment Dialog Component
function CommentDialog({ 
  open, 
  onOpenChange, 
  comment, 
  setComment, 
  onSubmit, 
  submitting 
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  comment: string
  setComment: (comment: string) => void
  onSubmit: () => void
  submitting: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Leave a Comment
          </DialogTitle>
          <DialogDescription>
            Please share your thoughts about this asset before downloading
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Write your comment here... (minimum 3 characters)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={onSubmit} disabled={submitting || comment.trim().length < 3}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post & Download"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}