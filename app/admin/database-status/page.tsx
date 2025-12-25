"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, RefreshCw, Database } from "lucide-react"

export default function DatabaseStatusPage() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [setupRunning, setSetupRunning] = useState(false)

  const checkStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/verify-db")
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error("Failed to check database status:", error)
    }
    setLoading(false)
  }

  const runSetup = async () => {
    setSetupRunning(true)
    try {
      const response = await fetch("/api/auto-setup-db")
      const data = await response.json()

      if (data.success) {
        alert("Database setup completed successfully!")
        await checkStatus()
      } else {
        alert(`Setup failed: ${data.message}\n\n${data.instructions || ""}`)
      }
    } catch (error) {
      alert(`Setup error: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
    setSetupRunning(false)
  }

  useEffect(() => {
    checkStatus()
  }, [])

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            Database Status
          </h1>
          <p className="text-muted-foreground mt-1">Monitor and manage database tables</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={checkStatus} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={runSetup} disabled={setupRunning}>
            <Database className="h-4 w-4 mr-2" />
            {setupRunning ? "Running Setup..." : "Run Auto Setup"}
          </Button>
        </div>
      </div>

      {status && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Connection Status</CardTitle>
              <CardDescription>Supabase connection configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">URL:</span>
                  <Badge variant="secondary">{status.config?.url}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Anon Key:</span>
                  <Badge variant={status.config?.hasAnonKey ? "default" : "destructive"}>
                    {status.config?.hasAnonKey ? "✓ Set" : "✗ Missing"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Service Key:</span>
                  <Badge variant={status.config?.hasServiceKey ? "default" : "destructive"}>
                    {status.config?.hasServiceKey ? "✓ Set" : "✗ Missing"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(status.tables || {}).map(([tableName, tableInfo]: [string, any]) => (
              <Card key={tableName}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{tableName}</CardTitle>
                    {tableInfo.exists ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={tableInfo.exists ? "default" : "destructive"}>
                        {tableInfo.exists ? "Exists" : "Missing"}
                      </Badge>
                    </div>
                    {tableInfo.exists && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Rows:</span>
                        <Badge variant="secondary">{tableInfo.count}</Badge>
                      </div>
                    )}
                    {tableInfo.error && <div className="text-xs text-red-500 mt-2">{tableInfo.error}</div>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {!status && !loading && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Failed to load database status. Click Refresh to try again.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
