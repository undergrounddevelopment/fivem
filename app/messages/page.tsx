"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
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
} from "lucide-react"
import { toast } from "sonner"
import useSWR from "swr"

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

  // SWR for conversations with auto-refresh
  const { data: conversationsData, mutate: mutateConversations } = useSWR(
    user ? "/api/messages/conversations" : null,
    fetcher,
    { refreshInterval: 5000 },
  )
  const conversations = conversationsData?.conversations || []

  // SWR for messages with faster polling when conversation is active
  const { data: messagesData, mutate: mutateMessages } = useSWR(
    selectedConversation ? `/api/messages?userId=${selectedConversation.user.discordId}` : null,
    fetcher,
    { refreshInterval: 2000 },
  )
  const messages = messagesData?.messages || []

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
    }
  }, [user, authLoading, router])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Play sound and show notification for new messages
  useEffect(() => {
    if (messages.length > lastMessageCountRef.current && lastMessageCountRef.current > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.senderId !== user?.id && notificationsEnabled) {
        // Play notification sound
        const audio = new Audio("/notification.mp3")
        audio.volume = 0.3
        audio.play().catch(() => {})

        // Show browser notification if permitted
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

  // Handle direct message from URL param
  useEffect(() => {
    if (toUserId && user) {
      startConversationWithUser(toUserId)
    }
  }, [toUserId, user])

  // Request notification permission
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
    // Mark as read
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
    // Check for image in message
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

  // Calculate total unread count
  const totalUnread = conversations.reduce((sum: number, conv: Conversation) => sum + conv.unreadCount, 0)

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex h-[calc(100vh-8rem)]">
          {/* Conversations List */}
          <div className="w-80 border-r border-border glass flex flex-col">
            <div className="p-4 border-b border-border/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-foreground">Messages</h2>
                  {totalUnread > 0 && (
                    <span className="flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {totalUnread}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 rounded-xl hover:bg-secondary"
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    title={notificationsEnabled ? "Mute notifications" : "Enable notifications"}
                  >
                    {notificationsEnabled ? (
                      <Bell className="h-4 w-4 text-primary" />
                    ) : (
                      <BellOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl hover:bg-secondary">
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 bg-secondary/50 border-border/50 rounded-xl"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {!conversationsData ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 px-4">
                  <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground text-center">No conversations yet</p>
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    Start a conversation from a user profile
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv: Conversation) => (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv)}
                    className={`w-full flex items-center gap-3 p-4 transition-colors border-l-2 ${
                      selectedConversation?.id === conv.id
                        ? "bg-primary/10 border-l-primary"
                        : "border-l-transparent hover:bg-secondary/30"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={conv.user.avatar || "/placeholder.svg?height=48&width=48&query=user"}
                        alt={conv.user.username}
                        className="h-12 w-12 rounded-xl object-cover"
                      />
                      {conv.user.membership === "vip" && (
                        <Crown className="absolute -bottom-1 -right-1 h-4 w-4 text-primary bg-background rounded-full p-0.5" />
                      )}
                      {conv.user.membership === "admin" && (
                        <Shield className="absolute -bottom-1 -right-1 h-4 w-4 text-destructive bg-background rounded-full p-0.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{conv.user.username}</span>
                        <span className="text-[10px] text-muted-foreground">{formatTime(conv.lastMessageAt)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.lastMessage.includes("[Image:") ? "Sent an image" : conv.lastMessage}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shrink-0 animate-pulse">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b border-border/50 glass">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={selectedConversation.user.avatar || "/placeholder.svg?height=44&width=44&query=user"}
                        alt={selectedConversation.user.username}
                        className="h-11 w-11 rounded-xl object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        {selectedConversation.user.username}
                        {selectedConversation.user.membership === "vip" && <Crown className="h-4 w-4 text-primary" />}
                        {selectedConversation.user.membership === "admin" && (
                          <Shield className="h-4 w-4 text-destructive" />
                        )}
                      </h3>
                      <p className="text-xs text-muted-foreground capitalize">
                        {selectedConversation.user.membership} Member
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">No messages yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Send a message to start the conversation</p>
                    </div>
                  ) : (
                    messages.map((msg: Message) => {
                      const isMe = msg.senderId === user.id
                      return (
                        <div key={msg.id} className={`flex gap-3 ${isMe ? "justify-end" : ""}`}>
                          {!isMe && (
                            <img
                              src={selectedConversation.user.avatar || "/placeholder.svg?height=32&width=32&query=user"}
                              alt=""
                              className="h-8 w-8 rounded-lg shrink-0 mt-1"
                            />
                          )}
                          <div className={`max-w-md ${isMe ? "order-1" : ""}`}>
                            <div
                              className={`rounded-2xl px-4 py-3 ${
                                isMe ? "bg-primary text-primary-foreground rounded-br-md" : "glass rounded-bl-md"
                              }`}
                            >
                              <div className={isMe ? "text-primary-foreground" : "text-foreground"}>
                                {renderMessageContent(msg.content)}
                              </div>
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
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="px-4 py-2 border-t border-border/50">
                    <div className="relative inline-block">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="h-20 w-20 object-cover rounded-lg"
                      />
                      {imageUploading && (
                        <div className="absolute inset-0 bg-background/80 rounded-lg flex items-center justify-center">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                      )}
                      <button onClick={clearImage} className="absolute -top-2 -right-2 p-1 bg-destructive rounded-full">
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-4 border-t border-border/50 glass">
                  <div className="flex items-center gap-3">
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
                      className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground shrink-0"
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
                      className="flex-1 h-11 bg-secondary/50 border-border/50 rounded-xl"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground shrink-0"
                    >
                      <Smile className="h-5 w-5" />
                    </Button>
                    <Button
                      size="icon"
                      className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 glow-sm shrink-0"
                      onClick={sendMessage}
                      disabled={(!newMessage.trim() && !imageUrl) || isSending || imageUploading}
                    >
                      {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center">
                <MessageSquare className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Your Messages</h3>
                <p className="text-muted-foreground text-center max-w-sm">
                  Select a conversation to view messages or start a new chat from a user profile
                </p>
              </div>
            )}
          </div>
    </div>
  )
}
