export const metadata = {
  title: 'Minimal Next.js App',
  description: 'A minimal Next.js app for testing deployment',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
