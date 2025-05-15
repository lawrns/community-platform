export default function BasicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Basic Layout</h1>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-gray-800 text-white p-4">
        <div className="container mx-auto">
          <p>© 2023 Basic Layout. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
