"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "./AuthContext"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  allowUnauthenticated?: boolean
}

export function AuthGuard({ children, allowUnauthenticated = false }: AuthGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading) {
      if (!user && !allowUnauthenticated) {
        // Remember the page they tried to access
        sessionStorage.setItem("redirectAfterLogin", pathname)
        router.push("/signin")
      } else if (user && (pathname === "/signin" || pathname === "/signup")) {
        // Redirect to dashboard if already logged in and trying to access auth pages
        router.push("/dashboard")
      }
    }
  }, [user, isLoading, router, pathname, allowUnauthenticated])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user && !allowUnauthenticated) {
    return null
  }

  return <>{children}</>
}