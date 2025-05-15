export default function SimpleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="bg-gray-800 text-white p-4">
            <div className="container mx-auto">
              <h1 className="text-2xl font-bold">Simple Layout</h1>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
          <footer className="bg-gray-800 text-white p-4">
            <div className="container mx-auto">
              <p>© 2023 Simple Layout. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
