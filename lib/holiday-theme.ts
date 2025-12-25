// Holiday Theme System - Auto changes based on date (12 Holidays)
export interface Holiday {
  name: string
  start: string // MM-DD
  end: string // MM-DD
  theme: {
    primary: string
    secondary: string
    accent: string
    bg: string
    text: string
  }
  effects: string[]
}

export const HOLIDAYS: Holiday[] = [
  {
    name: "New Year",
    start: "01-01",
    end: "01-07",
    theme: {
      primary: "oklch(0.75 0.15 280)",
      secondary: "oklch(0.7 0.18 320)",
      accent: "oklch(0.8 0.15 80)",
      bg: "from-purple-500/20 via-pink-500/20 to-yellow-500/20",
      text: "New Year 2025 🎆"
    },
    effects: ["✨", "🎉", "🎊", "🎆"]
  },
  {
    name: "Valentine",
    start: "02-10",
    end: "02-14",
    theme: {
      primary: "oklch(0.7 0.2 30)",
      secondary: "oklch(0.75 0.18 350)",
      accent: "oklch(0.8 0.15 340)",
      bg: "from-red-500/20 via-pink-500/20 to-rose-500/20",
      text: "Happy Valentine's Day 💝"
    },
    effects: ["❤️", "💕", "💖", "💗", "💝"]
  },
  {
    name: "St Patrick",
    start: "03-15",
    end: "03-17",
    theme: {
      primary: "oklch(0.7 0.18 160)",
      secondary: "oklch(0.75 0.15 120)",
      accent: "oklch(0.8 0.15 80)",
      bg: "from-green-500/20 via-emerald-500/20 to-green-600/20",
      text: "St. Patrick's Day 🍀"
    },
    effects: ["🍀", "☘️", "🌈", "🎩"]
  },
  {
    name: "Easter",
    start: "03-25",
    end: "04-05",
    theme: {
      primary: "oklch(0.75 0.15 120)",
      secondary: "oklch(0.8 0.15 80)",
      accent: "oklch(0.7 0.18 350)",
      bg: "from-green-400/20 via-yellow-400/20 to-pink-400/20",
      text: "Happy Easter 🐰"
    },
    effects: ["🥚", "🐣", "🐰", "🌸", "🌷"]
  },
  {
    name: "Earth Day",
    start: "04-20",
    end: "04-22",
    theme: {
      primary: "oklch(0.7 0.18 160)",
      secondary: "oklch(0.65 0.15 240)",
      accent: "oklch(0.75 0.15 120)",
      bg: "from-green-600/20 via-blue-500/20 to-green-500/20",
      text: "Earth Day 🌍"
    },
    effects: ["🌍", "🌱", "🌳", "♻️"]
  },
  {
    name: "Cinco de Mayo",
    start: "05-03",
    end: "05-05",
    theme: {
      primary: "oklch(0.7 0.2 30)",
      secondary: "oklch(0.7 0.18 160)",
      accent: "oklch(0.8 0.15 80)",
      bg: "from-red-500/20 via-green-500/20 to-yellow-500/20",
      text: "Cinco de Mayo 🇲🇽"
    },
    effects: ["🌮", "🎉", "🎊", "🇲🇽"]
  },
  {
    name: "Pride Month",
    start: "06-01",
    end: "06-30",
    theme: {
      primary: "oklch(0.7 0.2 30)",
      secondary: "oklch(0.65 0.15 240)",
      accent: "oklch(0.75 0.15 280)",
      bg: "from-red-500/20 via-purple-500/20 to-blue-500/20",
      text: "Pride Month 🏳️‍🌈"
    },
    effects: ["🏳️‍🌈", "❤️", "🧡", "💛", "💚", "💙", "💜"]
  },
  {
    name: "Independence Day",
    start: "07-01",
    end: "07-04",
    theme: {
      primary: "oklch(0.6 0.22 25)",
      secondary: "oklch(0.65 0.15 240)",
      accent: "oklch(0.95 0.01 260)",
      bg: "from-red-600/20 via-white/20 to-blue-600/20",
      text: "Independence Day 🇺🇸"
    },
    effects: ["🎆", "🎇", "⭐", "🗽", "🇺🇸"]
  },
  {
    name: "Indonesia Independence",
    start: "08-15",
    end: "08-17",
    theme: {
      primary: "oklch(0.6 0.22 25)",
      secondary: "oklch(0.95 0.01 260)",
      accent: "oklch(0.8 0.15 80)",
      bg: "from-red-600/20 to-white/20",
      text: "Merdeka Indonesia 🇮🇩"
    },
    effects: ["🇮🇩", "🎊", "🎉", "⭐"]
  },
  {
    name: "Halloween",
    start: "10-25",
    end: "10-31",
    theme: {
      primary: "oklch(0.7 0.2 30)",
      secondary: "oklch(0.3 0.05 280)",
      accent: "oklch(0.6 0.15 120)",
      bg: "from-orange-600/20 via-purple-900/20 to-black/20",
      text: "Happy Halloween 🎃"
    },
    effects: ["🎃", "👻", "🦇", "🕷️", "🕸️", "💀"]
  },
  {
    name: "Thanksgiving",
    start: "11-20",
    end: "11-28",
    theme: {
      primary: "oklch(0.7 0.2 30)",
      secondary: "oklch(0.8 0.15 80)",
      accent: "oklch(0.6 0.15 40)",
      bg: "from-orange-600/20 via-yellow-600/20 to-red-600/20",
      text: "Happy Thanksgiving 🦃"
    },
    effects: ["🦃", "🍂", "🍁", "🌽", "🥧"]
  },
  {
    name: "Christmas",
    start: "12-15",
    end: "12-31",
    theme: {
      primary: "oklch(0.6 0.22 25)",
      secondary: "oklch(0.7 0.18 160)",
      accent: "oklch(0.8 0.15 80)",
      bg: "from-red-600/20 via-green-600/20 to-red-600/20",
      text: "Merry Christmas 🎄"
    },
    effects: ["❄️", "⛄", "🎅", "🎁", "🎄", "⭐"]
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
