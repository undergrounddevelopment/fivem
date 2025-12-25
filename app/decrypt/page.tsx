"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Lock,
  Download,
  Shield,
  AlertTriangle,
  Package,
  CheckCircle,
  Clock,
  Key,
  MessageSquare,
  ThumbsUp,
  Eye,
  Calendar,
  User,
} from "lucide-react"

interface ForumPost {
  id: string
  author: string
  avatar: string
  title: string
  content: string
  likes: number
  views: number
  replies: number
  timestamp: string
  isPinned?: boolean
}

export default function DecryptPage() {
  const [downloadId, setDownloadId] = useState("")
  const [forumPosts] = useState<ForumPost[]>([
    {
      id: "1",
      author: "Admin",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
      title: "📌 CFX V7 Decryptor - How to Use Discord Bot",
      content:
        "Use /decrypt command in Discord to upload your encrypted files. Bot will process and give you a Download ID to use on this website.",
      likes: 245,
      views: 1823,
      replies: 34,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      isPinned: true,
    },
    {
      id: "2",
      author: "TechSupport",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tech",
      title: "🔥 Download Links Expire in 24 Hours",
      content: "Make sure to download your decrypted files within 24 hours. After that, you'll need to decrypt again.",
      likes: 189,
      views: 956,
      replies: 21,
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      isPinned: false,
    },
  ])

  useEffect(() => {
    // Adding structured data here
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "CFX V7 Decryptor",
      description: "Download decrypted files from Discord bot",
      // Additional structured data can be added here
    }

    document.head.innerHTML += `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-0 md:ml-72">
        <Header />
        <div className="p-4 md:p-6">
          {/* Forum Header */}
          <div className="glass rounded-2xl p-4 md:p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-gradient-to-br from-destructive to-chart-5 flex items-center justify-center glow-sm">
                  <Lock className="h-6 w-6 md:h-7 md:w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">CFX V7 Decryptor</h1>
                  <p className="text-sm md:text-base text-muted-foreground">
                    Download decrypted files from Discord bot
                  </p>
                </div>
              </div>
              <Badge className="bg-[#5865F2]/20 text-[#5865F2] border-[#5865F2]/30 w-fit">
                <MessageSquare className="h-3 w-3 mr-1" />
                Discord Bot Only
              </Badge>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {[
                { label: "Total Decrypts", value: "2.5K+", icon: Package, color: "text-primary" },
                { label: "Success Rate", value: "98.5%", icon: CheckCircle, color: "text-success" },
                { label: "Avg Time", value: "~45s", icon: Clock, color: "text-warning" },
                { label: "Active Users", value: "456", icon: MessageSquare, color: "text-accent" },
              ].map((stat) => (
                <div key={stat.label} className="bg-secondary/30 rounded-xl p-3 md:p-4 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {/* Discord Instructions */}
              <div className="glass rounded-2xl overflow-hidden border border-border/50">
                <div className="bg-gradient-to-r from-[#5865F2]/10 to-accent/10 border-b border-border/50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#5865F2]/20 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-[#5865F2]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Decrypt via Discord Bot</h2>
                      <p className="text-xs text-muted-foreground">All decryption is processed through Discord</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 md:p-6 space-y-4">
                  <div className="bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/30 rounded-xl p-6 text-center">
                    <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-foreground mb-2">How to Use</h3>
                    <div className="bg-background/50 rounded-lg p-4 mb-4">
                      <ol className="text-sm text-muted-foreground text-left space-y-2">
                        <li className="flex gap-2">
                          <span className="text-primary font-bold">1.</span>
                          <span>Join our Discord server</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-primary font-bold">2.</span>
                          <span>Post vouch in vouch channel (required)</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-primary font-bold">3.</span>
                          <span>
                            Use command:{" "}
                            <code className="bg-primary/20 text-primary px-2 py-0.5 rounded font-mono">/decrypt</code>
                          </span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-primary font-bold">4.</span>
                          <span>Upload your encrypted .ZIP file</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-primary font-bold">5.</span>
                          <span>Bot will give you an 8-character Download ID</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-primary font-bold">6.</span>
                          <span>Enter Download ID below to get your file</span>
                        </li>
                      </ol>
                    </div>
                    <Button className="bg-[#5865F2] hover:bg-[#4752C4] gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Join Discord Server
                    </Button>
                  </div>
                </div>
              </div>

              {/* Download Section */}
              <div className="glass rounded-2xl overflow-hidden border border-border/50">
                <div className="bg-gradient-to-r from-success/10 to-primary/10 border-b border-border/50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center">
                      <Download className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Download Decrypted File</h2>
                      <p className="text-xs text-muted-foreground">Enter your Download ID from Discord bot</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 md:p-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Download ID</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="XXXXXXXX"
                        value={downloadId}
                        onChange={(e) => setDownloadId(e.target.value.toUpperCase())}
                        className="w-full pl-10 pr-4 py-3 bg-secondary/30 border border-border rounded-lg text-lg font-mono tracking-wider focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        maxLength={8}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">8-character ID provided by Discord bot</p>
                  </div>

                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Key className="h-4 w-4 text-primary" />
                      Example Download ID
                    </h3>
                    <div className="bg-background/50 rounded p-3">
                      <p className="text-2xl font-mono font-bold text-primary text-center tracking-wider">A1B2C3D4</p>
                    </div>
                  </div>

                  <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                    <div className="flex gap-2">
                      <Clock className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-warning mb-1">Download Expiry</p>
                        <p className="text-xs text-muted-foreground">
                          Download links expire after 24 hours for security reasons.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <div className="flex gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-destructive mb-1">Important Notice</p>
                        <p className="text-xs text-muted-foreground">
                          Only decrypt scripts you own or have permission to decrypt. Respect intellectual property
                          rights.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      if (downloadId.length === 8) {
                        window.open(`/api/decrypt/download/${downloadId}`, "_blank")
                      }
                    }}
                    disabled={downloadId.length !== 8}
                    className="w-full bg-success hover:bg-success/90 gap-2 h-11 md:h-12 text-sm md:text-base font-semibold"
                  >
                    <Download className="h-4 w-4" />
                    Download Decrypted File
                  </Button>
                </div>
              </div>

              {/* Forum Posts */}
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 px-1">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Community Discussions
                </h2>
                {forumPosts.map((post) => (
                  <div
                    key={post.id}
                    className="glass rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 transition-colors"
                  >
                    <div className="p-4 md:p-5">
                      <div className="flex gap-3 md:gap-4">
                        <img
                          src={post.avatar || "/placeholder.svg"}
                          alt={post.author}
                          className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-secondary"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base md:text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                                {post.title}
                                {post.isPinned && <Badge className="bg-primary/20 text-primary text-xs">Pinned</Badge>}
                              </h3>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <User className="h-3 w-3" />
                                <span className="font-medium">{post.author}</span>
                                <span>•</span>
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(post.timestamp).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{post.content}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5 hover:text-primary cursor-pointer transition-colors">
                              <ThumbsUp className="h-3.5 w-3.5" />
                              <span>{post.likes}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Eye className="h-3.5 w-3.5" />
                              <span>{post.views}</span>
                            </div>
                            <div className="flex items-center gap-1.5 hover:text-primary cursor-pointer transition-colors">
                              <MessageSquare className="h-3.5 w-3.5" />
                              <span>{post.replies} replies</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 md:space-y-6">
              {/* Discord Commands */}
              <div className="glass rounded-2xl p-4 md:p-5 border border-border/50">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-[#5865F2]" />
                  Bot Commands
                </h2>
                <div className="space-y-3">
                  <div className="bg-secondary/30 rounded-lg p-3 border border-border/50">
                    <code className="text-sm font-mono text-primary">/decrypt</code>
                    <p className="text-xs text-muted-foreground mt-1">Upload and decrypt encrypted resource</p>
                  </div>
                  <div className="bg-secondary/30 rounded-lg p-3 border border-border/50">
                    <code className="text-sm font-mono text-primary">/status [id]</code>
                    <p className="text-xs text-muted-foreground mt-1">Check decryption status</p>
                  </div>
                  <div className="bg-secondary/30 rounded-lg p-3 border border-border/50">
                    <code className="text-sm font-mono text-primary">/help</code>
                    <p className="text-xs text-muted-foreground mt-1">Get help and instructions</p>
                  </div>
                </div>
              </div>

              {/* How It Works */}
              <div className="glass rounded-2xl p-4 md:p-5 border border-border/50">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  How It Works
                </h2>
                <div className="space-y-3 text-sm">
                  {[
                    "Upload file to Discord bot",
                    "Bot extracts .fxap file",
                    "Fetches grants from Keymaster",
                    "Decrypts with ChaCha20",
                    "Decompiles Lua bytecode",
                    "Get Download ID for website",
                  ].map((step, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">{i + 1}</span>
                      </div>
                      <span className="text-muted-foreground pt-0.5">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="glass rounded-2xl p-4 md:p-5 border border-border/50">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Quick Stats
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avg. Process Time</span>
                    <span className="text-sm font-semibold text-foreground">~45s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Success Rate</span>
                    <span className="text-sm font-semibold text-success">98.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active Users</span>
                    <span className="text-sm font-semibold text-foreground">456</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Processed</span>
                    <span className="text-sm font-semibold text-primary">2.5K+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
