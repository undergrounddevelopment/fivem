import { Metadata } from 'next'
import { COUNTRIES, SEO_TRANSLATIONS } from './seo-countries'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product' | 'profile' | string
  author?: string
  publishedTime?: string
  modifiedTime?: string
  lang?: string
}

export function generateSEO({
  title = 'FiveM Tools - Premium Scripts, MLOs & Resources',
  description = 'Download premium FiveM scripts, MLOs, vehicles, and resources. QBCore, ESX, and standalone frameworks. Free and premium assets for your FiveM server.',
  keywords = ['fivem', 'fivem scripts', 'fivem mlo', 'qbcore', 'esx', 'fivem resources', 'fivem vehicles', 'fivem tools'],
  image = 'https://www.fivemtools.net/og-image.png',
  url = 'https://www.fivemtools.net',
  type = 'website',
  author = 'FiveM Tools',
  publishedTime,
  modifiedTime,
  lang = 'en'
}: SEOProps = {}): Metadata {
  const siteName = 'FiveM Tools'
  const translation = SEO_TRANSLATIONS[lang as keyof typeof SEO_TRANSLATIONS] || SEO_TRANSLATIONS.en
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`

  return {
    title: fullTitle,
    description: translation.description,
    keywords: translation.keywords,
    authors: [{ name: author }],
    creator: author,
    publisher: siteName,

    openGraph: {
      type: type as any,
      locale: COUNTRIES[lang.toUpperCase() as keyof typeof COUNTRIES]?.code || 'en_US',
      url,
      siteName,
      title: fullTitle,
      description: translation.description,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },

    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: translation.description,
      images: [image],
      creator: '@fivemtools',
      site: '@fivemtools',
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

    verification: {
      google: 'your-google-verification-code',
      yandex: 'your-yandex-verification-code',
    },

    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        Object.values(COUNTRIES).map(c => [c.code, `https://www.fivemtools.net/${c.lang}`])
      ),
    },

    category: 'Gaming',
  }
}

// Asset SEO
export function generateAssetSEO(asset: any): Metadata {
  return generateSEO({
    title: `${asset.title} - ${asset.category.toUpperCase()}`,
    description: asset.description?.substring(0, 160) || `Download ${asset.title} for FiveM. ${asset.framework} framework. ${asset.coin_price === 0 ? 'Free' : 'Premium'} asset.`,
    keywords: [
      'fivem',
      asset.category,
      asset.framework,
      asset.title.toLowerCase(),
      `fivem ${asset.category}`,
      `${asset.framework} ${asset.category}`,
    ],
    image: asset.thumbnail || 'https://www.fivemtools.net/og-image.png',
    url: `https://www.fivemtools.net/asset/${asset.id}`,
    type: 'article',
    publishedTime: asset.created_at,
    modifiedTime: asset.updated_at,
  })
}

// Category SEO
export function generateCategorySEO(category: string): Metadata {
  const categoryNames: Record<string, string> = {
    scripts: 'Scripts',
    mlo: 'MLO Maps',
    vehicles: 'Vehicles',
    clothing: 'Clothing & EUP',
  }

  const categoryDescriptions: Record<string, string> = {
    scripts: 'Browse premium FiveM scripts for QBCore, ESX, and standalone frameworks. Jobs, housing, shops, and more.',
    mlo: 'Download high-quality MLO maps for your FiveM server. Custom interiors, buildings, and locations.',
    vehicles: 'Premium FiveM vehicles with custom handling, sounds, and liveries. Cars, bikes, boats, and aircraft.',
    clothing: 'Custom clothing, EUP packs, and accessories for your FiveM server. Male and female options.',
  }

  return generateSEO({
    title: `${categoryNames[category] || category} - FiveM Resources`,
    description: categoryDescriptions[category] || `Browse ${category} for FiveM servers.`,
    keywords: [
      'fivem',
      category,
      `fivem ${category}`,
      'qbcore',
      'esx',
      'fivem resources',
    ],
    url: `https://www.fivemtools.net/${category}`,
  })
}

// Profile SEO
export function generateProfileSEO(user: any): Metadata {
  return generateSEO({
    title: `${user.username} - Profile`,
    description: `View ${user.username}'s profile on FiveM Tools. ${user.assets_count || 0} assets uploaded, ${user.downloads || 0} downloads.`,
    keywords: ['fivem', 'profile', user.username, 'fivem creator'],
    image: user.avatar || 'https://www.fivemtools.net/og-image.png',
    url: `https://www.fivemtools.net/profile/${user.id}`,
    type: 'profile',
  })
}

// JSON-LD Schema
export function generateJSONLD(data: any) {
  return {
    '@context': 'https://schema.org',
    ...data,
  }
}

// Asset Schema
export function generateAssetSchema(asset: any) {
  return generateJSONLD({
    '@type': 'SoftwareApplication',
    name: asset.title,
    description: asset.description,
    applicationCategory: 'GameApplication',
    operatingSystem: 'FiveM',
    offers: {
      '@type': 'Offer',
      price: asset.coin_price === 0 ? '0' : asset.coin_price,
      priceCurrency: 'COINS',
    },
    aggregateRating: asset.rating_count > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: asset.rating,
      ratingCount: asset.rating_count,
    } : undefined,
    author: {
      '@type': 'Person',
      name: asset.author_name || 'Unknown',
    },
    datePublished: asset.created_at,
    dateModified: asset.updated_at,
    image: asset.thumbnail,
  })
}

// Organization Schema
export function generateOrganizationSchema() {
  return generateJSONLD({
    '@type': 'Organization',
    name: 'FiveM Tools',
    url: 'https://www.fivemtools.net',
    logo: 'https://www.fivemtools.net/logo.png',
    description: 'Premium FiveM scripts, MLOs, and resources marketplace',
    sameAs: [
      'https://discord.gg/fivemtools',
      'https://twitter.com/fivemtools',
    ],
  })
}

// Website Schema
export function generateWebsiteSchema() {
  return generateJSONLD({
    '@type': 'WebSite',
    name: 'FiveM Tools',
    url: 'https://www.fivemtools.net',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.fivemtools.net/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  })
}
