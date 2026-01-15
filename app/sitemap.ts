
import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/constants'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/forum',
    '/scripts',
    '/mlo',
    '/vehicles',
    '/clothing',
    '/messages',
    '/membership',
    '/decrypt',
    '/upvotes',
    '/upload',
    '/fixer',
    '/bypass',
    '/powerburst',
    '/fakeplayer',
    '/dump-server',
    '/clean-script',
  ]

  const staticRoutes = routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  return staticRoutes
}
