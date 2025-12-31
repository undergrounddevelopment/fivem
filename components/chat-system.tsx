"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, MessageCircle } from "lucide-react"
import { ForumRankBadge } from "./forum-rank-badge"

interface Message {
  id: string
  content: string
  createdAt: string
  author: {
    username: string
    avatar: string | null
    membership: string
    level: number
  }
  thread: {
    title: string
    id: string
  }
}

export function ChatSystem({ threadId }: { threadId?: string }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (threadId) {
      fetchReplies()
    } else {
      fetchMessages()
    }
  }, [threadId])

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages')
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const fetchReplies = async () => {
    try {
      const response = await fetch(`/api/forum/threads/${threadId}/replies`)
      const data = await response.json()
      setMessages(data.replies || [])
    } catch (error) {
      console.error('Failed to fetch replies:', error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    setLoading(true)
    try {
      const url = threadId ? `/api/forum/threads/${threadId}/replies` : '/api/messages'
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: newMessage,
          ...(threadId && { threadId })
        })
      })

      if (response.ok) {
        setNewMessage("")
        if (threadId) {
          fetchReplies()
        } else {
          fetchMessages()
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="glass rounded-2xl p-8 text-center border border-white/10" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
        <div className="relative inline-block mb-4">
          <MessageCircle className="h-16 w-16 text-[var(--primary)] animate-pulse" />
          <div className="absolute inset-0 blur-xl opacity-50" style={{ background: 'var(--primary)' }} />
        </div>
        <p className="text-[var(--textDim)] text-lg">Please login to participate in chat</p>
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl border border-white/10 overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
      <div className="p-6 border-b border-white/10" style={{ background: 'rgba(255, 20, 147, 0.1)' }}>
        <h3 className="flex items-center gap-3 text-xl font-bold text-[var(--text)]">
          <div className="p-2 rounded-xl" style={{ background: 'var(--primaryBg)' }}>
            <MessageCircle className="h-6 w-6 text-[var(--primary)]" />
          </div>
          {threadId ? 'Discussion' : 'Messages'}
        </h3>
      </div>
      <div className="p-6 space-y-4">
        <div className="max-h-96 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {messages.map((message) => (
            <div key={message.id} className="flex gap-3 group hover:bg-white/5 p-3 rounded-xl transition-all">
              <Avatar className="h-10 w-10 ring-2 ring-[var(--primary)]/30">
                <AvatarImage src={message.author.avatar || undefined} />
                <AvatarFallback className="bg-[var(--primaryBg)] text-[var(--primary)]">{message.author.username[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-sm text-[var(--text)]">{message.author.username}</span>
                  {message.author.level && <ForumRankBadge level={message.author.level} />}
                  <Badge className="text-xs px-2 py-0.5" style={{ background: 'var(--primaryBg)', color: 'var(--primary)', border: '1px solid var(--primary)' }}>
                    {message.author.membership}
                  </Badge>
                  <span className="text-xs text-[var(--textDim)] ml-auto">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-[var(--text)] leading-relaxed">{message.content}</p>
                {!threadId && message.thread && (
                  <p className="text-xs text-[var(--textDim)] mt-2 italic">
                    in: {message.thread.title}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <form onSubmit={sendMessage} className="flex gap-3 mt-4">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1 bg-white/5 border-white/20 focus:border-[var(--primary)] transition-all"
          />
          <Button 
            type="submit" 
            disabled={loading || !newMessage.trim()}
            className="px-6 transition-all hover:scale-105"
            style={{ background: 'var(--primary)', color: 'white' }}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
