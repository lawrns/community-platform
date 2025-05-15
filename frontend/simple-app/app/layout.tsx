import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Community Platform',
  description: 'A platform for community engagement and collaboration',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-border py-4 px-6">
            <div className="container mx-auto flex justify-between items-center">
              <div className="font-bold text-xl">Community Platform</div>
              <nav className="flex gap-6">
                <a href="/" className="hover:text-primary">Home</a>
                <a href="/dashboard" className="hover:text-primary">Dashboard</a>
                <a href="/profile" className="hover:text-primary">Profile</a>
                <a href="/tools" className="hover:text-primary">Tools</a>
                <a href="/search" className="hover:text-primary">Search</a>
              </nav>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
          <footer className="border-t border-border py-6 px-6 text-center text-muted-foreground">
            <div className="container mx-auto">
              <p>© 2023 Community Platform. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
