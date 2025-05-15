export default function Home() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-4">Complete Next.js App</h1>
      <p className="text-xl mb-8">
        This is a more complete Next.js app to test deployment on Vercel.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-secondary p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-2">Feature 1</h2>
          <p className="mb-4">This is a feature of the complete Next.js app.</p>
          <a href="#" className="text-primary hover:underline">Learn more</a>
        </div>
        <div className="bg-secondary p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-2">Feature 2</h2>
          <p className="mb-4">This is another feature of the complete Next.js app.</p>
          <a href="#" className="text-primary hover:underline">Learn more</a>
        </div>
        <div className="bg-secondary p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-2">Feature 3</h2>
          <p className="mb-4">This is yet another feature of the complete Next.js app.</p>
          <a href="#" className="text-primary hover:underline">Learn more</a>
        </div>
      </div>
    </div>
  )
}
