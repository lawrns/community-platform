/**
 * Brief History Component
 * Displays a user's history of daily briefs
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { FiClock, FiEye, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface BriefHistoryProps {
  className?: string;
}

export default function BriefHistory({ className = '' }: BriefHistoryProps) {
  const [loading, setLoading] = useState(true);
  const [briefs, setBriefs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const limit = 10;

  useEffect(() => {
    fetchBriefHistory();
  }, [page]);

  const fetchBriefHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.briefs.getHistory({
        limit,
        offset: page * limit,
        includeExpired: true
      });
      
      if (response.success) {
        setBriefs(response.briefs || []);
        setHasMore(response.briefs.length === limit);
      } else {
        setError('Failed to load brief history');
      }
    } catch (err) {
      console.error('Error fetching brief history:', err);
      setError('Unable to load your brief history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const handlePreviousPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (hasMore) {
      setPage(page + 1);
    }
  };

  if (loading && page === 0) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="border-b border-gray-100 pb-4">
                <div className="h-5 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold mb-1">Brief History</h2>
        <p className="text-gray-600">View your past daily briefs</p>
      </div>
      
      {error && (
        <div className="p-6">
          <div className="bg-red-50 text-red-700 p-4 rounded-md">
            {error}
          </div>
        </div>
      )}
      
      {briefs.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-gray-500 mb-4">You don't have any briefs in your history yet.</p>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition inline-block"
          >
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <>
          <div className="divide-y divide-gray-100">
            {briefs.map((brief) => {
              const isExpired = new Date(brief.expired_at) < new Date();
              const isRead = !!brief.read_at;
              
              return (
                <div key={brief.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link 
                        href={`/briefs/${brief.id}`}
                        className={`text-lg ${isRead ? 'text-gray-700' : 'text-gray-900 font-medium'}`}
                      >
                        {brief.title}
                      </Link>
                      
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <FiClock className="mr-1" />
                        <span>{formatDateTime(brief.generated_at)}</span>
                        
                        {isExpired && (
                          <span className="ml-3 text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-xs">
                            Expired
                          </span>
                        )}
                        
                        {isRead && (
                          <span className="ml-3 flex items-center text-green-600">
                            <FiEye className="mr-1" /> Read
                          </span>
                        )}
                      </div>
                      
                      <p className="mt-2 text-gray-600 text-sm line-clamp-2">{brief.summary}</p>
                    </div>
                    
                    <Link
                      href={`/briefs/${brief.id}`}
                      className="px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm"
                    >
                      View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
            <button
              onClick={handlePreviousPage}
              disabled={page === 0}
              className={`px-3 py-1 rounded-md flex items-center text-sm ${
                page === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FiChevronLeft className="mr-1" /> Previous
            </button>
            
            <span className="text-sm text-gray-500">
              Page {page + 1} {hasMore ? '•••' : ''}
            </span>
            
            <button
              onClick={handleNextPage}
              disabled={!hasMore}
              className={`px-3 py-1 rounded-md flex items-center text-sm ${
                !hasMore ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Next <FiChevronRight className="ml-1" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}