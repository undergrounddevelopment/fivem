import { getSiteSettings } from "@/lib/settings"
import { ForumClient } from "./forum-client"
import { CommunityBanners } from "@/components/community-banners"

export const dynamic = 'force-dynamic'

export default async function ForumPage() {
  const forumSettings = await getSiteSettings('forum')

  return (
    <div className="space-y-8">
      <CommunityBanners />
      <ForumClient forumSettings={forumSettings} />
    </div>
  )
}