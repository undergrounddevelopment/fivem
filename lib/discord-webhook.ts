const DISCORD_WEBHOOK_URL = "https://discordapp.com/api/webhooks/1453826334982930624/5ogVxfU-cXKBQCsx08cf2synDxgAdSBS4hkQlGwA9qY8sbRwRnWIMOSnJ7B1kUnBG7yQ"

export async function sendDiscordNotification(asset: {
  title: string
  description: string
  category: string
  thumbnail: string | null
  author: { username: string } | null
  id: string
}) {
  try {
    const embed = {
      title: `🆕 New ${asset.category.toUpperCase()} Posted!`,
      description: asset.description?.substring(0, 200) || "No description",
      color: 0x00ff00,
      fields: [
        {
          name: "📦 Asset",
          value: asset.title,
          inline: true
        },
        {
          name: "👤 Author",
          value: asset.author?.username || "Unknown",
          inline: true
        },
        {
          name: "📂 Category",
          value: asset.category.toUpperCase(),
          inline: true
        }
      ],
      image: asset.thumbnail ? { url: asset.thumbnail } : undefined,
      footer: {
        text: "FiveM Tools V7"
      },
      timestamp: new Date().toISOString()
    }

    const payload = {
      content: "@everyone @here",
      embeds: [embed]
    }

    await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
  } catch (error) {
    console.error("Discord webhook error:", error)
  }
}
