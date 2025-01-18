import { useState, useRef, useEffect, forwardRef } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { isValidMarkdown, sanitizeMarkdown } from '../../utils/markdown';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

const RichTextEditor = forwardRef<HTMLDivElement, RichTextEditorProps>(
  ({ value, onChange, onSubmit, placeholder, onKeyDown }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit,
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-blue-500 hover:text-blue-700 hover:underline',
          },
        }),
      ],
      content: value,
      editorProps: {
        attributes: {
          class: 'prose prose-sm dark:prose-invert focus:outline-none min-h-[1.25rem] max-h-48 overflow-y-auto',
        },
      },
      onUpdate: ({ editor }) => {
        const content = editor.getText();
        onChange(content);
      },
    });

    useEffect(() => {
      if (editor && value !== editor.getText()) {
        editor.commands.setContent(value);
      }
    }, [value, editor]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && onSubmit) {
        e.preventDefault();
        onSubmit();
      }
      onKeyDown?.(e);
    };

    return (
      <div 
        ref={ref}
        className="min-h-[2.5rem] rounded-lg border border-gray-300 bg-white px-3 py-1.5 shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
      >
        <EditorContent 
          editor={editor} 
          onKeyDown={handleKeyDown}
          className="min-h-[1.5rem] overflow-y-auto"
        />
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor; 