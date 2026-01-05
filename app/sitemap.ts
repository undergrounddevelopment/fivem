import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/constants'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL

  // Static pages
  const staticPages = [
    '',
    '/scripts',
    '/vehicles',
    '/mlo',
    '/clothing',
    '/eup',
    '/assets',
    '/forum',
    '/badges',
    '/membership',
    '/dashboard',
    '/leaderboard',
    '/decrypt',
    '/upvotes',
  ]

  // Category pages for FiveM resources
  const categories = [
    'qbcore-scripts',
    'esx-scripts',
    'qbox-scripts',
    'standalone-scripts',
    'fivem-vehicles',
    'fivem-mlo',
    'fivem-maps',
    'fivem-eup',
    'fivem-clothing',
    'fivem-weapons',
    'fivem-peds',
    'fivem-ui',
    'fivem-hud',
  ]

  const staticEntries = staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  const categoryEntries = categories.map((category) => ({
    url: `${baseUrl}/category/${category}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  // Language alternates for international SEO
  const languages = ['en', 'id', 'es', 'pt', 'de', 'fr', 'ru', 'zh', 'ja', 'ko', 'tr', 'ar']
  const languageEntries = languages.flatMap((lang) =>
    staticPages.map((route) => ({
      url: `${baseUrl}/${lang}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }))
  )

  return [...staticEntries, ...categoryEntries, ...languageEntries]
}
