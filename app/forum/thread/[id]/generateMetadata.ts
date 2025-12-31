import { getForumThreadById } from '@/lib/database-direct'
import type { Metadata } from 'next'

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const thread = await getForumThreadById(params.id)

  if (!thread) {
    return {
      title: 'Thread Not Found',
    }
  }

  return {
    title: `${thread.title} - FiveM Tools Forum`,
    description: thread.content.substring(0, 155),
    openGraph: {
      title: thread.title,
      description: thread.content.substring(0, 155),
      url: `/forum/thread/${thread.id}`,
      type: 'article',
    },
  }
}
