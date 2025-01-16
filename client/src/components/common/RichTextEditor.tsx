import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { useEffect } from 'react';
import {
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  CodeBracketIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Type a message...',
  onSubmit,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: {
          HTMLAttributes: {
            class: 'rounded bg-gray-100 p-2 font-mono text-sm text-pink-500 dark:bg-gray-800',
          },
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 hover:underline',
        },
      }),
    ],
    content: value || '',
    editable: true,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert min-h-[2.5rem] w-full focus:outline-none py-1',
      },
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit?.();
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="relative">
      {editor && editor.isEditable && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="flex space-x-1 rounded-lg bg-white p-1 shadow-lg dark:bg-gray-800"
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              editor.isActive('bold') ? 'bg-gray-100 dark:bg-gray-700' : ''
            }`}
          >
            <BoldIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              editor.isActive('italic') ? 'bg-gray-100 dark:bg-gray-700' : ''
            }`}
          >
            <ItalicIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              editor.isActive('strike') ? 'bg-gray-100 dark:bg-gray-700' : ''
            }`}
          >
            <StrikethroughIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              editor.isActive('codeBlock') ? 'bg-gray-100 dark:bg-gray-700' : ''
            }`}
          >
            <CodeBracketIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              const url = window.prompt('Enter URL');
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            className={`rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              editor.isActive('link') ? 'bg-gray-100 dark:bg-gray-700' : ''
            }`}
          >
            <LinkIcon className="h-4 w-4" />
          </button>
        </BubbleMenu>
      )}
      <div className="min-h-[2.5rem] w-full rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700">
        <EditorContent
          editor={editor}
          onKeyDown={handleKeyDown}
          className="px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 dark:text-white dark:placeholder-gray-400"
        />
      </div>
    </div>
  );
} 