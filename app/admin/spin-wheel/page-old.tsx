"use client"

import { SpinWheelManager } from "@/components/admin/spin-wheel-manager"
import { useEffect, useState } from "react"
import { Loader2, History, Trophy } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface SpinLog {
  id: string
  user_id: string
  prize_name: string
  coins_won: number
  created_at: string
  user: {
    username: string
    avatar: string
  }
}

export default function AdminSpinWheelPage() {
  const [mounted, setMounted] = useState(false)
  const [recentSpins, setRecentSpins] = useState<SpinLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    fetchRecentSpins()
  }, [])

  const fetchRecentSpins = async () => {
    try {
      const res = await fetch('/api/admin/spin-wheel/logs')
      const data = await res.json()
      setRecentSpins(data.logs || [])
    } catch (error) {
      console.error('Failed to fetch spin logs:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SpinWheelManager />
      
      {/* Recent Spins Activity Log */}
      <Card className="bg-card/50 border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <History className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-lg">Recent Spin Activity</h3>
            <Badge variant="secondary" className="ml-auto">{recentSpins.length} spins</Badge>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : recentSpins.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No spin activity yet</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recentSpins.map((spin) => (
                <div key={spin.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <img
                    src={spin.user?.avatar || '/placeholder.svg'}
                    alt={spin.user?.username}
                    className="h-10 w-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">
                      <span className="text-foreground">{spin.user?.username || 'Unknown'}</span>
                      <span className="text-muted-foreground"> won </span>
                      <span className="text-primary font-bold">{spin.prize_name}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(spin.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500 font-bold">
                    <Trophy className="h-4 w-4" />
                    +{spin.coins_won}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
