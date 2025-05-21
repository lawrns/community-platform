/**
 * Daily Brief Component
 * Displays the user's personalized AI-powered daily brief on the dashboard
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { api } from '../../lib/api';
import { FiStar, FiShare2, FiBookmark, FiX, FiRefreshCw, FiSettings, FiClock } from 'react-icons/fi';

interface DailyBriefProps {
  className?: string;
}

export default function DailyBrief({ className = '' }: DailyBriefProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [brief, setBrief] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch the latest brief
  useEffect(() => {
    fetchLatestBrief();
  }, []);

  const fetchLatestBrief = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.briefs.getLatest();
      
      if (response.success && response.brief) {
        setBrief(response.brief);
        setItems(response.items || []);
        
        // Mark brief as read if not already read
        if (!response.brief.read_at) {
          await api.briefs.markAsRead(response.brief.id);
        }
      } else {
        setBrief(null);
        setItems([]);
      }
    } catch (err) {
      console.error('Error fetching brief:', err);
      setError('Unable to load your daily brief. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBrief = async () => {
    try {
      setGenerating(true);
      setError(null);
      
      const response = await api.briefs.generateBrief();
      
      if (response.success && response.brief) {
        setBrief(response.brief);
        // Fetch the full brief with items
        const fullBrief = await api.briefs.getBrief(response.brief.id);
        if (fullBrief.success) {
          setItems(fullBrief.items || []);
        }
      } else {
        setError('Failed to generate a new brief. Please try again later.');
      }
    } catch (err) {
      console.error('Error generating brief:', err);
      setError('Unable to generate your daily brief. Please try again later.');
    } finally {
      setGenerating(false);
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

  // Get the appropriate icon for the content type
  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'tool':
        return <span className="text-blue-500 bg-blue-50 px-2 py-1 rounded text-xs font-medium">Tool</span>;
      case 'topic':
        return <span className="text-green-500 bg-green-50 px-2 py-1 rounded text-xs font-medium">Topic</span>;
      case 'content':
      default:
        return <span className="text-purple-500 bg-purple-50 px-2 py-1 rounded text-xs font-medium">Article</span>;
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-6"></div>
          {[1, 2, 3].map((i) => (
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

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={fetchLatestBrief}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition flex items-center justify-center mx-auto"
          >
            <FiRefreshCw className="mr-2" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!brief) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <h3 className="text-lg font-medium mb-4">Daily Brief</h3>
        <p className="text-gray-600 mb-6">
          You don't have a daily brief yet. Get an AI-powered summary of content based on your interests.
        </p>
        <div className="flex justify-center">
          <button
            onClick={handleGenerateBrief}
            disabled={generating}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition flex items-center"
          >
            {generating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>Generate Daily Brief</>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      <div className="p-6 border-b">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold mb-1">{brief.title}</h3>
            <p className="text-sm text-gray-500 mb-4 flex items-center">
              <FiClock className="mr-1" /> {getFormattedDate(brief.generated_at)}
            </p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => router.push('/briefs/preferences')}
              className="p-2 text-gray-500 hover:text-indigo-600 transition"
              title="Brief Preferences"
            >
              <FiSettings />
            </button>
            <button 
              onClick={handleGenerateBrief}
              disabled={generating}
              className="p-2 text-gray-500 hover:text-indigo-600 transition"
              title="Generate New Brief"
            >
              {generating ? (
                <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <FiRefreshCw />
              )}
            </button>
          </div>
        </div>
        <p className="text-gray-700">{brief.summary}</p>
      </div>
      
      <div className="px-4 py-2 bg-indigo-50 text-sm text-indigo-700 font-medium">
        Today's highlights based on your interests
      </div>
      
      <div className="divide-y divide-gray-100">
        {items.map((item) => {
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
            <div key={item.id} className="p-4 hover:bg-gray-50 transition">
              <div className="flex justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-1 gap-2">
                    {getContentTypeIcon(item.content_type)}
                    <div className="font-medium text-base">{item.title}</div>
                  </div>
                  <p className="text-gray-600 mb-2 text-sm">{item.summary}</p>
                  
                  {/* Metadata based on content type */}
                  {item.content_type === 'tool' && item.metadata && (
                    <div className="flex flex-wrap gap-1 mt-1 mb-2">
                      {item.metadata.tags && Array.isArray(item.metadata.tags) && 
                        item.metadata.tags.slice(0, 3).map((tag: string, i: number) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {tag}
                          </span>
                        ))
                      }
                    </div>
                  )}
                  
                  {item.content_type === 'content' && item.metadata && (
                    <div className="text-xs text-gray-500">
                      {item.metadata.author && <span>By {item.metadata.author}</span>}
                      {item.metadata.type && (
                        <span className="mx-1">• {item.metadata.type.charAt(0).toUpperCase() + item.metadata.type.slice(1)}</span>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-2">
                    <Link 
                      href={url}
                      onClick={() => handleItemInteraction(item.id, 'click')}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      View {item.content_type === 'tool' ? 'Tool' : item.content_type === 'topic' ? 'Topic' : 'Article'} →
                    </Link>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 ml-2">
                  <button 
                    onClick={() => handleItemInteraction(item.id, 'save')}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 transition"
                    title="Save for later"
                  >
                    <FiBookmark />
                  </button>
                  <button 
                    onClick={() => handleItemInteraction(item.id, 'share')}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 transition"
                    title="Share"
                  >
                    <FiShare2 />
                  </button>
                  <button 
                    onClick={() => handleItemInteraction(item.id, 'dismiss')}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition"
                    title="Not interested"
                  >
                    <FiX />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        
        {items.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No items in this brief. Try generating a new one.
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-50 border-t text-center">
        <Link href="/briefs/history" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
          View Brief History →
        </Link>
      </div>
    </div>
  );
}