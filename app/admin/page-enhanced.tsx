import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { AdvancedAnalytics } from "@/components/admin/advanced-analytics"
import { UserManagement } from "@/components/admin/user-management"
import { AssetManagement } from "@/components/admin/asset-management"
import { ForumManagement } from "@/components/admin/forum-management"
import { SecurityMonitoring } from "@/components/admin/security-monitoring"
import { RealtimeSystem } from "@/components/realtime-system"
import { LoadingSpinner } from "@/components/loading-spinner"
import { BarChart3, Users, Package, MessageSquare, Shield, Activity, Settings, Bell, Search, Menu, Crown, Zap, TrendingUp, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { motion } from "framer-motion"

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.isAdmin) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-yellow-500" />
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
            </div>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <Zap className="h-3 w-3 mr-1" />
              Super Admin
            </Badge>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
              <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                3
              </Badge>
            </Button>
            <Button variant="outline" size="sm">
              <Search className="h-4 w-4 mr-2" />
              Quick Search
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Quick Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">System Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-lg font-bold">Operational</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-full bg-green-100">
                    <Activity className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent" />
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                    <div className="flex items-center gap-2 mt-1">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span className="text-lg font-bold">1,234</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent" />
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Reviews</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="text-lg font-bold">47</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-full bg-orange-100">
                    <Package className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent" />
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Security Alerts</p>
                    <div className="flex items-center gap-2 mt-1">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-lg font-bold">2</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-full bg-red-100">
                    <Shield className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent" />
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Real-time System */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Real-time System Monitor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<LoadingSpinner />}>
                <RealtimeSystem />
              </Suspense>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Admin Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="analytics" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 h-12">
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="assets" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Assets
              </TabsTrigger>
              <TabsTrigger value="forum" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Forum
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                System
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Suspense fallback={<LoadingSpinner />}>
                  <AdvancedAnalytics />
                </Suspense>
              </motion.div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Suspense fallback={<LoadingSpinner />}>
                  <UserManagement />
                </Suspense>
              </motion.div>
            </TabsContent>

            <TabsContent value="assets" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Suspense fallback={<LoadingSpinner />}>
                  <AssetManagement />
                </Suspense>
              </motion.div>
            </TabsContent>

            <TabsContent value="forum" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Suspense fallback={<LoadingSpinner />}>
                  <ForumManagement />
                </Suspense>
              </motion.div>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Suspense fallback={<LoadingSpinner />}>
                  <SecurityMonitoring />
                </Suspense>
              </motion.div>
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>System Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Maintenance Mode</span>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span>Database Backup</span>
                        <Button variant="outline" size="sm">Run Backup</Button>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span>Cache Management</span>
                        <Button variant="outline" size="sm">Clear Cache</Button>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span>System Logs</span>
                        <Button variant="outline" size="sm">View Logs</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>CPU Usage</span>
                          <span>23%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: "23%" }}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Memory Usage</span>
                          <span>67%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: "67%" }}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Disk Usage</span>
                          <span>45%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-600 h-2 rounded-full" style={{ width: "45%" }}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Network I/O</span>
                          <span>12%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{ width: "12%" }}></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>FiveM Tools V7 Admin Dashboard</span>
            <Separator orientation="vertical" className="h-4" />
            <span>Version 7.0.0</span>
            <Separator orientation="vertical" className="h-4" />
            <span>Last updated: {new Date().toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              All Systems Operational
            </Badge>
          </div>
        </div>
      </footer>
    </div>
  )
}