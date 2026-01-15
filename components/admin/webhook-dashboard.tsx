"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  MessageSquare, 
  TrendingUp, 
  Trophy, 
  UserPlus, 
  BarChart3, 
  Settings, 
  Send,
  CheckCircle,
  XCircle,
  Loader2,
  Bell,
  Activity,
  Users,
  Download
} from "lucide-react"
import { toast } from "sonner"

interface WebhookTest {
  type: string
  name: string
  description: string
  icon: any
  color: string
}

export function WebhookDashboard() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Record<string, any>>({})

  const webhookTests: WebhookTest[] = [
    {
      type: 'trending',
      name: 'Trending Asset',
      description: 'Test notifikasi asset yang sedang trending',
      icon: TrendingUp,
      color: 'text-orange-500'
    },
    {
      type: 'milestone',
      name: 'Download Milestone',
      description: 'Test notifikasi milestone downloads',
      icon: Trophy,
      color: 'text-yellow-500'
    },
    {
      type: 'new_member',
      name: 'New Member',
      description: 'Test notifikasi member baru',
      icon: UserPlus,
      color: 'text-blue-500'
    },
    {
      type: 'daily_report',
      name: 'Daily Report',
      description: 'Test laporan statistik harian',
      icon: BarChart3,
      color: 'text-green-500'
    },
    {
      type: 'maintenance_start',
      name: 'Maintenance Start',
      description: 'Test notifikasi mulai maintenance',
      icon: Settings,
      color: 'text-red-500'
    },
    {
      type: 'maintenance_end',
      name: 'Maintenance End',
      description: 'Test notifikasi selesai maintenance',
      icon: CheckCircle,
      color: 'text-green-600'
    }
  ]

  const testWebhook = async (type: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/webhook/advanced?test=${type}`)
      const data = await response.json()
      
      if (response.ok) {
        setResults(prev => ({ ...prev, [type]: { success: true, data } }))
        toast.success(`✅ ${type} webhook test berhasil!`)
      } else {
        setResults(prev => ({ ...prev, [type]: { success: false, error: data.error } }))
        toast.error(`❌ ${type} webhook test gagal: ${data.error}`)
      }
    } catch (error: any) {
      setResults(prev => ({ ...prev, [type]: { success: false, error: error.message } }))
      toast.error(`❌ Error testing ${type} webhook`)
    } finally {
      setLoading(false)
    }
  }

  const sendCustomWebhook = async (type: string, customData: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/webhook/advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data: customData })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success(`✅ Custom ${type} webhook sent!`)
      } else {
        toast.error(`❌ Failed to send webhook: ${data.error}`)
      }
    } catch (error: any) {
      toast.error(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getResultIcon = (type: string) => {
    const result = results[type]
    if (!result) return null
    
    return result.success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
          <MessageSquare className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Webhook Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage dan test Discord webhook notifications</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Upload Notifications</p>
                <p className="text-lg font-bold">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">System Status</p>
                <p className="text-lg font-bold">Operational</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Mentions</p>
                <p className="text-lg font-bold">@everyone @here</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Advanced Features</p>
                <p className="text-lg font-bold">6 Types</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Webhook Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Webhook Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {webhookTests.map((webhook) => (
              <div key={webhook.type} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <webhook.icon className={`h-5 w-5 ${webhook.color}`} />
                    <span className="font-medium">{webhook.name}</span>
                  </div>
                  {getResultIcon(webhook.type)}
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {webhook.description}
                </p>
                
                <Button
                  onClick={() => testWebhook(webhook.type)}
                  disabled={loading}
                  size="sm"
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Test Webhook
                </Button>
                
                {results[webhook.type] && (
                  <div className="mt-2 p-2 bg-muted rounded text-xs">
                    {results[webhook.type].success ? (
                      <span className="text-green-600">✅ Success</span>
                    ) : (
                      <span className="text-red-600">❌ {results[webhook.type].error}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Webhook Sender */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Webhook Sender</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Trending Asset */}
            <div className="space-y-3">
              <Label>🔥 Send Trending Notification</Label>
              <Input placeholder="Asset Title" id="trending-title" />
              <Input placeholder="Downloads Count" type="number" id="trending-downloads" />
              <Button 
                onClick={() => {
                  const title = (document.getElementById('trending-title') as HTMLInputElement)?.value
                  const downloads = (document.getElementById('trending-downloads') as HTMLInputElement)?.value
                  if (title && downloads) {
                    sendCustomWebhook('trending', {
                      asset: { id: 'custom', title, category: 'scripts', coin_price: 0 },
                      stats: { views: parseInt(downloads) * 3, downloads: parseInt(downloads), rating: 4.8 }
                    })
                  }
                }}
                size="sm"
                className="w-full"
              >
                Send Trending Alert
              </Button>
            </div>

            {/* Milestone */}
            <div className="space-y-3">
              <Label>🏆 Send Milestone Notification</Label>
              <Input placeholder="Asset Title" id="milestone-title" />
              <Input placeholder="Milestone Number" type="number" id="milestone-number" />
              <Button 
                onClick={() => {
                  const title = (document.getElementById('milestone-title') as HTMLInputElement)?.value
                  const milestone = (document.getElementById('milestone-number') as HTMLInputElement)?.value
                  if (title && milestone) {
                    sendCustomWebhook('milestone', {
                      asset: { id: 'custom', title, category: 'scripts', author_name: 'Admin' },
                      milestone: parseInt(milestone)
                    })
                  }
                }}
                size="sm"
                className="w-full"
              >
                Send Milestone Alert
              </Button>
            </div>
          </div>

          {/* Maintenance Notification */}
          <div className="space-y-3">
            <Label>🔧 Send Maintenance Notification</Label>
            <Textarea placeholder="Maintenance details..." id="maintenance-details" />
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  const details = (document.getElementById('maintenance-details') as HTMLTextAreaElement)?.value
                  sendCustomWebhook('maintenance', { action: 'start', details })
                }}
                size="sm"
                variant="outline"
                className="flex-1"
              >
                Start Maintenance
              </Button>
              <Button 
                onClick={() => {
                  const details = (document.getElementById('maintenance-details') as HTMLTextAreaElement)?.value
                  sendCustomWebhook('maintenance', { action: 'end', details })
                }}
                size="sm"
                className="flex-1"
              >
                End Maintenance
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webhook Configuration Info */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Upload Webhook:</span>
              <span className="text-green-600">✅ Configured</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mentions:</span>
              <span className="text-green-600">✅ @everyone @here Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Custom Emojis:</span>
              <span className="text-green-600">✅ 6 Categories + 5 Frameworks</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Advanced Features:</span>
              <span className="text-green-600">✅ 6 Notification Types</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}