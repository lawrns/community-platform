'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Clock,
  Check,
  ArrowLeft,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface Version {
  timestamp: Date;
  content: string;
  id?: string;
  user_id?: string;
  user_name?: string;
}

interface VersionHistoryProps {
  versions: Version[];
  onRestore: (version: Version) => void;
  currentContent: string;
  isAuthenticated?: boolean;
}

export default function VersionHistory({
  versions,
  onRestore,
  currentContent,
  isAuthenticated = false
}: VersionHistoryProps) {
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [diffView, setDiffView] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  // Format versions list, sorting from newest to oldest
  const sortedVersions = [...versions].sort((a, b) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  );
  
  // Simplified diff function (in a real app, would use a proper diff library)
  const getSimpleDiff = (oldContent: string, newContent: string) => {
    const oldWords = oldContent.split(/\s+/);
    const newWords = newContent.split(/\s+/);
    
    // Extremely simplified diff - just highlights if words were added/removed
    // A real implementation would use a proper diff algorithm
    const added = newWords.filter(word => !oldWords.includes(word)).length;
    const removed = oldWords.filter(word => !newWords.includes(word)).length;
    
    return { added, removed };
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
          <Clock className="h-4 w-4 mr-2" />
          Version History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
          <DialogDescription>
            View and restore previous versions of your content.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4 flex-1 overflow-hidden">
          {/* Versions List */}
          <div className="overflow-y-auto border rounded-md">
            <div className="p-2 border-b bg-gray-50 dark:bg-gray-800 sticky top-0">
              <h3 className="text-sm font-medium">Versions</h3>
            </div>
            <div className="divide-y">
              {sortedVersions.map((version, index) => {
                const isSelected = selectedVersion && 
                  version.timestamp.getTime() === selectedVersion.timestamp.getTime();
                const isCurrent = index === 0;
                
                // Get diff stats for each version compared to the next one (if it exists)
                const nextVersion = sortedVersions[index + 1];
                const diff = nextVersion 
                  ? getSimpleDiff(nextVersion.content, version.content) 
                  : { added: 0, removed: 0 };
                
                return (
                  <div 
                    key={version.timestamp.getTime()}
                    className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      isSelected ? 'bg-blue-50 dark:bg-blue-900' : ''
                    }`}
                    onClick={() => setSelectedVersion(version)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">
                          {isCurrent ? 'Current Version' : `Version ${sortedVersions.length - index}`}
                          {isCurrent && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 px-2 py-0.5 rounded-full">
                              Latest
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {format(version.timestamp, 'MMM d, yyyy h:mm a')}
                        </p>
                        {version.user_name && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            By {version.user_name}
                          </p>
                        )}
                      </div>
                      {(diff.added > 0 || diff.removed > 0) && (
                        <div className="text-xs">
                          {diff.added > 0 && (
                            <span className="text-green-600 dark:text-green-400 mr-2">
                              +{diff.added}
                            </span>
                          )}
                          {diff.removed > 0 && (
                            <span className="text-red-600 dark:text-red-400">
                              -{diff.removed}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Version Content Preview */}
          <div className="col-span-2 border rounded-md overflow-hidden flex flex-col">
            <div className="p-2 border-b bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
              <h3 className="text-sm font-medium">
                {selectedVersion 
                  ? `Version from ${format(selectedVersion.timestamp, 'MMM d, yyyy h:mm a')}` 
                  : 'Select a version to preview'}
              </h3>
              
              {selectedVersion && (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setDiffView(!diffView)}>
                    {diffView ? 'Simple View' : 'Diff View'}
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {selectedVersion ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {diffView ? (
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border text-sm font-mono">
                      {/* A real diff view would use a proper diff library */}
                      <p className="text-gray-500 dark:text-gray-400 mb-2">Diff view would be implemented here using a proper diff library</p>
                      <p>Content length: {selectedVersion.content.length} characters</p>
                    </div>
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: selectedVersion.content }} />
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <p>Select a version to preview its content</p>
                </div>
              )}
            </div>
            
            {selectedVersion && (
              <div className="p-3 border-t bg-gray-50 dark:bg-gray-800 flex justify-between">
                <Button variant="outline" size="sm" onClick={() => setSelectedVersion(null)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => {
                      onRestore(selectedVersion);
                      setIsOpen(false);
                    }}
                    disabled={!isAuthenticated}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Restore This Version
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}