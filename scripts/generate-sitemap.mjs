import { writeFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables based on the environment
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config({ path: '.env.local' });
}

const SITE_URL = 'https://www.fivem.tools';

async function generateSitemap() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: threads } = await supabase.from('forum_threads').select('id,updated_at').eq('status', 'approved');
  const { data: assets } = await supabase.from('assets').select('id,updated_at').in('status', ['active', 'approved', 'published']);
  const { data: categories } = await supabase.from('forum_categories').select('id,updated_at').eq('is_active', true);

  const staticPages = [
    { url: '', priority: '1.0' },
    { url: '/forum', priority: '0.9' },
    { url: '/assets', priority: '0.9' },
    { url: '/spin-wheel', priority: '0.8' },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(page => `<url><loc>${SITE_URL}${page.url}</loc><priority>${page.priority}</priority></url>`).join('\n')}
  ${threads.map(({ id, updated_at }) => `<url><loc>${SITE_URL}/forum/thread/${id}</loc><lastmod>${new Date(updated_at).toISOString()}</lastmod></url>`).join('\n')}
  ${assets.map(({ id, updated_at }) => `<url><loc>${SITE_URL}/asset/${id}</loc><lastmod>${new Date(updated_at).toISOString()}</lastmod></url>`).join('\n')}
  ${categories.map(({ id }) => `<url><loc>${SITE_URL}/forum/category/${id}</loc></url>`).join('\n')}
</urlset>`;

  writeFileSync('public/sitemap.xml', sitemap);

  console.log('✅ Sitemap generated successfully!');
}

generateSitemap();
