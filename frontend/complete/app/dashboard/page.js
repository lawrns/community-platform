export default function Dashboard() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
      <p className="text-xl mb-8">
        This is the dashboard page of the complete Next.js app.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-secondary p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-2">Recent Activity</h2>
          <ul className="space-y-2">
            <li className="p-2 border-b">Activity 1</li>
            <li className="p-2 border-b">Activity 2</li>
            <li className="p-2 border-b">Activity 3</li>
            <li className="p-2">Activity 4</li>
          </ul>
        </div>
        <div className="bg-secondary p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-2">Statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg shadow">
              <h3 className="text-lg font-medium mb-1">Total Users</h3>
              <p className="text-3xl font-bold">1,234</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow">
              <h3 className="text-lg font-medium mb-1">Total Posts</h3>
              <p className="text-3xl font-bold">5,678</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow">
              <h3 className="text-lg font-medium mb-1">Active Users</h3>
              <p className="text-3xl font-bold">789</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow">
              <h3 className="text-lg font-medium mb-1">New Posts</h3>
              <p className="text-3xl font-bold">123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
