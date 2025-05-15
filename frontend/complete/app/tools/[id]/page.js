export default function ToolDetail({ params }) {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-4">Tool: {params.id}</h1>
      <p className="text-xl mb-8">
        This is the detail page for tool {params.id}.
      </p>
      <div className="bg-secondary p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-2">Tool Details</h2>
        <p className="mb-4">
          This is a detailed description of the tool. This is a dynamic route that uses the [id] parameter.
        </p>
        <div className="mt-6">
          <a href="/tools" className="bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90">
            Back to Tools
          </a>
        </div>
      </div>
    </div>
  )
}
