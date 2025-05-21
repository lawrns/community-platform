/**
 * Brief Detail Component
 * Displays a detailed view of a specific daily brief
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { api } from '../../lib/api';
import { FiStar, FiShare2, FiBookmark, FiX, FiArrowLeft, FiClock, FiEye } from 'react-icons/fi';

interface BriefDetailProps {
  briefId: string;
  className?: string;
}

export default function BriefDetail({ briefId, className = '' }: BriefDetailProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [brief, setBrief] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch the brief on load
  useEffect(() => {
    if (briefId) {
      fetchBrief();
    }
  }, [briefId]);

  const fetchBrief = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.briefs.getBrief(briefId);
      
      if (response.success && response.brief) {
        setBrief(response.brief);
        setItems(response.items || []);
        
        // Mark brief as read if not already read
        if (!response.brief.read_at) {
          await api.briefs.markAsRead(response.brief.id);
        }
      } else {
        setError('Failed to load brief');
      }
    } catch (err) {
      console.error('Error fetching brief:', err);
      setError('Unable to load the brief. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleItemInteraction = async (itemId: string, interaction: 'click' | 'save' | 'share' | 'dismiss') => {
    try {
      await api.briefs.recordItemInteraction(itemId, interaction);
      
      // If dismissing, remove the item from the list
      if (interaction === 'dismiss') {
        setItems(items.filter(item => item.id !== itemId));
      }
    } catch (err) {
      console.error('Error recording interaction:', err);
    }
  };

  const getFormattedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Group items by content type for better organization
  const groupedItems = items.reduce((groups: Record<string, any[]>, item) => {
    const type = item.content_type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(item);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-6"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="mb-4">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !brief) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error || 'Brief not found'}</p>
          <button 
            onClick={() => router.push('/briefs/history')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            Back to Brief History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      <div className="p-6 border-b">
        <div className="flex items-center mb-4">
          <button
            onClick={() => router.push('/briefs/history')}
            className="mr-4 p-2 text-gray-500 hover:text-indigo-600 transition"
          >
            <FiArrowLeft />
          </button>
          <div>
            <h2 className="text-2xl font-semibold">{brief.title}</h2>
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <FiClock className="mr-1" /> Generated on {getFormattedDate(brief.generated_at)}
              {brief.read_at && (
                <span className="ml-3 flex items-center text-green-600">
                  <FiEye className="mr-1" /> Read on {getFormattedDate(brief.read_at)}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-indigo-50 p-4 rounded-md text-indigo-800 mb-4">
          {brief.summary}
        </div>
      </div>
      
      {Object.keys(groupedItems).length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No items in this brief.
        </div>
      ) : (
        Object.entries(groupedItems).map(([contentType, typeItems]) => (
          <div key={contentType} className="mb-4">
            <div className="px-6 py-3 bg-gray-50 border-y text-gray-700 font-medium">
              {contentType === 'tool' && 'Tools & Resources'}
              {contentType === 'topic' && 'Topics & Categories'}
              {contentType === 'content' && 'Articles & Discussions'}
            </div>
            
            <div className="divide-y divide-gray-100">
              {typeItems.map((item: any) => {
                // Define the URL based on content type
                let url;
                switch (item.content_type) {
                  case 'tool':
                    url = `/tools/${item.content_id}`;
                    break;
                  case 'topic':
                    url = `/topics/${item.content_id}`;
                    break;
                  case 'content':
                  default:
                    url = `/view/${item.content_id}`;
                    break;
                }
                
                return (
                  <div key={item.id} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium mb-2">{item.title}</h3>
                        <p className="text-gray-700 mb-4">{item.summary}</p>
                        
                        {/* Metadata based on content type */}
                        {item.content_type === 'tool' && item.metadata && (
                          <div className="mb-4">
                            {item.metadata.tags && Array.isArray(item.metadata.tags) && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.metadata.tags.map((tag: string, i: number) => (
                                  <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {item.content_type === 'content' && item.metadata && (
                          <div className="text-sm text-gray-500 mb-4">
                            {item.metadata.author && <span>By {item.metadata.author}</span>}
                            {item.metadata.type && (
                              <span className="mx-1">• {item.metadata.type.charAt(0).toUpperCase() + item.metadata.type.slice(1)}</span>
                            )}
                            
                            {item.metadata.tags && Array.isArray(item.metadata.tags) && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.metadata.tags.map((tag: string, i: number) => (
                                  <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-4">
                          <Link 
                            href={url}
                            onClick={() => handleItemInteraction(item.id, 'click')}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition inline-flex items-center"
                          >
                            View {item.content_type === 'tool' ? 'Tool' : item.content_type === 'topic' ? 'Topic' : 'Article'}
                          </Link>
                          
                          <button
                            onClick={() => handleItemInteraction(item.id, 'save')}
                            className="p-2 text-gray-500 hover:text-indigo-600 transition"
                            title="Save for later"
                          >
                            <FiBookmark />
                          </button>
                          
                          <button
                            onClick={() => handleItemInteraction(item.id, 'share')}
                            className="p-2 text-gray-500 hover:text-indigo-600 transition"
                            title="Share"
                          >
                            <FiShare2 />
                          </button>
                          
                          <button
                            onClick={() => handleItemInteraction(item.id, 'dismiss')}
                            className="p-2 text-gray-500 hover:text-red-600 transition"
                            title="Not interested"
                          >
                            <FiX />
                          </button>
                        </div>
                      </div>
                      
                      {/* If there's a logo for tools, show it */}
                      {item.content_type === 'tool' && item.metadata?.logo_url && (
                        <div className="ml-4 flex-shrink-0">
                          <img
                            src={item.metadata.logo_url}
                            alt={`${item.title} logo`}
                            className="w-16 h-16 object-contain rounded-md"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
      
      <div className="p-6 bg-gray-50 border-t flex justify-between">
        <Link
          href="/briefs/history"
          className="text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          <FiArrowLeft className="mr-2" /> Back to Brief History
        </Link>
        
        <Link
          href="/dashboard"
          className="text-indigo-600 hover:text-indigo-800"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}