"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { RichTextEditor } from "@/components/rich-text-editor"
import { MessageSquare, Send, AlertCircle, CheckCircle, Tag, Sparkles } from "lucide-react"

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
  const [categories, setCategories] = useState<Category[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null)
  const [files, setFiles] = useState<UploadedFile[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/forum/categories")
        const data = await res.json()
        const categoriesArray = Array.isArray(data) ? data : data.categories || []
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
      const imageUrls = files.filter((f) => f.type === "image" && !f.error && !f.uploading).map((f) => f.url)

      const res = await fetch("/api/forum/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          categoryId,
          images: imageUrls,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        const isPending = data.status === "pending"
        setSubmitResult({
          success: true,
          message: isPending
            ? "Your post has been submitted and is awaiting admin approval."
            : "Your post has been published successfully!",
        })

        if (!isPending) {
          setTimeout(() => router.push(`/forum/thread/${data.id}`), 2000)
        } else {
          setTimeout(() => router.push("/forum"), 3000)
        }
      } else {
        setSubmitResult({
          success: false,
          message: data.error || "Failed to create thread",
        })
      }
    } catch {
      setSubmitResult({
        success: false,
        message: "An error occurred. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="md:ml-72 transition-all duration-300">
          <Header />
          <div className="flex items-center justify-center min-h-[80vh] p-6">
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
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="md:ml-72 transition-all duration-300">
        <Header />
        <div className="p-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-sm">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Create New Thread</h1>
              <p className="text-muted-foreground">Share your thoughts with the community</p>
            </div>
          </div>

          {/* Notice */}
          <div className="glass rounded-xl p-4 mb-6 border border-amber-500/30 bg-amber-500/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Moderation Notice</p>
                <p className="text-sm text-muted-foreground">
                  All new posts require admin approval before they become visible to the community.
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
            <div className="glass rounded-2xl p-6 space-y-5">
              {/* Category Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                  <Tag className="h-4 w-4 text-primary" />
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        categoryId === cat.id
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                          : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a descriptive title for your thread..."
                  className="bg-secondary/50 border-border h-12 text-lg"
                  maxLength={200}
                  required
                />
                <div className="flex justify-between mt-2">
                  <p className="text-xs text-muted-foreground">Make it clear and engaging</p>
                  <p className="text-xs text-muted-foreground">{title.length}/200</p>
                </div>
              </div>
            </div>

            {/* Content Editor */}
            <div className="glass rounded-2xl p-6">
              <label className="block text-sm font-medium text-foreground mb-3">
                Content <span className="text-red-500">*</span>
              </label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Write your post content here... Use the toolbar above for formatting."
                minHeight="300px"
                files={files}
                onFilesChange={setFiles}
                maxFiles={10}
              />
              <p className="text-xs text-muted-foreground mt-2">Minimum 10 characters. Supports Markdown formatting.</p>
            </div>

            {/* Submit Button */}
            <div className="flex items-center gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1 h-12">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !title.trim() || content.length < 10}
                className="flex-1 h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 gap-2"
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
      </main>
    </div>
  )
}
