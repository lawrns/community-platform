'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="bg-primary text-primary-foreground p-4">
      <div className="container mx-auto flex flex-col md:flex-row md:justify-between md:items-center">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">Complete Next.js App</Link>
          <button className="md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <div className="md:flex md:space-x-4">
          <Link href="/" className={`block py-2 md:py-0 ${pathname === '/' ? 'font-bold' : ''}`}>Home</Link>
          <Link href="/dashboard" className={`block py-2 md:py-0 ${pathname === '/dashboard' ? 'font-bold' : ''}`}>Dashboard</Link>
          <Link href="/profile" className={`block py-2 md:py-0 ${pathname === '/profile' ? 'font-bold' : ''}`}>Profile</Link>
          <Link href="/tools" className={`block py-2 md:py-0 ${pathname === '/tools' ? 'font-bold' : ''}`}>Tools</Link>
        </div>
      </div>
    </nav>
  )
}
