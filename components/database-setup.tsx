"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react"

interface SetupStep {
  name: string
  status: "pending" | "running" | "success" | "error"
  message?: string
}

export function DatabaseSetup() {
  const [steps, setSteps] = useState<SetupStep[]>([
    { name: "Check Database Connection", status: "pending" },
    { name: "Seed Forum Categories", status: "pending" },
    { name: "Seed Sample Assets", status: "pending" },
    { name: "Create Admin User", status: "pending" },
  ])
  const [isRunning, setIsRunning] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateStep = (index: number, status: SetupStep["status"], message?: string) => {
    setSteps((prev) => prev.map((step, i) => (i === index ? { ...step, status, message } : step)))
  }

  const runSetup = async () => {
    setIsRunning(true)
    setError(null)

    // Step 1: Check connection
    updateStep(0, "running")
    try {
      const statsRes = await fetch("/api/stats")
      if (statsRes.ok) {
        updateStep(0, "success", "Connected to Supabase")
      } else {
        throw new Error("Connection failed")
      }
    } catch (err) {
      updateStep(0, "error", "Failed to connect to database")
      setError("Please ensure Supabase is properly connected in the sidebar")
      setIsRunning(false)
      return
    }

    // Step 2 & 3: Seed data
    updateStep(1, "running")
    try {
      const seedRes = await fetch("/api/seed", { method: "POST" })
      const seedData = await seedRes.json()

      if (seedRes.ok) {
        if (seedData.message === "Already seeded") {
          updateStep(1, "success", "Categories already exist")
          updateStep(2, "success", `${seedData.count || 0} assets exist`)
        } else {
          updateStep(1, "success", `${seedData.categories || 6} categories created`)
          updateStep(2, "success", `${seedData.seeded || 0} assets created`)
        }
      } else {
        throw new Error(seedData.error || "Seed failed")
      }
    } catch (err: any) {
      if (err.message?.includes("does not exist")) {
        updateStep(1, "error", "Tables not created yet")
        updateStep(2, "error", "Run SQL scripts first")
        setError("Please run the SQL scripts in the /scripts folder to create the database tables first")
      } else {
        updateStep(1, "error", err.message || "Seed failed")
        updateStep(2, "error", "Check console for details")
      }
    }

    // Step 4: Check admin
    updateStep(3, "running")
    try {
      const adminRes = await fetch("/api/force-admin")
      const adminData = await adminRes.json()

      if (adminData.adminCount > 0) {
        updateStep(3, "success", `${adminData.adminCount} admin(s) configured`)
      } else if (adminData.currentUser) {
        updateStep(3, "success", "Login detected - click 'Become Admin' in admin panel")
      } else {
        updateStep(3, "success", "Login with Discord to become admin")
      }
    } catch {
      updateStep(3, "error", "Admin check failed")
    }

    setIsRunning(false)
    setCompleted(steps.every((s) => s.status === "success" || s.status === "error"))
  }

  const resetSetup = () => {
    setSteps([
      { name: "Check Database Connection", status: "pending" },
      { name: "Seed Forum Categories", status: "pending" },
      { name: "Seed Sample Assets", status: "pending" },
      { name: "Create Admin User", status: "pending" },
    ])
    setCompleted(false)
    setError(null)
  }

  const allSuccess = steps.every((s) => s.status === "success")

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Setup
        </CardTitle>
        <CardDescription>Initialize your FiveM Tools database with sample data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step) => (
          <div key={step.name} className="flex items-center gap-3">
            {step.status === "pending" && <div className="h-5 w-5 rounded-full border-2 border-muted" />}
            {step.status === "running" && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
            {step.status === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
            {step.status === "error" && <XCircle className="h-5 w-5 text-red-500" />}
            <div className="flex-1">
              <p className="text-sm font-medium">{step.name}</p>
              {step.message && (
                <p className={`text-xs ${step.status === "error" ? "text-red-400" : "text-muted-foreground"}`}>
                  {step.message}
                </p>
              )}
            </div>
          </div>
        ))}

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <Button onClick={runSetup} disabled={isRunning} className="flex-1">
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running...
              </>
            ) : allSuccess ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete!
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Initialize Database
              </>
            )}
          </Button>

          {completed && (
            <Button onClick={resetSetup} variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Make sure to run the SQL scripts in /scripts folder first
        </p>
      </CardContent>
    </Card>
  )
}
