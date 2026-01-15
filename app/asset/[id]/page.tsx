import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/client'
import { AssetDetailClient } from '@/components/assets/asset-detail-client'
import { SITE_NAME, SITE_URL } from '@/lib/constants'

// This fetch happens on the server
async function getAsset(id: string) {
  // Note: We use the REST API here via fetch for simplicity if Supabase direct access is complex, 
  // but since we are on the server we can also just use Supabase direct or fetch the internal API URL.
  // Using absolute URL for server-side fetch
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/assets/${id}`, {
      next: { revalidate: 60 } // Cache for 60 seconds
    })

    if (!res.ok) return null
    return res.json()
  } catch (error) {
    console.error("Failed to fetch asset", error)
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const asset = await getAsset(id)
  const { getSiteSettings } = await import("@/lib/settings")
  const settings = await getSiteSettings()
  const siteName = settings.site_info.name || SITE_NAME

  if (!asset) {
    return {
      title: 'Asset Not Found',
    }
  }

  // Global SEO hashtags for worldwide discoverability
  const globalHashtags = [
    "FiveM", "FiveMScript", "FiveMLeaks", "FiveMFree", "FiveMDownload",
    "GTA5", "GTAV", "GTAMods", "GTARoleplay", "GTARP",
    "QBCore", "ESX", "QBox", "vRP", "Standalone",
    "FiveMServer", "FiveMResource", "FiveMMLO", "FiveMVehicles", "FiveMEUP",
    "RoleplayServer", "RPServer", "FiveMCommunity", "FiveMDevelopment",
    "GameMods", "ServerMods", "CFXDecrypt", "FiveMTools", "FiveMHub",
    "FreeScripts", "PremiumScripts", "FiveMAssets", "FiveMStore"
  ]

  // Category-specific hashtags
  const categoryHashtags: Record<string, string[]> = {
    scripts: ["FiveMScripts", "LuaScripts", "ServerScripts", "ClientScripts"],
    vehicles: ["FiveMCars", "FiveMVehicles", "GTACars", "CustomVehicles"],
    mlo: ["FiveMMLO", "MLOInterior", "FiveMMaps", "CustomMaps"],
    eup: ["FiveMEUP", "FiveMClothing", "GTAClothes", "FiveMPeds"],
    weapons: ["FiveMWeapons", "GTAWeapons", "CustomWeapons"],
  }

  const assetCategory = asset.category?.toLowerCase() || 'scripts'
  const extraHashtags = categoryHashtags[assetCategory] || []

  // Generate hashtag string for description
  const hashtagString = [...globalHashtags.slice(0, 10), ...extraHashtags.slice(0, 5)]
    .map(tag => `#${tag}`)
    .join(' ')

  const title = `${asset.title} - ${asset.framework} Script | ${siteName}`
  const baseDescription = asset.description?.substring(0, 120) || `Download ${asset.title} for FiveM`
  const seoDescription = `${baseDescription} | ${hashtagString}`

  const images = asset.thumbnail_url || asset.thumbnail
    ? [asset.thumbnail_url || asset.thumbnail]
    : []

  // Full keyword list including asset-specific and global tags
  const keywords = [
    asset.title,
    asset.category,
    asset.framework,
    ...(asset.tags || []),
    ...globalHashtags,
    ...extraHashtags,
    "FiveM Script Download",
    "GTA V Mods",
    "Free FiveM Resources",
    "Premium FiveM Scripts",
    "Best FiveM Server Scripts",
    `${asset.framework} Script`,
    `${asset.category} FiveM`
  ].filter(Boolean)

  return {
    title,
    description: seoDescription,
    keywords,
    openGraph: {
      title: `${asset.title} | ${hashtagString.substring(0, 50)}`,
      description: seoDescription,
      images,
      type: 'website',
      url: `${SITE_URL}/asset/${asset.id}`,
      siteName,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${asset.title} | #FiveM #${asset.framework}`,
      description: seoDescription,
      images,
    },
    alternates: {
      canonical: `${SITE_URL}/asset/${asset.id}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export default async function AssetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const asset = await getAsset(id)

  // Global hashtags for JSON-LD
  const seoKeywords = [
    "FiveM", "FiveMScript", "FiveMLeaks", "GTA5", "GTAV", "QBCore", "ESX",
    asset?.category, asset?.framework, ...(asset?.tags || [])
  ].filter(Boolean)

  // JSON-LD Structured Data with enhanced SEO
  const jsonLd = asset ? {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": asset.title,
    "operatingSystem": "Windows",
    "applicationCategory": "GameApplication",
    "applicationSubCategory": "FiveM Resource",
    "keywords": seoKeywords.join(", "),
    "offers": {
      "@type": "Offer",
      "price": asset.coin_price || "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": asset.rating ? {
      "@type": "AggregateRating",
      "ratingValue": asset.rating,
      "ratingCount": asset.rating_count || "1",
      "bestRating": "5",
      "worstRating": "1"
    } : undefined,
    "description": asset.description,
    "downloadUrl": `${SITE_URL}/asset/${asset.id}`,
    "softwareVersion": asset.version || "1.0.0",
    "datePublished": asset.created_at,
    "dateModified": asset.updated_at,
    "publisher": {
      "@type": "Organization",
      "name": "FiveM Tools",
      "url": SITE_URL
    }
  } : null

  return (
    <>
      {asset && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <AssetDetailClient initialAsset={asset} id={id} />
    </>
  )
}
