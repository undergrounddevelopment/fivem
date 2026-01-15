"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { FormattedText } from "@/components/formatted-text"
import {
  Star, Eye, Package, Sparkles, FileText, History,
  ArrowLeft, Heart, Share2, Shield, Crown, CheckCircle, Clock,
  Users, Zap, ExternalLink, Check, Loader2, MessageSquare, Download
} from "lucide-react"
import { CoinIcon, COIN_ICON_URL } from "@/components/coin-icon"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { LinkvertiseDownloadButton } from "@/components/linkvertise-download-button"
import { AssetComments } from "@/components/asset-comments"

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
  const [copied, setCopied] = useState(false)

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
            {/* Cover Image - Full Width */}
            {asset.thumbnail && (
              <div className="relative w-full h-[400px] md:h-[500px]">
                <Image
                  src={asset.thumbnail}
                  alt={asset.title}
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Badges on image */}
                <div className="absolute top-6 left-6 flex gap-2">
                  {isPremium && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1.5 px-3 py-1.5 shadow-lg">
                      <Crown className="h-3.5 w-3.5" />
                      Premium
                    </Badge>
                  )}
                  <Badge className="bg-black/70 backdrop-blur-md text-white border-0 capitalize px-3 py-1.5 shadow-lg">
                    {asset.category}
                  </Badge>
                </div>

                {/* Title & Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <h1 className="text-3xl md:text-4xl font-bold mb-3 text-white drop-shadow-lg">{asset.title}</h1>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="outline" className="bg-primary/20 backdrop-blur-md text-white border-primary/50 shadow-lg">
                      {asset.framework}
                    </Badge>
                    <span className="text-sm text-white/90 flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1 rounded-lg">
                      <Clock className="h-3.5 w-3.5" />
                      v{asset.version || "1.0.0"}
                    </span>
                    {asset.status === "active" && (
                      <span className="text-sm text-green-400 flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1 rounded-lg">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Active
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Stats & Actions Bar */}
            <div className="p-6 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                {/* Stats */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Download className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="font-semibold">{(asset.downloads || 0).toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">downloads</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <Eye className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                      <div className="font-semibold">{(asset.views || 0).toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">views</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    </div>
                    <div>
                      <div className="font-semibold">{asset.rating || "5.0"}</div>
                      <div className="text-xs text-muted-foreground">rating</div>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-xl bg-card/50 border-border hover:border-pink-500/50 hover:text-pink-400"
                    onClick={() => setIsLiked(!isLiked)}
                  >
                    <Heart className={`h-5 w-5 ${isLiked ? "fill-pink-500 text-pink-500" : ""}`} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-xl bg-card/50 border-border"
                    onClick={handleShare}
                  >
                    {copied ? <Check className="h-5 w-5 text-green-400" /> : <Share2 className="h-5 w-5" />}
                  </Button>
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
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
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

          {/* Modern Asset Comments Section */}
          <AssetComments
            assetId={params?.id as string}
            isFreeAsset={!isPremium}
            onCommentPosted={() => {
              // Comment posted - any global UI updates can go here
              console.log("Comment posted on asset detail page")
            }}
          />
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

              {/* Linkvertise Download Button */}
              {session ? (
                <LinkvertiseDownloadButton
                  assetId={params?.id as string}
                  downloadUrl={asset.download_url || ''}
                  title={asset.title}
                  className="w-full"
                />
              ) : (
                <Button
                  onClick={() => toast.error("Login Required", {
                    description: "Please login with Discord to download."
                  })}
                  className="w-full h-14 text-lg font-bold rounded-xl gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Login to Download
                </Button>
              )}

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
