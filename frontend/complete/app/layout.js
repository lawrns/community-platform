import './globals.css'
import Navbar from '../components/Navbar'

export const metadata = {
  title: 'Complete Next.js App',
  description: 'A more complete Next.js app for testing deployment',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <footer className="bg-primary text-primary-foreground p-4">
            <div className="container mx-auto">
              <p>© 2023 Complete Next.js App. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
