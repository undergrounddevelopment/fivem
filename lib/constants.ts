import type { FrameworkInfo, Sponsor } from "./types"

// FiveM Tools V7 Logo
export const SITE_LOGO = "/logo.gif"
export const SITE_NAME = "FiveM Tools V7"
export const SITE_DESCRIPTION =
  "FiveM Tools V7 - #1 FiveM Resource Hub for Free Scripts, MLO Maps, Vehicles, EUP Clothing, Decrypt CFX, FiveM Upvotes, Leak Scripts, QBCore, ESX, QBox Framework Resources. Download Premium FiveM Assets Free!"
export const SITE_URL = "https://fivemtools.net"

export const SEO_KEYWORDS = [
  // Primary Keywords
  "fivem",
  "fivem scripts",
  "fivem mlo",
  "fivem leak",
  "fivem free",
  "fivem tools",
  "fivem upvotes",
  "fivem decrypt",
  "cfx decrypt",
  "fivem decrypt cfx",
  "fivem fakeplayer",
  "fivem bot upvote",
  "fivem server boost",

  // Script Keywords
  "fivem scripts free",
  "fivem scripts leak",
  "fivem scripts download",
  "qbcore scripts",
  "esx scripts",
  "qbox scripts",
  "standalone scripts",
  "fivem lua scripts",
  "fivem resources",
  "fivem resource hub",

  // MLO Keywords
  "fivem mlo free",
  "fivem mlo leak",
  "fivem mlo download",
  "fivem maps",
  "fivem interior",
  "fivem mlo pack",
  "gta v mlo",
  "fivem ymap",

  // Vehicle Keywords
  "fivem vehicles",
  "fivem cars",
  "fivem vehicle pack",
  "fivem cars free",
  "fivem addon vehicles",
  "gta v vehicles fivem",
  "fivem vehicle leak",

  // Clothing Keywords
  "fivem eup",
  "fivem clothing",
  "fivem eup pack",
  "fivem clothes free",
  "fivem ped",
  "fivem outfit",
  "fivem uniform",
  "fivem eup leak",

  // Framework Keywords
  "qbcore",
  "esx framework",
  "qbox framework",
  "fivem framework",
  "qbcore free",
  "esx free",
  "qbox free",
  "fivem roleplay",

  // Tool Keywords
  "fivem decrypt tool",
  "cfx v7 decrypt",
  "fivem decryptor",
  "fivem unlocker",
  "fivem upvote bot",
  "fivem server upvotes",
  "fivem ranking boost",
  "fivem fake players",
  "fivem player bot",

  // Community Keywords
  "fivem community",
  "fivem forum",
  "fivem discord",
  "fivem indonesia",
  "fivem server",
  "fivem roleplay server",
  "fivem rp",

  // GTA Keywords
  "gta v",
  "gta 5",
  "gta v mods",
  "gta v roleplay",
  "gta v fivem",
  "grand theft auto v",
  "rockstar games",
]

// Discord Links
export const DISCORD_LINKS = {
  COMMUNITY: "https://discord.gg/tZXg4GVRM5",
  SUPPORT: "https://discord.gg/fivemtools",
}

// Framework Logos
export const FRAMEWORK_LOGOS = {
  qbox: "https://www.qbox.re/static/screenshots/qbox-logo2.png",
  qbcore: "https://avatars.githubusercontent.com/u/81791099?s=280&v=4",
  esx: "https://docs.esx-framework.org/logo.png",
  standalone: "/standalone-script-icon.svg",
}

// Sponsor Banners
export const SPONSOR_BANNERS = [
  "https://r2.fivemanage.com/pjW8diq5cgbXePkRb7YQg/ts(1).mp4",
  "https://r2.fivemanage.com/pjW8diq5cgbXePkRb7YQg/letraserverlistgif.gif",
  "https://r2.fivemanage.com/pjW8diq5cgbXePkRb7YQg/serverlist_iteration_1.gif",
  "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExb20ydGl6a21pY3FxdG5ndWtqbmlrNGRrcWV6YWg5bGN2MDE4OGx6ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/NACV6SPFQ8Fqndeek9/giphy.gif",
]

export const FRAMEWORKS: FrameworkInfo[] = [
  {
    id: "qbox",
    name: "QBox",
    logo: FRAMEWORK_LOGOS.qbox,
    color: "#3B82F6",
    description: "Modern FiveM Framework",
  },
  {
    id: "qbcore",
    name: "QBCore",
    logo: FRAMEWORK_LOGOS.qbcore,
    color: "#22C55E",
    description: "Popular Community Framework",
  },
  {
    id: "esx",
    name: "ESX",
    logo: FRAMEWORK_LOGOS.esx,
    color: "#F59E0B",
    description: "Classic Roleplay Framework",
  },
  {
    id: "standalone",
    name: "Standalone",
    logo: FRAMEWORK_LOGOS.standalone,
    color: "#8B5CF6",
    description: "Framework Independent",
  },
]

// Sponsor Banners
export const SPONSORS: Sponsor[] = [
  {
    id: "sponsor-1",
    name: "FiveManage",
    image: SPONSOR_BANNERS[0],
    type: "video",
    isActive: true,
  },
  {
    id: "sponsor-2",
    name: "Letra Server List",
    image: SPONSOR_BANNERS[1],
    type: "gif",
    isActive: true,
  },
  {
    id: "sponsor-3",
    name: "Server List",
    image: SPONSOR_BANNERS[2],
    type: "gif",
    isActive: true,
  },
  {
    id: "sponsor-4",
    name: "Gaming Sponsor",
    image: SPONSOR_BANNERS[3],
    type: "gif",
    isActive: true,
  },
]

// Admin Discord Role ID
export const ADMIN_DISCORD_ROLE_ID = "1047719075322810378"
export const ADMIN_DISCORD_ID = "1047719075322810378"

export const DISCORD_CONFIG = {
  clientId: "1445650115447754933",
  redirectUri: `${SITE_URL}/api/auth/callback`,
  scope: "identify email guilds",
}

// Navigation items
export const NAV_ITEMS = [
  { label: "Community Forum", href: "/forum", icon: "MessageSquare", badge: "HOT" },
  { label: "Discover", href: "/", icon: "Compass" },
  { label: "Scripts", href: "/scripts", icon: "Code" },
  { label: "Maps & MLO", href: "/mlo", icon: "MapPin" },
  { label: "Vehicles", href: "/vehicles", icon: "Car" },
  { label: "EUP & Clothing", href: "/clothing", icon: "Shirt" },
  { label: "Messages", href: "/messages", icon: "Mail" },
  { label: "Membership", href: "/membership", icon: "Crown" },
  { label: "Decrypt CFX V7", href: "/decrypt", icon: "Key" },
  { label: "Upvotes Server", href: "/upvotes", icon: "Rocket" },
]

// Forum categories
export const FORUM_CATEGORIES = [
  {
    id: "announcements",
    name: "Announcements",
    description: "Official announcements and updates from the team",
    icon: "megaphone",
    color: "#EF4444",
    sort_order: 1,
  },
  {
    id: "general",
    name: "General Discussion",
    description: "Chat about anything FiveM related",
    icon: "message-circle",
    color: "#22C55E",
    sort_order: 2,
  },
  {
    id: "help",
    name: "Help & Support",
    description: "Get help with scripts, installation, and troubleshooting",
    icon: "help-circle",
    color: "#F59E0B",
    sort_order: 3,
  },
  {
    id: "requests",
    name: "Script Requests",
    description: "Request new scripts and features",
    icon: "code",
    color: "#3B82F6",
    sort_order: 4,
  },
  {
    id: "showcase",
    name: "Showcase",
    description: "Show off your servers and creations",
    icon: "star",
    color: "#EC4899",
    sort_order: 5,
  },
  {
    id: "marketplace",
    name: "Marketplace",
    description: "Buy, sell, and trade FiveM resources",
    icon: "shopping-bag",
    color: "#8B5CF6",
    sort_order: 6,
  },
]
