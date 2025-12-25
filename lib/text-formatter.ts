// Auto-format text for cleaner display

export function formatDescription(text: string): string {
  if (!text) return ""

  let formatted = text.trim()

  // Remove excessive newlines (more than 2)
  formatted = formatted.replace(/\n{3,}/g, "\n\n")

  // Clean up HTML entities
  formatted = formatted.replace(/&quot;/g, '"')
  formatted = formatted.replace(/&amp;/g, "&")
  formatted = formatted.replace(/&lt;/g, "<")
  formatted = formatted.replace(/&gt;/g, ">")
  formatted = formatted.replace(/&#x27;/g, "'")
  formatted = formatted.replace(/&nbsp;/g, " ")

  // Normalize headers (ensure space after #)
  formatted = formatted.replace(/^(#{1,6})([^#\s])/gm, "$1 $2")

  // Remove duplicate headers
  const lines = formatted.split("\n")
  const seenHeaders = new Set<string>()
  const filteredLines = lines.filter((line) => {
    const trimmed = line.trim()
    if (trimmed.startsWith("#")) {
      if (seenHeaders.has(trimmed)) {
        return false
      }
      seenHeaders.add(trimmed)
    }
    return true
  })
  formatted = filteredLines.join("\n")

  // Ensure bullet points have proper formatting
  formatted = formatted.replace(/^[-*•]\s*/gm, "- ")

  // Clean up numbered lists
  formatted = formatted.replace(/^(\d+)[.)]\s*/gm, "$1. ")

  // Add proper spacing around code blocks
  formatted = formatted.replace(/```(\w*)\n/g, "\n```$1\n")
  formatted = formatted.replace(/\n```/g, "\n\n```")

  // Clean up links
  formatted = formatted.replace(/\[([^\]]+)\]\s*$$([^)]+)$$/g, "[$1]($2)")

  // Remove trailing whitespace from lines
  formatted = formatted
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")

  return formatted.trim()
}

export function formatFeatures(text: string): string {
  if (!text) return ""

  const formatted = formatDescription(text)

  const lines = formatted.split("\n")
  const processedLines: string[] = []
  let hasHeader = false

  for (const line of lines) {
    const trimmed = line.trim()

    // Skip empty lines at the start
    if (!trimmed && processedLines.length === 0) continue

    // Add Features header if not present
    if (!hasHeader && !trimmed.startsWith("#")) {
      processedLines.push("## Features")
      processedLines.push("")
      hasHeader = true
    } else if (trimmed.startsWith("#")) {
      hasHeader = true
    }

    // Convert plain text lines to bullet points if they look like features
    if (
      trimmed &&
      !trimmed.startsWith("#") &&
      !trimmed.startsWith("-") &&
      !trimmed.startsWith("*") &&
      !trimmed.startsWith("```") &&
      !trimmed.match(/^\d+\./)
    ) {
      // Check if it's a short feature-like line
      if (trimmed.length < 200 && !trimmed.includes("\n")) {
        processedLines.push(`- ${trimmed}`)
        continue
      }
    }

    processedLines.push(line)
  }

  return processedLines.join("\n").trim()
}

export function formatInstallation(text: string): string {
  if (!text) return ""

  const formatted = formatDescription(text)

  const lines = formatted.split("\n")
  const processedLines: string[] = []
  let hasHeader = false
  let stepNumber = 0

  for (const line of lines) {
    const trimmed = line.trim()

    // Skip empty lines at the start
    if (!trimmed && processedLines.length === 0) continue

    // Add Installation header if not present
    if (!hasHeader && !trimmed.startsWith("#")) {
      processedLines.push("## Installation Guide")
      processedLines.push("")
      hasHeader = true
    } else if (trimmed.startsWith("#")) {
      hasHeader = true
    }

    // Convert steps to numbered list if they mention "step" or similar
    if (trimmed.toLowerCase().includes("step") || trimmed.match(/^\d+[.):]/)) {
      stepNumber++
      const cleanText = trimmed.replace(/^(step\s*\d*[.):]*\s*)/i, "").replace(/^\d+[.):]\s*/, "")
      processedLines.push(`${stepNumber}. ${cleanText}`)
      continue
    }

    processedLines.push(line)
  }

  return processedLines.join("\n").trim()
}

export function formatChangelog(text: string): string {
  if (!text) return ""

  const formatted = formatDescription(text)

  const lines = formatted.split("\n")
  const processedLines: string[] = []
  let hasHeader = false

  for (const line of lines) {
    const trimmed = line.trim()

    // Skip empty lines at the start
    if (!trimmed && processedLines.length === 0) continue

    // Add Changelog header if not present
    if (!hasHeader && !trimmed.startsWith("#")) {
      processedLines.push("## Changelog")
      processedLines.push("")
      hasHeader = true
    } else if (trimmed.startsWith("#")) {
      hasHeader = true
    }

    // Format version numbers as headers
    if (trimmed.match(/^v?\d+\.\d+(\.\d+)?/i) && !trimmed.startsWith("#")) {
      processedLines.push(`### ${trimmed}`)
      continue
    }

    // Convert changes to bullet points
    if (
      trimmed &&
      !trimmed.startsWith("#") &&
      !trimmed.startsWith("-") &&
      !trimmed.startsWith("*") &&
      !trimmed.startsWith("```")
    ) {
      if (
        trimmed.toLowerCase().includes("added") ||
        trimmed.toLowerCase().includes("fixed") ||
        trimmed.toLowerCase().includes("changed") ||
        trimmed.toLowerCase().includes("removed") ||
        trimmed.toLowerCase().includes("update")
      ) {
        processedLines.push(`- ${trimmed}`)
        continue
      }
    }

    processedLines.push(line)
  }

  return processedLines.join("\n").trim()
}

// Auto clean text on paste/upload
export function autoCleanText(text: string): string {
  if (!text) return ""

  let cleaned = text

  // Decode HTML entities
  cleaned = cleaned.replace(/&quot;/g, '"')
  cleaned = cleaned.replace(/&amp;/g, "&")
  cleaned = cleaned.replace(/&lt;/g, "<")
  cleaned = cleaned.replace(/&gt;/g, ">")
  cleaned = cleaned.replace(/&#x27;/g, "'")
  cleaned = cleaned.replace(/&nbsp;/g, " ")
  cleaned = cleaned.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(Number.parseInt(num)))
  cleaned = cleaned.replace(/&#x([a-fA-F0-9]+);/g, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)))

  // Remove excessive whitespace
  cleaned = cleaned.replace(/[ \t]+/g, " ")
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n")

  // Trim lines
  cleaned = cleaned
    .split("\n")
    .map((line) => line.trim())
    .join("\n")

  // Fix common formatting issues
  cleaned = cleaned.replace(/^(#{1,6})([^#\s])/gm, "$1 $2")
  cleaned = cleaned.replace(/^[-*•]\s*/gm, "- ")
  cleaned = cleaned.replace(/^(\d+)[.)]\s*/gm, "$1. ")

  return cleaned.trim()
}
