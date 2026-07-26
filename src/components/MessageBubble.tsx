import type { Message } from "../types/message";
import { memo } from "react";

interface MessageBubbleProps {
  message: Message;
  showTimestamp: boolean;
}

const MessageBubble = ({ message, showTimestamp }: MessageBubbleProps) => {
  const isMine = message.senderID === 'me';

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-2 m-3`}>
      <div className={`max-w-xs px-3 py-2 rounded-2xl ${isMine ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
        <p className="whitespace-pre-wrap">{message.content}</p>
        {showTimestamp && (
          <p className="text-xs opacity-70">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
        {isMine && (
          <p className="text-xs">{message.status}</p>
        )}
      </div>
    </div>
  );
}

export default memo(MessageBubble);