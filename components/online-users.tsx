'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'
import Image from 'next/image'

interface OnlineUser {
  discord_id: string
  username: string
  avatar: string | null
  membership: string
}

export function OnlineUsers() {
  const [users, setUsers] = useState<OnlineUser[]>([])
  const [count, setCount] = useState(0)

  useEffect(() => {
    async function fetchOnline() {
      try {
        const res = await fetch('/api/users/online')
        const data = await res.json()
        setUsers(data.users || [])
        setCount(data.count || 0)
      } catch (error) {
        console.error('Failed to fetch online users:', error)
      }
    }

    fetchOnline()
    const interval = setInterval(fetchOnline, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Online Users ({count})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {users.length > 0 ? (
          <div className="space-y-2">
            {users.slice(0, 10).map((user) => (
              <div key={user.discord_id} className="flex items-center gap-2">
                <div className="relative h-8 w-8 rounded-full overflow-hidden bg-secondary">
                  {user.avatar ? (
                    <Image src={user.avatar} alt={user.username} fill className="object-cover" />
                  ) : (
                    <div className="h-full w-full bg-primary/20 flex items-center justify-center text-xs">
                      {user.username[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.username}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.membership}</p>
                </div>
                <div className="h-2 w-2 rounded-full bg-green-500" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No users online</p>
        )}
      </CardContent>
    </Card>
  )
}
