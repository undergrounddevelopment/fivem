'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'

interface SystemStatus {
  success: boolean
  health_score: number
  status: 'healthy' | 'degraded' | 'error'
  connections: {
    supabase_client: boolean
    supabase_server: boolean
    supabase_admin: boolean
    database_verified: boolean
  }
  database: {
    tables: {
      total: number
      existing: number
      missing: string[]
      percentage: number
    }
  }
  features: Record<string, boolean>
  summary: {
    overall: string
    database: string
    auth: string
    connections: string
  }
  response_time_ms: number
}

export function ConnectionStatus() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/status-complete', {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      const data = await response.json()
      setStatus(data)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Failed to fetch status:', error)
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    
    if (autoRefresh) {
      const interval = setInterval(fetchStatus, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const getStatusIcon = (isHealthy: boolean) => {
    if (loading) return <Loader2 className="h-4 w-4 animate-spin" />
    if (isHealthy) return <CheckCircle className="h-4 w-4 text-green-500" />
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusColor = (score: number) => {
    if (score >= 90) return 'bg-green-500'
    if (score >= 70) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (loading && !status) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading system status...</span>
        </CardContent>
      </Card>
    )
  }

  if (!status) {
    return (
      <Card className="w-full border-red-200">
        <CardContent className="flex items-center justify-center p-6">
          <XCircle className="h-6 w-6 text-red-500 mr-2" />
          <span>Failed to load system status</span>
          <Button onClick={fetchStatus} variant="outline" size="sm" className="ml-4">
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Overall Status */}
      <Card className={`border-2 ${
        status.health_score >= 90 ? 'border-green-200 bg-green-50' :
        status.health_score >= 70 ? 'border-yellow-200 bg-yellow-50' :
        'border-red-200 bg-red-50'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(status.health_score >= 80)}
              FiveM Tools V7 - System Status
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={status.health_score >= 90 ? 'default' : status.health_score >= 70 ? 'secondary' : 'destructive'}>
                {status.health_score}% Health
              </Badge>
              <Button 
                onClick={fetchStatus} 
                variant="outline" 
                size="sm"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Health Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>System Health</span>
                <span>{status.health_score}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${getStatusColor(status.health_score)}`}
                  style={{ width: `${status.health_score}%` }}
                />
              </div>
            </div>

            {/* Quick Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">Overall:</span>
                <span>{status.summary.overall}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Database:</span>
                <span>{status.summary.database}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Auth:</span>
                <span>{status.summary.auth}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Connections:</span>
                <span>{status.summary.connections}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Database Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              {getStatusIcon(status.database.tables.percentage === 100)}
              Database Tables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Tables:</span>
                <span>{status.database.tables.existing}/{status.database.tables.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${status.database.tables.percentage}%` }}
                />
              </div>
              <div className="text-sm text-gray-600">
                {status.database.tables.percentage}% Complete
              </div>
              {status.database.tables.missing.length > 0 && (
                <div className="text-sm text-red-600">
                  Missing: {status.database.tables.missing.join(', ')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Connections Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              {getStatusIcon(Object.values(status.connections).every(Boolean))}
              Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(status.connections).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{key.replace('_', ' ')}:</span>
                  <Badge variant={value ? 'default' : 'destructive'} className="text-xs">
                    {value ? '✅ Connected' : '❌ Failed'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Features Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              {getStatusIcon(Object.values(status.features).filter(Boolean).length >= 8)}
              Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(status.features).slice(0, 6).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{key.replace('_', ' ')}:</span>
                  <Badge variant={value ? 'default' : 'secondary'} className="text-xs">
                    {value ? '✅' : '⚠️'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <span>Response Time: {status.response_time_ms}ms</span>
          {lastUpdate && (
            <span>Last Updated: {lastUpdate.toLocaleTimeString()}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 cursor-pointer">
            <input 
              type="checkbox" 
              checked={autoRefresh} 
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4"
            />
            Auto Refresh
          </label>
        </div>
      </div>
    </div>
  )
}