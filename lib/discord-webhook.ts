// FiveM Tools - Professional Discord Webhook System
// Banner: https://r2.fivemanage.com/w7oyrZqqBoxEiG7UVDfhV/snapedit_1767706318773.png

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_UPLOADS

// Banner & Avatar
const BANNER_URL = "https://r2.fivemanage.com/w7oyrZqqBoxEiG7UVDfhV/snapedit_1767706318773.png"
const AVATAR_URL = "https://www.fivemtools.net/logo.gif"

// Colors
const COLOR_PURPLE = 0x5856D6
const COLOR_PINK = 0xFF2D92
const COLOR_GREEN = 0x00D26A

interface WebhookEmbed {
  title?: string
  description?: string
  color?: number
  fields?: { name: string; value: string; inline?: boolean }[]
  thumbnail?: { url: string }
  image?: { url: string }
  footer?: { text: string; icon_url?: string }
  timestamp?: string
}

async function sendDiscordWebhook(content: string, embed: WebhookEmbed): Promise<boolean> {
  if (!WEBHOOK_URL) {
    console.log("[Webhook] Not configured")
    return false
  }

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "FiveM Tools",
        avatar_url: AVATAR_URL,
        content,
        embeds: [embed]
      })
    })
    
    if (res.ok) {
      console.log("[Webhook] Sent successfully")
      return true
    }
    console.error("[Webhook] Failed:", res.status)
    return false
  } catch (err) {
    console.error("[Webhook] Error:", err)
    return false
  }
}

/**
 * Send notification when asset is uploaded - SINGLE NOTIFICATION ONLY
 */
export async function notifyAssetUpload(asset: any, user: any): Promise<boolean> {
  const isPremium = asset.coin_price > 0
  const category = asset.category?.toUpperCase() || "ASSET"
  const framework = asset.framework?.toUpperCase() || "STANDALONE"
  const price = isPremium ? `${asset.coin_price} Coins` : "FREE"
  const status = asset.status === "approved" ? "Ready" : "Pending"
  const username = user?.username || user?.name || "Unknown"

  const content = `@everyone @here

🚀 **NEW ASSET UPLOADED** 🚀

📦 **${asset.title}**

💎 ${isPremium ? "Premium" : "Free"} • ${category} • ${framework}

🔗 https://www.fivemtools.net/asset/${asset.id}`

  const embed: WebhookEmbed = {
    title: `📦 ${asset.title}`,
    description: asset.description?.substring(0, 200) || "No description",
    color: isPremium ? COLOR_PINK : COLOR_PURPLE,
    fields: [
      { name: "📂 Category", value: category, inline: true },
      { name: "⚙️ Framework", value: framework, inline: true },
      { name: "💰 Price", value: price, inline: true },
      { name: "👤 Author", value: username, inline: true },
      { name: "📊 Status", value: status, inline: true },
      { name: "🏷️ Version", value: asset.version || "1.0.0", inline: true }
    ],
    image: { url: BANNER_URL },
    thumbnail: { url: asset.thumbnail || AVATAR_URL },
    footer: { text: "FiveM Tools • fivemtools.net", icon_url: AVATAR_URL },
    timestamp: new Date().toISOString()
  }

  return await sendDiscordWebhook(content, embed)
}

/**
 * REMOVED - Use notifyAssetUpload directly to prevent double notifications
 */
export async function notifyAssetUploadAdvanced(
  asset: any, 
  user: any, 
  options?: { mentionEveryone?: boolean; priority?: string }
): Promise<boolean> {
  // Just call the main function once to prevent double notifications
  return await notifyAssetUpload(asset, user)
}

/**
 * Admin notification
 */
export async function notifyAdmin(title: string, message: string, type?: string, data?: any): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_ADMIN || WEBHOOK_URL
  if (!webhookUrl) return

  const embed: WebhookEmbed = {
    title: `🔧 ${title}`,
    description: message,
    color: COLOR_GREEN,
    footer: { text: "FiveM Tools Admin", icon_url: AVATAR_URL },
    timestamp: new Date().toISOString()
  }

  if (data) {
    embed.fields = Object.entries(data).map(([k, v]) => ({ name: k, value: String(v), inline: true }))
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "FiveM Tools Admin", avatar_url: AVATAR_URL, embeds: [embed] })
    })
  } catch (err) {
    console.error("[Admin Webhook] Error:", err)
  }
}

/**
 * Log activity
 */
export async function logActivity(action: string, details: string, userId?: string, data?: any): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_LOGS || WEBHOOK_URL
  if (!webhookUrl) return

  const embed: WebhookEmbed = {
    title: `📝 ${action}`,
    description: details,
    color: COLOR_PURPLE,
    footer: { text: "FiveM Tools Log", icon_url: AVATAR_URL },
    timestamp: new Date().toISOString()
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "FiveM Tools Log", avatar_url: AVATAR_URL, embeds: [embed] })
    })
  } catch (err) {
    console.error("[Log Webhook] Error:", err)
  }
}

export async function notifyAssetDownload(asset: any, user: any): Promise<void> {
  await logActivity("Download", `${asset.title} downloaded by ${user?.username || "Unknown"}`)
}

export async function notifySystemError(error: string, context: string): Promise<void> {
  await notifyAdmin("System Error", `${error} in ${context}`, "error")
}

export { BANNER_URL, AVATAR_URL }
