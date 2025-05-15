'use client';

import { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import CodeBlock from '@tiptap/extension-code-block';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import { Button } from '@/components/ui/button';
import { isBrowser } from '@/lib/environment';
import ClientSideOnly from '@/components/ClientSideOnly';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Code2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
} from 'lucide-react';

interface RichTextEditorProps {
  initialContent?: string;
  onChange?: (html: string) => void;
  onSave?: (html: string) => void;
  autoSave?: boolean;
  placeholder?: string;
}

const RichTextEditor = ({
  initialContent = '',
  onChange,
  onSave,
  autoSave = false,
  placeholder = 'Start writing your content here...',
}: RichTextEditorProps) => {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'block p-2 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (onChange) {
        onChange(html);
      }
      
      // If autoSave is enabled, save content after debounce period
      if (autoSave) {
        // We'd implement actual autosave logic here
        setLastSaved(new Date());
      }
    },
  });
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Implement save function
  const saveContent = useCallback(() => {
    if (editor && onSave) {
      const html = editor.getHTML();
      onSave(html);
      setLastSaved(new Date());
    }
  }, [editor, onSave]);
  
  // Auto-save implementation (simulated)
  useEffect(() => {
    if (!autoSave || !editor) return;
    
    const interval = setInterval(() => {
      const html = editor.getHTML();
      // In a real implementation, we would push to a server or local storage here
      console.log('Auto-saving content:', html);
      setLastSaved(new Date());
    }, 30000); // Auto-save every 30 seconds
    
    return () => clearInterval(interval);
  }, [autoSave, editor]);
  
  // Formatting helper functions
  const addImage = useCallback(() => {
    // Create a file input element
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
        // We would use an image upload API here in a real implementation
        // For now, we'll just prompt for a URL as fallback
        // Use a safe way to access window
        const url = isBrowser() 
          ? window.prompt('Enter the URL of the image (in a full implementation, the file would be uploaded):')
          : null;
        if (url && editor) {
          editor.chain().focus().setImage({ src: url }).run();
        }
      } catch (err) {
        console.error('Error uploading image:', err);
        alert('Failed to upload image. Please try again.');
      }
    };
    
    // Click the input to open the file dialog
    input.click();
  }, [editor]);
  
  const addLink = useCallback(() => {
    // Safely access window only in browser environment
    const url = isBrowser() ? window.prompt('Enter the URL:') : null;
    if (url && editor) {
      // Check if there's selected text, otherwise use the URL as the link text
      if (editor.view.state.selection.empty) {
        editor
          .chain()
          .focus()
          .insertContent(`<a href="${url}">${url}</a>`)
          .run();
      } else {
        editor.chain().focus().setLink({ href: url }).run();
      }
    }
  }, [editor]);
  
  // If the editor isn't ready or we're SSR, show nothing
  if (!isMounted || !editor) {
    return null;
  }
  
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Editor Toolbar */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b p-2 flex items-center justify-between">
        <div className="flex items-center space-x-1 flex-wrap">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <Bold className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <Italic className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive('heading', { level: 3 }) ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <Heading3 className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <List className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <Quote className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={editor.isActive('code') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <Code className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={editor.isActive('codeBlock') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <Code2 className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={addLink}
            className={editor.isActive('link') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={addImage}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>

          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={editor.isActive('highlight') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <Highlighter className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2"
            onClick={saveContent}
          >
            Save
          </Button>
        </div>
      </div>
      
      {/* Bubble Menu for selection formatting */}
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="bg-white dark:bg-gray-800 shadow-lg rounded-md border p-1 flex items-center space-x-1"
        >
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <Bold className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <Italic className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={editor.isActive('code') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <Code className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={addLink}
            className={editor.isActive('link') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <LinkIcon className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={editor.isActive('highlight') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          >
            <Highlighter className="h-3 w-3" />
          </Button>
        </BubbleMenu>
      )}
      
      {/* Main Editor Content */}
      <EditorContent editor={editor} className="prose prose-sm max-w-none dark:prose-invert sm:prose-base p-4 min-h-[400px] focus:outline-none" />
      
      {/* Editor Status Bar */}
      <div className="bg-gray-50 dark:bg-gray-800 border-t p-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div>
          <span>{editor.storage.characterCount.characters()} characters</span>
          <span className="mx-2">•</span>
          <span>{editor.storage.characterCount.words()} words</span>
        </div>
        <div>
          {lastSaved 
            ? `Last saved: ${lastSaved.toLocaleTimeString()}` 
            : autoSave 
              ? 'Auto-save enabled' 
              : 'Not saved yet'}
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;