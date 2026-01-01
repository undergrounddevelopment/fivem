// Auto Category Detection System for FiveM Assets
// Detects category, framework, and tags based on asset title and description

export interface AutoCategoryResult {
  category: string
  framework: string
  suggestedTags: string[]
  confidence: number
}

// Category keywords mapping
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  scripts: [
    "script",
    "system",
    "hud",
    "ui",
    "menu",
    "banking",
    "bank",
    "job",
    "garage",
    "inventory",
    "phone",
    "admin",
    "anticheat",
    "anti-cheat",
    "loading",
    "spawn",
    "character",
    "multichar",
    "identity",
    "police",
    "ambulance",
    "mechanic",
    "racing",
    "drift",
    "prison",
    "jail",
    "hospital",
    "shop",
    "store",
    "market",
    "fuel",
    "gas",
    "petrol",
    "atm",
    "robbery",
    "heist",
    "drugs",
    "weed",
    "meth",
    "cocaine",
    "farming",
    "mining",
    "hunting",
    "fishing",
    "crafting",
    "housing",
    "real estate",
    "billing",
    "invoice",
    "death",
    "respawn",
    "dispatch",
    "mdt",
    "cad",
    "radar",
    "speedcam",
    "traffic",
    "npc",
    "ped",
    "ai",
    "bot",
    "quest",
    "mission",
    "gang",
    "faction",
    "crew",
    "organization",
    "skill",
    "xp",
    "level",
    "progressbar",
    "notification",
    "notify",
    "draw",
    "text",
    "marker",
    "blip",
    "target",
    "interaction",
    "ox_target",
    "qb-target",
    "doorlock",
    "door",
    "elevator",
    "lift",
    "teleport",
    "weather",
    "time",
    "sync",
    "voice",
    "radio",
    "discord",
    "webhook",
    "log",
    "report",
    "ticket",
    "support",
    "sit",
    "emote",
    "animation",
    "walk",
    "walkstyle",
    "carry",
    "piggyback",
    "status",
    "needs",
    "hunger",
    "thirst",
    "stress",
    "armor",
    "health",
  ],
  vehicles: [
    "vehicle",
    "car",
    "truck",
    "bike",
    "motorcycle",
    "boat",
    "plane",
    "helicopter",
    "heli",
    "jet",
    "aircraft",
    "addon",
    "replace",
    "livery",
    "handling",
    "tune",
    "tuning",
    "wheels",
    "rims",
    "spoiler",
    "bodykit",
    "wrap",
    "vinyl",
    "police car",
    "ambulance car",
    "fire truck",
    "ems",
    "lspd",
    "bcso",
    "sahp",
    "fib",
    "swat",
    "unmarked",
    "slicktop",
    "crown vic",
    "charger",
    "mustang",
    "corvette",
    "camaro",
    "challenger",
    "lamborghini",
    "ferrari",
    "porsche",
    "bmw",
    "mercedes",
    "audi",
    "toyota",
    "nissan",
    "honda",
    "ford",
    "chevrolet",
    "dodge",
    "gtr",
    "supra",
    "rx7",
    "silvia",
    "m3",
    "m4",
    "m5",
    "rs6",
    "rs7",
    "amg",
    "brabus",
    "maybach",
    "rolls royce",
    "bentley",
    "bugatti",
    "mclaren",
    "pagani",
    "koenigsegg",
  ],
  mlo: [
    "mlo",
    "interior",
    "building",
    "house",
    "apartment",
    "mansion",
    "villa",
    "office",
    "shop",
    "store",
    "warehouse",
    "garage",
    "dealership",
    "showroom",
    "club",
    "nightclub",
    "bar",
    "restaurant",
    "cafe",
    "hospital",
    "clinic",
    "police station",
    "pd",
    "fire station",
    "ems station",
    "prison",
    "jail",
    "courthouse",
    "city hall",
    "bank",
    "vault",
    "bunker",
    "base",
    "hangar",
    "yacht",
    "penthouse",
    "studio",
    "gym",
    "tattoo",
    "barber",
    "clothing store",
    "gas station",
    "motel",
    "hotel",
    "casino",
    "arcade",
    "cinema",
    "theater",
    "church",
    "farm",
    "ranch",
    "mine",
    "factory",
    "port",
    "dock",
    "pier",
    "beach house",
    "lake house",
    "cabin",
    "compound",
    "headquarters",
    "hq",
    "trap house",
    "stash house",
    "safe house",
    "hideout",
    "lair",
    "den",
  ],
  clothing: [
    "clothing",
    "clothes",
    "outfit",
    "eup",
    "ped",
    "skin",
    "model",
    "mp_m_",
    "mp_f_",
    "freemode",
    "addon ped",
    "replace ped",
    "uniform",
    "police uniform",
    "ems uniform",
    "fire uniform",
    "mechanic uniform",
    "suit",
    "dress",
    "jacket",
    "pants",
    "shoes",
    "boots",
    "hat",
    "cap",
    "mask",
    "glasses",
    "watch",
    "chain",
    "necklace",
    "earring",
    "bracelet",
    "ring",
    "tattoo",
    "hairstyle",
    "hair",
    "beard",
    "makeup",
    "face",
    "accessory",
    "bag",
    "backpack",
    "vest",
    "armor",
    "helmet",
    "gloves",
    "scarf",
    "hoodie",
    "shirt",
    "t-shirt",
    "tank top",
    "shorts",
    "skirt",
    "jeans",
    "cargo",
    "sweatpants",
    "tracksuit",
    "jersey",
  ],
}

// Framework keywords mapping
const FRAMEWORK_KEYWORDS: Record<string, string[]> = {
  qbcore: ["qb", "qbcore", "qb-core", "qb_", "qb-", "qbx", "qbox"],
  esx: ["esx", "es_extended", "esx_", "esx-", "extendedmode"],
  vorp: ["vorp", "redm", "red dead", "rdr", "western"],
  standalone: ["standalone", "universal", "all frameworks", "any framework", "framework independent"],
}

// Common tags to extract
const TAG_KEYWORDS: Record<string, string[]> = {
  Free: ["free", "gratis", "no cost"],
  Premium: ["premium", "paid", "exclusive"],
  Optimized: ["optimized", "optimised", "0.0ms", "low ms", "performance"],
  "Open Source": ["open source", "opensource", "github", "gitlab"],
  Encrypted: ["escrow", "encrypted", "protected", "obfuscated"],
  "Drag & Drop": ["drag and drop", "drag & drop", "easy install", "plug and play"],
  Configurable: ["configurable", "config", "customizable", "customisable"],
  Multilingual: ["multilingual", "multi-language", "locales", "translation"],
  "Discord Integration": ["discord", "webhook", "discord bot"],
  "UI Included": ["ui", "nui", "interface", "menu"],
  Database: ["mysql", "mariadb", "oxmysql", "ghmattimysql", "database"],
  "Target System": ["ox_target", "qb-target", "qtarget", "target"],
  Inventory: ["ox_inventory", "qb-inventory", "qs-inventory", "inventory"],
  Updated: ["updated", "latest", "new version", "2024", "2025"],
  Animated: ["animated", "animation", "anim"],
  HQ: ["hq", "high quality", "4k", "hd"],
  "FiveM Ready": ["fivem", "fivem ready", "gta v", "gta 5"],
  "ESX Compatible": ["esx compatible", "works with esx"],
  "QBCore Compatible": ["qbcore compatible", "works with qbcore", "qb compatible"],
}

/**
 * Auto-detect category based on asset title and description
 */
export function detectCategory(title: string, description = ""): AutoCategoryResult {
  const text = `${title} ${description}`.toLowerCase()

  const scores: Record<string, number> = {
    scripts: 0,
    vehicles: 0,
    mlo: 0,
    clothing: 0,
  }

  // Calculate scores for each category
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        scores[category] += keyword.length > 5 ? 2 : 1
      }
    }
  }

  let maxScore = 0
  let detectedCategory = "scripts"

  for (const [category, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score
      detectedCategory = category
    }
  }

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0)
  const confidence = totalScore > 0 ? Math.min(100, Math.round((maxScore / totalScore) * 100)) : 50

  const framework = detectFramework(text)
  const tags = detectTags(text)

  return {
    category: detectedCategory,
    framework,
    suggestedTags: tags,
    confidence,
  }
}

/**
 * Auto-detect framework based on text
 */
export function detectFramework(text: string): string {
  const lowerText = text.toLowerCase()

  for (const [framework, keywords] of Object.entries(FRAMEWORK_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return framework
      }
    }
  }

  return "standalone" // default
}

/**
 * Auto-detect tags based on text
 */
export function detectTags(text: string): string[] {
  const lowerText = text.toLowerCase()
  const detectedTags: string[] = []

  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        if (!detectedTags.includes(tag)) {
          detectedTags.push(tag)
        }
        break
      }
    }
  }

  // Limit to 5 tags max
  return detectedTags.slice(0, 5)
}

/**
 * Get suggested title improvements
 */
export function suggestTitleFormat(title: string): string {
  // Remove common prefixes
  let formatted = title
    .replace(/^\[.*?\]\s*/g, "") // Remove [PREFIX]
    .replace(/^(qb-|esx_|esx-|qb_)/i, "") // Remove framework prefixes
    .trim()

  // Capitalize first letter of each word
  formatted = formatted
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")

  return formatted
}

/**
 * Get category icon
 */
export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    scripts: "🔧",
    vehicles: "🚗",
    mlo: "🏠",
    clothing: "👕",
  }
  return icons[category] || "📦"
}

/**
 * Get category color class
 */
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    scripts: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    vehicles: "bg-green-500/20 text-green-400 border-green-500/30",
    mlo: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    clothing: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  }
  return colors[category] || "bg-gray-500/20 text-gray-400 border-gray-500/30"
}
