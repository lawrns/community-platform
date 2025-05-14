'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { analyzeContent, getCrossProviderAnalysis } from '@/lib/ai';

interface AIEnhancementPanelProps {
  currentContent: string;
  onApplyEnhancement: (enhancedContent: string) => void;
}

export default function AIEnhancementPanel({ 
  currentContent, 
  onApplyEnhancement 
}: AIEnhancementPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCrossAnalyzing, setIsCrossAnalyzing] = useState(false);
  const [enhancements, setEnhancements] = useState<{
    readability?: string;
    grammar?: string;
    structure?: string;
    suggestions?: string;
    crossProvider?: string;
  }>({});
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [error, setError] = useState<string | null>(null);
  
  const analyzeWithAI = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const analysis = await analyzeContent(currentContent, {
        model: selectedModel as any
      });
      
      setEnhancements(analysis);
    } catch (err) {
      console.error('Error analyzing content:', err);
      setError('Failed to analyze content. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleCrossProvider = async () => {
    setIsCrossAnalyzing(true);
    setError(null);
    
    try {
      const analysis = await getCrossProviderAnalysis(currentContent);
      
      setEnhancements(prev => ({
        ...prev,
        crossProvider: analysis
      }));
    } catch (err) {
      console.error('Error getting cross-provider analysis:', err);
      setError('Failed to get cross-provider analysis. Please try again.');
    } finally {
      setIsCrossAnalyzing(false);
    }
  };
  
  // Generate an enhanced version of the content based on suggestions
  const generateEnhancedContent = () => {
    // In a real implementation, we would send the content and enhancements to an API
    // and get back an improved version. This is a simplified version.
    
    // For demo purposes, we'll just add comments about what would be improved
    const enhancedContent = `${currentContent}\n\n/* Enhanced by AI with the following improvements:
${enhancements.grammar ? `- Grammar: ${enhancements.grammar.split('\n')[0]}` : ''}
${enhancements.readability ? `- Readability: ${enhancements.readability.split('\n')[0]}` : ''}
${enhancements.structure ? `- Structure: ${enhancements.structure.split('\n')[0]}` : ''}
*/`;
    
    onApplyEnhancement(enhancedContent);
  };
  
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-blue-50 dark:bg-blue-900/30 p-4 border-b">
        <h3 className="font-medium mb-1">AI Content Enhancement</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          Get AI-powered suggestions to improve your content across multiple dimensions.
        </p>
        
        <div className="flex items-center mb-3">
          <p className="text-xs text-gray-500 mr-2">Model:</p>
          <select 
            className="text-xs p-1 border rounded bg-white dark:bg-gray-800"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={isAnalyzing}
          >
            <option value="gpt-4">GPT-4</option>
            <option value="claude">Claude</option>
            <option value="gemini">Gemini</option>
            <option value="llama">Llama 3</option>
          </select>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            onClick={analyzeWithAI} 
            disabled={isAnalyzing || isCrossAnalyzing}
            size="sm"
          >
            {isAnalyzing 
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
              : 'Analyze Content'
            }
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCrossProvider}
            disabled={isAnalyzing || isCrossAnalyzing}
          >
            {isCrossAnalyzing 
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
              : 'Cross-Provider Analysis'
            }
          </Button>
        </div>
      </div>
      
      <div className="p-4 max-h-[500px] overflow-y-auto">
        {(isAnalyzing || isCrossAnalyzing) ? (
          <motion.div 
            className="flex flex-col items-center justify-center p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
            <p className="text-sm text-gray-500">
              {isAnalyzing ? 'Analyzing your content...' : 'Getting cross-provider analysis...'}
            </p>
          </motion.div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded text-sm">
            {error}
          </div>
        ) : Object.keys(enhancements).length > 0 ? (
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {enhancements.readability && (
              <div>
                <h4 className="text-sm font-medium mb-2">Readability Analysis</h4>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm">
                  {enhancements.readability}
                </div>
              </div>
            )}
            
            {enhancements.grammar && (
              <div>
                <h4 className="text-sm font-medium mb-2">Grammar & Style</h4>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm">
                  {enhancements.grammar}
                </div>
              </div>
            )}
            
            {enhancements.structure && (
              <div>
                <h4 className="text-sm font-medium mb-2">Structure Assessment</h4>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm">
                  {enhancements.structure}
                </div>
              </div>
            )}
            
            {enhancements.suggestions && (
              <div>
                <h4 className="text-sm font-medium mb-2">Content Suggestions</h4>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm">
                  {enhancements.suggestions}
                </div>
              </div>
            )}
            
            {enhancements.crossProvider && (
              <div>
                <h4 className="text-sm font-medium mb-2">Cross-Provider Analysis</h4>
                <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded text-sm border border-blue-100 dark:border-blue-800">
                  {enhancements.crossProvider}
                </div>
              </div>
            )}
            
            <div className="pt-2">
              <Button
                variant="default"
                size="sm"
                className="mr-2"
                onClick={generateEnhancedContent}
              >
                Apply Suggested Improvements
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEnhancements({})}
              >
                Dismiss
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="text-center p-8 text-gray-500 dark:text-gray-400 text-sm">
            Click "Analyze Content" to get AI-powered suggestions for improving your writing.
          </div>
        )}
      </div>
    </div>
  );
}