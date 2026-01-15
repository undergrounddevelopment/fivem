import { redirect, notFound } from 'next/navigation'
import { COUNTRIES } from '@/lib/seo-countries'

// Get valid language codes
const VALID_LANGS = [...new Set(Object.values(COUNTRIES).map(c => c.lang))]

export async function generateStaticParams() {
  return Object.values(COUNTRIES).map((country) => ({
    lang: country.lang,
  }))
}

export default async function LangPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  
  // Only redirect if this is a valid language code
  if (VALID_LANGS.includes(lang)) {
    redirect('/')
  }
  
  // Otherwise, this is not a language route - return 404
  notFound()
}

