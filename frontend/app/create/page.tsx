import Editor from '@/components/editor/Editor';
import { Button } from '@/components/ui/button';

export default function CreateContentPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Create Content</h1>
          <p className="text-gray-500">Share your knowledge with the community</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">Title</label>
            <input
              id="title"
              type="text"
              placeholder="Enter a descriptive title"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div>
            <label htmlFor="content-type" className="block text-sm font-medium mb-2">Content Type</label>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="rounded-full">Article</Button>
              <Button variant="outline" className="rounded-full">Question</Button>
              <Button variant="outline" className="rounded-full">Tutorial</Button>
              <Button variant="outline" className="rounded-full">Tool Review</Button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <Editor />
          </div>
          
          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-2">Tags (maximum 5)</label>
            <input
              id="tags"
              type="text"
              placeholder="Add tags separated by commas"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-gray-500 mt-1">
              Tags help others discover your content. Choose relevant tags for better visibility.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Visibility</label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="public"
                  name="visibility"
                  defaultChecked
                  className="mr-2"
                />
                <label htmlFor="public">Public</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="unlisted"
                  name="visibility"
                  className="mr-2"
                />
                <label htmlFor="unlisted">Unlisted</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="draft"
                  name="visibility"
                  className="mr-2"
                />
                <label htmlFor="draft">Save as Draft</label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline">Save Draft</Button>
            <Button>Publish</Button>
          </div>
        </div>
      </div>
    </div>
  );
}