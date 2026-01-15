"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface MessageNotification {
  id: string
  title: string
  message: string
  data: {
    sender_id: string
    sender_name: string
    sender_avatar: string | null
    message_preview: string
  }
  created_at: string
}

export function FloatingMessageNotifications() {
  const { data: session } = useSession()
  const router = useRouter()
  const [notification, setNotification] = useState<MessageNotification | null>(null)
  const [lastCheck, setLastCheck] = useState(Date.now())
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio on mount
  useEffect(() => {
    audioRef.current = new Audio('/sound/sound.wav')
    audioRef.current.volume = 0.7
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Function to play notification sound
  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch((err) => {
        console.warn('Could not play notification sound:', err)
      })
    }
  }, [])

  useEffect(() => {
    if (!session?.user) return

    const checkMessages = async () => {
      try {
        const res = await fetch('/api/notifications')
        if (!res.ok) return
        const data = await res.json()
        
        const messageNotifs = data.filter((n: any) => 
          n.type === 'message' && 
          !n.read && 
          new Date(n.created_at).getTime() > lastCheck
        )

        if (messageNotifs.length > 0) {
          setNotification(messageNotifs[0])
          setLastCheck(Date.now())
          // Play sound when new message notification arrives
          playNotificationSound()
        }
      } catch (error) {
        console.error('Failed to check messages:', error)
      }
    }

    checkMessages()
    const interval = setInterval(checkMessages, 10000)
    return () => clearInterval(interval)
  }, [session, lastCheck, playNotificationSound])

  const handleClick = () => {
    if (notification) {
      router.push('/messages')
      setNotification(null)
    }
  }

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    setNotification(null)
  }

  return (
    <AnimatePresence mode="wait">
      {notification && (
        <motion.div
          key={notification.id}
          initial={{ opacity: 0, x: 400, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 400, scale: 0.8 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-20 right-6 z-50 max-w-sm w-full mx-4 sm:mx-0 cursor-pointer"
          onClick={handleClick}
        >
          <div className="relative overflow-hidden rounded-2xl border-2 border-blue-500/40 shadow-2xl backdrop-blur-xl bg-gradient-to-br from-gray-900/98 via-blue-900/20 to-gray-900/98">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none" />
            
            <div className="relative p-5">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-0.5">
                    <img
                      src={notification.data.sender_avatar || "/placeholder.svg?height=48&width=48"}
                      alt={notification.data.sender_name}
                      className="w-full h-full rounded-full object-cover border-2 border-background"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg?height=48&width=48"
                      }}
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-blue-400" />
                      <h4 className="font-bold text-sm text-white">
                        New Message
                      </h4>
                    </div>
                    <button
                      onClick={handleClose}
                      className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-xs text-blue-300 font-medium mb-2">
                    From {notification.data.sender_name}
                  </p>

                  <p className="text-sm text-gray-200 leading-relaxed line-clamp-2">
                    {notification.data.message_preview}
                  </p>

                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-blue-400 font-medium">
                      Click to view message →
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
