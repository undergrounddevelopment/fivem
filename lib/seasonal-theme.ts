// Enhanced Holiday Theme System with 3D Effects
export interface Holiday {
  name: string
  start: string
  end: string
  theme: {
    primary: string
    secondary: string
    accent: string
    bg: string
    text: string
  }
  effects: string[]
  particles: {
    emoji: string
    count: number
    speed: number
  }
}

export const HOLIDAYS: Holiday[] = [
  {
    name: "New Year",
    start: "01-01",
    end: "01-07",
    theme: {
      primary: "#9333ea",
      secondary: "#ec4899",
      accent: "#fbbf24",
      bg: "from-purple-500/20 via-pink-500/20 to-yellow-500/20",
      text: "Happy New Year 2025 🎉"
    },
    effects: ["✨", "🎆", "🎊", "⭐"],
    particles: { emoji: "✨", count: 30, speed: 2 }
  },
  {
    name: "Valentine",
    start: "02-10",
    end: "02-14",
    theme: {
      primary: "#ef4444",
      secondary: "#ec4899",
      accent: "#f472b6",
      bg: "from-red-500/20 via-pink-500/20 to-rose-500/20",
      text: "Happy Valentine's Day 💝"
    },
    effects: ["❤️", "💕", "💖", "💗", "💝"],
    particles: { emoji: "❤️", count: 25, speed: 1.5 }
  },
  {
    name: "St Patrick",
    start: "03-15",
    end: "03-17",
    theme: {
      primary: "#10b981",
      secondary: "#059669",
      accent: "#fbbf24",
      bg: "from-green-500/20 via-emerald-500/20 to-green-600/20",
      text: "St. Patrick's Day 🍀"
    },
    effects: ["🍀", "☘️", "🌈", "🎩"],
    particles: { emoji: "🍀", count: 20, speed: 1.2 }
  },
  {
    name: "Easter",
    start: "03-25",
    end: "04-05",
    theme: {
      primary: "#84cc16",
      secondary: "#fbbf24",
      accent: "#ec4899",
      bg: "from-green-400/20 via-yellow-400/20 to-pink-400/20",
      text: "Happy Easter 🐰"
    },
    effects: ["🥚", "🐣", "🐰", "🌸", "🌷"],
    particles: { emoji: "🥚", count: 20, speed: 1 }
  },
  {
    name: "Earth Day",
    start: "04-20",
    end: "04-22",
    theme: {
      primary: "#10b981",
      secondary: "#3b82f6",
      accent: "#84cc16",
      bg: "from-green-600/20 via-blue-500/20 to-green-500/20",
      text: "Earth Day 🌍"
    },
    effects: ["🌍", "🌱", "🌳", "♻️"],
    particles: { emoji: "🌱", count: 15, speed: 0.8 }
  },
  {
    name: "Cinco de Mayo",
    start: "05-03",
    end: "05-05",
    theme: {
      primary: "#ef4444",
      secondary: "#10b981",
      accent: "#fbbf24",
      bg: "from-red-500/20 via-green-500/20 to-yellow-500/20",
      text: "Cinco de Mayo 🇲🇽"
    },
    effects: ["🌮", "🎉", "🎊", "🇲🇽"],
    particles: { emoji: "🎉", count: 25, speed: 1.5 }
  },
  {
    name: "Pride Month",
    start: "06-01",
    end: "06-30",
    theme: {
      primary: "#ef4444",
      secondary: "#3b82f6",
      accent: "#9333ea",
      bg: "from-red-500/20 via-purple-500/20 to-blue-500/20",
      text: "Pride Month 🏳️‍🌈"
    },
    effects: ["🏳️‍🌈", "❤️", "🧡", "💛", "💚", "💙", "💜"],
    particles: { emoji: "🏳️‍🌈", count: 20, speed: 1.3 }
  },
  {
    name: "Independence Day",
    start: "07-01",
    end: "07-04",
    theme: {
      primary: "#dc2626",
      secondary: "#3b82f6",
      accent: "#ffffff",
      bg: "from-red-600/20 via-white/20 to-blue-600/20",
      text: "Independence Day 🇺🇸"
    },
    effects: ["🎆", "🎇", "⭐", "🗽", "🇺🇸"],
    particles: { emoji: "🎆", count: 30, speed: 2 }
  },
  {
    name: "Indonesia Independence",
    start: "08-15",
    end: "08-17",
    theme: {
      primary: "#dc2626",
      secondary: "#ffffff",
      accent: "#fbbf24",
      bg: "from-red-600/20 to-white/20",
      text: "Merdeka Indonesia 🇮🇩"
    },
    effects: ["🇮🇩", "🎊", "🎉", "⭐"],
    particles: { emoji: "🇮🇩", count: 25, speed: 1.5 }
  },
  {
    name: "Halloween",
    start: "10-25",
    end: "10-31",
    theme: {
      primary: "#f97316",
      secondary: "#7c3aed",
      accent: "#10b981",
      bg: "from-orange-600/20 via-purple-900/20 to-black/20",
      text: "Happy Halloween 🎃"
    },
    effects: ["🎃", "👻", "🦇", "🕷️", "🕸️", "💀"],
    particles: { emoji: "🎃", count: 20, speed: 1 }
  },
  {
    name: "Thanksgiving",
    start: "11-20",
    end: "11-28",
    theme: {
      primary: "#f97316",
      secondary: "#fbbf24",
      accent: "#dc2626",
      bg: "from-orange-600/20 via-yellow-600/20 to-red-600/20",
      text: "Happy Thanksgiving 🦃"
    },
    effects: ["🦃", "🍂", "🍁", "🌽", "🥧"],
    particles: { emoji: "🍂", count: 25, speed: 1.2 }
  },
  {
    name: "Christmas",
    start: "12-15",
    end: "12-31",
    theme: {
      primary: "#dc2626",
      secondary: "#10b981",
      accent: "#fbbf24",
      bg: "from-red-600/20 via-green-600/20 to-red-600/20",
      text: "Merry Christmas 🎄"
    },
    effects: ["❄️", "⛄", "🎅", "🎁", "🎄", "⭐"],
    particles: { emoji: "❄️", count: 35, speed: 0.8 }
  }
]

export function getCurrentHoliday(): Holiday | null {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return HOLIDAYS.find(holiday => {
    const [startMonth, startDay] = holiday.start.split('-')
    const [endMonth, endDay] = holiday.end.split('-')
    
    if (startMonth === endMonth) {
      return month === startMonth && day >= startDay && day <= endDay
    }
    
    return (month === startMonth && day >= startDay) || 
           (month === endMonth && day <= endDay) ||
           (month > startMonth && month < endMonth)
  }) || null
}
