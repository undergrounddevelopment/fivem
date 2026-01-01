import { writeFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables based on the environment
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config({ path: '.env.local' });
}

const DEFAULT_SITE_URL = 'https://www.fivemtools.net';

function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || DEFAULT_SITE_URL;
  return String(raw).replace(/\/+$/, '');
}

const SITE_URL = getSiteUrl();

async function generateSitemap() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: threadsData, error: threadsError } = await supabase
    .from('forum_threads')
    .select('id,updated_at')
    .eq('status', 'approved');

  const { data: assetsData, error: assetsError } = await supabase
    .from('assets')
    .select('id,updated_at')
    .in('status', ['active', 'approved', 'published']);

  const { data: categoriesData, error: categoriesError } = await supabase
    .from('forum_categories')
    .select('id,updated_at')
    .eq('is_active', true);

  if (threadsError) console.warn('[sitemap] forum_threads query error:', threadsError.message);
  if (assetsError) console.warn('[sitemap] assets query error:', assetsError.message);
  if (categoriesError) console.warn('[sitemap] forum_categories query error:', categoriesError.message);

  const threads = threadsData ?? [];
  const assets = assetsData ?? [];
  const categories = categoriesData ?? [];

  const staticPages = [
    { url: '', priority: '1.0' },
    { url: '/scripts', priority: '0.9' },
    { url: '/mlo', priority: '0.9' },
    { url: '/vehicles', priority: '0.9' },
    { url: '/clothing', priority: '0.8' },
    { url: '/forum', priority: '0.9' },
    { url: '/assets', priority: '0.9' },
    { url: '/spin-wheel', priority: '0.7' },
    { url: '/decrypt', priority: '0.8' },
    { url: '/upvotes', priority: '0.8' },
    { url: '/membership', priority: '0.7' },
    { url: '/upload', priority: '0.6' },
    { url: '/dashboard', priority: '0.7' },
    { url: '/discord', priority: '0.5' },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(page => `<url><loc>${SITE_URL}${page.url}</loc><priority>${page.priority}</priority></url>`).join('\n')}
  ${threads.map(({ id, updated_at }) => `<url><loc>${SITE_URL}/forum/thread/${id}</loc><lastmod>${updated_at ? new Date(updated_at).toISOString() : new Date().toISOString()}</lastmod></url>`).join('\n')}
  ${assets.map(({ id, updated_at }) => `<url><loc>${SITE_URL}/asset/${id}</loc><lastmod>${updated_at ? new Date(updated_at).toISOString() : new Date().toISOString()}</lastmod></url>`).join('\n')}
  ${categories.map(({ id }) => `<url><loc>${SITE_URL}/forum/category/${id}</loc></url>`).join('\n')}
</urlset>`;

  writeFileSync('public/sitemap.xml', sitemap);

  console.log('✅ Sitemap generated successfully!');
}

generateSitemap();
