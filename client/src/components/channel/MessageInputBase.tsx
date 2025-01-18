import { useState, useRef, useEffect } from 'react';
import { useMessageStore } from '../../stores';
import RichTextEditor from '../common/RichTextEditor';

interface MessageInputBaseProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder: string;
  focusTrigger?: any; // Value to trigger focus effect
  disabled?: boolean;
}

export default function MessageInputBase({ 
  onSubmit, 
  placeholder, 
  focusTrigger,
  disabled 
}: MessageInputBaseProps) {
  const [content, setContent] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const setError = useMessageStore((state) => state.setError);

  const handleSubmit = async () => {
    if (disabled || !content.trim()) return;

    try {
      await onSubmit(content);
      setContent('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send message');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, [focusTrigger]);

  if (disabled) {
    return null;
  }

  return (
    <div className="border-t border-gray-200 p-4 dark:border-gray-700">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <RichTextEditor
            ref={editorRef}
            value={content}
            onChange={setContent}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={!content.trim()}
          className="flex-shrink-0 h-[2.5rem] rounded-md bg-blue-500 px-4 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
} 