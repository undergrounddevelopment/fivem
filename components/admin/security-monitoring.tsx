"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Shield, AlertTriangle, Eye, Lock, Zap, Activity, Globe, Server, Database, Users, FileText, Settings, CheckCircle, XCircle, Clock, TrendingUp, TrendingDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface SecurityEvent {
  id: string
  type: "login_attempt" | "rate_limit" | "suspicious_activity" | "malware_detected" | "ddos_attempt" | "unauthorized_access"
  severity: "low" | "medium" | "high" | "critical"
  source: string
  target?: string
  description: string
  timestamp: string
  status: "active" | "resolved" | "investigating"
  automated_response: boolean
  details: any
}

interface SecurityMetrics {
  threats_blocked: number
  login_attempts: number
  rate_limits_triggered: number
  malware_detected: number
  uptime_percentage: number
  response_time: number
  active_sessions: number
  failed_logins: number
}

interface FirewallRule {
  id: string
  name: string
  type: "allow" | "deny" | "rate_limit"
  source: string
  target: string
  action: string
  priority: number
  enabled: boolean
  created_at: string
  hit_count: number
}

export function SecurityMonitoring() {
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null)
  const [firewallRules, setFirewallRules] = useState<FirewallRule[]>([])
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30)
  const [filters, setFilters] = useState({
    severity: "all",
    type: "all",
    status: "all",
    timeRange: "24h"
  })

  useEffect(() => {
    fetchSecurityData()
    
    if (autoRefresh) {
      const interval = setInterval(fetchSecurityData, refreshInterval * 1000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, filters])

  const fetchSecurityData = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        severity: filters.severity,
        type: filters.type,
        status: filters.status,
        timeRange: filters.timeRange
      })
      
      const [eventsRes, metricsRes, rulesRes] = await Promise.all([
        fetch(`/api/admin/security/events?${params}`),
        fetch("/api/admin/security/metrics"),
        fetch("/api/admin/security/firewall")
      ])

      const [eventsData, metricsData, rulesData] = await Promise.all([
        eventsRes.json(),
        metricsRes.json(),
        rulesRes.json()
      ])

      if (eventsData.success) setEvents(eventsData.data)
      if (metricsData.success) setMetrics(metricsData.data)
      if (rulesData.success) setFirewallRules(rulesData.data)
      
    } catch (error) {
      console.error("Failed to fetch security data:", error)
      toast.error("Failed to load security data")
    } finally {
      setLoading(false)
    }
  }

  const handleEventAction = async (eventId: string, action: string) => {
    try {
      const response = await fetch(`/api/admin/security/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success(`Event ${action} successful`)
        fetchSecurityData()
      } else {
        toast.error(result.error || `Failed to ${action} event`)
      }
    } catch (error) {
      console.error(`Failed to ${action} event:`, error)
      toast.error(`Failed to ${action} event`)
    }
  }

  const handleFirewallRule = async (ruleId: string, action: string, data?: any) => {
    try {
      const response = await fetch(`/api/admin/security/firewall/${ruleId}`, {
        method: action === "delete" ? "DELETE" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...data })
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success(`Firewall rule ${action} successful`)
        fetchSecurityData()
      } else {
        toast.error(result.error || `Failed to ${action} rule`)
      }
    } catch (error) {
      console.error(`Failed to ${action} firewall rule:`, error)
      toast.error(`Failed to ${action} firewall rule`)
    }
  }

  const getSeverityBadge = (severity: string) => {
    const variants = {
      low: { variant: "secondary" as const, className: "bg-blue-100 text-blue-800" },
      medium: { variant: "default" as const, className: "bg-yellow-100 text-yellow-800" },
      high: { variant: "destructive" as const, className: "bg-orange-100 text-orange-800" },
      critical: { variant: "destructive" as const, className: "bg-red-100 text-red-800" }
    }
    
    const config = variants[severity as keyof typeof variants] || variants.low
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {severity.toUpperCase()}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { variant: "destructive" as const, icon: <AlertTriangle className="h-3 w-3" /> },
      resolved: { variant: "default" as const, icon: <CheckCircle className="h-3 w-3" />, className: "bg-green-100 text-green-800" },
      investigating: { variant: "secondary" as const, icon: <Eye className="h-3 w-3" /> }
    }
    
    const config = variants[status as keyof typeof variants] || variants.active
    
    return (
      <Badge variant={config.variant} className={`flex items-center gap-1 ${config.className || ""}`}>
        {config.icon}
        {status.toUpperCase()}
      </Badge>
    )
  }

  const getTypeIcon = (type: string) => {
    const icons = {
      login_attempt: <Users className="h-4 w-4" />,
      rate_limit: <Zap className="h-4 w-4" />,
      suspicious_activity: <Eye className="h-4 w-4" />,
      malware_detected: <Shield className="h-4 w-4" />,
      ddos_attempt: <Globe className="h-4 w-4" />,
      unauthorized_access: <Lock className="h-4 w-4" />
    }
    return icons[type as keyof typeof icons] || <AlertTriangle className="h-4 w-4" />
  }

  const SecurityMetricsCards = () => {
    if (!metrics) return null

    const metricCards = [
      {
        title: "Threats Blocked",
        value: metrics.threats_blocked,
        icon: Shield,
        color: "text-red-500",
        trend: "+12%"
      },
      {
        title: "Active Sessions",
        value: metrics.active_sessions,
        icon: Users,
        color: "text-blue-500",
        trend: "+5%"
      },
      {
        title: "System Uptime",
        value: `${metrics.uptime_percentage}%`,
        icon: Server,
        color: "text-green-500",
        trend: "+0.1%"
      },
      {
        title: "Response Time",
        value: `${metrics.response_time}ms`,
        icon: Activity,
        color: "text-purple-500",
        trend: "-8%"
      }
    ]

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <div className="flex items-center mt-2">
                      {metric.trend.startsWith('+') ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${
                        metric.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {metric.trend}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-100 ${metric.color}`}>
                    <metric.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    )
  }

  const EventsTab = () => (
    <div className="space-y-6">
      {/* Real-time Alerts */}
      <AnimatePresence>
        {events.filter(e => e.severity === "critical" && e.status === "active").map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <AlertTitle className="text-red-800">Critical Security Event</AlertTitle>
              <AlertDescription className="text-red-700">
                {event.description}
                <div className="flex gap-2 mt-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEventAction(event.id, "investigate")}
                  >
                    Investigate
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleEventAction(event.id, "block")}
                  >
                    Block Source
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Security Events</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(event.type)}
                      <span className="capitalize">{event.type.replace('_', ' ')}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getSeverityBadge(event.severity)}</TableCell>
                  <TableCell className="font-mono text-sm">{event.source}</TableCell>
                  <TableCell className="max-w-xs truncate">{event.description}</TableCell>
                  <TableCell>{getStatusBadge(event.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(event.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {event.status === "active" && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEventAction(event.id, "investigate")}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleEventAction(event.id, "block")}
                          >
                            <Lock className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )

  const FirewallTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Firewall Rules</h3>
        <Button>
          <Shield className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Hits</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {firewallRules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell>
                    <Badge variant={rule.type === "deny" ? "destructive" : "default"}>
                      {rule.type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{rule.source}</TableCell>
                  <TableCell>{rule.action}</TableCell>
                  <TableCell>{rule.priority}</TableCell>
                  <TableCell>{rule.hit_count.toLocaleString()}</TableCell>
                  <TableCell>
                    <Switch 
                      checked={rule.enabled}
                      onCheckedChange={(checked) => 
                        handleFirewallRule(rule.id, "toggle", { enabled: checked })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleFirewallRule(rule.id, "edit")}
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleFirewallRule(rule.id, "delete")}
                      >
                        <XCircle className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )

  const AnalyticsTab = () => {
    const chartData = [
      { time: "00:00", threats: 12, requests: 1200 },
      { time: "04:00", threats: 8, requests: 800 },
      { time: "08:00", threats: 25, requests: 2500 },
      { time: "12:00", threats: 45, requests: 4200 },
      { time: "16:00", threats: 38, requests: 3800 },
      { time: "20:00", threats: 22, requests: 2200 }
    ]

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Threat Detection Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="threats" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Threats Blocked"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Request Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="requests" 
                    stroke="#3b82f6" 
                    fill="#3b82f6"
                    fillOpacity={0.6}
                    name="Total Requests"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Security Metrics Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-500">247</div>
                <div className="text-sm text-muted-foreground">Threats Blocked Today</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-500">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime This Month</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-500">1,234</div>
                <div className="text-sm text-muted-foreground">Active Sessions</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-500">142ms</div>
                <div className="text-sm text-muted-foreground">Avg Response Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Security Monitoring</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch 
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <span className="text-sm">Auto Refresh</span>
          </div>
          <Select value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10s</SelectItem>
              <SelectItem value="30">30s</SelectItem>
              <SelectItem value="60">1m</SelectItem>
              <SelectItem value="300">5m</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Security Metrics */}
      <SecurityMetricsCards />

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={filters.severity} onValueChange={(value) => setFilters({ ...filters, severity: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="login_attempt">Login Attempts</SelectItem>
                <SelectItem value="rate_limit">Rate Limits</SelectItem>
                <SelectItem value="suspicious_activity">Suspicious Activity</SelectItem>
                <SelectItem value="malware_detected">Malware</SelectItem>
                <SelectItem value="ddos_attempt">DDoS Attempts</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.timeRange} onValueChange={(value) => setFilters({ ...filters, timeRange: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="events">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="firewall">Firewall Rules</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <EventsTab />
        </TabsContent>

        <TabsContent value="firewall">
          <FirewallTab />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}