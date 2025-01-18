import { useMessageStore, useChannelStore } from '../../stores';
import { createMessage } from '../../services/message';
import MessageInputBase from './MessageInputBase';

export default function ThreadMessageInput() {
  const activeChannelId = useChannelStore((state) => state.activeChannelId);
  const activeThreadId = useMessageStore((state) => state.activeThreadId);
  const addThreadMessage = useMessageStore((state) => state.addThreadMessage);

  const handleSubmit = async (content: string) => {
    if (!activeThreadId || !activeChannelId) return;
    const message = await createMessage(activeChannelId, content, activeThreadId);
    addThreadMessage(activeThreadId, message);
  };

  return (
    <MessageInputBase
      onSubmit={handleSubmit}
      placeholder="Reply to thread..."
      focusTrigger={activeThreadId}
      disabled={!activeChannelId || !activeThreadId}
    />
  );
} 