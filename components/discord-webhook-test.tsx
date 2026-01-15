"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Settings,
  Bell,
  Shield,
  Activity
} from "lucide-react"
import { toast } from "sonner"

interface WebhookStatus {
  uploads: boolean
  admin: boolean
  logs: boolean
}

export function DiscordWebhookTest() {
  const [testing, setTesting] = useState(false)
  const [status, setStatus] = useState<WebhookStatus | null>(null)
  const [loading, setLoading] = useState(false)

  const checkWebhookStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/webhook/test')
      const data = await response.json()
      
      if (response.ok) {
        setStatus(data.configured)
        toast.success(`${data.total} webhook(s) configured`)
      } else {
        toast.error("Failed to check webhook status")
      }
    } catch (error) {
      toast.error("Error checking webhook status")
    } finally {
      setLoading(false)
    }
  }

  const testWebhook = async (type: 'uploads' | 'admin' | 'logs') => {
    setTesting(true)
    try {
      const response = await fetch('/api/webhook/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success(`✅ ${type} webhook working!`)
      } else {
        toast.error(`❌ ${type} webhook failed: ${data.message}`)
      }
    } catch (error) {
      toast.error(`Error testing ${type} webhook`)
    } finally {
      setTesting(false)
    }
  }

  const getStatusIcon = (configured: boolean) => {
    return configured ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    )
  }

  const webhookTypes = [
    {
      key: 'uploads' as const,
      name: 'Upload Notifications',
      description: 'Notifikasi asset baru yang diupload',
      icon: Bell,
      color: 'text-purple-500'
    },
    {
      key: 'admin' as const,
      name: 'Admin Alerts',
      description: 'Notifikasi untuk admin dan error sistem',
      icon: Shield,
      color: 'text-orange-500'
    },
    {
      key: 'logs' as const,
      name: 'Activity Logs',
      description: 'Log aktivitas sistem dan download',
      icon: Activity,
      color: 'text-blue-500'
    }
  ]

  return (
    <Card className="border-purple-500/20 bg-purple-50/50 dark:bg-purple-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
          <MessageSquare className="h-5 w-5" />
          Discord Webhook System
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Check */}
        <div className="flex items-center gap-2">
          <Button
            onClick={checkWebhookStatus}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Settings className="h-4 w-4 mr-2" />
            )}
            Check Status
          </Button>
          
          {status && (
            <div className="text-sm text-muted-foreground">
              {Object.values(status).filter(Boolean).length}/3 webhooks configured
            </div>
          )}
        </div>

        {/* Webhook Types */}
        {status && (
          <div className="space-y-3">
            {webhookTypes.map((webhook) => (
              <div key={webhook.key} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <webhook.icon className={`h-5 w-5 ${webhook.color}`} />
                  <div>
                    <div className="font-medium">{webhook.name}</div>
                    <div className="text-sm text-muted-foreground">{webhook.description}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusIcon(status[webhook.key])}
                  
                  {status[webhook.key] && (
                    <Button
                      onClick={() => testWebhook(webhook.key)}
                      disabled={testing}
                      size="sm"
                      variant="outline"
                    >
                      {testing ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        "Test"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Configuration Help */}
        <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
          <div className="font-medium mb-1">📝 Setup Instructions:</div>
          <div>1. Create Discord webhooks in your server settings</div>
          <div>2. Add webhook URLs to your .env file:</div>
          <div className="font-mono text-xs mt-1 ml-2">
            DISCORD_WEBHOOK_UPLOADS=https://discord.com/api/webhooks/...
          </div>
          <div className="font-mono text-xs ml-2">
            DISCORD_WEBHOOK_ADMIN=https://discord.com/api/webhooks/...
          </div>
          <div className="font-mono text-xs ml-2">
            DISCORD_WEBHOOK_LOGS=https://discord.com/api/webhooks/...
          </div>
        </div>
      </CardContent>
    </Card>
  )
}