import { useState, useRef, useEffect } from "react";
import type { ChatAction } from "../reducers/chatReducer";
import type MockWebSocket from "../services/mockWebSocket";

interface MessageInputProps {
    dispatch: React.Dispatch<ChatAction>;
    socket: MockWebSocket | null;
}

const MAX_HEIGHT = 150; // px, cap before internal scrolling kicks in

const MessageInput = ({ dispatch, socket }: MessageInputProps) => {
    const [text, setText] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = () => {
        if (text.trim() === '') return;

        const newMessage = {
            id: crypto.randomUUID(),
            senderID: 'me' as const,
            content: text,
            timestamp: Date.now(),
            status: 'sent' as const,
        };

        dispatch({ type: 'SEND_MESSAGE', payload: { message: newMessage } });
        socket?.send(newMessage);

        setText('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
        // Shift+Enter: do nothing special, let the browser insert a newline
    };

    // Auto-expand: runs whenever `text` changes
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;

        el.style.height = 'auto'; // reset first, so it can shrink too
        el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
    }, [text]);

    return (
        <div className="flex items-end">
            <textarea
                ref={textareaRef}
                className="border rounded p-2 m-2 w-full resize-none overflow-y-auto"
                style={{ maxHeight: `${MAX_HEIGHT}px` }}
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
            />
            <button
                className="bg-blue-500 text-white px-4 py-2 m-2 rounded active:scale-95"
                onClick={handleSend}
            >
                Send
            </button>
        </div>
    );
}

export default MessageInput;