'use client';

import dynamic from 'next/dynamic';
import Quill from 'quill';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';

// Define the ref type for the RichTextEditor component
export type RichTextEditorHandle = {
  getContent: () => string;
  setContent: (content: string) => void;
};

interface RichTextEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
}

// Global instance reference
let globalQuillInstance: Quill | null = null;
let globalEditorElement: HTMLDivElement | null = null;
let initializationInProgress = false;
let initializationTimeout: NodeJS.Timeout | null = null;

const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(({ initialContent, onChange }, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const componentId = useRef(Math.random().toString(36).substr(2, 9));
  const [isReady, setIsReady] = useState(false);

  // Memoize the Quill configuration
  const quillConfig = useMemo(() => ({
    theme: 'snow',
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['clean'],
      ],
    },
    placeholder: 'Write something...',
  }), []);

  // Memoize the cleanup function
  const cleanupQuill = useCallback(() => {
    console.log(`[${componentId.current}] Cleaning up Quill instance...`);
    
    // Remove all toolbars from the document
    const toolbars = document.querySelectorAll('.ql-toolbar');
    console.log(`[${componentId.current}] Found ${toolbars.length} toolbars to remove`);
    toolbars.forEach(toolbar => {
      console.log(`[${componentId.current}] Removing toolbar:`, toolbar);
      toolbar.remove();
    });

    if (globalQuillInstance) {
      console.log(`[${componentId.current}] Destroying Quill instance`);
      globalQuillInstance = null;
    }

    if (globalEditorElement) {
      console.log(`[${componentId.current}] Cleaning up editor container`);
      const container = globalEditorElement.querySelector('.ql-container');
      if (container) container.remove();
      globalEditorElement.innerHTML = '';
      globalEditorElement = null;
    }
    initializationInProgress = false;
    setIsReady(false);
  }, []);

  // Memoize the initialization function
  const initQuill = useCallback(async () => {
    if (!editorRef.current) {
      console.log(`[${componentId.current}] Skipping initialization - no editor ref`);
      return;
    }

    // If we already have a Quill instance and it's attached to this editor, skip initialization
    if (globalQuillInstance && globalEditorElement === editorRef.current) {
      console.log(`[${componentId.current}] Quill already initialized for this editor, skipping...`);
      return;
    }

    // If initialization is already in progress, wait for it to complete
    if (initializationInProgress) {
      console.log(`[${componentId.current}] Initialization already in progress, skipping...`);
      return;
    }

    // Clear any existing timeout
    if (initializationTimeout) {
      clearTimeout(initializationTimeout);
      initializationTimeout = null;
    }

    // Debounce initialization
    initializationTimeout = setTimeout(async () => {
      console.log(`[${componentId.current}] Starting Quill initialization...`);
      initializationInProgress = true;
      
      try {
        // Clean up any existing instance
        cleanupQuill();

        await import('quill/dist/quill.snow.css');

        console.log(`[${componentId.current}] Creating new Quill instance`);
        if (editorRef.current) {
          globalQuillInstance = new Quill(editorRef.current, quillConfig);
          globalEditorElement = editorRef.current;

          if (initialContent) {
            console.log(`[${componentId.current}] Setting initial content`);
            globalQuillInstance.root.innerHTML = initialContent;
          }

          globalQuillInstance.on('text-change', () => {
            if (onChange && globalQuillInstance) {
              onChange(globalQuillInstance.root.innerHTML);
            }
          });

          setIsReady(true);
          console.log(`[${componentId.current}] Quill initialization complete`);
        }
      } catch (error) {
        console.error(`[${componentId.current}] Error during Quill initialization:`, error);
        cleanupQuill();
      } finally {
        initializationInProgress = false;
      }
    }, 100); // 100ms debounce
  }, [cleanupQuill, initialContent, onChange, quillConfig]);

  useEffect(() => {
    console.log(`[${componentId.current}] useEffect running`);
    initQuill();

    return () => {
      console.log(`[${componentId.current}] Component unmounting, cleaning up...`);
      if (initializationTimeout) {
        clearTimeout(initializationTimeout);
        initializationTimeout = null;
      }
      // Only clean up if this is the editor that owns the Quill instance
      if (globalEditorElement === editorRef.current) {
        cleanupQuill();
      }
    };
  }, [initQuill, cleanupQuill]);

  useImperativeHandle(ref, () => ({
    getContent: () => {
      if (globalQuillInstance) {
        return globalQuillInstance.root.innerHTML;
      }
      return '';
    },
    setContent: (content: string) => {
      if (globalQuillInstance) {
        globalQuillInstance.root.innerHTML = content;
      }
    },
  }));

  return (
    <div className="border rounded-md">
      <div ref={editorRef} className="min-h-[200px] max-h-[400px]" />
      <style jsx global>{`
        .ql-editor a {
          color: #2563eb;
          text-decoration: underline;
        }
        .ql-editor a:hover {
          color: #1d4ed8;
        }
      `}</style>
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';

export default dynamic(() => Promise.resolve(RichTextEditor), { 
  ssr: false 
});