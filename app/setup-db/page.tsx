"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, Database } from "lucide-react"

export default function SetupDatabasePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const setupDatabase = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/setup-database-now", {
        method: "POST",
      })

      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || "Failed to setup database",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            <CardTitle>Database Setup</CardTitle>
          </div>
          <CardDescription>
            Setup all required tables for admin features: banners, announcements, forum categories, spin wheel, and
            more.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">This will create:</p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Users table with admin support</li>
              <li>Banners management table</li>
              <li>Announcements table</li>
              <li>Forum categories table</li>
              <li>Spin wheel prizes table</li>
              <li>Spin history and daily claims tables</li>
              <li>File uploads table</li>
              <li>Default data for spin prizes and forum categories</li>
            </ul>
          </div>

          <Button onClick={setupDatabase} disabled={loading} className="w-full" size="lg">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up database...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Setup Database Now
              </>
            )}
          </Button>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              <div className="flex items-start gap-2">
                {result.success ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5" />}
                <AlertDescription className="flex-1">{result.message}</AlertDescription>
              </div>
            </Alert>
          )}

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">Alternative: Run SQL script manually</p>
            <p className="text-xs text-muted-foreground">
              If automatic setup fails, you can run the SQL script manually in Supabase SQL Editor:
              <code className="block mt-1 p-2 bg-muted rounded text-xs">scripts/200-complete-setup.sql</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
