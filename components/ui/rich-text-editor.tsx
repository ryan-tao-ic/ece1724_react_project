'use client';

import dynamic from 'next/dynamic';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';

// Define the ref type for the RichTextEditor component
export type RichTextEditorHandle = {
  getContent: () => string;
  setContent: (content: string) => void;
};

interface RichTextEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  disabled?: boolean;
}

// The actual component implementation
const RichTextEditorComponent = forwardRef<RichTextEditorHandle, RichTextEditorProps>(({ initialContent, onChange, disabled = false }, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillInstanceRef = useRef<any>(null);
  const componentId = useRef(Math.random().toString(36).substr(2, 9));
  const [isReady, setIsReady] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    
    if (typeof document !== 'undefined') {
      // Remove all toolbars from the document
      const toolbars = document.querySelectorAll('.ql-toolbar');
      console.log(`[${componentId.current}] Found ${toolbars.length} toolbars to remove`);
      toolbars.forEach(toolbar => {
        console.log(`[${componentId.current}] Removing toolbar:`, toolbar);
        toolbar.remove();
      });
    }

    if (quillInstanceRef.current) {
      console.log(`[${componentId.current}] Destroying Quill instance`);
      quillInstanceRef.current = null;
    }

    if (editorRef.current) {
      console.log(`[${componentId.current}] Cleaning up editor container`);
      const container = editorRef.current.querySelector('.ql-container');
      if (container) container.remove();
      editorRef.current.innerHTML = '';
    }
    
    setIsReady(false);
  }, []);

  // Memoize the initialization function
  const initQuill = useCallback(async () => {
    if (!editorRef.current) {
      console.log(`[${componentId.current}] Skipping initialization - no editor ref`);
      return;
    }

    // If we already have a Quill instance for this editor, skip initialization
    if (quillInstanceRef.current) {
      console.log(`[${componentId.current}] Quill already initialized for this editor, skipping...`);
      return;
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Debounce initialization
    timeoutRef.current = setTimeout(async () => {
      console.log(`[${componentId.current}] Starting Quill initialization...`);
      
      try {
        // Clean up any existing instance
        cleanupQuill();

        // Dynamically import Quill
        const Quill = (await import('quill')).default;
        await import('quill/dist/quill.snow.css');

        console.log(`[${componentId.current}] Creating new Quill instance`);
        if (editorRef.current) {
          quillInstanceRef.current = new Quill(editorRef.current, quillConfig);

          if (initialContent) {
            console.log(`[${componentId.current}] Setting initial content`);
            quillInstanceRef.current.root.innerHTML = initialContent;
          }

          quillInstanceRef.current.on('text-change', () => {
            if (onChange && quillInstanceRef.current) {
              onChange(quillInstanceRef.current.root.innerHTML);
            }
          });

          setIsReady(true);
          console.log(`[${componentId.current}] Quill initialization complete`);
        }
      } catch (error) {
        console.error(`[${componentId.current}] Error during Quill initialization:`, error);
        cleanupQuill();
      }
    }, 100); // 100ms debounce
  }, [cleanupQuill, initialContent, onChange, quillConfig]);

  useEffect(() => {
    console.log(`[${componentId.current}] useEffect running`);
    initQuill();

    return () => {
      console.log(`[${componentId.current}] Component unmounting, cleaning up...`);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      cleanupQuill();
    };
  }, [initQuill, cleanupQuill]);

  // Add effect to handle disabled state
  useEffect(() => {
    if (quillInstanceRef.current) {
      quillInstanceRef.current.enable(!disabled);
    }
  }, [disabled]);

  useImperativeHandle(ref, () => ({
    getContent: () => {
      if (quillInstanceRef.current) {
        return quillInstanceRef.current.root.innerHTML;
      }
      return '';
    },
    setContent: (content: string) => {
      if (quillInstanceRef.current) {
        quillInstanceRef.current.root.innerHTML = content;
      }
    },
  }));

  return (
    <div className={`border rounded-md w-full overflow-hidden ${disabled ? 'opacity-70' : ''}`}>
      <div ref={editorRef} className="min-h-[200px] max-h-[400px] w-full" />
      <style jsx global>{`
        .ql-editor {
          width: 100%;
          max-width: 100%;
        }
        .ql-toolbar {
          width: 100%;
          max-width: 100%;
        }
        .ql-container {
          width: 100%;
          max-width: 100%;
        }
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

RichTextEditorComponent.displayName = 'RichTextEditor';

// Export with dynamic import to avoid SSR
const RichTextEditor = dynamic(() => Promise.resolve(RichTextEditorComponent), { 
  ssr: false 
});

export default RichTextEditor;