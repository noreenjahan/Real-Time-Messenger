import { useReducer, useEffect, useState, useRef } from "react";
import ChatWindow from "./components/ChatWindow";
import MessageInput from "./components/MessageInput";
import chatReducer from "./reducers/chatReducer";
import type { ChatState } from "./reducers/chatReducer";
import type { Message } from "./types/message";
import MockWebSocket from "./services/mockWebSocket";

const generateBulkMessages = (count: number): Message[] => {
  const senders: Message['senderID'][] = ['me', 'alice', 'bob'];
  return Array.from({ length: count }, (_, i) => ({
    id: crypto.randomUUID(),
    senderID: senders[i % senders.length],
    content: `Test message number ${i + 1}`,
    timestamp: Date.now() - (count - i) * 60000,
    status: 'read' as const,
  }));
};

const initialState: ChatState = {
  messages: generateBulkMessages(200),
};

const App = () => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const socketRef = useRef<MockWebSocket | null>(null);

  useEffect(() => {
    const socket = new MockWebSocket();
    socketRef.current = socket;

    socket.on((event) => {
      switch (event.type) {
        case 'message':
          dispatch({ type: 'RECEIVE_MESSAGE', payload: { message: event.payload } });
          break;

        case 'status':
          dispatch({
            type: 'UPDATE_STATUS',
            payload: { messageId: event.payload.messageId, status: event.payload.status },
          });
          break;

        case 'typing':
          setTypingUsers((prev) => {
            const next = new Set(prev);
            if (event.payload.isTyping) {
              next.add(event.payload.userId);
            } else {
              next.delete(event.payload.userId);
            }
            return next;
          });
          break;
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <ChatWindow messages={state.messages} />
      {typingUsers.size > 0 && (
        <p className="text-xs text-gray-500 px-2">
          {Array.from(typingUsers).join(', ')} typing...
        </p>
      )}
      <MessageInput dispatch={dispatch} socket={socketRef.current} />
    </div>
  );
}

export default App;