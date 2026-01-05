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
    const categoryColors: Record<string, number> = {
      scripts: 0x3b82f6,   // Blue
      vehicles: 0x10b981,  // Green
      mlo: 0x8b5cf6,       // Purple
      clothing: 0xf59e0b,  // Amber
      eup: 0xec4899,       // Pink
      maps: 0x06b6d4,      // Cyan
      default: 0x6366f1    // Indigo
    }

    const embed = {
      title: asset.title,
      description: asset.description?.substring(0, 200) || "No description",
      color: categoryColors[asset.category.toLowerCase()] || categoryColors.default,
      fields: [
        {
          name: "Category",
          value: asset.category.charAt(0).toUpperCase() + asset.category.slice(1),
          inline: true
        },
        {
          name: "Author",
          value: asset.author?.username || "Unknown",
          inline: true
        }
      ],
      image: asset.thumbnail ? { url: asset.thumbnail } : undefined,
      footer: {
        text: "FiveM Tools"
      },
      timestamp: new Date().toISOString()
    }

    // Custom emojis - sesuai urutan
    const e1 = "<:e1:1401859930566295564>"
    const e2 = "<:e2:1401859969745289257>"
    const e3 = "<:e3:1401860029677834251>"
    const e4 = "<:e4:1401860079325806733>"
    const e5 = "<:e5:1401860127375491102>"
    const logo = "<:fivemtools:1457788699356954754>"
    
    const payload = {
      content: `${e1} ${e2} ${e3} ${e4} ${e5} @everyone @here ${e1} ${e2} ${e3} ${e4} ${e5}\n\n${logo} **NEW ASSET UPLOADED** ${logo}`,
      embeds: [embed]
    }

    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      console.error("Discord webhook failed:", response.status, await response.text())
    } else {
      console.log("Discord notification sent:", asset.title)
    }
  } catch (error) {
    console.error("Discord webhook error:", error)
  }
}
