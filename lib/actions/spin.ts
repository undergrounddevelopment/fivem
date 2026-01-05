"use server"

// ============================================
// LUCKY SPIN WHEEL - EVENT BERAKHIR
// Semua fungsi dinonaktifkan karena event sudah habis
// ============================================

export async function getSpinPrizes() {
  // Event sudah berakhir
  return []
}

export async function spinWheel() {
  // Event sudah berakhir
  throw new Error("Lucky Spin event telah berakhir. Terima kasih telah berpartisipasi!")
}

export async function claimDailySpinTicket() {
  // Event sudah berakhir
  throw new Error("Lucky Spin event telah berakhir. Terima kasih telah berpartisipasi!")
}

export async function getSpinWinners() {
  // Event sudah berakhir
  return []
}

export async function getDailySpinStatus() {
  // Event sudah berakhir
  return { canClaim: false, eventEnded: true }
}

export async function getSpinHistory() {
  // Event sudah berakhir
  return []
}

export async function getUserBalance() {
  // Redirect ke user actions
  const { getUserBalance: getBalance } = await import('@/lib/actions/user')
  return getBalance()
}