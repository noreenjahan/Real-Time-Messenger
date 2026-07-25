import { useReducer, useEffect, useState, useRef } from "react";
import ChatWindow from "./components/ChatWindow";
import MessageInput from "./components/MessageInput";
import chatReducer from "./reducers/chatReducer";
import type { ChatState } from "./reducers/chatReducer";
import type { Message } from "./types/message";
import MockWebSocket from "./services/mockWebSocket";

const initialMessages: Message[] = [
  { id: '1', senderID: 'me', content: 'hey, you free later?', timestamp: Date.now() - 60000, status: 'read' },
  { id: '2', senderID: 'alice', content: 'yeah whats up', timestamp: Date.now() - 45000, status: 'read' },
  { id: '3', senderID: 'me', content: 'wanna review the ping assignment', timestamp: Date.now() - 30000, status: 'delivered' },
];

const initialState: ChatState = {
  messages: initialMessages,
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
    <div>
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