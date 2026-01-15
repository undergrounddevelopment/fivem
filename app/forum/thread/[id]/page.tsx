import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/client'
import { ThreadClient } from '@/components/forum/thread-client'
import { SITE_NAME, SITE_URL } from '@/lib/constants'

// Server-side fetch for Thread Data
async function getThread(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'; 
    const res = await fetch(`${baseUrl}/api/forum/threads/${id}`, {
      next: { revalidate: 0 } // Live content
    })

    if (!res.ok) return null
    return res.json()
  } catch (error) {
    console.error("Failed to fetch thread", error)
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const thread = await getThread(id)
  const { getSiteSettings } = await import("@/lib/settings")
  const settings = await getSiteSettings()
  const siteName = settings.site_info.name || SITE_NAME

  if (!thread) {
    return {
      title: 'Thread Not Found',
    }
  }

  const title = `${thread.title} | ${siteName} Forum`
  const description = thread.content.substring(0, 160).replace(/[^\w\s]/gi, '') || "Join the conversation at FiveM Tools"

  // Use first image if available
  const images = thread.images && thread.images.length > 0
    ? [thread.images[0]]
    : []

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${SITE_URL}/forum/thread/${thread.id}`,
      images,
      publishedTime: thread.createdAt,
      authors: [thread.author?.username || 'Community Member'],
      section: thread.category
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images,
    }
  }
}

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const thread = await getThread(id)

  // JSON-LD for Forum Posting
  // Schema.org: DiscussionForumPosting
  const jsonLd = thread ? {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    "headline": thread.title,
    "text": thread.content,
    "author": {
      "@type": "Person",
      "name": thread.author?.username || "Unknown"
    },
    "interactionStatistic": [
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/CommentAction",
        "userInteractionCount": thread.repliesCount || 0
      },
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/LikeAction",
        "userInteractionCount": thread.likes || 0
      }
    ],
    "datePublished": thread.createdAt,
    "image": thread.images
  } : null

  return (
    <>
      {thread && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ThreadClient initialThread={thread} threadId={id} />
    </>
  )
}
