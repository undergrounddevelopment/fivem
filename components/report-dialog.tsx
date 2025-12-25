"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Flag, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { useAuth } from "@/components/auth-provider"

interface ReportDialogProps {
  // Controlled mode (no trigger)
  open?: boolean
  onOpenChange?: (open: boolean) => void
  contentType?: "asset" | "thread" | "reply" | "user" | "message"
  contentId?: string
  // Uncontrolled mode (with trigger)
  type?: "asset" | "thread" | "reply" | "user" | "message"
  targetId?: string
  trigger?: React.ReactNode
}

const REPORT_REASONS = [
  { value: "spam", label: "Spam or misleading" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "copyright", label: "Copyright violation" },
  { value: "malware", label: "Malware or malicious content" },
  { value: "harassment", label: "Harassment or bullying" },
  { value: "other", label: "Other" },
]

export function ReportDialog({
  // Controlled props
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  contentType,
  contentId,
  // Uncontrolled props
  type,
  targetId,
  trigger,
}: ReportDialogProps) {
  const { user } = useAuth()
  const [internalOpen, setInternalOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Determine if controlled or uncontrolled
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen

  // Use the appropriate type and id
  const reportType = contentType || type || "asset"
  const reportTargetId = contentId || targetId || ""

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setReason("")
      setDescription("")
    }
  }, [open])

  const handleSubmit = async () => {
    if (!reason) {
      toast.error("Please select a reason")
      return
    }

    if (!user) {
      toast.error("Please login to submit a report")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: reportType,
          targetId: reportTargetId,
          reason,
          description: description.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit report")
      }

      toast.success("Report submitted successfully")
      setOpen(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to submit report")
    } finally {
      setIsSubmitting(false)
    }
  }

  // If controlled mode, don't render trigger
  if (isControlled) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md glass">
          <DialogHeader>
            <DialogTitle className="text-foreground">Report {reportType}</DialogTitle>
            <DialogDescription>
              Help us understand what's wrong. Reports are reviewed by our moderation team.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label className="text-foreground">Reason for reporting</Label>
              <RadioGroup value={reason} onValueChange={setReason}>
                {REPORT_REASONS.map((r) => (
                  <div key={r.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={r.value} id={`controlled-${r.value}`} />
                    <Label htmlFor={`controlled-${r.value}`} className="text-sm text-foreground cursor-pointer">
                      {r.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="controlled-description" className="text-foreground">
                Additional details (optional)
              </Label>
              <Textarea
                id="controlled-description"
                placeholder="Provide more context about your report..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px] bg-secondary/50 border-border"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Uncontrolled mode with trigger
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-destructive">
            <Flag className="h-4 w-4" />
            Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md glass">
        <DialogHeader>
          <DialogTitle className="text-foreground">Report {reportType}</DialogTitle>
          <DialogDescription>
            Help us understand what's wrong. Reports are reviewed by our moderation team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label className="text-foreground">Reason for reporting</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {REPORT_REASONS.map((r) => (
                <div key={r.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={r.value} id={r.value} />
                  <Label htmlFor={r.value} className="text-sm text-foreground cursor-pointer">
                    {r.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">
              Additional details (optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Provide more context about your report..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] bg-secondary/50 border-border"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Submit Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
