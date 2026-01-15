"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { RichTextEditor } from "@/components/rich-text-editor"
import { 
  MessageSquare, Send, AlertCircle, CheckCircle, Tag, Sparkles, 
  ArrowLeft, Eye, FileText, Image, Hash, Info, Zap, PenLine,
  LayoutGrid
} from "lucide-react"
import { THREAD_TYPES } from "@/lib/thread-types"

interface Category {
  id: string
  name: string
  color: string
}

interface UploadedFile {
  id: string
  name: string
  url: string
  type: "image" | "file"
  uploading?: boolean
  error?: string
}

export default function NewThreadPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [threadType, setThreadType] = useState("discussion")
  const [categories, setCategories] = useState<Category[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null)
  const [files, setFiles] = useState<UploadedFile[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { getForumCategories } = await import('@/lib/actions/forum')
        const categoriesArray = await getForumCategories()
        if (categoriesArray.length > 0) {
          setCategories(categoriesArray)
          setCategoryId(categoriesArray[0].id)
        }
      } catch (error) {
        console.error("Failed to fetch categories")
      }
    }
    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setIsSubmitting(true)
    setSubmitResult(null)

    try {
      const { createForumThread } = await import('@/lib/actions/forum')
      const thread = await createForumThread({
        categoryId,
        title,
        content,
        threadType
      })

      setSubmitResult({
        success: true,
        message: "Your post has been submitted and is awaiting admin approval."
      })

      setTimeout(() => router.push("/forum"), 3000)
    } catch (error: any) {
      setSubmitResult({
        success: false,
        message: error.message || "Failed to create thread"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
            <div className="text-center glass rounded-2xl p-8 max-w-md">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Login Required</h2>
              <p className="text-muted-foreground mb-6">
                Please login with Discord to create a new thread and participate in the community.
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => {
                    // Trigger Discord login
                    window.location.href = "/api/auth/signin/discord"
                  }}
                  className="w-full h-12 bg-[#5865F2] hover:bg-[#4752C4] gap-2"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                  Login with Discord
                </Button>
                <Button variant="outline" onClick={() => router.push("/forum")} className="w-full h-12">
                  Back to Forum
                </Button>
              </div>
            </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Forum
          </Button>

          {/* Modern Hero Header */}
          <div className="relative overflow-hidden rounded-3xl glass mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-purple-500/20" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 p-6 md:p-8">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary via-pink-500 to-purple-500 flex items-center justify-center shadow-2xl shadow-primary/30">
                    <PenLine className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                    <Zap className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-pink-200 to-primary bg-clip-text text-transparent">
                      Create New Thread
                    </h1>
                    <Badge className="bg-primary/20 text-primary border-primary/30 hidden sm:flex">
                      <Sparkles className="h-3 w-3 mr-1" />
                      New
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm md:text-base">
                    Share your thoughts, ask questions, or start a discussion
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notice */}
          <div className="glass rounded-2xl p-4 mb-6 border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-orange-500/5">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                <Info className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="font-medium text-foreground">Moderation Notice</p>
                <p className="text-sm text-muted-foreground">
                  All new posts require admin approval before they become visible to the community. This helps maintain quality discussions.
                </p>
              </div>
            </div>
          </div>

          {/* Success/Error Message */}
          {submitResult && (
            <div
              className={`glass rounded-xl p-4 mb-6 ${
                submitResult.success ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"
              }`}
            >
              <div className="flex items-start gap-3">
                {submitResult.success ? (
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                )}
                <p className="text-foreground">{submitResult.message}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category & Title */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/5 bg-gradient-to-r from-purple-500/10 to-pink-500/5">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Hash className="h-4 w-4 text-purple-400" />
                  Thread Details
                </h3>
              </div>
              <div className="p-6 space-y-6">
                {/* Category Selection */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                    <Tag className="h-4 w-4 text-primary" />
                    Select Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoryId(cat.id)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                          categoryId === cat.id
                            ? "bg-gradient-to-r from-primary to-pink-500 text-white border-transparent shadow-lg shadow-primary/25"
                            : "bg-white/[0.03] border-white/10 text-muted-foreground hover:bg-white/[0.06] hover:border-primary/30 hover:text-foreground"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Thread Type Selection */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                    <LayoutGrid className="h-4 w-4 text-cyan-400" />
                    Select Thread Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {Object.values(THREAD_TYPES).map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setThreadType(type.id)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                          threadType === type.id
                            ? "text-white shadow-lg shadow-primary/10"
                            : "bg-white/[0.03] border-white/10 text-muted-foreground hover:bg-white/[0.06] hover:text-white"
                        }`}
                        style={threadType === type.id ? { 
                          backgroundColor: type.color,
                          borderColor: 'transparent'
                        } : {}}
                      >
                        <span className="text-sm">{type.icon}</span>
                        {type.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    <FileText className="h-4 w-4 text-cyan-400" />
                    Title <span className="text-red-400">*</span>
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a descriptive title for your thread..."
                    className="bg-white/[0.03] border-white/10 h-12 text-lg rounded-xl focus:border-primary/50 focus:ring-primary/20"
                    maxLength={200}
                    required
                  />
                  <div className="flex justify-between mt-2">
                    <p className="text-xs text-muted-foreground">Make it clear and engaging</p>
                    <p className={`text-xs ${title.length > 180 ? 'text-amber-400' : 'text-muted-foreground'}`}>
                      {title.length}/200
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Editor */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/5 bg-gradient-to-r from-cyan-500/10 to-blue-500/5">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <PenLine className="h-4 w-4 text-cyan-400" />
                  Content
                  <span className="text-red-400 text-sm">*</span>
                </h3>
              </div>
              <div className="p-6">
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Write your post content here... Use the toolbar above for formatting."
                  minHeight="300px"
                  files={files}
                  onFilesChange={setFiles}
                  maxFiles={10}
                />
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Image className="h-3 w-3" />
                      Images supported
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Markdown enabled
                    </span>
                  </div>
                  <p className={`text-xs ${content.length < 10 ? 'text-red-400' : 'text-green-400'}`}>
                    {content.length} characters {content.length < 10 && '(min 10)'}
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()} 
                className="h-12 rounded-xl border-white/10 hover:bg-white/5"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                type="button"
                variant="ghost"
                className="h-12 rounded-xl hover:bg-white/5"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !title.trim() || content.length < 10}
                className="flex-1 h-12 bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white font-semibold rounded-xl shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit for Review
                  </>
                )}
              </Button>
            </div>
          </form>
    </div>
  )
}
