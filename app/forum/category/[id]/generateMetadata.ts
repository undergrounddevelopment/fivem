import { createAdminClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createAdminClient()
  const { data: category } = await supabase
    .from('forum_categories')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!category) {
    return {
      title: 'Category Not Found',
    }
  }

  return {
    title: `${category.name} - FiveM Tools Forum`,
    description: category.description || `Discussions in the ${category.name} category.`,
    openGraph: {
      title: `${category.name} Forum Category`,
      description: category.description || `Discussions in the ${category.name} category.`,
      url: `/forum/category/${category.id}`,
      type: 'website',
    },
  }
}
