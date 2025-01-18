import { useMessageStore, useChannelStore } from '../../stores';
import { createMessage } from '../../services/message';
import MessageInputBase from './MessageInputBase';

export default function MessageInput() {
  const activeChannelId = useChannelStore((state) => state.activeChannelId);
  const addMessage = useMessageStore((state) => state.addMessage);

  const handleSubmit = async (content: string) => {
    if (!activeChannelId) return;
    const message = await createMessage(activeChannelId, content);
    addMessage(activeChannelId, message);
  };

  return (
    <MessageInputBase
      onSubmit={handleSubmit}
      placeholder="Type a message..."
      focusTrigger={activeChannelId}
      disabled={!activeChannelId}
    />
  );
} 