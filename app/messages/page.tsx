"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-provider"
import {
  Plus,
  Search,
  Send,
  MoreVertical,
  Smile,
  Loader2,
  MessageSquare,
  Crown,
  Shield,
  Check,
  CheckCheck,
  Bell,
  BellOff,
  ImagePlus,
  X,
  ArrowLeft,
  Mail,
} from "lucide-react"
import { toast } from "sonner"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"

interface User {
  id: string
  discordId: string
  username: string
  avatar: string | null
  membership: string
}

interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  createdAt: string
  read: boolean
  sender?: User
  receiver?: User
  image?: string
}

interface Conversation {
  id: string
  user: User
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function MessagesPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const toUserId = searchParams?.get("to") ?? null

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [imageUploading, setImageUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const lastMessageCountRef = useRef(0)

  const { data: conversationsData, mutate: mutateConversations } = useSWR(
    user ? "/api/messages/conversations" : null,
    fetcher,
    { refreshInterval: 0 },
  )
  const conversations = conversationsData?.conversations || []
  
  const currentPartnerId = selectedConversation?.user.discordId || null

  const { data: messagesData, mutate: mutateMessages } = useSWR(
    currentPartnerId ? `/api/messages?userId=${currentPartnerId}` : null,
    fetcher,
    { refreshInterval: 0 },
  )
  const messages = messagesData?.messages || []

  // Supabase Realtime Subscription
  useEffect(() => {
    if (!user) return

    const supabase = createClient()
    if (!supabase) return

    const currentUserId = user.discordId || user.id

    console.log("[Messages] Enabling Realtime for user:", currentUserId)

    const channel = supabase
      .channel('messages_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${currentUserId}`
        },
        (payload) => {
          console.log("[Messages] Outgoing message change:", payload)
          mutateConversations()
          if (currentPartnerId && (payload.new as any).receiver_id === currentPartnerId) {
             mutateMessages()
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${currentUserId}`
        },
        (payload) => {
          console.log("[Messages] Incoming message change:", payload)
          mutateConversations()
          
          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new as any
            // If currently chatting with this person, refresh messages
            if (currentPartnerId && newMsg.sender_id === currentPartnerId) {
               mutateMessages()
               // Also mark as read in background
               fetch("/api/messages/read", {
                 method: "POST",
                 headers: { "Content-Type": "application/json" },
                 body: JSON.stringify({ otherUserId: currentPartnerId }),
               })
            }
          } else {
             mutateMessages()
          }
        }
      )
      .subscribe((status) => {
        console.log("[Messages] Subscription status:", status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, currentPartnerId, mutateMessages, mutateConversations])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (messages.length > lastMessageCountRef.current && lastMessageCountRef.current > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.senderId !== user?.id && notificationsEnabled) {
        const audio = new Audio("/notification.mp3")
        audio.volume = 0.3
        audio.play().catch(() => {})

        if (Notification.permission === "granted") {
          new Notification("New Message", {
            body: lastMessage.content.substring(0, 50),
            icon: selectedConversation?.user.avatar || "/placeholder.svg",
          })
        }
      }
    }
    lastMessageCountRef.current = messages.length
  }, [messages, user?.id, notificationsEnabled, selectedConversation])

  useEffect(() => {
    if (toUserId && user) {
      startConversationWithUser(toUserId)
    }
  }, [toUserId, user])

  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  const startConversationWithUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/profile/${userId}`)
      if (res.ok) {
        const data = await res.json()
        const userInfo: User = {
          id: data.user.id,
          discordId: data.user.discordId || userId,
          username: data.user.username,
          avatar: data.user.avatar,
          membership: data.user.membership,
        }
        setSelectedConversation({
          id: userId,
          user: userInfo,
          lastMessage: "",
          lastMessageAt: new Date().toISOString(),
          unreadCount: 0,
        })
      }
    } catch (error) {
      console.error("Failed to start conversation:", error)
    }
  }

  const selectConversation = (conv: Conversation) => {
    setSelectedConversation(conv)
    lastMessageCountRef.current = 0
    fetch("/api/messages/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otherUserId: conv.user.discordId }),
    }).then(() => mutateConversations())
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setImageUploading(true)
    setImagePreview(URL.createObjectURL(file))

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "messages")

      const res = await fetch("/api/upload/blob", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("Upload failed")

      const data = await res.json()
      setImageUrl(data.url)
      toast.success("Image ready to send!")
    } catch (error) {
      toast.error("Failed to upload image")
      setImagePreview(null)
    } finally {
      setImageUploading(false)
    }
  }

  const clearImage = () => {
    setImagePreview(null)
    setImageUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const sendMessage = async () => {
    if ((!newMessage.trim() && !imageUrl) || !selectedConversation || isSending) return

    setIsSending(true)
    try {
      const messageContent = imageUrl ? `${newMessage.trim()}\n[Image: ${imageUrl}]` : newMessage.trim()

      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: selectedConversation.user.discordId,
          content: messageContent,
        }),
      })

      if (res.ok) {
        setNewMessage("")
        clearImage()
        mutateMessages()
        mutateConversations()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to send message")
      }
    } catch (error) {
      toast.error("Failed to send message")
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) return "Just now"
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    return date.toLocaleDateString()
  }

  const renderMessageContent = (content: string) => {
    const imageMatch = content.match(/\[Image: (https?:\/\/[^\]]+)\]/)
    if (imageMatch) {
      const textContent = content.replace(/\[Image: https?:\/\/[^\]]+\]/, "").trim()
      return (
        <>
          {textContent && <p className="mb-2">{textContent}</p>}
          <img
            src={imageMatch[1] || "/placeholder.svg"}
            alt="Shared image"
            className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(imageMatch[1], "_blank")}
          />
        </>
      )
    }
    return <p>{content}</p>
  }

  const filteredConversations = conversations.filter((conv: Conversation) =>
    conv.user.username.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const totalUnread = conversations.reduce((sum: number, conv: Conversation) => sum + conv.unreadCount, 0)

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background relative">
        <div className="blur-orb" style={{ top: '20%', left: '10%', opacity: 0.15 }} />
        <div className="blur-orb" style={{ top: '60%', right: '15%', opacity: 0.1 }} />
        
        <div className="container mx-auto p-6 flex items-center justify-center min-h-[60vh] relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <p className="text-muted-foreground">Loading messages...</p>
          </motion.div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Effects */}
      <div className="blur-orb" style={{ top: '5%', left: '5%', opacity: 0.1 }} />
      <div className="blur-orb" style={{ top: '70%', right: '10%', opacity: 0.08 }} />

      <div className="flex h-[calc(100vh-8rem)] relative z-10 max-w-7xl mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        {/* Conversations List */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`
            w-full md:w-80 border-r border-white/10 glass flex flex-col
            ${selectedConversation ? 'hidden md:flex' : 'flex'}
          `}
        >
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-pink-600 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Messages</h2>
                  {totalUnread > 0 && (
                    <span className="text-xs text-muted-foreground">{totalUnread} unread</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 rounded-xl"
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  title={notificationsEnabled ? "Mute notifications" : "Enable notifications"}
                >
                  {notificationsEnabled ? (
                    <Bell className="h-4 w-4 text-primary" />
                  ) : (
                    <BellOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
                {/* <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl">
                  <Plus className="h-5 w-5" />
                </Button> */}
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-card/50 backdrop-blur-sm border-white/10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {!conversationsData ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20 animate-pulse">
                    <div className="h-12 w-12 rounded-full bg-secondary/50" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-24 bg-secondary/50 rounded" />
                      <div className="h-3 w-32 bg-secondary/50 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No conversations yet</p>
                <p className="text-xs text-muted-foreground/70">Start a conversation from a user profile</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredConversations.map((conv: Conversation) => (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      selectedConversation?.id === conv.id
                        ? "bg-primary/10 border border-primary/20 shadow-sm"
                        : "hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={conv.user.avatar || "/placeholder.svg?height=48&width=48&query=user"}
                        alt={conv.user.username}
                        className="h-12 w-12 rounded-xl object-cover"
                      />
                      {conv.user.membership === "vip" && (
                        <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-amber-500/20 flex items-center justify-center backdrop-blur-sm border border-amber-500/20">
                          <Crown className="h-3 w-3 text-amber-500" />
                        </div>
                      )}
                      {conv.user.membership === "admin" && (
                        <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-red-500/20 flex items-center justify-center backdrop-blur-sm border border-red-500/20">
                          <Shield className="h-3 w-3 text-red-500" />
                        </div>
                      )}
                      {conv.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary animate-pulse border border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`font-medium text-sm ${conv.unreadCount > 0 ? 'text-primary' : ''}`}>
                          {conv.user.username}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{formatTime(conv.lastMessageAt)}</span>
                      </div>
                      <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                        {conv.lastMessage.includes("[Image:") ? 
                          <span className="flex items-center gap-1"><ImagePlus className="h-3 w-3" /> Sent an image</span> : 
                          conv.lastMessage
                        }
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shrink-0 shadow-lg shadow-primary/20">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Chat Area */}
        <div className={`flex-1 flex-col glass ${selectedConversation ? 'flex' : 'hidden md:flex'}`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-background/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="md:hidden h-9 w-9 -ml-2 rounded-xl"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  
                  <div className="relative">
                    <img
                      src={selectedConversation.user.avatar || "/placeholder.svg?height=44&width=44&query=user"}
                      alt={selectedConversation.user.username}
                      className="h-10 w-10 rounded-xl object-cover ring-2 ring-white/10"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></span>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 text-sm md:text-base">
                      {selectedConversation.user.username}
                      {selectedConversation.user.membership === "vip" && (
                        <span className="h-5 px-2 rounded-full bg-amber-500/20 text-amber-500 text-[10px] font-medium flex items-center gap-1">
                          <Crown className="h-3 w-3" /> VIP
                        </span>
                      )}
                      {selectedConversation.user.membership === "admin" && (
                        <span className="h-5 px-2 rounded-full bg-red-500/20 text-red-500 text-[10px] font-medium flex items-center gap-1">
                          <Shield className="h-3 w-3" /> Admin
                        </span>
                      )}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                   {/* <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground">
                    <MoreVertical className="h-5 w-5" />
                  </Button> */}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar bg-black/5">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <MessageSquare className="h-10 w-10 text-primary" />
                    </div>
                    <p className="text-muted-foreground font-medium">No messages yet</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">Send a message to start the conversation</p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {messages.map((msg: Message, index) => {
                      const isMe = msg.senderId === user.id
                      const isConsecutive = index > 0 && messages[index - 1].senderId === msg.senderId
                      
                      return (
                        <motion.div 
                          key={msg.id} 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className={`flex gap-3 ${isMe ? "justify-end" : ""}`}
                        >
                          {!isMe && !isConsecutive && (
                            <img
                              src={selectedConversation.user.avatar || "/placeholder.svg?height=32&width=32&query=user"}
                              alt=""
                              className="h-8 w-8 rounded-lg shrink-0 mt-1"
                            />
                          )}
                          {!isMe && isConsecutive && <div className="w-8 shrink-0" />}
                          
                          <div className={`max-w-[85%] md:max-w-[70%] ${isMe ? "order-1" : ""}`}>
                            <div
                              className={`rounded-2xl px-4 py-3 shadow-sm ${
                                isMe 
                                  ? "bg-primary text-primary-foreground rounded-br-sm" 
                                  : "bg-white/10 backdrop-blur-sm rounded-bl-sm"
                              }`}
                            >
                              {renderMessageContent(msg.content)}
                            </div>
                            <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : ""}`}>
                              <span className="text-[10px] text-muted-foreground">{formatTime(msg.createdAt)}</span>
                              {isMe &&
                                (msg.read ? (
                                  <CheckCheck className="h-3 w-3 text-primary" />
                                ) : (
                                  <Check className="h-3 w-3 text-muted-foreground" />
                                ))}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Image Preview */}
              <AnimatePresence>
                {imagePreview && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 py-3 border-t border-white/10 bg-black/20"
                  >
                    <div className="relative inline-block group">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="h-24 w-24 object-cover rounded-xl border border-white/20 shadow-lg"
                      />
                      {imageUploading && (
                        <div className="absolute inset-0 bg-background/60 rounded-xl flex items-center justify-center backdrop-blur-sm">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      )}
                      <button 
                        onClick={clearImage} 
                        className="absolute -top-2 -right-2 p-1.5 bg-destructive rounded-full shadow-lg hover:bg-destructive/90 transition-colors"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input */}
              <div className="p-4 border-t border-white/10 bg-background/50 backdrop-blur-md">
                <div className="flex items-end gap-2 bg-secondary/30 p-2 rounded-2xl border border-white/5 focus-within:border-primary/30 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl shrink-0 text-muted-foreground hover:text-foreground hover:bg-white/10"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={imageUploading}
                  >
                    <ImagePlus className="h-5 w-5" />
                  </Button>
                  
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="flex-1 min-h-[44px] max-h-32 py-3 bg-transparent border-none focus-visible:ring-0 resize-none px-2"
                  />
                  
                  {/* <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl shrink-0 text-muted-foreground hover:text-foreground hover:bg-white/10"
                  >
                    <Smile className="h-5 w-5" />
                  </Button> */}
                  
                  <Button
                    size="icon"
                    className={`h-10 w-10 rounded-xl shrink-0 transition-all ${
                      (!newMessage.trim() && !imageUrl) || isSending || imageUploading
                        ? "opacity-50 grayscale" 
                        : "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                    }`}
                    onClick={sendMessage}
                    disabled={(!newMessage.trim() && !imageUrl) || isSending || imageUploading}
                  >
                    {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center p-8"
            >
              <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-primary/20 to-pink-500/20 flex items-center justify-center mb-6 animate-float">
                <MessageSquare className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3 gradient-text">Your Messages</h3>
              <p className="text-muted-foreground text-center max-w-md leading-relaxed">
                Select a conversation from the list to view messages, or start a new chat by visiting a user's profile.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
