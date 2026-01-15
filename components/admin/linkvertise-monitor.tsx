'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, TrendingUp, Download, DollarSign, CheckCircle2 } from 'lucide-react'
import { LINKVERTISE_CONFIG } from '@/lib/linkvertise'

export function LinkvertiseMonitor() {
  const [stats, setStats] = useState({
    totalDownloads: 0,
    linkvertiseDownloads: 0,
    conversionRate: 0,
    estimatedRevenue: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/linkvertise-stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Linkvertise Monitor</h2>
          <p className="text-muted-foreground">Track monetization performance</p>
        </div>
        <Badge variant={LINKVERTISE_CONFIG.enabled ? 'default' : 'secondary'}>
          {LINKVERTISE_CONFIG.enabled ? (
            <>
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Active
            </>
          ) : (
            'Disabled'
          )}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDownloads}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Linkvertise Downloads</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.linkvertiseDownloads}</div>
            <p className="text-xs text-muted-foreground">Protected downloads</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">Success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Est. Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.estimatedRevenue}</div>
            <p className="text-xs text-muted-foreground">Based on CPM</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>Current Linkvertise settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Publisher ID:</span>
            <span className="text-sm font-mono">{LINKVERTISE_CONFIG.publisherId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Base URL:</span>
            <span className="text-sm font-mono">{LINKVERTISE_CONFIG.baseUrl}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Domain:</span>
            <span className="text-sm font-mono">{LINKVERTISE_CONFIG.websiteDomain}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge variant={LINKVERTISE_CONFIG.enabled ? 'default' : 'secondary'}>
              {LINKVERTISE_CONFIG.enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
