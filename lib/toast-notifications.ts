/**
 * Client-side Toast Notification Helper
 * Use this to show toast notifications from client components
 */

// Import Toast from modern-toast component
// This file provides typed helpers for common notification scenarios

export type ToastType = "success" | "error" | "warning" | "info" | "xp" | "reward" | "achievement"

export interface ToastOptions {
  title: string
  message?: string
  duration?: number
}

// Dynamic import to avoid SSR issues
let ToastModule: any = null

async function getToast() {
  if (!ToastModule) {
    ToastModule = await import("@/components/modern-toast")
  }
  return ToastModule.Toast
}

/**
 * Show a success toast
 */
export async function showSuccess(title: string, message?: string) {
  const Toast = await getToast()
  return Toast.success(title, message)
}

/**
 * Show an error toast
 */
export async function showError(title: string, message?: string) {
  const Toast = await getToast()
  return Toast.error(title, message)
}

/**
 * Show a warning toast
 */
export async function showWarning(title: string, message?: string) {
  const Toast = await getToast()
  return Toast.warning(title, message)
}

/**
 * Show an info toast
 */
export async function showInfo(title: string, message?: string) {
  const Toast = await getToast()
  return Toast.info(title, message)
}

/**
 * Show an XP gain toast
 */
export async function showXP(amount: number, reason?: string) {
  const Toast = await getToast()
  return Toast.xp(`+${amount} XP`, reason)
}

/**
 * Show a reward toast
 */
export async function showReward(title: string, message?: string) {
  const Toast = await getToast()
  return Toast.reward(title, message)
}

/**
 * Show an achievement toast
 */
export async function showAchievement(title: string, message?: string) {
  const Toast = await getToast()
  return Toast.achievement(title, message)
}

/**
 * Show a loading toast that can be updated
 */
export async function showLoading(title: string, message?: string) {
  const Toast = await getToast()
  return Toast.loading(title, message)
}

/**
 * Update an existing toast
 */
export async function updateToast(id: string, options: { type?: ToastType; title?: string; message?: string }) {
  const Toast = await getToast()
  return Toast.update(id, options)
}

/**
 * Dismiss a toast
 */
export async function dismissToast(id: string) {
  const Toast = await getToast()
  return Toast.dismiss(id)
}

/**
 * Show toast for async operation with loading state
 */
export async function showPromise<T>(
  promise: Promise<T>,
  messages: { loading: string; success: string; error: string }
): Promise<T> {
  const Toast = await getToast()
  return Toast.promise(promise, messages)
}

// Common notification scenarios
export const Notifications = {
  // Forum
  threadCreated: () => showSuccess("Thread Created", "Your thread is pending approval"),
  threadApproved: () => showSuccess("Thread Approved", "Your thread is now visible"),
  replyPosted: () => showSuccess("Reply Posted", "Your reply has been added"),
  
  // Assets
  assetDownloaded: (name: string) => showSuccess("Downloaded", `${name} is ready`),
  assetLiked: () => showSuccess("Liked", "Added to your favorites"),
  commentPosted: () => showSuccess("Comment Posted", "Thanks for your feedback"),
  
  // XP & Rewards
  xpGained: (amount: number, reason: string) => showXP(amount, reason),
  levelUp: (level: number) => showAchievement("Level Up!", `You reached Level ${level}`),
  badgeUnlocked: (badge: string) => showAchievement("Badge Unlocked", badge),
  coinsReceived: (amount: number) => showReward(`+${amount} Coins`, "Added to your wallet"),
  
  // Auth
  loginSuccess: (name: string) => showSuccess("Welcome back!", `Logged in as ${name}`),
  logoutSuccess: () => showInfo("Logged out", "See you next time!"),
  
  // Errors
  unauthorized: () => showError("Unauthorized", "Please login to continue"),
  networkError: () => showError("Connection Error", "Please check your internet"),
  serverError: () => showError("Server Error", "Something went wrong"),
  validationError: (msg: string) => showWarning("Validation Error", msg),
}
