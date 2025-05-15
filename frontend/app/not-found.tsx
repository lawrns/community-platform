"use client"

import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  useEffect(() => {
    // Try to handle client-side routing for dynamic routes
    const path = window.location.pathname
    
    // Check if this is a dynamic route
    if (path.startsWith('/tools/')) {
      router.push(`/tools/placeholder?id=${path.split('/').pop()}`)
    } else if (path.startsWith('/profile/')) {
      router.push(`/profile/placeholder?id=${path.split('/').pop()}`)
    } else if (path.startsWith('/view/')) {
      router.push(`/view/placeholder?id=${path.split('/').pop()}`)
    } else if (path.startsWith('/edit/')) {
      router.push(`/edit/placeholder?id=${path.split('/').pop()}`)
    }
  }, [router])

  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
      <p className="text-muted-foreground mb-6">
        Sorry, the page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link 
          href="/" 
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Go to Home
        </Link>
        <Link 
          href="/dashboard" 
          className="inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
