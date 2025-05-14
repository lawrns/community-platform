import Editor from '@/components/editor/Editor';
import { Button } from '@/components/ui/button';

// This is a sample content that would normally be fetched from an API
const sampleContent = {
  id: '123',
  title: 'Understanding Large Language Models: A Comprehensive Guide',
  type: 'Article',
  content: `# Understanding Large Language Models

Large Language Models (LLMs) have revolutionized natural language processing in recent years. This article provides a comprehensive overview of how these models work, their capabilities, and their limitations.

## How LLMs Work

LLMs are built using transformer architectures, which rely on self-attention mechanisms to process and generate text. These models are trained on vast datasets of text from the internet and books, learning patterns and relationships between words and concepts.

## Key Capabilities

LLMs can:
- Generate human-like text
- Answer questions based on their training data
- Summarize long documents
- Translate between languages
- Write creative content like stories or poems
- Assist with coding and technical tasks

## Limitations and Challenges

Despite their impressive capabilities, LLMs face several challenges:
- They can generate plausible-sounding but incorrect information
- They may reproduce biases present in their training data
- They lack true understanding of the content they process
- They have limited reasoning abilities for complex tasks

## The Future of LLMs

As research continues, we can expect improvements in:
- Reasoning capabilities
- Factual accuracy
- Alignment with human values
- Computational efficiency

LLMs represent a significant step forward in AI, but understanding their strengths and weaknesses is crucial for using them effectively.`,
  tags: ['AI', 'Machine Learning', 'NLP', 'Large Language Models', 'Deep Learning'],
  visibility: 'public',
  created_at: '2025-04-15T10:30:00Z',
  updated_at: '2025-05-10T14:45:00Z'
};

export default function EditContentPage({ params }: { params: { id: string } }) {
  // In a real app, we would fetch the content based on the id from the params
  const content = sampleContent;
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Edit Content</h1>
          <p className="text-gray-500">
            Last edited: {new Date(content.updated_at).toLocaleString()}
          </p>
        </div>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">Title</label>
            <input
              id="title"
              type="text"
              defaultValue={content.title}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div>
            <label htmlFor="content-type" className="block text-sm font-medium mb-2">Content Type</label>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={content.type === 'Article' ? 'default' : 'outline'} 
                className="rounded-full"
              >
                Article
              </Button>
              <Button 
                variant={content.type === 'Question' ? 'default' : 'outline'} 
                className="rounded-full"
              >
                Question
              </Button>
              <Button 
                variant={content.type === 'Tutorial' ? 'default' : 'outline'} 
                className="rounded-full"
              >
                Tutorial
              </Button>
              <Button 
                variant={content.type === 'Tool Review' ? 'default' : 'outline'} 
                className="rounded-full"
              >
                Tool Review
              </Button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <Editor initialContent={content.content} />
          </div>
          
          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-2">Tags (maximum 5)</label>
            <input
              id="tags"
              type="text"
              defaultValue={content.tags.join(', ')}
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
                  defaultChecked={content.visibility === 'public'}
                  className="mr-2"
                />
                <label htmlFor="public">Public</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="unlisted"
                  name="visibility"
                  defaultChecked={content.visibility === 'unlisted'}
                  className="mr-2"
                />
                <label htmlFor="unlisted">Unlisted</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="draft"
                  name="visibility"
                  defaultChecked={content.visibility === 'draft'}
                  className="mr-2"
                />
                <label htmlFor="draft">Save as Draft</label>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 pt-4 border-t">
            <div className="flex-1">
              <Button variant="outline" className="text-red-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                Delete
              </Button>
            </div>
            <Button variant="outline">Cancel</Button>
            <Button variant="outline">Save Draft</Button>
            <Button>Update</Button>
          </div>
          
          <div className="text-xs text-gray-500 pt-2">
            <p>Version history: 3 previous versions</p>
          </div>
        </div>
      </div>
    </div>
  );
}