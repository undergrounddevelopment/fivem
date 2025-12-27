import { redirect } from 'next/navigation'

export default async function LanguageRedirect({ params }: { params: Promise<{ lang: string }> }) {
  await params
  redirect('/')
}

export function generateStaticParams() {
  return [
    { lang: 'en' },
    { lang: 'id' },
    { lang: 'es' },
    { lang: 'pt' },
    { lang: 'de' },
    { lang: 'fr' },
    { lang: 'ru' },
    { lang: 'zh' },
    { lang: 'ja' },
    { lang: 'ko' },
    { lang: 'tr' },
    { lang: 'ar' },
  ]
}
