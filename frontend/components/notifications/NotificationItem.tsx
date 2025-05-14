import { ReactNode } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from './NotificationProvider';

export type NotificationType = 
  | 'mention' 
  | 'comment' 
  | 'upvote' 
  | 'answer' 
  | 'follow' 
  | 'system'
  | 'badge';

export interface NotificationItemProps {
  id: string;
  type: NotificationType;
  content: string;
  link?: string;
  timestamp: string;
  read: boolean;
  actor?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  target?: {
    id: string;
    type: string;
    title?: string;
  };
  onMarkAsRead?: (id: string) => void;
}

export default function NotificationItem({
  id,
  type,
  content,
  link,
  timestamp,
  read,
  actor,
  target,
  onMarkAsRead
}: NotificationItemProps) {
  // Get notification service if no explicit onMarkAsRead handler is provided
  const notificationContext = useNotifications();
  
  // Handle clicking on the notification
  const handleClick = (e: React.MouseEvent) => {
    // If notification is not read, mark it as read
    if (!read) {
      if (onMarkAsRead) {
        onMarkAsRead(id);
      } else {
        notificationContext.markAsRead(id);
      }
    }
  };
  
  const getIcon = (): ReactNode => {
    switch (type) {
      case 'mention':
        return (
          <div className="rounded-full bg-blue-100 p-2">
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
              className="text-blue-600"
            >
              <circle cx="12" cy="12" r="4"></circle>
              <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"></path>
            </svg>
          </div>
        );
      case 'comment':
        return (
          <div className="rounded-full bg-purple-100 p-2">
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
              className="text-purple-600"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
        );
      case 'upvote':
        return (
          <div className="rounded-full bg-green-100 p-2">
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
              className="text-green-600"
            >
              <path d="M7 10v12"></path>
              <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
            </svg>
          </div>
        );
      case 'answer':
        return (
          <div className="rounded-full bg-amber-100 p-2">
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
              className="text-amber-600"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="m16 10-4 4-2-2"></path>
            </svg>
          </div>
        );
      case 'follow':
        return (
          <div className="rounded-full bg-red-100 p-2">
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
              className="text-red-600"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <line x1="19" y1="8" x2="19" y2="14"></line>
              <line x1="22" y1="11" x2="16" y2="11"></line>
            </svg>
          </div>
        );
      case 'system':
      default:
        return (
          <div className="rounded-full bg-gray-100 p-2">
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
              className="text-gray-600"
            >
              <path d="M12 16.5v1.5"></path>
              <path d="M12 6v1.5"></path>
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 9a3 3 0 1 0 0 6 3 3 0 1 0 0-6"></path>
            </svg>
          </div>
        );
    }
  };
  
  // Format the timestamp using date-fns
  const formattedTime = typeof timestamp === 'string' 
    ? formatDistanceToNow(new Date(timestamp), { addSuffix: true }) 
    : timestamp;
  
  // Determine link target
  const linkTarget = link || (target ? `/view/${target.id}` : '#');
  
  return (
    <Link 
      href={linkTarget}
      onClick={handleClick}
      className={`flex items-start p-4 hover:bg-gray-50 dark:hover:bg-gray-800 ${read ? 'opacity-75' : 'border-l-4 border-blue-500'}`}
    >
      <div className="mr-3">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm mb-1">
          {actor && (
            <span className="font-medium">
              {actor.name}{' '}
            </span>
          )}
          {content}
          {target?.title && (
            <span className="text-sm italic"> "{target.title}"</span>
          )}
        </p>
        <p className="text-xs text-gray-500">{formattedTime}</p>
      </div>
      {!read && (
        <div className="ml-2 w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
      )}
    </Link>
  );
}