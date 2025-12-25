import { useSession, signIn, signOut } from "next-auth/react"

export function useAuth() {
  const { data: session, status } = useSession()
  
  return {
    user: session?.user,
    isLoading: status === "loading",
    isAdmin: session?.user?.isAdmin ?? false,
    login: () => signIn("discord"),
    logout: () => signOut(),
    session
  }
}
