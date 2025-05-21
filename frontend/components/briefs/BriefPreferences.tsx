/**
 * Brief Preferences Component
 * Allows users to customize their daily brief settings
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { api } from '../../lib/api';
import { FiSave, FiRefreshCw } from 'react-icons/fi';

interface BriefPreferencesProps {
  className?: string;
}

export default function BriefPreferences({ className = '' }: BriefPreferencesProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    enabled: true,
    frequency: 'daily',
    content_types: ['tools', 'topics', 'discussions'],
    preferred_time: '08:00:00',
    preferred_timezone: 'UTC',
    max_items: 10,
    email_delivery: true
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Time zones
  const timeZones = [
    'UTC', 'America/New_York', 'America/Los_Angeles', 'America/Chicago',
    'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai', 
    'Australia/Sydney', 'Pacific/Auckland'
  ];

  // Fetch user preferences
  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.briefs.getPreferences();
      
      if (response.success && response.preferences) {
        setPreferences(response.preferences);
      }
    } catch (err) {
      console.error('Error fetching brief preferences:', err);
      setError('Unable to load your preferences. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      const response = await api.briefs.updatePreferences(preferences);
      
      if (response.success) {
        setPreferences(response.preferences);
        setSuccessMessage('Preferences saved successfully.');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        setError('Failed to save preferences. Please try again.');
      }
    } catch (err) {
      console.error('Error saving brief preferences:', err);
      setError('Unable to save your preferences. Please try again later.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleContentType = (type: string) => {
    const currentTypes = [...preferences.content_types];
    
    if (currentTypes.includes(type)) {
      // Remove type if it exists
      setPreferences({
        ...preferences,
        content_types: currentTypes.filter(t => t !== type)
      });
    } else {
      // Add type if it doesn't exist
      setPreferences({
        ...preferences,
        content_types: [...currentTypes, type]
      });
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="grid grid-cols-3 gap-4">
                <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                <div className="h-4 bg-gray-200 rounded col-span-2"></div>
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
        <h2 className="text-xl font-semibold mb-1">Daily Brief Preferences</h2>
        <p className="text-gray-600">Customize how your AI-powered daily briefs are generated</p>
      </div>
      
      <div className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-50 text-green-700 p-4 rounded-md mb-4">
            {successMessage}
          </div>
        )}
        
        <div>
          <label className="flex items-center space-x-3 mb-3">
            <input
              type="checkbox"
              checked={preferences.enabled}
              onChange={(e) => setPreferences({ ...preferences, enabled: e.target.checked })}
              className="h-5 w-5 rounded text-indigo-600"
            />
            <span className="text-gray-700 font-medium">Enable Daily Briefs</span>
          </label>
          <p className="text-gray-500 text-sm ml-8">
            Receive personalized content briefs based on your interests and activity
          </p>
        </div>
        
        <div>
          <h3 className="font-medium text-gray-700 mb-3">Brief Frequency</h3>
          <div className="grid grid-cols-3 gap-3">
            {['daily', 'weekly', 'monthly'].map((freq) => (
              <button
                key={freq}
                type="button"
                onClick={() => setPreferences({ ...preferences, frequency: freq })}
                className={`px-4 py-2 rounded-md border ${
                  preferences.frequency === freq
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {freq.charAt(0).toUpperCase() + freq.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="font-medium text-gray-700 mb-3">Content Types</h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={preferences.content_types.includes('tools')}
                onChange={() => handleToggleContentType('tools')}
                className="h-5 w-5 rounded text-indigo-600"
              />
              <span className="text-gray-700">Tools & Resources</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={preferences.content_types.includes('topics')}
                onChange={() => handleToggleContentType('topics')}
                className="h-5 w-5 rounded text-indigo-600"
              />
              <span className="text-gray-700">Topics & Categories</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={preferences.content_types.includes('discussions')}
                onChange={() => handleToggleContentType('discussions')}
                className="h-5 w-5 rounded text-indigo-600"
              />
              <span className="text-gray-700">Articles & Discussions</span>
            </label>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-3">Preferred Time</h3>
            <input
              type="time"
              value={preferences.preferred_time.substring(0, 5)}
              onChange={(e) => setPreferences({ 
                ...preferences, 
                preferred_time: `${e.target.value}:00` 
              })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="text-gray-500 text-sm mt-1">
              When you'd like to receive your brief
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700 mb-3">Timezone</h3>
            <select
              value={preferences.preferred_timezone}
              onChange={(e) => setPreferences({ ...preferences, preferred_timezone: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {timeZones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium text-gray-700 mb-3">Maximum Items</h3>
          <input
            type="range"
            min="5"
            max="20"
            step="1"
            value={preferences.max_items}
            onChange={(e) => setPreferences({ ...preferences, max_items: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between mt-2 text-gray-600 text-sm">
            <span>5 items</span>
            <span>{preferences.max_items} items</span>
            <span>20 items</span>
          </div>
        </div>
        
        <div>
          <label className="flex items-center space-x-3 mb-2">
            <input
              type="checkbox"
              checked={preferences.email_delivery}
              onChange={(e) => setPreferences({ ...preferences, email_delivery: e.target.checked })}
              className="h-5 w-5 rounded text-indigo-600"
            />
            <span className="text-gray-700 font-medium">Email Delivery</span>
          </label>
          <p className="text-gray-500 text-sm ml-8">
            Receive your brief via email in addition to viewing it on the platform
          </p>
        </div>
      </div>
      
      <div className="p-6 bg-gray-50 border-t flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSavePreferences}
          disabled={saving}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition flex items-center"
        >
          {saving ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <FiSave className="mr-2" />
              Save Preferences
            </>
          )}
        </button>
      </div>
    </div>
  );
}