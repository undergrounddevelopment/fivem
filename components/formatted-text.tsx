"use client"

import type React from "react"
import { useState } from "react"
import { ExternalLink, Play, Link2, Copy, Check, FileCode, Image as ImageIcon, Video } from "lucide-react"

interface FormattedTextProps {
  content: string
  className?: string
  enableYouTube?: boolean
  enableImages?: boolean
  enableLinks?: boolean
}

// YouTube URL patterns
const YOUTUBE_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S*)?/g
const URL_REGEX = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g

// Sanitization helper
function isValidUrl(url: string): boolean {
  if (!url) return false
  try {
    const trimmed = url.trim()
    // Allow relative paths starting with /
    if (trimmed.startsWith('/')) return true
    // Allow http, https, mailto
    const protocol = new URL(trimmed).protocol
    return ['http:', 'https:', 'mailto:'].includes(protocol)
  } catch {
    // If it fails URL parsing but looks like a valid domain or relative path
    return false
  }
}

// Extract YouTube video ID
function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

// YouTube Embed Component
function YouTubeEmbed({ videoId, title }: { videoId: string; title?: string }) {
  const [isLoaded, setIsLoaded] = useState(false)
  
  return (
    <div className="my-4 rounded-xl overflow-hidden border border-white/10 bg-black/40 group">
      <div className="relative aspect-video">
        {!isLoaded ? (
          <button
            onClick={() => setIsLoaded(true)}
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-600/20 to-red-900/20 hover:from-red-600/30 hover:to-red-900/30 transition-all"
          >
            <div className="absolute inset-0 bg-cover bg-center opacity-50" 
              style={{ backgroundImage: `url(https://img.youtube.com/vi/${videoId}/maxresdefault.jpg)` }} 
            />
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/50 group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-white ml-1" fill="white" />
              </div>
              <span className="text-sm font-medium text-white/90 bg-black/50 px-3 py-1 rounded-full">
                Click to play video
              </span>
            </div>
          </button>
        ) : (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title={title || "YouTube video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        )}
      </div>
      <div className="px-4 py-2 flex items-center gap-2 bg-black/60 border-t border-white/5">
        <Video className="w-4 h-4 text-red-500" />
        <span className="text-xs text-muted-foreground truncate flex-1">
          {title || `youtube.com/watch?v=${videoId}`}
        </span>
        <a 
          href={`https://youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  )
}

// Image Preview Component
function ImagePreview({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)
  
  if (error) {
    return (
      <div className="my-4 p-4 rounded-xl border border-white/10 bg-secondary/20 flex items-center gap-3">
        <ImageIcon className="w-5 h-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Image failed to load</span>
      </div>
    )
  }
  
  return (
    <div className="my-4 rounded-xl overflow-hidden border border-white/10 bg-black/20">
      <div className="relative">
        {!loaded && (
          <div className="absolute inset-0 bg-secondary/30 animate-pulse flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
          </div>
        )}
        <img
          src={src}
          alt={alt || "Image"}
          className={`w-full max-h-[500px] object-contain transition-opacity ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      </div>
      {alt && (
        <div className="px-4 py-2 bg-black/40 border-t border-white/5">
          <span className="text-xs text-muted-foreground">{alt}</span>
        </div>
      )}
    </div>
  )
}

// Link Preview Component
function LinkPreview({ url, text }: { url: string; text: string }) {
  const safeUrl = isValidUrl(url) ? url : '#'
  const isExternal = safeUrl.startsWith('http')
  let domain = ''
  try {
    domain = isExternal ? new URL(safeUrl).hostname.replace('www.', '') : ''
  } catch {
    domain = safeUrl
  }
  
  return (
    <a
      href={url}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20 text-sm group"
    >
      <Link2 className="w-3 h-3" />
      <span className="group-hover:underline">{text}</span>
      {isExternal && (
        <>
          <span className="text-[10px] text-muted-foreground">({domain})</span>
          <ExternalLink className="w-3 h-3 opacity-50" />
        </>
      )}
    </a>
  )
}

// Code Block Component
function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <div className="my-4 rounded-xl overflow-hidden border border-white/10 bg-black/60">
      <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-white/5">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-muted-foreground uppercase">
            {language || 'code'}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm font-mono text-foreground/90">{code}</code>
      </pre>
    </div>
  )
}

export function FormattedText({ 
  content, 
  className = "",
  enableYouTube = true,
  enableImages = true,
  enableLinks = true
}: FormattedTextProps) {
  if (!content) return null

  const formatContent = (text: string) => {
    const lines = text.split('\n')
    const elements: React.ReactNode[] = []
    let inCodeBlock = false
    let codeContent = ''
    let codeLanguage = ''
    let listItems: React.ReactNode[] = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // Code block handling
      if (line.trim().startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true
          codeLanguage = line.trim().slice(3) || 'code'
          codeContent = ''
        } else {
          inCodeBlock = false
          elements.push(<CodeBlock key={`code-${i}`} code={codeContent.trim()} language={codeLanguage} />)
        }
        continue
      }
      
      if (inCodeBlock) {
        codeContent += line + '\n'
        continue
      }
      
      // YouTube URLs (standalone line)
      if (enableYouTube) {
        const youtubeMatch = line.match(YOUTUBE_REGEX)
        if (youtubeMatch && line.trim().match(/^https?:\/\//)) {
          const videoId = getYouTubeId(line.trim())
          if (videoId) {
            // Flush list items first
            if (listItems.length > 0) {
              elements.push(<ul key={`list-${i}`} className="my-4 space-y-2">{listItems}</ul>)
              listItems = []
            }
            elements.push(<YouTubeEmbed key={`yt-${i}`} videoId={videoId} />)
            continue
          }
        }
      }
      
      // Image markdown
      if (enableImages) {
        const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
        if (imageMatch) {
          if (listItems.length > 0) {
            elements.push(<ul key={`list-${i}`} className="my-4 space-y-2">{listItems}</ul>)
            listItems = []
          }
          elements.push(<ImagePreview key={`img-${i}`} src={imageMatch[2]} alt={imageMatch[1]} />)
          continue
        }
      }
      
      // Headers
      if (line.startsWith('#### ')) {
        if (listItems.length > 0) {
          elements.push(<ul key={`list-${i}`} className="my-4 space-y-2">{listItems}</ul>)
          listItems = []
        }
        elements.push(
          <h4 key={i} className="text-base font-bold mb-2 text-foreground mt-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-primary rounded-full" />
            {formatInline(line.slice(5))}
          </h4>
        )
        continue
      }
      if (line.startsWith('### ')) {
        if (listItems.length > 0) {
          elements.push(<ul key={`list-${i}`} className="my-4 space-y-2">{listItems}</ul>)
          listItems = []
        }
        elements.push(
          <h3 key={i} className="text-lg font-bold mb-3 text-foreground mt-6 pb-2 border-b border-white/10 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-gradient-to-b from-primary to-pink-500 rounded-full" />
            {formatInline(line.slice(4))}
          </h3>
        )
        continue
      }
      if (line.startsWith('## ')) {
        if (listItems.length > 0) {
          elements.push(<ul key={`list-${i}`} className="my-4 space-y-2">{listItems}</ul>)
          listItems = []
        }
        elements.push(
          <h2 key={i} className="text-xl font-bold mb-4 text-foreground mt-8 pb-2 border-b-2 border-primary/50 flex items-center gap-3">
            <span className="w-2 h-6 bg-gradient-to-b from-primary to-purple-500 rounded-full" />
            {formatInline(line.slice(3))}
          </h2>
        )
        continue
      }
      if (line.startsWith('# ')) {
        if (listItems.length > 0) {
          elements.push(<ul key={`list-${i}`} className="my-4 space-y-2">{listItems}</ul>)
          listItems = []
        }
        elements.push(
          <h1 key={i} className="text-2xl font-bold mb-6 text-foreground gradient-text flex items-center gap-3">
            <span className="w-2 h-8 bg-gradient-to-b from-primary via-pink-500 to-purple-500 rounded-full" />
            {formatInline(line.slice(2))}
          </h1>
        )
        continue
      }
      
      // Blockquote
      if (line.startsWith('> ')) {
        if (listItems.length > 0) {
          elements.push(<ul key={`list-${i}`} className="my-4 space-y-2">{listItems}</ul>)
          listItems = []
        }
        elements.push(
          <blockquote key={i} className="my-4 pl-4 border-l-4 border-primary/50 bg-primary/5 py-3 pr-4 rounded-r-xl italic text-muted-foreground">
            {formatInline(line.slice(2))}
          </blockquote>
        )
        continue
      }
      
      // Horizontal rule
      if (line.trim() === '---' || line.trim() === '***') {
        if (listItems.length > 0) {
          elements.push(<ul key={`list-${i}`} className="my-4 space-y-2">{listItems}</ul>)
          listItems = []
        }
        elements.push(
          <hr key={i} className="my-6 border-none h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        )
        continue
      }
      
      // Lists
      if (line.trim().match(/^[-•✓✅❌⭐🔥💎📦🎮🔧⚡️💡📝🎯✨🚀]/)) {
        const emoji = line.trim().match(/^([-•✓✅❌⭐🔥💎📦🎮🔧⚡️💡📝🎯✨🚀])/)?.[1] || '•'
        const content = line.trim().replace(/^[-•✓✅❌⭐🔥💎📦🎮🔧⚡️💡📝🎯✨🚀]\s*/, '')
        listItems.push(
          <li key={`li-${i}`} className="flex items-start gap-3 text-muted-foreground">
            <span className="mt-0.5 text-primary shrink-0">{emoji === '-' || emoji === '•' ? '•' : emoji}</span>
            <span className="flex-1">{formatInline(content)}</span>
          </li>
        )
        continue
      }
      
      // Numbered lists
      if (line.trim().match(/^\d+\.\s/)) {
        const num = line.trim().match(/^(\d+)\./)?.[1] || '1'
        const content = line.trim().replace(/^\d+\.\s*/, '')
        listItems.push(
          <li key={`li-${i}`} className="flex items-start gap-3 text-muted-foreground">
            <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold shrink-0">
              {num}
            </span>
            <span className="flex-1">{formatInline(content)}</span>
          </li>
        )
        continue
      }
      
      // Flush list items if we hit a non-list line
      if (listItems.length > 0 && !line.trim().match(/^[-•✓✅❌⭐🔥💎📦🎮🔧⚡️💡📝🎯✨🚀\d]/)) {
        elements.push(<ul key={`list-${i}`} className="my-4 space-y-2">{listItems}</ul>)
        listItems = []
      }
      
      // Empty lines
      if (!line.trim()) {
        continue
      }
      
      // Regular paragraphs
      elements.push(
        <p key={i} className="mb-4 text-muted-foreground leading-relaxed">
          {formatInline(line)}
        </p>
      )
    }
    
    // Flush remaining list items
    if (listItems.length > 0) {
      elements.push(<ul key="list-final" className="my-4 space-y-2">{listItems}</ul>)
    }
    
    return elements
  }

  const formatInline = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = []
    let remaining = text
    let keyIndex = 0
    
    // Process inline elements
    while (remaining.length > 0) {
      // YouTube inline link
      if (enableYouTube) {
        const ytMatch = remaining.match(YOUTUBE_REGEX)
        if (ytMatch && ytMatch.index !== undefined) {
          if (ytMatch.index > 0) {
            parts.push(processBasicInline(remaining.slice(0, ytMatch.index), keyIndex++))
          }
          const videoId = getYouTubeId(ytMatch[0])
          if (videoId) {
            parts.push(
              <a
                key={`yt-inline-${keyIndex++}`}
                href={`https://youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20 text-sm"
              >
                <Video className="w-3 h-3" />
                <span>YouTube</span>
                <ExternalLink className="w-3 h-3 opacity-50" />
              </a>
            )
          }
          remaining = remaining.slice((ytMatch.index || 0) + ytMatch[0].length)
          continue
        }
      }
      
      // Markdown links [text](url)
      if (enableLinks) {
        const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/)
        if (linkMatch && linkMatch.index !== undefined) {
          if (linkMatch.index > 0) {
            parts.push(processBasicInline(remaining.slice(0, linkMatch.index), keyIndex++))
          }
          
          const rawUrl = linkMatch[2]
          const linkText = linkMatch[1]
          
          if (isValidUrl(rawUrl)) {
             parts.push(
               <LinkPreview key={`link-${keyIndex++}`} url={rawUrl} text={linkText} />
             )
          } else {
             // Render unsafe links as plain text or code
             parts.push(
               <span key={`unsafe-link-${keyIndex++}`} className="text-muted-foreground line-through" title="Blocked unsafe link">
                 {linkText}
               </span>
             )
          }

          remaining = remaining.slice(linkMatch.index + linkMatch[0].length)
          continue
        }
      }
      
      // Plain URLs
      if (enableLinks) {
        const urlMatch = remaining.match(URL_REGEX)
        if (urlMatch && urlMatch.index !== undefined && urlMatch.index === 0) {
          parts.push(
            <a
              key={`url-${keyIndex++}`}
              href={urlMatch[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              {urlMatch[0].length > 50 ? urlMatch[0].slice(0, 50) + '...' : urlMatch[0]}
              <ExternalLink className="w-3 h-3 opacity-50" />
            </a>
          )
          remaining = remaining.slice(urlMatch[0].length)
          continue
        }
      }
      
      // Process basic inline formatting for the rest
      parts.push(processBasicInline(remaining, keyIndex++))
      break
    }
    
    return parts.length === 1 ? parts[0] : parts
  }
  
  const processBasicInline = (text: string, baseKey: number): React.ReactNode => {
    const parts: React.ReactNode[] = []
    let current = ''
    let i = 0
    
    while (i < text.length) {
      // Bold **text**
      if (text.slice(i, i + 2) === '**') {
        if (current) parts.push(current)
        current = ''
        i += 2
        let bold = ''
        while (i < text.length && text.slice(i, i + 2) !== '**') {
          bold += text[i]
          i++
        }
        parts.push(<strong key={`bold-${baseKey}-${i}`} className="font-bold text-foreground">{bold}</strong>)
        i += 2
        continue
      }
      
      // Italic *text* or _text_
      if ((text[i] === '*' || text[i] === '_') && text[i + 1] !== text[i]) {
        const marker = text[i]
        if (current) parts.push(current)
        current = ''
        i++
        let italic = ''
        while (i < text.length && text[i] !== marker) {
          italic += text[i]
          i++
        }
        parts.push(<em key={`italic-${baseKey}-${i}`} className="italic text-foreground/80">{italic}</em>)
        i++
        continue
      }
      
      // Strikethrough ~~text~~
      if (text.slice(i, i + 2) === '~~') {
        if (current) parts.push(current)
        current = ''
        i += 2
        let strike = ''
        while (i < text.length && text.slice(i, i + 2) !== '~~') {
          strike += text[i]
          i++
        }
        parts.push(<del key={`strike-${baseKey}-${i}`} className="line-through text-muted-foreground/60">{strike}</del>)
        i += 2
        continue
      }
      
      // Inline code `text`
      if (text[i] === '`') {
        if (current) parts.push(current)
        current = ''
        i++
        let code = ''
        while (i < text.length && text[i] !== '`') {
          code += text[i]
          i++
        }
        parts.push(
          <code key={`code-${baseKey}-${i}`} className="px-1.5 py-0.5 rounded-md bg-secondary text-primary font-mono text-sm border border-white/10">
            {code}
          </code>
        )
        i++
        continue
      }
      
      // Highlight ==text==
      if (text.slice(i, i + 2) === '==') {
        if (current) parts.push(current)
        current = ''
        i += 2
        let highlight = ''
        while (i < text.length && text.slice(i, i + 2) !== '==') {
          highlight += text[i]
          i++
        }
        parts.push(
          <mark key={`mark-${baseKey}-${i}`} className="px-1 rounded bg-yellow-500/30 text-yellow-200">
            {highlight}
          </mark>
        )
        i += 2
        continue
      }
      
      current += text[i]
      i++
    }
    
    if (current) parts.push(current)
    return parts.length === 1 ? parts[0] : <>{parts}</>
  }

  return (
    <div className={`formatted-text prose prose-invert max-w-none ${className}`}>
      {formatContent(content)}
    </div>
  )
}

export function autoFormatText(text: string): string {
  if (!text) return ""
  
  return text
    .split('\n')
    .map(line => {
      const trimmed = line.trim()
      // Auto-format lists
      if (trimmed.match(/^[✓✅❌⭐🔥💎]/) && !trimmed.startsWith('- ')) {
        return `- ${trimmed}`
      }
      // Auto-format headers
      if (trimmed.match(/^[A-Z][A-Z\s]+:$/)) {
        return `## ${trimmed.replace(':', '')}`
      }
      return line
    })
    .join('\n')
}

export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/^[-•✓✅❌⭐🔥💎]\s*/gm, '')
    .trim()
}

export function generatePreview(text: string, maxLength: number = 150): string {
  const plain = stripMarkdown(text)
  if (plain.length <= maxLength) return plain
  return plain.substring(0, maxLength).trim() + '...'
}
