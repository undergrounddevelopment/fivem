import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function LanguageRedirect({ params }: { params: { lang: string } }) {
  redirect('/')
}
