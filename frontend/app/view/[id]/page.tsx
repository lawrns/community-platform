import Link from 'next/link';
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
  author: {
    id: '456',
    name: 'John Doe',
    avatar: '',
    reputation: 1250
  },
  visibility: 'public',
  stats: {
    views: 1243,
    upvotes: 87,
    comments: 23
  },
  created_at: '2025-04-15T10:30:00Z',
  updated_at: '2025-05-10T14:45:00Z'
};

export default function ViewContentPage({ params }: { params: { id: string } }) {
  // In a real app, we would fetch the content based on the id from the params
  const content = sampleContent;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Content Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{content.title}</h1>

          <div className="flex flex-wrap items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
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
                <div>
                  <Link href={`/profile/${content.author.id}`} className="font-medium hover:underline">
                    {content.author.name}
                  </Link>
                  <div className="text-sm text-gray-500 flex items-center">
                    <span>{content.author.reputation} reputation</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(content.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-2 sm:mt-0">
              <Button variant="outline" size="sm">
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
                  <path d="M7 10v12"></path>
                  <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
                </svg>
                {content.stats.upvotes}
              </Button>
              <Button variant="outline" size="sm">
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
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                {content.stats.comments}
              </Button>
              <Button variant="outline" size="sm">
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
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                  <polyline points="16 6 12 2 8 6"></polyline>
                  <line x1="12" y1="2" x2="12" y2="15"></line>
                </svg>
                Share
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {content.tags.map(tag => (
              <Link
                key={tag}
                href={`/tags/${tag}`}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="prose prose-lg max-w-none mb-10 pb-10 border-b">
          <div dangerouslySetInnerHTML={{
            __html: content.content
              .replace(/^# (.*$)/gm, '<h1>$1</h1>')
              .replace(/^## (.*$)/gm, '<h2>$1</h2>')
              .replace(/^### (.*$)/gm, '<h3>$1</h3>')
              .replace(/^- (.*$)/gm, '<li>$1</li>')
              .replace(/\n\n/g, '</p><p>')
              .replace(/<li>.*<\/li>/g, match => `<ul>${match}</ul>`)
          }} />
        </div>

        {/* Comments Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Comments ({content.stats.comments})</h3>

          <div className="space-y-4 mb-6">
            <div className="p-4 border rounded-lg">
              <div className="flex items-start mb-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
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
                    className="text-gray-400"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <Link href="/profile/user1" className="font-medium hover:underline">
                      Alex Thompson
                    </Link>
                    <span className="text-xs text-gray-500">2 days ago</span>
                  </div>
                  <p className="text-sm mt-1">
                    Great overview! I'd add that instruction tuning and RLHF have been critical in making LLMs more useful for specific tasks.
                  </p>
                  <div className="flex items-center mt-2 text-sm">
                    <button className="text-gray-500 hover:text-blue-500 mr-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="inline mr-1"
                      >
                        <path d="M7 10v12"></path>
                        <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
                      </svg>
                      15
                    </button>
                    <button className="text-gray-500 hover:text-blue-500">Reply</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-start mb-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
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
                    className="text-gray-400"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <Link href="/profile/user2" className="font-medium hover:underline">
                      Sarah Chen
                    </Link>
                    <span className="text-xs text-gray-500">4 days ago</span>
                  </div>
                  <p className="text-sm mt-1">
                    I'd love to see more about benchmark comparisons between different models. Are there any specific metrics you recommend for evaluating LLMs for research applications?
                  </p>
                  <div className="flex items-center mt-2 text-sm">
                    <button className="text-gray-500 hover:text-blue-500 mr-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="inline mr-1"
                      >
                        <path d="M7 10v12"></path>
                        <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
                      </svg>
                      8
                    </button>
                    <button className="text-gray-500 hover:text-blue-500">Reply</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium mb-2">Add a comment</h4>
            <textarea
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
              placeholder="Share your thoughts..."
            ></textarea>
            <div className="flex justify-end mt-2">
              <Button>Post Comment</Button>
            </div>
          </div>
        </div>

        {/* Related Content */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Related Content</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <span className="text-xs text-gray-500 uppercase">Article</span>
              <h4 className="font-medium mb-1">Practical Guide to Fine-tuning LLMs</h4>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                A step-by-step guide to fine-tuning large language models for domain-specific tasks.
              </p>
              <div className="flex justify-between text-xs text-gray-500">
                <span>By Emily Johnson</span>
                <span>1,025 views</span>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <span className="text-xs text-gray-500 uppercase">Tutorial</span>
              <h4 className="font-medium mb-1">Building RAG Applications with LLMs</h4>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                Learn how to implement Retrieval-Augmented Generation to give LLMs access to external knowledge.
              </p>
              <div className="flex justify-between text-xs text-gray-500">
                <span>By Michael Wong</span>
                <span>842 views</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// This function tells Next.js which dynamic routes to pre-render for static export
export async function generateStaticParams() {
  // For a static export, we need to provide a list of all possible [id] values
  // Include a comprehensive list of content IDs that might be viewed
  return [
    // Content categories
    { id: 'post' },
    { id: 'event' },
    { id: 'resource' },
    { id: 'announcement' },
    { id: 'guide' },
    { id: 'tutorial' },
    { id: 'faq' },

    // Sample content IDs
    { id: 'post-1' },
    { id: 'post-2' },
    { id: 'post-3' },
    { id: 'post-4' },
    { id: 'post-5' },
    { id: 'event-1' },
    { id: 'event-2' },
    { id: 'event-3' },
    { id: 'resource-1' },
    { id: 'resource-2' },
    { id: 'resource-3' },
    { id: 'announcement-1' },
    { id: 'announcement-2' },

    // Featured content
    { id: 'welcome' },
    { id: 'getting-started' },
    { id: 'community-guidelines' },
    { id: 'code-of-conduct' },

    // Special IDs
    { id: 'latest' },
    { id: 'featured' },
    { id: 'trending' },
    { id: 'placeholder' }
  ]
}