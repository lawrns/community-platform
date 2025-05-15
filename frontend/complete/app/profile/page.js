export default function Profile() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-4">Profile</h1>
      <p className="text-xl mb-8">
        This is the profile page of the complete Next.js app.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-secondary p-6 rounded-lg shadow-md">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-4xl font-bold mb-4">
                JD
              </div>
              <h2 className="text-2xl font-bold">John Doe</h2>
              <p className="text-gray-500 mb-4">@johndoe</p>
              <button className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90">
                Edit Profile
              </button>
            </div>
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="bg-secondary p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-semibold mb-2">About</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.
            </p>
          </div>
          <div className="bg-secondary p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-2">Recent Activity</h2>
            <ul className="space-y-4">
              <li className="p-4 bg-white rounded-lg shadow">
                <h3 className="font-medium">Posted a new article</h3>
                <p className="text-gray-500 text-sm">2 days ago</p>
              </li>
              <li className="p-4 bg-white rounded-lg shadow">
                <h3 className="font-medium">Commented on an article</h3>
                <p className="text-gray-500 text-sm">5 days ago</p>
              </li>
              <li className="p-4 bg-white rounded-lg shadow">
                <h3 className="font-medium">Liked an article</h3>
                <p className="text-gray-500 text-sm">1 week ago</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
