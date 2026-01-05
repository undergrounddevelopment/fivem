"use client"

import type React from "react"
import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { CoinIcon } from "@/components/coin-icon"
import { Separator } from "@/components/ui/separator"
import {
  Upload,
  ImageIcon,
  FileCode,
  X,
  Plus,
  Loader2,
  CheckCircle,
  Wand2,
  LinkIcon,
  Youtube,
  Github,
  ArrowRight,
  Code,
  Car,
  Building,
  Shirt,
  Sparkles,
  Info,
  Bold,
  Italic,
  Type,
  AtSign,
  Eye,
  MoreHorizontal,
  List,
  ListOrdered,
  AlignLeft,
  Smile,
  Link2,
  Quote,
  Table,
  Minus,
  Undo,
  Redo,
  Paperclip,
  FileImage,
  Send,
  AlertCircle,
  Home,
} from "lucide-react"
import { detectCategory } from "@/lib/auto-category"
import { toast } from "sonner"
import { autoCleanText } from "@/lib/text-formatter"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const CATEGORIES = [
  {
    id: "scripts",
    name: "Scripts",
    icon: Code,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500",
  },
  {
    id: "vehicles",
    name: "Vehicles",
    icon: Car,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500",
  },
  {
    id: "mlo",
    name: "MLO / Maps",
    icon: Building,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500",
  },
  {
    id: "clothing",
    name: "Clothing",
    icon: Shirt,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    border: "border-pink-500",
  },
]

const FRAMEWORKS = [
  { id: "standalone", name: "Standalone", desc: "Works with any framework", color: "text-gray-500" },
  { id: "qbcore", name: "QBCore", desc: "QBCore Framework", color: "text-blue-500" },
  { id: "esx", name: "ESX", desc: "ESX Framework", color: "text-orange-500" },
  { id: "qbox", name: "QBox", desc: "QBox Framework", color: "text-purple-500" },
]

// Modern Thread Editor Component
function ThreadEditor({
  value,
  onChange,
  placeholder,
  minHeight = "300px",
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  minHeight?: string
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [history, setHistory] = useState<string[]>([value])
  const [historyIndex, setHistoryIndex] = useState(0)

  const insertText = useCallback(
    (before: string, after = "", placeholder = "") => {
      const textarea = textareaRef.current
      if (!textarea) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = value.substring(start, end) || placeholder
      const newValue = value.substring(0, start) + before + selectedText + after + value.substring(end)

      onChange(newValue)
      setHistory((prev) => [...prev.slice(0, historyIndex + 1), newValue])
      setHistoryIndex((prev) => prev + 1)

      setTimeout(() => {
        textarea.focus()
        const newCursorPos = start + before.length + selectedText.length
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      }, 0)
    },
    [value, onChange, historyIndex],
  )

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1)
      onChange(history[historyIndex - 1])
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1)
      onChange(history[historyIndex + 1])
    }
  }

  const renderMarkdown = useCallback((text: string) => {
    // Sanitize input to prevent XSS
    const sanitized = text
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")

    return sanitized
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/#{1,6}\s+(.+)/g, (match, content) => {
        const level = match.match(/^#+/)?.[0].length || 1
        return `<h${level}>${content}</h${level}>`
      })
      .replace(/\n/g, "<br>")
  }, [])

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-muted/30 border-b border-border flex-wrap">
        {/* Text Formatting Group */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-border">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => insertText("**", "**", "bold")}
                >
                  <Bold className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bold</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => insertText("*", "*", "italic")}
                >
                  <Italic className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Italic</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                <Type className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => insertText("# ", "\n", "Heading 1")}>
                <span className="text-xl font-bold">H1</span>
                <span className="ml-2 text-muted-foreground">Heading 1</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertText("## ", "\n", "Heading 2")}>
                <span className="text-lg font-bold">H2</span>
                <span className="ml-2 text-muted-foreground">Heading 2</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertText("### ", "\n", "Heading 3")}>
                <span className="text-base font-bold">H3</span>
                <span className="ml-2 text-muted-foreground">Heading 3</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => insertText("@", "", "username")}
                >
                  <AtSign className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Mention</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => insertText("~~", "~~", "strikethrough")}>
                <span className="line-through">Strikethrough</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertText("<sub>", "</sub>", "subscript")}>Subscript</DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertText("<sup>", "</sup>", "superscript")}>
                Superscript
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* List & Paragraph Group */}
        <div className="flex items-center gap-0.5 px-2 border-r border-border">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => insertText("\n- ", "\n", "List item")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bullet List</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => insertText("\n1. ", "\n", "List item")}
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Numbered List</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                  <AlignLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Align Left</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Media Group */}
        <div className="flex items-center gap-0.5 px-2 border-r border-border">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                  <Smile className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Emoji</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => insertText("[", "](url)", "link text")}
                >
                  <Link2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Insert Link</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => insertText("![", "](image-url)", "alt text")}
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Insert Image</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => insertText("\n> ", "\n", "Quote")}
                >
                  <Quote className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Quote</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    insertText("\n| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n", "")
                  }
                >
                  <Table className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Insert Table</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => insertText("\n\n---\n\n", "")}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Divider</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => insertText("\n```\n", "\n```\n", "code")}
                >
                  <Code className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Code Block</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Actions Group */}
        <div className="flex items-center gap-0.5 px-2 ml-auto">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleUndo}
                  disabled={historyIndex === 0}
                >
                  <Undo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <Button
            type="button"
            variant={showPreview ? "secondary" : "ghost"}
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
        </div>
      </div>

      {/* Editor / Preview */}
      {showPreview ? (
        <div
          className="p-4 prose prose-sm dark:prose-invert max-w-none"
          style={{ minHeight }}
          dangerouslySetInnerHTML={{
            __html: renderMarkdown(value) || `<span class="text-muted-foreground">${placeholder}</span>`,
          }}
        />
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-4 bg-transparent resize-none focus:outline-none text-sm leading-relaxed"
          style={{ minHeight }}
        />
      )}

      {/* Bottom Bar */}
      <div className="flex items-center gap-2 p-2 bg-muted/20 border-t border-border">
        <Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5 text-muted-foreground">
          <Paperclip className="h-4 w-4" />
          Attach files
        </Button>
        <span className="text-xs text-muted-foreground ml-auto">Supports Markdown formatting</span>
      </div>
    </div>
  )
}

export default function UploadPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  const thumbnailInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadedAssetId, setUploadedAssetId] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [isPremium, setIsPremium] = useState(false)

  const [autoDetected, setAutoDetected] = useState(false)
  const [detectionConfidence, setDetectionConfidence] = useState(0)

  const [thumbnailUploading, setThumbnailUploading] = useState(false)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [fileUploading, setFileUploading] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    features: "",
    installation: "",
    changelog: "",
    category: "scripts",
    framework: "standalone",
    coinPrice: 0,
    version: "1.0.0",
    tags: [] as string[],
    downloadLink: "",
    youtubeLink: "",
    githubLink: "",
    docsLink: "",
    thumbnail: "",
  })

  const [newTag, setNewTag] = useState("")

  const handleTitleChange = useCallback(
    (title: string) => {
      setFormData((prev) => ({ ...prev, title }))
      if (title.length >= 3) {
        try {
          const result = detectCategory(title, formData.description)
          if (result) {
            setFormData((prev) => ({
              ...prev,
              category: result.category || prev.category,
              framework: result.framework || prev.framework,
              tags: [...new Set([...prev.tags, ...(result.suggestedTags || [])])].slice(0, 10),
            }))
            setAutoDetected(true)
            setDetectionConfidence(result.confidence || 0)
          }
        } catch (e) {
          console.error("Auto-detection failed:", e)
        }
      }
    },
    [formData.description],
  )

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim()) && formData.tags.length < 10) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, newTag.trim()] }))
      setNewTag("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))
  }

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB")
      return
    }

    setThumbnailUploading(true)
    setThumbnailPreview(URL.createObjectURL(file))

    try {
      const formDataUpload = new FormData()
      formDataUpload.append("file", file)
      formDataUpload.append("folder", "thumbnails")

      const res = await fetch("/api/upload/blob", {
        method: "POST",
        body: formDataUpload,
      })

      if (!res.ok) throw new Error("Upload failed")

      const data = await res.json()
      setFormData((prev) => ({ ...prev, thumbnail: data.url }))
      toast.success("Thumbnail uploaded!")
    } catch (error) {
      toast.error("Failed to upload thumbnail")
      setThumbnailPreview(null)
    } finally {
      setThumbnailUploading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 50 * 1024 * 1024) {
      toast.error("File must be less than 50MB")
      return
    }

    setFileUploading(true)
    setUploadedFileName(file.name)

    try {
      const formDataUpload = new FormData()
      formDataUpload.append("file", file)
      formDataUpload.append("folder", "assets")

      const res = await fetch("/api/upload/blob", {
        method: "POST",
        body: formDataUpload,
      })

      if (!res.ok) throw new Error("Upload failed")

      const data = await res.json()
      setFormData((prev) => ({ ...prev, downloadLink: data.url }))
      toast.success("File uploaded!")
    } catch (error) {
      toast.error("Failed to upload file")
      setUploadedFileName(null)
    } finally {
      setFileUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error("Please login to upload assets")
      return
    }

    if (!formData.title || formData.title.length < 3) {
      toast.error("Title must be at least 3 characters")
      return
    }

    if (!formData.description || formData.description.length < 10) {
      toast.error("Description must be at least 10 characters")
      return
    }

    if (!formData.downloadLink) {
      toast.error("Download link is required")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/upload/asset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: autoCleanText(formData.description),
          features: autoCleanText(formData.features) || null,
          installation: autoCleanText(formData.installation) || null,
          changelog: autoCleanText(formData.changelog) || null,
          category: formData.category,
          framework: formData.framework,
          coinPrice: isPremium ? formData.coinPrice : 0,
          tags: formData.tags,
          fileUrl: formData.downloadLink,
          thumbnailUrl: formData.thumbnail || null,
          version: formData.version || "1.0.0",
          youtubeLink: formData.youtubeLink || null,
          githubLink: formData.githubLink || null,
          docsLink: formData.docsLink || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Upload failed")
      }

      setUploadSuccess(true)
      setUploadedAssetId(data.asset?.id)
      toast.success(data.message || "Asset uploaded successfully!")

      setTimeout(() => {
        if (data.asset?.id) {
          router.push(`/asset/${data.asset.id}`)
        }
      }, 2000)
    } catch (err: any) {
      toast.error(err.message || "Failed to upload asset")
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceedToStep2 = formData.title.length >= 3 && formData.category && formData.framework
  const canProceedToStep3 = canProceedToStep2 && formData.description.length >= 10
  const canSubmit = canProceedToStep3 && formData.downloadLink

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
            <Card className="max-w-md w-full border-amber-500/20 bg-gradient-to-b from-amber-500/5 to-transparent">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/20">
                  <AlertCircle className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Login Required</h2>
                <p className="text-muted-foreground mb-6">
                  Please login with Discord to upload assets and share your creations with the community.
                </p>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => (window.location.href = "/api/auth/signin/discord")}
                    className="w-full h-12 bg-[#5865F2] hover:bg-[#4752C4] gap-2 text-base"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.077.077 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                    Login with Discord
                  </Button>
                  <Button variant="outline" onClick={() => router.push("/")} className="w-full h-12 gap-2">
                    <Home className="h-4 w-4" />
                    Back to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
      </div>
    )
  }

  if (uploadSuccess) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
            <Card className="max-w-md w-full border-emerald-500/20 bg-gradient-to-b from-emerald-500/5 to-transparent">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Upload Successful!</h2>
                <p className="text-muted-foreground mb-6">
                  Your asset has been submitted for review. You will be notified once it&apos;s approved.
                </p>
                <Button onClick={() => router.push(`/asset/${uploadedAssetId}`)} className="gap-2">
                  View Your Asset
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <div className="blur-orb" style={{ top: '5%', left: '15%', opacity: 0.2 }} />
      <div className="blur-orb" style={{ top: '50%', right: '10%', opacity: 0.15 }} />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-pink-600 flex items-center justify-center shadow-lg shadow-primary/20">
                <Upload className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Create New Asset</h1>
                <p className="text-muted-foreground">Share your creation with the FiveM community</p>
              </div>
            </div>

              {/* Progress Steps */}
              <div className="flex items-center gap-2 mt-6">
                {[
                  { step: 1, label: "Basic Info" },
                  { step: 2, label: "Content" },
                  { step: 3, label: "Files & Pricing" },
                ].map((item, index) => (
                  <div key={item.step} className="flex items-center gap-2 flex-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (item.step === 1) setCurrentStep(1)
                        else if (item.step === 2 && canProceedToStep2) setCurrentStep(2)
                        else if (item.step === 3 && canProceedToStep3) setCurrentStep(3)
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        currentStep === item.step
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                          : currentStep > item.step
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {currentStep > item.step ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <span className="h-5 w-5 rounded-full bg-current/20 flex items-center justify-center text-xs">
                          {item.step}
                        </span>
                      )}
                      <span className="hidden sm:inline">{item.label}</span>
                    </button>
                    {index < 2 && (
                      <div
                        className={`flex-1 h-0.5 rounded-full ${currentStep > item.step ? "bg-emerald-500" : "bg-muted"}`}
                      />
                    )}
                  </div>
                ))}
              </div>
          </motion.div>

          <form onSubmit={handleSubmit}>
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6 space-y-6">
                      {/* Title */}
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          Asset Title <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            value={formData.title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            placeholder="e.g., QB Advanced Banking System"
                            className="h-12 text-base pr-32"
                            required
                          />
                          {autoDetected && detectionConfidence > 60 && (
                            <Badge className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary/10 text-primary border-0">
                              <Wand2 className="h-3 w-3 mr-1" />
                              Auto-detected
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Choose a descriptive title that clearly describes your asset
                        </p>
                      </div>

                      {/* Category Selection */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold">
                          Category <span className="text-destructive">*</span>
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {CATEGORIES.map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, category: cat.id }))}
                              className={`relative p-4 rounded-xl border-2 transition-all text-left group ${
                                formData.category === cat.id
                                  ? `${cat.border} ${cat.bg} shadow-lg`
                                  : "border-border hover:border-muted-foreground/50 hover:bg-muted/30"
                              }`}
                            >
                              <div className={`inline-flex p-2.5 rounded-xl ${cat.bg} mb-3`}>
                                <cat.icon className={`h-5 w-5 ${cat.color}`} />
                              </div>
                              <div className="font-semibold text-sm">{cat.name}</div>
                              {formData.category === cat.id && (
                                <div className="absolute top-2 right-2">
                                  <CheckCircle className={`h-4 w-4 ${cat.color}`} />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Framework Selection */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold">
                          Framework <span className="text-destructive">*</span>
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {FRAMEWORKS.map((fw) => (
                            <button
                              key={fw.id}
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, framework: fw.id }))}
                              className={`p-3 rounded-xl border-2 transition-all text-left ${
                                formData.framework === fw.id
                                  ? "border-primary bg-primary/5 shadow-md"
                                  : "border-border hover:border-primary/50 hover:bg-muted/30"
                              }`}
                            >
                              <div className={`font-semibold text-sm ${formData.framework === fw.id ? fw.color : ""}`}>
                                {fw.name}
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5">{fw.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Version */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Version</Label>
                          <Input
                            value={formData.version}
                            onChange={(e) => setFormData((prev) => ({ ...prev, version: e.target.value }))}
                            placeholder="1.0.0"
                            className="h-11"
                          />
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Tags (max 10)</Label>
                        <div className="flex gap-2">
                          <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Add a tag and press Enter..."
                            className="h-11"
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                          />
                          <Button
                            type="button"
                            onClick={handleAddTag}
                            variant="outline"
                            size="icon"
                            className="h-11 w-11 bg-transparent"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {formData.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {formData.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="pl-3 pr-1 py-1.5 gap-1 text-sm">
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTag(tag)}
                                  className="ml-1 hover:bg-foreground/10 rounded p-0.5"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      disabled={!canProceedToStep2}
                      className="gap-2"
                    >
                      Continue to Content
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Content Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6 space-y-6">
                      {/* Description - Main Thread Editor */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold flex items-center gap-2">
                          <FileCode className="h-4 w-4 text-primary" />
                          Description <span className="text-destructive">*</span>
                        </Label>
                        <ThreadEditor
                          value={formData.description}
                          onChange={(value) => setFormData((prev) => ({ ...prev, description: value }))}
                          placeholder="Describe your asset in detail. What does it do? What problems does it solve? Include any important information users should know..."
                          minHeight="250px"
                        />
                      </div>

                      {/* Features */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold">Features (Optional)</Label>
                        <ThreadEditor
                          value={formData.features}
                          onChange={(value) => setFormData((prev) => ({ ...prev, features: value }))}
                          placeholder="List the main features of your asset:&#10;- Feature 1&#10;- Feature 2&#10;- Feature 3"
                          minHeight="150px"
                        />
                      </div>

                      {/* Installation */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold">Installation Guide (Optional)</Label>
                        <ThreadEditor
                          value={formData.installation}
                          onChange={(value) => setFormData((prev) => ({ ...prev, installation: value }))}
                          placeholder="How to install and configure this asset:&#10;1. Download the file&#10;2. Extract to your resources folder&#10;3. Add to server.cfg"
                          minHeight="150px"
                        />
                      </div>

                      {/* Changelog */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold">Changelog (Optional)</Label>
                        <ThreadEditor
                          value={formData.changelog}
                          onChange={(value) => setFormData((prev) => ({ ...prev, changelog: value }))}
                          placeholder="## Version 1.0.0&#10;- Initial release"
                          minHeight="120px"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setCurrentStep(1)} className="gap-2">
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      disabled={!canProceedToStep3}
                      className="gap-2"
                    >
                      Continue to Files
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Files & Pricing */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* File Uploads */}
                  <Card>
                    <CardContent className="p-6 space-y-6">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-primary" />
                        Media & Files
                      </h3>

                      {/* Thumbnail Upload */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold">Thumbnail Image</Label>
                        <div
                          onClick={() => thumbnailInputRef.current?.click()}
                          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:border-primary/50 hover:bg-muted/20 ${
                            thumbnailPreview ? "border-primary bg-primary/5" : "border-border"
                          }`}
                        >
                          <input
                            ref={thumbnailInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleThumbnailUpload}
                            className="hidden"
                          />
                          {thumbnailUploading ? (
                            <div className="flex flex-col items-center gap-2">
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                              <span className="text-sm text-muted-foreground">Uploading...</span>
                            </div>
                          ) : thumbnailPreview ? (
                            <div className="relative">
                              <img
                                src={thumbnailPreview || "/placeholder.svg"}
                                alt="Thumbnail preview"
                                className="max-h-48 mx-auto rounded-lg shadow-lg"
                              />
                              <Badge className="absolute top-2 right-2 bg-emerald-500 gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Uploaded
                              </Badge>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-3">
                              <div className="p-4 rounded-full bg-muted">
                                <FileImage className="h-8 w-8 text-muted-foreground" />
                              </div>
                              <div>
                                <span className="text-sm font-medium">Click to upload thumbnail</span>
                                <p className="text-xs text-muted-foreground mt-1">
                                  PNG, JPG up to 5MB - Recommended: 1280x720
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Asset File Upload */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold">
                          Asset File <span className="text-destructive">*</span>
                        </Label>
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:border-primary/50 hover:bg-muted/20 ${
                            uploadedFileName ? "border-emerald-500 bg-emerald-500/5" : "border-border"
                          }`}
                        >
                          <input ref={fileInputRef} type="file" onChange={handleFileUpload} className="hidden" />
                          {fileUploading ? (
                            <div className="flex flex-col items-center gap-2">
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                              <span className="text-sm text-muted-foreground">Uploading file...</span>
                            </div>
                          ) : uploadedFileName ? (
                            <div className="flex flex-col items-center gap-3">
                              <div className="p-4 rounded-full bg-emerald-500/10">
                                <CheckCircle className="h-8 w-8 text-emerald-500" />
                              </div>
                              <div>
                                <span className="text-sm font-medium">{uploadedFileName}</span>
                                <p className="text-xs text-emerald-500 mt-1">File uploaded successfully</p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-3">
                              <div className="p-4 rounded-full bg-muted">
                                <Upload className="h-8 w-8 text-muted-foreground" />
                              </div>
                              <div>
                                <span className="text-sm font-medium">Click to upload asset file</span>
                                <p className="text-xs text-muted-foreground mt-1">ZIP, RAR, or any file up to 50MB</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* External Links */}
                      <div className="space-y-4 pt-4 border-t">
                        <Label className="text-sm font-semibold">External Links (Optional)</Label>
                        <div className="grid gap-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-red-500/10 shrink-0">
                              <Youtube className="h-4 w-4 text-red-500" />
                            </div>
                            <Input
                              placeholder="YouTube preview video URL"
                              value={formData.youtubeLink}
                              onChange={(e) => setFormData((prev) => ({ ...prev, youtubeLink: e.target.value }))}
                              className="h-11"
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-muted shrink-0">
                              <Github className="h-4 w-4" />
                            </div>
                            <Input
                              placeholder="GitHub repository URL"
                              value={formData.githubLink}
                              onChange={(e) => setFormData((prev) => ({ ...prev, githubLink: e.target.value }))}
                              className="h-11"
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-blue-500/10 shrink-0">
                              <LinkIcon className="h-4 w-4 text-blue-500" />
                            </div>
                            <Input
                              placeholder="Documentation URL"
                              value={formData.docsLink}
                              onChange={(e) => setFormData((prev) => ({ ...prev, docsLink: e.target.value }))}
                              className="h-11"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pricing */}
                  <Card>
                    <CardContent className="p-6 space-y-6">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <CoinIcon size="sm" />
                        Pricing
                      </h3>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 border">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${isPremium ? "bg-amber-500/10" : "bg-emerald-500/10"}`}>
                            {isPremium ? <CoinIcon size="md" /> : <CheckCircle className="h-6 w-6 text-emerald-500" />}
                          </div>
                          <div>
                            <div className="font-semibold text-base">{isPremium ? "Premium Asset" : "Free Asset"}</div>
                            <div className="text-sm text-muted-foreground">
                              {isPremium ? "Users pay coins to download" : "Available for everyone to download"}
                            </div>
                          </div>
                        </div>
                        <Switch checked={isPremium} onCheckedChange={setIsPremium} />
                      </div>

                      {isPremium && (
                        <div className="space-y-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                          <Label className="text-sm font-semibold">Coin Price</Label>
                          <div className="flex items-center gap-3">
                            <div className="relative flex-1 max-w-[200px]">
                              <Input
                                type="number"
                                min="1"
                                value={formData.coinPrice}
                                onChange={(e) =>
                                  setFormData((prev) => ({ ...prev, coinPrice: Number.parseInt(e.target.value) || 0 }))
                                }
                                className="h-12 text-lg pl-12 font-semibold"
                              />
                              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                <CoinIcon size="sm" />
                              </div>
                            </div>
                            <span className="text-muted-foreground font-medium">coins</span>
                          </div>
                          <div className="flex items-start gap-2 text-amber-700 dark:text-amber-300">
                            <Info className="h-4 w-4 mt-0.5 shrink-0" />
                            <span className="text-sm">
                              Users earn coins through daily rewards, spin wheel, and other activities.
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setCurrentStep(2)} className="gap-2">
                      Back
                    </Button>
                    <Button type="submit" disabled={isSubmitting || !canSubmit} className="gap-2 min-w-[180px]">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Submit for Review
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
    </div>
  )
}
