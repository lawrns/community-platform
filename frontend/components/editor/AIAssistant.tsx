'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { getAICompletion } from '@/lib/ai';
import { motion } from 'framer-motion';

interface AIAssistantProps {
  currentContent: string;
  onSuggestion: (suggestion: string) => void;
}

export default function AIAssistant({ currentContent, onSuggestion }: AIAssistantProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Quick prompts for common use cases
  const quickPrompts = {
    'Improve writing': 'Suggest improvements for my writing',
    'Add conclusion': 'Help me write a compelling conclusion',
    'Fix grammar': 'Check for grammar and spelling issues',
    'Expand on topic': 'Help me expand on this topic',
    'Suggest headline': 'Suggest engaging headlines or titles',
    'Summarize': 'Create a brief summary of this content',
  };
  
  const handlePromptSubmit = async () => {
    if (!prompt.trim()) return;
    
    setError(null);
    setIsLoading(true);
    
    // Add user message
    const userMessage = {
      role: 'user' as const,
      content: prompt,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      // Get AI completion
      const response = await getAICompletion(prompt, currentContent, {
        model: selectedModel as any,
        temperature: 0.7,
      });
      
      // Add assistant message
      const assistantMessage = {
        role: 'assistant' as const,
        content: response.text,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Pass suggestion to parent
      onSuggestion(response.text);
    } catch (err) {
      console.error('Error getting AI completion:', err);
      setError('Failed to get AI suggestion. Please try again.');
    } finally {
      setIsLoading(false);
      setPrompt('');
    }
  };
  
  const handleQuickPrompt = async (promptText: string) => {
    setPrompt(quickPrompts[promptText as keyof typeof quickPrompts] || promptText);
    
    // Auto-submit after short delay
    setTimeout(() => {
      handlePromptSubmit();
    }, 100);
  };
  
  // Clear conversation
  const clearConversation = () => {
    setMessages([]);
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-sm">AI Assistant</h3>
          {messages.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              className="text-xs h-7 px-2"
              onClick={clearConversation}
            >
              Clear
            </Button>
          )}
        </div>
        
        <div className="flex items-center mb-3">
          <p className="text-xs text-gray-500 mr-2">Model:</p>
          <select 
            className="text-xs p-1 border rounded bg-white dark:bg-gray-800"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            <option value="gpt-4">GPT-4</option>
            <option value="claude">Claude</option>
            <option value="gemini">Gemini</option>
            <option value="llama">Llama 3</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-xs text-gray-500">Quick prompts:</h4>
          <div className="flex flex-wrap gap-1">
            {Object.keys(quickPrompts).map(key => (
              <Button 
                key={key}
                variant="outline" 
                size="sm" 
                className="text-xs py-0 h-6"
                onClick={() => handleQuickPrompt(key)}
                disabled={isLoading}
              >
                {key}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3">
        {messages.length === 0 ? (
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded p-3 mb-3">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              AI Assistant analyzes your content and can help improve it. Try asking for suggestions on 
              improving clarity, adding structure, or expanding on key points.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <motion.div 
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div 
                  className={`max-w-[80%] rounded-lg p-3 text-sm ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  {message.content}
                  <div className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {isLoading && (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded text-sm mt-4">
            {error}
          </div>
        )}
      </div>
      
      <div className="border-t p-3">
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Ask AI for suggestions..."
            className="flex-1 p-2 text-sm border rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary dark:bg-gray-800 dark:border-gray-700"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && prompt.trim() && !isLoading) {
                handlePromptSubmit();
              }
            }}
            disabled={isLoading}
          />
          <Button 
            className="rounded-l-none" 
            size="sm"
            onClick={handlePromptSubmit}
            disabled={!prompt.trim() || isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  );
}