'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/components/ui/use-toast';
import AIAssistant from './AIAssistant';
import AIEnhancementPanel from './AIEnhancementPanel';
import RichTextEditor from './RichTextEditor';
import VersionHistory from './VersionHistory';
import { api } from '@/lib/api';
import { useAuth } from '@/components/auth/AuthContext';
import { 
  Wand2, 
  Save, 
  RotateCcw, 
  History, 
  ImagePlus, 
  FileCode,
  SplitSquareVertical, 
  AlertCircle
} from 'lucide-react';

interface EditorProps {
  initialContent?: string;
  contentId?: string;
  onSave?: (content: string, contentId?: string) => Promise<void> | void;
  autoSave?: boolean;
  title?: string;
  contentType?: string;
}

export default function Editor({ 
  initialContent = '', 
  contentId,
  onSave,
  autoSave = false,
  title = '',
  contentType = 'article'
}: EditorProps) {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState(initialContent);
  const [showAIPanel, setShowAIPanel] = useState<boolean>(false);
  const [aiPanelTab, setAiPanelTab] = useState<'assistant' | 'enhancement'>('assistant');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [versionHistory, setVersionHistory] = useState<Array<{
    id?: string;
    timestamp: Date;
    content: string;
    user_id?: string;
    user_name?: string;
  }>>([{ timestamp: new Date(), content: initialContent }]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(!!contentId);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [savedContentId, setSavedContentId] = useState<string | undefined>(contentId);
  const [error, setError] = useState<string | null>(null);
  
  // Handle content changes from the rich text editor
  const handleContentChange = useCallback((html: string) => {
    setContent(html);
  }, []);
  
  // Handle AI suggestions
  const handleAISuggestion = useCallback((suggestion: string) => {
    setAiSuggestion(suggestion);
  }, []);
  
  // Apply AI suggestion to content
  const applyAISuggestion = useCallback(() => {
    // In a real implementation, we would need to insert at cursor position
    // or replace selected text in the editor. This is a simplified version.
    setContent(prev => `${prev}\n${aiSuggestion}`);
    setAiSuggestion('');
  }, [aiSuggestion]);
  
  // Load content and version history if contentId is provided
  useEffect(() => {
    if (!contentId) {
      setIsLoading(false);
      return;
    }

    const loadContent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch content
        const contentData = await api.content.getContent(contentId);
        setContent(contentData.content);
        
        // Fetch version history
        const historyData = await api.content.getVersionHistory(contentId);
        
        if (historyData.versions && historyData.versions.length > 0) {
          // Map backend versions to local version history format
          const formattedHistory = historyData.versions.map(version => ({
            id: version.id,
            timestamp: new Date(version.created_at),
            content: version.content || contentData.content, // Use current content if version content is not available
            user_id: version.user_id,
            user_name: version.user_name
          }));
          
          setVersionHistory(formattedHistory);
        }
      } catch (err) {
        console.error('Error loading content:', err);
        setError('Failed to load content. Please try again.');
        toast({
          title: 'Error',
          description: 'Failed to load content. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [contentId, toast]);
  
  // Handle content saving
  const handleSave = useCallback(async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to save content.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setIsSaving(true);
      setError(null);
      
      let contentResponse;
      
      // Save content to backend
      if (savedContentId) {
        // Update existing content
        contentResponse = await api.content.updateContent(savedContentId, {
          content,
          title,
          type: contentType
        });
      } else {
        // Create new content
        contentResponse = await api.content.createContent({
          content,
          title,
          type: contentType
        });
        
        // Store the newly created content ID
        setSavedContentId(contentResponse.id);
      }
      
      // Add to version history
      const newVersion = { 
        timestamp: new Date(), 
        content,
        user_id: user?.id,
        user_name: user?.name || user?.username
      };
      
      setVersionHistory(prev => [...prev, newVersion]);
      
      // Call onSave callback if provided
      if (onSave) {
        await onSave(content, contentResponse.id);
      }
      
      // Update last saved timestamp
      setLastSaved(new Date());
      
      toast({
        title: 'Saved',
        description: 'Your content has been saved successfully.',
      });
    } catch (err: any) {
      console.error('Error saving content:', err);
      setError(err.message || 'Failed to save content. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to save content. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  }, [content, onSave, savedContentId, isAuthenticated, title, contentType, user, toast]);
  
  // Handle content enhancement from AI
  const handleApplyEnhancement = useCallback((enhancedContent: string) => {
    // Save the current version to history
    setVersionHistory(prev => [
      ...prev,
      { timestamp: new Date(), content }
    ]);
    // Apply the enhanced content
    setContent(enhancedContent);
  }, [content]);
  
  // Restore a previous version
  const restoreVersion = useCallback(async (versionContent: string, versionId?: string) => {
    try {
      setIsSaving(true);
      
      // Save current as a version first locally
      const newVersion = { 
        timestamp: new Date(), 
        content,
        user_id: user?.id,
        user_name: user?.name || user?.username
      };
      
      setVersionHistory(prev => [...prev, newVersion]);
      
      // If we have a content ID and version ID, restore on backend too
      if (savedContentId && versionId && isAuthenticated) {
        await api.content.restoreVersion(savedContentId, versionId);
      }
      
      // Then restore the selected version
      setContent(versionContent);
      
      // Update last saved timestamp
      setLastSaved(new Date());
      
      toast({
        title: 'Version Restored',
        description: 'The selected version has been restored.',
      });
    } catch (err: any) {
      console.error('Error restoring version:', err);
      toast({
        title: 'Error',
        description: 'Failed to restore version. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  }, [content, savedContentId, isAuthenticated, user, toast]);
  
  // Set up autosave if enabled
  useEffect(() => {
    if (!autoSave || !isAuthenticated) return;
    
    const interval = setInterval(() => {
      if (content !== initialContent) {
        handleSave();
      }
    }, 20000); // Auto-save every 20 seconds per requirements
    
    return () => clearInterval(interval);
  }, [autoSave, handleSave, content, initialContent, isAuthenticated]);
  
  return (
    <motion.div 
      className="rounded-lg overflow-hidden border shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Editor Toolbar */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b p-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowAIPanel(!showAIPanel);
              setAiPanelTab('assistant');
            }}
            className={showAIPanel && aiPanelTab === 'assistant' ? "bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300" : ""}
          >
            <Wand2 className="h-4 w-4 mr-2" />
            AI Assistant
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowAIPanel(!showAIPanel);
              setAiPanelTab('enhancement');
            }}
            className={showAIPanel && aiPanelTab === 'enhancement' ? "bg-purple-50 text-purple-600 dark:bg-purple-900 dark:text-purple-300" : ""}
          >
            <SplitSquareVertical className="h-4 w-4 mr-2" />
            AI Enhancement
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (!isAuthenticated) {
                toast({
                  title: 'Authentication Required',
                  description: 'Please sign in to upload images.',
                  variant: 'destructive'
                });
                return;
              }
              
              // Handle image upload
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = async (e) => {
                const target = e.target as HTMLInputElement;
                if (!target.files || target.files.length === 0) {
                  return;
                }
                
                const file = target.files[0];
                
                try {
                  // Show loading toast
                  toast({
                    title: 'Uploading',
                    description: 'Uploading image...',
                  });
                  
                  // Upload the file to the server
                  const response = await api.content.uploadImage(file);
                  
                  if (response.url) {
                    // Insert the image URL into the editor
                    const imageHtml = `<img src="${response.url}" alt="${file.name}" />`;
                    setContent(prev => prev + imageHtml);
                    
                    // Show success toast
                    toast({
                      title: 'Success',
                      description: 'Image uploaded successfully',
                    });
                  }
                } catch (err) {
                  console.error('Error uploading image:', err);
                  
                  // Show error toast
                  toast({
                    title: 'Error',
                    description: 'Failed to upload image. Please try again.',
                    variant: 'destructive'
                  });
                }
              };
              input.click();
            }}
          >
            <ImagePlus className="h-4 w-4 mr-2" />
            Upload Image
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
          >
            <FileCode className="h-4 w-4 mr-2" />
            Code Block
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <VersionHistory 
            versions={versionHistory}
            onRestore={(version) => {
              // Save current as a version first (if not the current version)
              const currentVersion = versionHistory[versionHistory.length - 1];
              if (version.timestamp.getTime() !== currentVersion.timestamp.getTime()) {
                restoreVersion(version.content, version.id);
              }
            }}
            currentContent={content}
            isAuthenticated={isAuthenticated}
          />
          
          <Button
            variant="ghost"
            size="sm"
            disabled={versionHistory.length <= 1}
            onClick={() => {
              if (versionHistory.length > 1) {
                // Restore previous version (simplified - would have UI in real implementation)
                const previousVersion = versionHistory[versionHistory.length - 2].content;
                restoreVersion(previousVersion);
              }
            }}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Undo
          </Button>
          
          <Button 
            variant={isSaving ? "secondary" : "default"}
            size="sm" 
            disabled={isSaving}
            onClick={handleSave}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
      
      {/* Error message display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900 p-3 flex items-center text-red-800 dark:text-red-200">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>{error}</p>
        </div>
      )}
      
      {/* Loading state */}
      {isLoading ? (
        <div className="p-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading content...</p>
        </div>
      ) : (
        <div className="flex">
          {/* Main Editor */}
          <div className={`flex-1 ${showAIPanel ? 'border-r' : ''}`}>
            <RichTextEditor 
              initialContent={content}
              onChange={handleContentChange}
              onSave={handleSave}
              autoSave={autoSave}
            />
          </div>
        
        {/* AI Panel */}
        <AnimatePresence>
          {showAIPanel && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '350px', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-l bg-white dark:bg-gray-900 overflow-hidden"
            >
              <Tabs value={aiPanelTab} onValueChange={(value) => setAiPanelTab(value as 'assistant' | 'enhancement')} className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="assistant" className="flex-1">AI Assistant</TabsTrigger>
                  <TabsTrigger value="enhancement" className="flex-1">AI Enhancement</TabsTrigger>
                </TabsList>
                
                <TabsContent value="assistant" className="p-0 border-none">
                  <div className="h-[550px]">
                    <AIAssistant 
                      currentContent={content} 
                      onSuggestion={handleAISuggestion} 
                    />
                    
                    {aiSuggestion && (
                      <motion.div 
                        className="p-3 border-t"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <p className="text-sm font-medium mb-2">AI Suggestion:</p>
                        <div className="p-2 bg-blue-50 dark:bg-blue-900 rounded text-sm mb-2">
                          {aiSuggestion}
                        </div>
                        <Button size="sm" onClick={applyAISuggestion}>Apply Suggestion</Button>
                      </motion.div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="enhancement" className="p-0 border-none">
                  <div className="max-h-[550px] overflow-y-auto">
                    <AIEnhancementPanel 
                      currentContent={content}
                      onApplyEnhancement={handleApplyEnhancement}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      )}
      
      {/* Editor Status Bar */}
      <div className="bg-gray-50 dark:bg-gray-800 border-t p-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div>
          <span>{content.length} characters</span>
          <span className="mx-2">•</span>
          <span>{content.split(/\s+/).filter(Boolean).length} words</span>
          <span className="mx-2">•</span>
          <span>{versionHistory.length} versions</span>
        </div>
        <div>
          {lastSaved 
            ? `Last saved: ${lastSaved.toLocaleTimeString()}` 
            : autoSave 
              ? 'Auto-save enabled' 
              : 'Not saved yet'}
        </div>
      </div>
    </motion.div>
  );
}