'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import NotificationItem, { NotificationItemProps } from '@/components/notifications/NotificationItem';
import ClientSideOnly from '@/components/ClientSideOnly';

// Sample notification data (extended for the full page view)
const sampleNotifications: NotificationItemProps[] = [
  {
    id: '1',
    type: 'mention',
    content: 'mentioned you in a comment: "Thanks @johndoe for your insights on transformer models."',
    link: '/view/123#comment-456',
    timestamp: '15 minutes ago',
    read: false,
    actor: {
      id: '789',
      name: 'Emily Chen'
    }
  },
  {
    id: '2',
    type: 'comment',
    content: 'commented on your post "Understanding Large Language Models"',
    link: '/view/123#comment-457',
    timestamp: '2 hours ago',
    read: false,
    actor: {
      id: '101',
      name: 'Michael Wong'
    }
  },
  {
    id: '3',
    type: 'upvote',
    content: 'upvoted your answer about fine-tuning techniques',
    link: '/view/124#answer-321',
    timestamp: '1 day ago',
    read: true,
    actor: {
      id: '202',
      name: 'Sarah Johnson'
    }
  },
  {
    id: '4',
    type: 'follow',
    content: 'started following you',
    link: '/profile/202',
    timestamp: '2 days ago',
    read: true,
    actor: {
      id: '202',
      name: 'Sarah Johnson'
    }
  },
  {
    id: '5',
    type: 'badge',
    content: 'You earned the "Contributor" badge',
    link: '/profile/badges',
    timestamp: '3 days ago',
    read: true
  },
  {
    id: '6',
    type: 'mention',
    content: 'mentioned you in "Prompt Engineering Best Practices"',
    link: '/view/125#comment-789',
    timestamp: '4 days ago',
    read: true,
    actor: {
      id: '303',
      name: 'David Lee'
    }
  },
  {
    id: '7',
    type: 'comment',
    content: 'replied to your comment on "AI Safety Frameworks"',
    link: '/view/126#comment-890',
    timestamp: '5 days ago',
    read: true,
    actor: {
      id: '404',
      name: 'Alex Rivera'
    }
  },
  {
    id: '8',
    type: 'system',
    content: 'Your post "Transformer Architecture Explained" was featured in the weekly digest',
    link: '/view/127',
    timestamp: '6 days ago',
    read: true
  },
  {
    id: '9',
    type: 'system',
    content: 'You earned the "Helpful Answer" badge for your contribution',
    link: '/profile/badges',
    timestamp: '1 week ago',
    read: true
  },
  {
    id: '10',
    type: 'mention',
    content: 'mentioned you in "AI Ethics Discussion Thread"',
    link: '/view/128#comment-602',
    timestamp: '2 weeks ago',
    read: true,
    actor: {
      id: '606',
      name: 'Jordan Harris'
    }
  }
];

// Create a loading skeleton for server-side rendering
const loadingSkeleton = (
  <div className="container mx-auto px-4 py-12">
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-72 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="border-b p-4 bg-gray-50 flex items-center gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
        <div className="divide-y">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="p-4 flex items-start gap-3">
              <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// The actual notifications page content
const notificationsContent = (
  <div className="container mx-auto px-4 py-12">
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Notifications</h1>
          <p className="text-gray-500">Stay updated on activity related to your content and interactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Mark all as read</Button>
          <Button variant="outline">Settings</Button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="border-b p-4 bg-gray-50 flex items-center gap-4">
          <Button variant="ghost" className="bg-white">All</Button>
          <Button variant="ghost">Unread</Button>
          <Button variant="ghost">Mentions</Button>
          <Button variant="ghost">Comments</Button>
          <Button variant="ghost">System</Button>
        </div>
        
        {sampleNotifications.length > 0 ? (
          <div className="divide-y">
            {sampleNotifications.map(notification => (
              <NotificationItem
                key={notification.id}
                {...notification}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto text-gray-400 mb-4"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
            </svg>
            <h3 className="text-xl font-medium mb-2">No notifications yet</h3>
            <p className="text-gray-500 mb-4">
              When you receive notifications about your activity they’ll show up here
            </p>
            <Button asChild>
              <Link href="/">Explore Community</Link>
            </Button>
          </div>
        )}
        
        <div className="p-4 border-t bg-gray-50 flex justify-center">
          <Button variant="outline" size="sm">
            Load More
          </Button>
        </div>
      </div>
    </div>
  </div>
);

export default function NotificationsPage() {
  return (
    <ClientSideOnly fallback={loadingSkeleton}>
      {notificationsContent}
    </ClientSideOnly>
  );
}