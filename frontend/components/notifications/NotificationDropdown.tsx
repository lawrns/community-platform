"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BellRing, Loader2 } from 'lucide-react';
import NotificationItem from './NotificationItem';
import { useNotifications } from './NotificationProvider';
import { useAuth } from '@/components/auth/AuthContext';
import { useOnClickOutside } from '@/lib/hooks';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAllAsRead, fetchNotifications, isLoading } = useNotifications();
  const { isAuthenticated } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useOnClickOutside(dropdownRef, () => setIsOpen(false));
  
  // Fetch notifications when dropdown is opened
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchNotifications();
    }
  }, [isOpen, isAuthenticated, fetchNotifications]);
  
  // Handle marking all notifications as read
  const handleMarkAllAsRead = () => {
    if (isAuthenticated) {
      markAllAsRead();
    }
  };
  
  return (
    <div className="relative">
      <button 
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 relative"
        onClick={() => setIsOpen(!isOpen)}
      >
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
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
        </svg>
        {unreadCount > 0 && (
          <div className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
            {unreadCount}
          </div>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg z-20 overflow-hidden border">
          <div className="p-3 border-b flex items-center justify-between">
            <h3 className="font-medium">Notifications</h3>
            <div className="flex items-center gap-2">
              <button 
                className="text-xs text-blue-600 hover:underline"
                onClick={markAllAsRead}
              >
                Mark all as read
              </button>
              <Link href="/notifications" className="text-xs text-blue-600 hover:underline">
                See all
              </Link>
            </div>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y">
                {notifications.slice(0, 5).map(notification => (
                  <NotificationItem
                    key={notification.id}
                    {...notification}
                  />
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p>No notifications yet</p>
              </div>
            )}
          </div>
          
          <div className="p-3 border-t text-center">
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/notifications">View All Notifications</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}