"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, AlertCircle, Loader2, RefreshCw, Database, Zap } from "lucide-react"

interface TableStatus {
  exists: boolean
  columns?: string[]
  columnCount?: number
  error?: string
  code?: string
}

interface AnalysisResult {
  timestamp: string
  tables: Record<string, TableStatus>
  summary: {
    total: number
    existing: number
    missing: number
    errors: number
  }
  fixes: Array<{
    type: string
    table: string
    sql: string
  }>
}

export default function DatabaseStatusPage() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [sqlScript, setSqlScript] = useState<string>("")
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchAnalysis = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/database/analyze")
      const data = await res.json()
      setAnalysis(data)
    } catch (error) {
      console.error("Failed to fetch analysis:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFixes = async () => {
    try {
      setApplying(true)
      const res = await fetch("/api/admin/database/apply-fixes", {
        method: "POST"
      })
      const data = await res.json()
      
      if (data.sqlScript) {
        setSqlScript(data.sqlScript)
      }
      
      // Refresh analysis after applying
      setTimeout(() => {
        fetchAnalysis()
      }, 2000)
    } catch (error) {
      console.error("Failed to apply fixes:", error)
    } finally {
      setApplying(false)
    }
  }

  useEffect(() => {
    fetchAnalysis()

    if (autoRefresh) {
      const interval = setInterval(fetchAnalysis, 10000) // Refresh every 10 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  if (loading && !analysis) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            Database Status - Real-time
          </h1>
          <p className="text-muted-foreground mt-2">
            Last updated: {analysis?.timestamp ? new Date(analysis.timestamp).toLocaleString() : 'Never'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? "Auto Refresh: ON" : "Auto Refresh: OFF"}
          </Button>
          <Button onClick={fetchAnalysis} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={applyFixes} disabled={applying} variant="default">
            <Zap className="h-4 w-4 mr-2" />
            {applying ? "Applying..." : "Apply Fixes"}
          </Button>
        </div>
      </div>

      {/* Summary */}
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analysis.summary.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Existing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{analysis.summary.existing}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Missing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{analysis.summary.missing}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                Fixes Needed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{analysis.fixes.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Fixes Alert */}
      {analysis && analysis.fixes.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                {analysis.fixes.length} fix{analysis.fixes.length > 1 ? 'es' : ''} needed. 
                Click "Apply Fixes" to generate SQL script.
              </span>
              <Button size="sm" onClick={applyFixes} disabled={applying}>
                Apply Now
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* SQL Script */}
      {sqlScript && (
        <Card>
          <CardHeader>
            <CardTitle>Generated SQL Script</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm max-h-96 overflow-auto">
              <pre>{sqlScript}</pre>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(sqlScript)
                  alert("SQL script copied to clipboard!")
                }}
              >
                Copy to Clipboard
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const blob = new Blob([sqlScript], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `database-fix-${Date.now()}.sql`
                  a.click()
                }}
              >
                Download SQL File
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Execute this SQL in Supabase SQL Editor: Dashboard → SQL Editor → Paste → Run
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tables List */}
      <Card>
        <CardHeader>
          <CardTitle>Tables Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis && Object.entries(analysis.tables).map(([tableName, status]) => (
              <div
                key={tableName}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {status.exists ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <div className="font-medium">{tableName}</div>
                    {status.exists ? (
                      <div className="text-sm text-muted-foreground">
                        {status.columnCount || 0} columns
                        {status.columns && status.columns.length > 0 && (
                          <span className="ml-2">
                            ({status.columns.slice(0, 5).join(', ')}
                            {status.columns.length > 5 ? '...' : ''})
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-red-500">
                        {status.error || 'Table not found'}
                      </div>
                    )}
                  </div>
                </div>
                <Badge variant={status.exists ? "default" : "destructive"}>
                  {status.exists ? "OK" : "Missing"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
