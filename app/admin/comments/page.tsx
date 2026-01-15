"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, CheckCircle, XCircle, Trash2, MessageSquare, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  useEffect(() => {
    fetchComments()
  }, [filter])

  const fetchComments = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/comments?status=${filter}`)
      const data = await res.json()
      setComments(data.comments || [])
    } catch (error) {
      toast.error("Failed to load comments")
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'delete') => {
    try {
      if (action === 'delete' && !confirm("Delete this comment permanently?")) return

      const method = action === 'delete' ? 'DELETE' : 'PATCH'
      const body = action !== 'delete' ? JSON.stringify({ status: action === 'approve' ? 'approved' : 'rejected' }) : undefined
      
      const res = await fetch(`/api/admin/comments/${id}`, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body
      })

      if (res.ok) {
        toast.success(`Comment ${action}d successfully`)
        fetchComments()
      } else {
        throw new Error('Action failed')
      }
    } catch (error) {
      toast.error(`Failed to ${action} comment`)
    }
  }

  const stats = {
    total: comments.length,
    pending: comments.filter(c => c.status === 'pending').length,
    rejected: comments.filter(c => c.status === 'rejected').length
  }

  return (
    <div className="min-h-screen bg-transparent relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="blur-orb" style={{ top: '20%', right: '20%', background: 'rgba(236, 72, 153, 0.1)' }} />
      </div>

      <div className="flex items-center justify-between mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-xs font-medium">Dashboard</span>
            </Link>
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Comment Moderation</h1>
          <p className="text-muted-foreground">Review and moderate user comments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="glass border-white/10 hover:border-white/20 transition-all hover:scale-[1.02] cursor-default">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">{stats.total}</p>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1">Total Loaded</p>
          </CardContent>
        </Card>
        <Card className="glass border-white/10 hover:border-yellow-500/30 transition-all hover:scale-[1.02] cursor-default">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-yellow-500">{stats.pending}</p>
            <p className="text-xs font-medium text-yellow-500/70 uppercase tracking-widest mt-1">Pending Review</p>
          </CardContent>
        </Card>
        <Card className="glass border-white/10 hover:border-red-500/30 transition-all hover:scale-[1.02] cursor-default">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-red-500">{stats.rejected}</p>
            <p className="text-xs font-medium text-red-500/70 uppercase tracking-widest mt-1">Rejected</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 p-1 bg-white/5 rounded-xl border border-white/10 w-fit">
        {['all', 'pending', 'approved', 'rejected'].map((tab) => (
          <Button
            key={tab}
            variant="ghost"
            size="sm"
            onClick={() => setFilter(tab as any)}
            className={filter === tab ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-white"}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </div>

      <div className="glass rounded-xl border border-white/10 overflow-hidden shadow-2xl min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 text-muted-foreground animate-pulse">
            <div className="h-10 w-10 bg-white/10 rounded-lg mb-4" />
            <p>Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-muted-foreground">
            <MessageSquare className="h-10 w-10 mb-4 opacity-20" />
            <p>No comments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase">Author</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase">Content</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase">Context</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase">Status</th>
                  <th className="text-right py-4 px-6 text-xs font-medium text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {comments.map((comment) => (
                  <tr key={comment.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-white/10 overflow-hidden">
                            <img src={comment.author?.avatar || "/placeholder.svg"} className="h-full w-full object-cover" />
                        </div>
                        <div>
                            <p className="font-medium text-sm text-white">{comment.author?.username || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 max-w-md">
                      <p className="text-sm text-gray-300 line-clamp-2">{comment.content}</p>
                    </td>
                    <td className="py-4 px-6">
                        <Badge variant="outline" className="text-xs border-white/10">
                            {comment.asset_id ? 'Asset' : 'Forum'}
                        </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <Badge className={
                        comment.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                        comment.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-red-500/10 text-red-500'
                      }>
                        {comment.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        {comment.status === 'pending' && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => handleAction(comment.id, 'approve')} className="h-8 w-8 hover:text-green-500">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleAction(comment.id, 'reject')} className="h-8 w-8 hover:text-red-500">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleAction(comment.id, 'delete')} className="h-8 w-8 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
