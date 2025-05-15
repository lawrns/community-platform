export default function TestPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-4">Test Page</h1>
      <p className="text-xl mb-8">This is a simple test page to verify Vercel deployment.</p>
      <div className="p-6 bg-gray-100 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-2">Deployment Information</h2>
        <p>This page was created to test the Vercel deployment configuration.</p>
        <p className="mt-4">If you can see this page, the deployment is working correctly!</p>
      </div>
    </div>
  );
}
