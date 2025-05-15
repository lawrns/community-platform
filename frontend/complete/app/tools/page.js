export default function Tools() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-4">Tools</h1>
      <p className="text-xl mb-8">
        This is the tools page of the complete Next.js app.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-secondary p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-2">Tool 1</h2>
          <p className="mb-4">This is a description of Tool 1.</p>
          <a href="#" className="text-primary hover:underline">Learn more</a>
        </div>
        <div className="bg-secondary p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-2">Tool 2</h2>
          <p className="mb-4">This is a description of Tool 2.</p>
          <a href="#" className="text-primary hover:underline">Learn more</a>
        </div>
        <div className="bg-secondary p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-2">Tool 3</h2>
          <p className="mb-4">This is a description of Tool 3.</p>
          <a href="#" className="text-primary hover:underline">Learn more</a>
        </div>
        <div className="bg-secondary p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-2">Tool 4</h2>
          <p className="mb-4">This is a description of Tool 4.</p>
          <a href="#" className="text-primary hover:underline">Learn more</a>
        </div>
        <div className="bg-secondary p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-2">Tool 5</h2>
          <p className="mb-4">This is a description of Tool 5.</p>
          <a href="#" className="text-primary hover:underline">Learn more</a>
        </div>
        <div className="bg-secondary p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-2">Tool 6</h2>
          <p className="mb-4">This is a description of Tool 6.</p>
          <a href="#" className="text-primary hover:underline">Learn more</a>
        </div>
      </div>
    </div>
  )
}
