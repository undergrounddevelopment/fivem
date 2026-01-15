"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { UploadTestButton } from "@/components/upload-test-button"
import { DiscordWebhookTest } from "@/components/discord-webhook-test"
import {
  Upload, ImageIcon, X, Loader2, CheckCircle,
  Code, Car, Building, Shirt, AlertCircle, Home, Coins,
  Eye, Package, Link2, FileText, FileArchive, File
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const CATEGORIES = [
  { id: "scripts", name: "Scripts", icon: Code },
  { id: "vehicles", name: "Vehicles", icon: Car },
  { id: "mlo", name: "MLO / Maps", icon: Building },
  { id: "clothing", name: "Clothing", icon: Shirt },
]

const FRAMEWORKS = [
  { id: "standalone", name: "Standalone" },
  { id: "qbcore", name: "QBCore" },
  { id: "esx", name: "ESX" },
  { id: "qbox", name: "QBox" },
]

export default function UploadPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const thumbnailRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // States
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [assetId, setAssetId] = useState<string | null>(null)
  const [thumbUploading, setThumbUploading] = useState(false)
  const [thumbPreview, setThumbPreview] = useState<string | null>(null)
  const [fileUploading, setFileUploading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [isPremium, setIsPremium] = useState(false)

  // Helper function to get file icon based on extension
  const getFileIcon = (filename: string) => {
    const ext = filename.toLowerCase().split('.').pop()
    switch (ext) {
      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
      case 'gz':
        return FileArchive
      case 'txt':
      case 'md':
      case 'lua':
      case 'js':
      case 'json':
      case 'xml':
      case 'html':
      case 'css':
      case 'sql':
        return FileText
      case 'exe':
      case 'dll':
      case 'so':
        return Code
      default:
        return File
    }
  }

  // Helper function to get file type description
  const getFileTypeDescription = (filename: string) => {
    const ext = filename.toLowerCase().split('.').pop()
    switch (ext) {
      case 'zip':
      case 'rar':
      case '7z':
        return 'Archive File'
      case 'txt':
        return 'Text File'
      case 'lua':
        return 'Lua Script'
      case 'js':
        return 'JavaScript File'
      case 'json':
        return 'JSON Data'
      case 'exe':
        return 'Executable'
      case 'dll':
        return 'Library File'
      default:
        return 'Asset File'
    }
  }

  // Form data
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [features, setFeatures] = useState("")
  const [installation, setInstallation] = useState("")
  const [category, setCategory] = useState("scripts")
  const [framework, setFramework] = useState("standalone")
  const [coinPrice, setCoinPrice] = useState(0)
  const [version, setVersion] = useState("1.0.0")
  const [downloadLink, setDownloadLink] = useState("")
  const [youtubeLink, setYoutubeLink] = useState("")
  const [thumbnail, setThumbnail] = useState("")

  // Upload thumbnail
  const uploadThumbnail = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    console.log("📸 Uploading thumbnail:", file.name)

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB")
      return
    }

    setThumbUploading(true)
    setThumbPreview(URL.createObjectURL(file))

    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("folder", "thumbnails")

      const res = await fetch("/api/upload/blob", { method: "POST", body: fd })
      const data = await res.json()

      console.log("📸 Thumbnail response:", res.status, data)

      if (!res.ok) throw new Error(data.error || "Upload failed")

      setThumbnail(data.url)
      toast.success("Thumbnail uploaded!")
    } catch (err: any) {
      console.error("📸 Thumbnail error:", err)
      toast.error(err.message || "Failed to upload thumbnail")
      setThumbPreview(null)
    } finally {
      setThumbUploading(false)
    }
  }

  // Upload file
  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    console.log("📁 Uploading file:", file.name, "Type:", file.type, "Size:", file.size)

    // More generous file size limits
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      toast.error("File must be less than 100MB")
      return
    }

    // Check file extension for additional validation
    const fileName = file.name.toLowerCase()
    const allowedExtensions = [
      '.zip', '.rar', '.7z', '.tar', '.gz',           // Archives
      '.txt', '.md', '.lua', '.js', '.json', '.xml',  // Text/Scripts
      '.html', '.css', '.sql',                        // Web files
      '.pdf', '.doc', '.docx',                        // Documents
      '.exe', '.dll', '.so', '.dylib',                // Executables
      '.cfg', '.ini', '.conf', '.yml', '.yaml'        // Config files
    ]

    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext))

    if (!hasValidExtension) {
      toast.error("Unsupported file type. Supported: " + allowedExtensions.slice(0, 8).join(', ') + " and more")
      return
    }

    setFileUploading(true)
    setFileName(file.name)
    setProgress(0)

    const interval = setInterval(() => setProgress(p => Math.min(p + 10, 90)), 200)

    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("folder", "assets")

      const res = await fetch("/api/upload/blob", { method: "POST", body: fd })
      const data = await res.json()

      console.log("📁 File response:", res.status, data)

      if (!res.ok) throw new Error(data.error || "Upload failed")

      setDownloadLink(data.url)
      setProgress(100)
      toast.success(`${file.name} uploaded successfully!`)
    } catch (err: any) {
      console.error("📁 File error:", err)
      toast.error(err.message || "Failed to upload file")
      setFileName(null)
      setProgress(0)
    } finally {
      clearInterval(interval)
      setFileUploading(false)
    }
  }

  // Submit asset
  const handleSubmit = async () => {
    console.log("🚀 Submit clicked")
    console.log("User:", user)
    console.log("Title:", title, "Length:", title.length)
    console.log("Description:", description, "Length:", description.length)
    console.log("Download link:", downloadLink)

    if (!user) {
      toast.error("Please login first")
      return
    }

    if (title.length < 3) {
      toast.error("Title must be at least 3 characters")
      return
    }

    if (description.length < 10) {
      toast.error("Description must be at least 10 characters")
      return
    }

    if (!downloadLink) {
      toast.error("Please upload a file or provide download link")
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        features: features.trim() || null,
        installation: installation.trim() || null,
        category,
        framework,
        coinPrice: isPremium ? coinPrice : 0,
        fileUrl: downloadLink,
        thumbnailUrl: thumbnail || null,
        version: version || "1.0.0",
        youtubeLink: youtubeLink || null,
      }

      console.log("📤 Sending payload:", payload)

      const res = await fetch("/api/upload/asset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      console.log("📥 Asset response:", res.status, data)

      if (!res.ok) {
        // Handle specific error cases
        if (res.status === 401) {
          toast.error("Please login again")
          window.location.href = "/api/auth/signin/discord"
          return
        } else if (res.status === 404) {
          toast.error("User not found. Please contact support.")
          return
        } else {
          throw new Error(data.error || `Server error (${res.status})`)
        }
      }

      if (!data.success || !data.asset) {
        throw new Error("Invalid response from server")
      }

      setAssetId(data.asset.id)
      setSuccess(true)
      toast.success(data.message || "Asset uploaded successfully!")

      // Clear form data
      console.log("✅ Upload successful, clearing form")

    } catch (err: any) {
      console.error("❌ Submit error:", err)

      // Show user-friendly error messages
      let errorMessage = "Failed to upload asset"

      if (err.message.includes("fetch")) {
        errorMessage = "Network error. Please check your connection."
      } else if (err.message.includes("certificate")) {
        errorMessage = "Connection security error. Please try again."
      } else if (err.message) {
        errorMessage = err.message
      }

      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  // Reset form
  const reset = () => {
    setSuccess(false)
    setTitle("")
    setDescription("")
    setFeatures("")
    setInstallation("")
    setCategory("scripts")
    setFramework("standalone")
    setCoinPrice(0)
    setVersion("1.0.0")
    setDownloadLink("")
    setYoutubeLink("")
    setThumbnail("")
    setThumbPreview(null)
    setFileName(null)
    setAssetId(null)
    setIsPremium(false)
    setProgress(0)
  }

  // Check if can submit
  const canSubmit = title.length >= 3 && description.length >= 10 && downloadLink && !submitting

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-amber-500" />
            <h2 className="text-xl font-bold mb-2">Login Required</h2>
            <p className="text-muted-foreground mb-4">Please login with Discord to upload assets</p>
            <Button
              onClick={() => window.location.href = "/api/auth/signin/discord"}
              className="w-full bg-[#5865F2] hover:bg-[#4752C4]"
            >
              Login with Discord
            </Button>
            <Button variant="ghost" onClick={() => router.push("/")} className="w-full mt-2">
              <Home className="h-4 w-4 mr-2" />Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-green-500/20">
          <CardContent className="pt-8 pb-8 text-center">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
            <h2 className="text-xl font-bold mb-2">Upload Successful!</h2>
            <p className="text-muted-foreground mb-4">Your asset has been submitted for review</p>
            <div className="space-y-2">
              {assetId && (
                <Button onClick={() => router.push(`/asset/${assetId}`)} className="w-full">
                  <Eye className="h-4 w-4 mr-2" />View Your Asset
                </Button>
              )}
              <Button variant="outline" onClick={() => router.push("/assets")} className="w-full">
                Browse Assets
              </Button>
              <Button variant="ghost" onClick={reset} className="w-full">
                Upload Another Asset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-10 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="blur-orb" style={{ top: '10%', right: '20%', background: 'rgba(236,72,153,0.15)' }} />
        <div className="blur-orb" style={{ bottom: '10%', left: '10%', background: 'rgba(59,130,246,0.15)' }} />
      </div>

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-pink-600 flex items-center justify-center shadow-lg shadow-primary/25 ring-2 ring-white/10">
            <Upload className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Upload Asset</h1>
            <p className="text-muted-foreground">Share your FiveM resource with the community</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card className="glass border-white/10 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <CardHeader className="bg-white/5 border-b border-white/5 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Title */}
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter asset title..."
                    className={cn(
                      "mt-2 bg-secondary/50 border-white/10 focus:border-primary/50 transition-all",
                      title.length > 0 && title.length < 3 ? "border-red-500/50" : "",
                      title.length >= 3 ? "border-green-500/50" : ""
                    )}
                  />
                  <div className="flex justify-between items-center mt-1.5">
                    <p className={cn(
                      "text-xs transition-colors",
                      title.length < 3 ? "text-red-400" : "text-muted-foreground"
                    )}>
                      {title.length < 3 ? "Min 3 characters" : "Looks good"}
                    </p>
                    <p className="text-xs text-muted-foreground">{title.length}/200</p>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <Label>Category *</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={cn(
                          "p-3 rounded-xl border text-center transition-all duration-300 flex flex-col items-center gap-2 group",
                          category === cat.id
                            ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]"
                            : "border-white/10 bg-secondary/30 hover:bg-secondary/50 hover:border-white/20"
                        )}
                      >
                        <cat.icon className={cn(
                          "h-6 w-6 transition-colors duration-300",
                          category === cat.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                        )} />
                        <span className="text-xs font-medium">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Framework */}
                <div>
                  <Label>Framework *</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {FRAMEWORKS.map(fw => (
                      <button
                        key={fw.id}
                        type="button"
                        onClick={() => setFramework(fw.id)}
                        className={cn(
                          "px-4 py-3 rounded-xl border text-left transition-all duration-300 flex items-center justify-between group",
                          framework === fw.id
                            ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]"
                            : "border-white/10 bg-secondary/30 hover:bg-secondary/50 hover:border-white/20"
                        )}
                      >
                        <span className="text-sm font-medium">{fw.name}</span>
                        {framework === fw.id && <CheckCircle className="h-4 w-4 text-primary" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Version & YouTube */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Version</Label>
                    <Input
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      placeholder="1.0.0"
                      className="mt-2 bg-secondary/50 border-white/10"
                    />
                  </div>
                  <div>
                    <Label>YouTube Preview</Label>
                    <Input
                      value={youtubeLink}
                      onChange={(e) => setYoutubeLink(e.target.value)}
                      placeholder="https://youtube.com/..."
                      className="mt-2 bg-secondary/50 border-white/10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="glass border-white/10 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <CardHeader className="bg-white/5 border-b border-white/5 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-400" />Description & Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <Label>Description *</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your asset in detail..."
                    className={cn(
                      "mt-2 min-h-[150px] bg-secondary/50 border-white/10 focus:border-primary/50 transition-all resize-y",
                      description.length > 0 && description.length < 10 ? "border-red-500/50" : "",
                      description.length >= 10 ? "border-green-500/50" : ""
                    )}
                  />
                  <p className={cn(
                    "text-xs mt-1.5",
                    description.length < 10 ? "text-red-400" : "text-muted-foreground"
                  )}>
                    Min 10 characters required
                  </p>
                </div>

                <div>
                  <Label>Features (Optional)</Label>
                  <Textarea
                    value={features}
                    onChange={(e) => setFeatures(e.target.value)}
                    placeholder="- Feature 1&#10;- Feature 2&#10;- Feature 3"
                    className="mt-2 min-h-[100px] bg-secondary/50 border-white/10"
                  />
                </div>

                <div>
                  <Label>Installation Guide (Optional)</Label>
                  <Textarea
                    value={installation}
                    onChange={(e) => setInstallation(e.target.value)}
                    placeholder="1. Download the resource&#10;2. Extract to resources folder&#10;3. Add to server.cfg"
                    className="mt-2 min-h-[100px] bg-secondary/50 border-white/10"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Thumbnail & Files */}
            <Card className="glass border-white/10 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <CardHeader className="bg-white/5 border-b border-white/5 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-purple-400" />Media & Files
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Thumbnail */}
                <div>
                  <Label>Thumbnail Image</Label>
                  <div
                    onClick={() => thumbnailRef.current?.click()}
                    className={cn(
                      "mt-2 border-2 border-dashed rounded-xl h-40 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden group",
                      thumbPreview ? "border-white/20" : "border-white/10 hover:border-primary/50 hover:bg-white/5"
                    )}
                  >
                    {thumbPreview ? (
                      <>
                        <img src={thumbPreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white text-sm font-medium">Click to change</p>
                        </div>
                        {thumbUploading && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setThumbPreview(null)
                            setThumbnail("")
                          }}
                          className="absolute top-2 right-2 bg-black/50 hover:bg-red-500/80 backdrop-blur rounded-full p-1.5 transition-colors"
                        >
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-4">
                        <div className="h-10 w-10 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium">Upload Thumbnail</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Max 5MB (JPG, PNG)
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={thumbnailRef}
                    type="file"
                    accept="image/*"
                    onChange={uploadThumbnail}
                    className="hidden"
                  />
                </div>

                {/* Asset File */}
                <div>
                  <Label>Asset File *</Label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className={cn(
                      "mt-2 border-2 border-dashed rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative group",
                      fileName ? "border-green-500/30 bg-green-500/5" : "border-white/10 hover:border-primary/50 hover:bg-white/5"
                    )}
                  >
                    {fileName ? (
                      <div className="space-y-2 text-center w-full px-4">
                        <div className="flex items-center justify-center gap-3">
                          {(() => {
                            const FileIcon = getFileIcon(fileName)
                            return <FileIcon className="h-8 w-8 text-green-500" />
                          })()}
                          <div className="text-left overflow-hidden">
                            <p className="text-sm font-medium truncate max-w-[150px]">{fileName}</p>
                            <p className="text-[10px] text-muted-foreground">{getFileTypeDescription(fileName)}</p>
                          </div>
                        </div>

                        {fileUploading ? (
                          <Progress value={progress} className="h-1.5" />
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setFileName(null)
                              setDownloadLink("")
                              setProgress(0)
                            }}
                            className="text-xs text-red-400 hover:text-red-300 hover:underline mt-1 block w-full"
                          >
                            Remove file
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center p-4">
                        {fileUploading ? (
                          <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary mb-2" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                            <Upload className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <p className="text-sm font-medium">Upload Resource</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          ZIP, RAR, 7Z, LUA, JS (Max 100MB)
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".zip,.rar,.7z,.tar,.gz,.txt,.md,.lua,.js,.json,.xml,.html,.css,.sql,.pdf,.doc,.docx,.exe,.dll,.cfg,.ini,.conf,.yml,.yaml"
                    onChange={uploadFile}
                    className="hidden"
                  />
                </div>

                {/* Direct Link */}
                <div className="pt-2 border-t border-white/5">
                  <Label className="flex items-center gap-2 mb-2 text-xs text-muted-foreground uppercase tracking-wider">
                    <Link2 className="h-3 w-3" />Alternative
                  </Label>
                  <Input
                    value={downloadLink}
                    onChange={(e) => setDownloadLink(e.target.value)}
                    placeholder="External download link..."
                    className={cn(
                      "bg-secondary/50 border-white/10 text-xs h-9",
                      downloadLink ? "border-green-500/50" : ""
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card className="glass border-white/10 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
              <CardHeader className="bg-white/5 border-b border-white/5 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-yellow-500" />Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium text-sm">Premium Asset</p>
                    <p className="text-xs text-muted-foreground">Charge coins for download</p>
                  </div>
                  <Switch checked={isPremium} onCheckedChange={setIsPremium} />
                </div>

                <div className={cn(
                  "space-y-2 transition-all duration-300 opacity-0 h-0 overflow-hidden",
                  isPremium && "opacity-100 h-auto"
                )}>
                  <Label>Price (Coins)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={10000}
                    value={coinPrice}
                    onChange={(e) => setCoinPrice(parseInt(e.target.value) || 0)}
                    className="bg-secondary/50 border-white/10"
                  />
                  <p className="text-[10px] text-muted-foreground">Use 0 for Free</p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={cn(
                  "w-full h-14 text-lg font-bold shadow-lg transition-all hover:scale-[1.02]",
                  canSubmit ? "bg-gradient-to-r from-primary to-pink-600 hover:shadow-primary/25" : "opacity-70"
                )}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    Submit Asset
                  </>
                )}
              </Button>

              {!canSubmit && !submitting && (
                <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                  <p className="text-xs text-red-400">
                    {!title || title.length < 3 ? "Title required (min 3 chars)" :
                      !description || description.length < 10 ? "Description required (min 10 chars)" :
                        !downloadLink ? "File or download link required" : "Please check errors"}
                  </p>
                </div>
              )}
            </div>

            {/* Development Tools - Only show in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="space-y-4 pt-4 border-t border-white/5 opacity-50 hover:opacity-100 transition-opacity">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground text-center">Dev Tools</p>
                <UploadTestButton />
                <DiscordWebhookTest />
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}