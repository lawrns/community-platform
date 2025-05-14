import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Settings Sidebar */}
          <div className="col-span-1">
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start font-medium bg-gray-100">
                Profile
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Notifications
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Privacy
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Security
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Preferences
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                API Keys
              </Button>
              <Button variant="ghost" className="w-full justify-start text-red-500">
                Delete Account
              </Button>
            </div>
          </div>
          
          {/* Settings Main Content */}
          <div className="col-span-1 md:col-span-3">
            <div className="border rounded-lg p-6 space-y-6">
              <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
              
              {/* Profile Photo */}
              <div>
                <label className="block text-sm font-medium mb-2">Profile Photo</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-400"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Upload new photo</Button>
                      <Button variant="outline" size="sm" className="text-red-500">Remove</Button>
                    </div>
                    <p className="text-xs text-gray-500">JPG, GIF or PNG. 1MB max.</p>
                  </div>
                </div>
              </div>
              
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  id="name"
                  type="text"
                  defaultValue="John Doe"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  id="email"
                  type="email"
                  defaultValue="john.doe@example.com"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-2">Username</label>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-1">community.io/</span>
                  <input
                    id="username"
                    type="text"
                    defaultValue="johndoe"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              
              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  id="bio"
                  rows={4}
                  defaultValue="AI researcher specializing in natural language processing and large language models. Currently working on improving context handling in transformer-based architectures."
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-gray-500 mt-1">Brief description for your profile. Max 160 characters.</p>
              </div>
              
              {/* Interests */}
              <div>
                <label htmlFor="interests" className="block text-sm font-medium mb-2">Interests</label>
                <input
                  id="interests"
                  type="text"
                  defaultValue="Machine Learning, NLP, Large Language Models, Transformers, AI Ethics"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-gray-500 mt-1">Add up to 5 interests, separated by commas.</p>
              </div>
              
              {/* External Links */}
              <div>
                <label className="block text-sm font-medium mb-2">External Links</label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Website"
                      defaultValue="https://johndoe.ai"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="LinkedIn"
                      defaultValue="https://linkedin.com/in/johndoe"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="GitHub"
                      defaultValue="https://github.com/johndoe"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <Button variant="outline" size="sm">+ Add another link</Button>
                </div>
              </div>
              
              <div className="pt-4 border-t flex justify-end gap-3">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}