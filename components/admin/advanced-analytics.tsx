"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown, Users, Download, MessageSquare, Coins, Eye, Activity, Calendar, Clock } from "lucide-react"
import { motion } from "framer-motion"

interface AnalyticsData {
  users: {
    total: number
    active: number
    new: number
    growth: number
  }
  assets: {
    total: number
    downloads: number
    uploads: number
    growth: number
  }
  forum: {
    threads: number
    replies: number
    active: number
    growth: number
  }
  revenue: {
    total: number
    monthly: number
    coins: number
    growth: number
  }
  traffic: Array<{
    date: string
    visitors: number
    pageViews: number
    downloads: number
  }>
  categories: Array<{
    name: string
    value: number
    color: string
  }>
  topAssets: Array<{
    id: string
    title: string
    downloads: number
    rating: number
    category: string
  }>
  userActivity: Array<{
    hour: string
    users: number
    activity: number
  }>
}

const COLORS = ['#3b82f6', '#8b5cf6', '#06d6a0', '#f59e0b', '#ef4444', '#ec4899']

export function AdvancedAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("7d")

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`)
      const result = await response.json()
      setData(result.data)
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-8 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!data) return null

  const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="relative overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">{value.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                {change >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {Math.abs(change)}%
                </span>
              </div>
            </div>
            <div className={`p-3 rounded-full ${color}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
        <div className="flex gap-2">
          {["24h", "7d", "30d", "90d"].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={data.users.total}
          change={data.users.growth}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Downloads"
          value={data.assets.downloads}
          change={data.assets.growth}
          icon={Download}
          color="bg-green-500"
        />
        <StatCard
          title="Forum Posts"
          value={data.forum.replies}
          change={data.forum.growth}
          icon={MessageSquare}
          color="bg-purple-500"
        />
        <StatCard
          title="Revenue"
          value={data.revenue.total}
          change={data.revenue.growth}
          icon={Coins}
          color="bg-yellow-500"
        />
      </div>

      {/* Charts */}
      <Tabs defaultValue="traffic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="activity">User Activity</TabsTrigger>
          <TabsTrigger value="assets">Top Assets</TabsTrigger>
        </TabsList>

        <TabsContent value="traffic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={data.traffic}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="pageViews"
                    stackId="1"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="downloads"
                    stackId="1"
                    stroke="#06d6a0"
                    fill="#06d6a0"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Asset Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.categories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {data.categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.categories.map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={(category.value / Math.max(...data.categories.map(c => c.value))) * 100}
                          className="w-20"
                        />
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {category.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Activity by Hour</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.userActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="users" fill="#3b82f6" name="Active Users" />
                  <Bar dataKey="activity" fill="#8b5cf6" name="Activity Score" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topAssets.map((asset, index) => (
                  <motion.div
                    key={asset.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold">{asset.title}</h4>
                        <p className="text-sm text-muted-foreground">{asset.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">{asset.downloads.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">downloads</p>
                      </div>
                      <Badge variant="secondary">
                        ⭐ {asset.rating.toFixed(1)}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.users.active}</div>
            <p className="text-xs text-muted-foreground">
              +{data.users.new} new users today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Server Load</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23%</div>
            <Progress value={23} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142ms</div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}