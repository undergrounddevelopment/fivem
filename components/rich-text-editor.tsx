"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Bold,
  Italic,
  Type,
  AtSign,
  Eye,
  MoreHorizontal,
  List,
  ListOrdered,
  AlignLeft,
  Pilcrow,
  Smile,
  Link2,
  ImageIcon,
  Quote,
  Table,
  Minus,
  Code,
  Undo,
  Redo,
  Paperclip,
  X,
  Loader2,
  FileImage,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface UploadedFile {
  id: string
  name: string
  url: string
  type: "image" | "file"
  uploading?: boolean
  error?: string
}

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
  maxFiles?: number
  onFilesChange?: (files: UploadedFile[]) => void
  files?: UploadedFile[]
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write something...",
  minHeight = "200px",
  maxFiles = 10,
  onFilesChange,
  files = [],
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [linkText, setLinkText] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [imageAlt, setImageAlt] = useState("")
  const [history, setHistory] = useState<string[]>([value])
  const [historyIndex, setHistoryIndex] = useState(0)

  const insertText = useCallback(
    (before: string, after = "", placeholder = "") => {
      const textarea = textareaRef.current
      if (!textarea) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = value.substring(start, end) || placeholder
      const newValue = value.substring(0, start) + before + selectedText + after + value.substring(end)

      onChange(newValue)

      // Save to history
      setHistory((prev) => [...prev.slice(0, historyIndex + 1), newValue])
      setHistoryIndex((prev) => prev + 1)

      // Set cursor position after insertion
      setTimeout(() => {
        textarea.focus()
        const newCursorPos = start + before.length + selectedText.length
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      }, 0)
    },
    [value, onChange, historyIndex],
  )

  const handleBold = () => insertText("**", "**", "bold text")
  const handleItalic = () => insertText("*", "*", "italic text")
  const handleHeading = (level: number) => insertText("\n" + "#".repeat(level) + " ", "\n", "Heading")
  const handleBulletList = () => insertText("\n- ", "\n", "List item")
  const handleNumberedList = () => insertText("\n1. ", "\n", "List item")
  const handleQuote = () => insertText("\n> ", "\n", "Quote")
  const handleCode = () => insertText("\n```\n", "\n```\n", "code")
  const handleInlineCode = () => insertText("`", "`", "code")
  const handleDivider = () => insertText("\n\n---\n\n", "")
  const handleMention = () => insertText("@", "", "username")

  const handleLink = () => {
    if (linkUrl) {
      const text = linkText || linkUrl
      insertText(`[${text}](${linkUrl})`, "")
      setLinkUrl("")
      setLinkText("")
      setShowLinkDialog(false)
    }
  }

  const handleImage = () => {
    if (imageUrl) {
      insertText(`![${imageAlt || "image"}](${imageUrl})`, "")
      setImageUrl("")
      setImageAlt("")
      setShowImageDialog(false)
    }
  }

  const handleTable = () => {
    const table = `
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
`
    insertText(table, "")
  }

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1)
      onChange(history[historyIndex - 1])
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1)
      onChange(history[historyIndex + 1])
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles || !onFilesChange) return

    const remainingSlots = maxFiles - files.length
    const filesToUpload = Array.from(selectedFiles).slice(0, remainingSlots)

    for (const file of filesToUpload) {
      const isImage = file.type.startsWith("image/")
      const tempFile: UploadedFile = {
        id: `temp-${Date.now()}-${Math.random()}`,
        name: file.name,
        url: URL.createObjectURL(file),
        type: isImage ? "image" : "file",
        uploading: true,
      }

      onFilesChange([...files, tempFile])

      try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("folder", "threads")

        const res = await fetch("/api/upload/blob", {
          method: "POST",
          body: formData,
        })

        if (!res.ok) throw new Error("Upload failed")
        const data = await res.json()

        onFilesChange(files.map((f) => (f.id === tempFile.id ? { ...f, url: data.url, uploading: false } : f)))
      } catch {
        onFilesChange(files.map((f) => (f.id === tempFile.id ? { ...f, uploading: false, error: "Failed" } : f)))
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const removeFile = (fileId: string) => {
    if (onFilesChange) {
      onFilesChange(files.filter((f) => f.id !== fileId))
    }
  }

  const renderPreview = () => {
    // Simple markdown to HTML conversion for preview
    const html = value
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, "<code class='bg-secondary px-1 rounded'>$1</code>")
      .replace(/^### (.*$)/gim, "<h3 class='text-lg font-semibold mt-4 mb-2'>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2 class='text-xl font-semibold mt-4 mb-2'>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1 class='text-2xl font-bold mt-4 mb-2'>$1</h1>")
      .replace(/^> (.*$)/gim, "<blockquote class='border-l-4 border-primary pl-4 italic my-2'>$1</blockquote>")
      .replace(/^- (.*$)/gim, "<li class='ml-4'>$1</li>")
      .replace(/^\d+\. (.*$)/gim, "<li class='ml-4 list-decimal'>$1</li>")
      .replace(/\[([^\]]+)\]$$([^)]+)$$/g, "<a href='$2' class='text-primary underline'>$1</a>")
      .replace(/!\[([^\]]*)\]$$([^)]+)$$/g, "<img src='$2' alt='$1' class='max-w-full rounded-lg my-2' />")
      .replace(/^---$/gim, "<hr class='my-4 border-border' />")
      .replace(/\n/g, "<br />")

    return html
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-border bg-secondary/30 flex-wrap">
        {/* Text Formatting Group */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-border/50">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-secondary"
            onClick={() => onChange("")}
            title="Clear"
          >
            <X className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-secondary"
            onClick={handleBold}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-secondary"
            onClick={handleItalic}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-secondary"
                title="Heading"
              >
                <Type className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => handleHeading(1)}>
                <span className="text-xl font-bold">Heading 1</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleHeading(2)}>
                <span className="text-lg font-bold">Heading 2</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleHeading(3)}>
                <span className="text-base font-bold">Heading 3</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-secondary"
            onClick={handleMention}
            title="Mention"
          >
            <AtSign className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-secondary"
            onClick={() => setShowPreview(!showPreview)}
            title="Toggle Preview"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-secondary">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => insertText("~~", "~~", "strikethrough")}>Strikethrough</DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertText("<sub>", "</sub>", "subscript")}>Subscript</DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertText("<sup>", "</sup>", "superscript")}>
                Superscript
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* List Group */}
        <div className="flex items-center gap-0.5 px-2 border-r border-border/50">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-secondary"
            onClick={handleBulletList}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-secondary"
            onClick={handleNumberedList}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-secondary"
            title="Align"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-secondary"
                title="Paragraph"
              >
                <Pilcrow className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => insertText("\n\n", "", "")}>New Paragraph</DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertText("\n", "", "")}>Line Break</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Media Group */}
        <div className="flex items-center gap-0.5 px-2 border-r border-border/50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-secondary"
                title="Emoji"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="grid grid-cols-8 gap-1 p-2 w-auto">
              {["😀", "😂", "😍", "🤔", "👍", "👎", "❤️", "🔥", "⭐", "✅", "❌", "🎉", "💯", "🚀", "💡", "⚡"].map(
                (emoji) => (
                  <Button
                    key={emoji}
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-lg"
                    onClick={() => insertText(emoji, "")}
                  >
                    {emoji}
                  </Button>
                ),
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-secondary"
            onClick={() => setShowLinkDialog(true)}
            title="Insert Link"
          >
            <Link2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-secondary"
            onClick={() => setShowImageDialog(true)}
            title="Insert Image URL"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-secondary"
            title="GIF"
          >
            <span className="text-xs font-bold">GIF</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-secondary"
            onClick={handleQuote}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-secondary"
            onClick={handleTable}
            title="Table"
          >
            <Table className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-secondary"
            onClick={handleDivider}
            title="Divider"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-secondary"
            onClick={handleCode}
            title="Code Block"
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>

        {/* Undo/Redo & Preview */}
        <div className="flex items-center gap-0.5 ml-auto">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-secondary"
            onClick={handleUndo}
            disabled={historyIndex === 0}
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-secondary"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={showPreview ? "secondary" : "ghost"}
            size="sm"
            className="h-8 rounded-lg gap-1.5 ml-2"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative" style={{ minHeight }}>
        {showPreview ? (
          <div
            className="p-4 prose prose-invert max-w-none"
            style={{ minHeight }}
            dangerouslySetInnerHTML={{
              __html: renderPreview() || `<span class="text-muted-foreground">${placeholder}</span>`,
            }}
          />
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              onChange(e.target.value)
              setHistory((prev) => [...prev.slice(0, historyIndex + 1), e.target.value])
              setHistoryIndex((prev) => prev + 1)
            }}
            placeholder={placeholder}
            className="w-full p-4 bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none"
            style={{ minHeight }}
          />
        )}
      </div>

      {/* Uploaded Files Preview */}
      {files.length > 0 && (
        <div className="p-3 border-t border-border bg-secondary/20">
          <div className="flex flex-wrap gap-2">
            {files.map((file) => (
              <div key={file.id} className="relative group flex items-center gap-2 bg-secondary/50 rounded-lg p-2 pr-8">
                {file.type === "image" ? (
                  <div className="h-10 w-10 rounded overflow-hidden">
                    <img src={file.url || "/placeholder.svg"} alt={file.name} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <FileImage className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="text-sm text-foreground truncate max-w-[120px]">{file.name}</span>
                {file.uploading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                {file.error && <span className="text-xs text-destructive">{file.error}</span>}
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attach Files Button */}
      <div className="p-3 border-t border-border">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-2 text-primary hover:text-primary"
          onClick={() => fileInputRef.current?.click()}
          disabled={files.length >= maxFiles}
        >
          <Paperclip className="h-4 w-4" />
          Attach files
          {files.length > 0 && (
            <span className="text-muted-foreground">
              ({files.length}/{maxFiles})
            </span>
          )}
        </Button>
      </div>

      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>URL</Label>
              <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://example.com" />
            </div>
            <div className="space-y-2">
              <Label>Text (optional)</Label>
              <Input value={linkText} onChange={(e) => setLinkText(e.target.value)} placeholder="Link text" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleLink} disabled={!linkUrl}>
              Insert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label>Alt Text (optional)</Label>
              <Input value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} placeholder="Image description" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImageDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleImage} disabled={!imageUrl}>
              Insert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
