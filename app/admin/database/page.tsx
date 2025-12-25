"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database, RefreshCw, CheckCircle, AlertTriangle, Loader2, Server, Table2 } from "lucide-react"
import { toast } from "sonner"

interface TableStatus {
  table: string
  status: string
  count: number
  error?: string
}

interface DatabaseStats {
  users: number
  assets: number
  banners: number
  announcements: number
  messages: number
  testimonials: number
}

export default function AdminDatabasePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [tables, setTables] = useState<TableStatus[]>([])
  const [lastSync, setLastSync] = useState<string | null>(null)

  useEffect(() => {
    fetchDatabaseStatus()
  }, [])

  const fetchDatabaseStatus = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/database/setup")
      const data = await res.json()

      if (data.success) {
        setStats(data.stats)
        setLastSync(new Date().toLocaleString())
        toast.success("Database status loaded")
      }
    } catch (error) {
      toast.error("Failed to fetch database status")
    } finally {
      setIsLoading(false)
    }
  }

  const verifyDatabase = async () => {
    setIsVerifying(true)
    try {
      const res = await fetch("/api/database/setup", {
        method: "POST",
      })
      const data = await res.json()

      if (data.success) {
        setTables(data.tables || [])
        toast.success("Database verification completed")
        fetchDatabaseStatus() // Refresh stats
      } else {
        toast.error(data.error || "Verification failed")
      }
    } catch (error) {
      toast.error("Failed to verify database")
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Database className="h-8 w-8" />
                  Database Management
                </h1>
                <p className="text-muted-foreground mt-1">Monitor and manage your Supabase database</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={fetchDatabaseStatus} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <Button onClick={verifyDatabase} disabled={isVerifying}>
                  {isVerifying ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Verify Database
                </Button>
              </div>
            </div>

            {/* Connection Status */}
            <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-emerald-500" />
                  Connection Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-emerald-500">Connected</p>
                    <p className="text-sm text-muted-foreground">Supabase Database - xnghnotodknxalkhzqvu</p>
                    {lastSync && <p className="text-xs text-muted-foreground mt-1">Last synced: {lastSync}</p>}
                  </div>
                  <Badge variant="outline" className="text-emerald-500 border-emerald-500">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Database Statistics */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(stats).map(([key, value]) => (
                  <Card key={key} className="bg-card/50">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{value.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground capitalize">{key}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Table Verification Results */}
            {tables.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Table2 className="h-5 w-5" />
                    Table Verification Results
                  </CardTitle>
                  <CardDescription>Status of all essential database tables</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {tables.map((table) => (
                      <div
                        key={table.table}
                        className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/50"
                      >
                        <div className="flex items-center gap-3">
                          {table.status === "ok" ? (
                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                          )}
                          <div>
                            <p className="font-medium">{table.table}</p>
                            {table.error && <p className="text-xs text-red-500">{table.error}</p>}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={table.status === "ok" ? "default" : "destructive"}>{table.status}</Badge>
                          {table.count !== undefined && (
                            <p className="text-xs text-muted-foreground mt-1">{table.count} rows</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage banners, announcements, and other database features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto flex-col gap-2 p-4 bg-transparent"
                    onClick={() => (window.location.href = "/admin/banners")}
                  >
                    <Database className="h-6 w-6" />
                    <div className="text-center">
                      <p className="font-semibold">Manage Banners</p>
                      <p className="text-xs text-muted-foreground">{stats?.banners || 0} banners</p>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto flex-col gap-2 p-4 bg-transparent"
                    onClick={() => (window.location.href = "/admin")}
                  >
                    <Server className="h-6 w-6" />
                    <div className="text-center">
                      <p className="font-semibold">Admin Dashboard</p>
                      <p className="text-xs text-muted-foreground">Full management</p>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto flex-col gap-2 p-4 bg-transparent"
                    onClick={() => (window.location.href = "/admin/users")}
                  >
                    <Table2 className="h-6 w-6" />
                    <div className="text-center">
                      <p className="font-semibold">User Management</p>
                      <p className="text-xs text-muted-foreground">{stats?.users || 0} users</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
