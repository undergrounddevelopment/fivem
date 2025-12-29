"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { MessageSquare, CheckCircle, XCircle, Clock, User, Eye, AlertTriangle, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface PendingThread {
  id: string
  title: string
  content: string
  status: string
  created_at: string
  author: {
    discord_id: string
    username: string
    avatar: string
    membership: string
  } | null
  category: {
    id: string
    name: string
    color: string
  } | null
}

export default function AdminForumPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth()
  const [threads, setThreads] = useState<PendingThread[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedThread, setSelectedThread] = useState<PendingThread | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [processing, setProcessing] = useState<string | null>(null)

  const fetchPendingThreads = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/forum/pending")
      if (!res.ok) throw new Error("Failed to fetch pending threads")
      const data = await res.json()

      const normalizedThreads = (data.threads || []).map((thread: PendingThread) => ({
        ...thread,
        author: thread.author || { username: "Unknown", avatar: "", membership: "free" },
        category: thread.category || null,
      }))

      setThreads(normalizedThreads)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setThreads([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAdmin) {
      fetchPendingThreads()
    }
  }, [isAdmin, fetchPendingThreads])

  const handleAction = async (threadId: string, action: "approve" | "reject") => {
    setProcessing(threadId)
    try {
      const res = await fetch("/api/admin/forum/pending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          action,
          reason: action === "reject" ? rejectReason : undefined,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setThreads(threads.filter((t) => t.id !== threadId))
        setSelectedThread(null)
        setRejectReason("")
      } else {
        alert(data.error || "Action failed")
      }
    } catch (error) {
      console.error("Action failed:", error)
      alert("Failed to process action")
    } finally {
      setProcessing(null)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
          <p className="text-muted-foreground">Admin access required</p>
        </div>
      </div>
    )
  }

  return (
    <div>
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <MessageSquare className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Forum Moderation</h1>
              <p className="text-muted-foreground">Review and approve community forum posts</p>
            </div>
            <Badge variant="secondary" className="ml-auto text-lg px-4 py-2">
              {threads.length} Pending
            </Badge>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {error}
              <Button variant="outline" size="sm" className="ml-auto bg-transparent" onClick={fetchPendingThreads}>
                Retry
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass rounded-xl p-6 animate-pulse">
                  <div className="h-6 w-1/3 bg-secondary/50 rounded mb-4" />
                  <div className="h-4 w-2/3 bg-secondary/50 rounded" />
                </div>
              ))}
            </div>
          ) : threads.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">All Caught Up!</h3>
              <p className="text-muted-foreground">No pending forum posts to review</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Thread List */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Clock className="h-5 w-5 text-warning" />
                  Pending Approval
                </h2>
                {threads.map((thread) => (
                  <div
                    key={thread.id}
                    onClick={() => setSelectedThread(thread)}
                    className={`glass rounded-xl p-4 cursor-pointer transition-all hover:bg-secondary/30 ${
                      selectedThread?.id === thread.id ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-secondary overflow-hidden">
                        <img
                          src={thread.author?.avatar || "/placeholder.svg"}
                          alt={thread.author?.username || "Unknown"}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{thread.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <User className="h-3 w-3" />
                          <span>{thread.author?.username || "Unknown"}</span>
                          <span>•</span>
                          <span>
                            {formatDistanceToNow(new Date(thread.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        {thread.category && (
                          <Badge variant="outline" className="mt-2" style={{ borderColor: thread.category.color }}>
                            {thread.category.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Thread Preview */}
              <div className="lg:sticky lg:top-6">
                {selectedThread ? (
                  <div className="glass rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Eye className="h-5 w-5 text-primary" />
                        Preview
                      </h2>
                      <Badge variant="outline" className="text-warning border-warning">
                        Pending Review
                      </Badge>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-foreground mb-2">{selectedThread.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <img
                          src={selectedThread.author?.avatar || "/placeholder.svg"}
                          alt={selectedThread.author?.username || "Unknown"}
                          className="h-6 w-6 rounded-full"
                        />
                        <span>{selectedThread.author?.username || "Unknown"}</span>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(selectedThread.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <div className="prose prose-sm max-w-none text-muted-foreground bg-secondary/30 rounded-xl p-4 max-h-64 overflow-y-auto">
                        {selectedThread.content}
                      </div>
                    </div>

                    {/* Reject Reason Input */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Rejection Reason (optional)
                      </label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Provide a reason if rejecting..."
                        className="w-full h-20 rounded-xl border border-border bg-secondary/30 p-3 text-foreground resize-none text-sm"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleAction(selectedThread.id, "approve")}
                        disabled={processing === selectedThread.id}
                        className="flex-1 bg-success hover:bg-success/90 gap-2"
                      >
                        {processing === selectedThread.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleAction(selectedThread.id, "reject")}
                        disabled={processing === selectedThread.id}
                        variant="destructive"
                        className="flex-1 gap-2"
                      >
                        {processing === selectedThread.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        Reject
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="glass rounded-2xl p-12 text-center">
                    <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Select a thread to preview</p>
                  </div>
                )}
              </div>
            </div>
          )}
    </div>
  )
}
