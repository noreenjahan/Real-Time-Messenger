import { useRef, useState, useEffect } from "react";
import type { Message } from "../types/message";
import MessageBubble from "./MessageBubble";

interface ChatWindowProps {
    messages: Message[];
}

const NEAR_BOTTOM_THRESHOLD = 100;

const ChatWindow = ({ messages }: ChatWindowProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isNearBottom, setIsNearBottom] = useState(true);
    const [hasNewMessages, setHasNewMessages] = useState(false);
    const prevMessageCount = useRef(messages.length);

    const handleScroll = () => {
        const el = containerRef.current;
        if (!el) return;
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        const nearBottom = distanceFromBottom < NEAR_BOTTOM_THRESHOLD;
        setIsNearBottom(nearBottom);
        if (nearBottom) setHasNewMessages(false);
    };

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const messageWasAdded = messages.length > prevMessageCount.current;
        prevMessageCount.current = messages.length;
        if (!messageWasAdded) return;

        const latestMessage = messages[messages.length - 1];
        const iSentIt = latestMessage.senderID === 'me';

        if (iSentIt || isNearBottom) {
            el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
            setHasNewMessages(false);
        } else {
            setHasNewMessages(true);
        }
    }, [messages, isNearBottom]);

    const scrollToBottom = () => {
        const el = containerRef.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
        setHasNewMessages(false);
    };

    return (
        <div className="relative flex-1 flex flex-col min-h-0">
            <div ref={containerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto min-h-0">
                {messages.map((message, index) => {
                    const nextMessage = messages[index + 1];
                    const isLastInGroup = !nextMessage || nextMessage.senderID !== message.senderID;
                    return (
                        <MessageBubble key={message.id} message={message} showTimestamp={isLastInGroup} />
                    );
                })}
            </div>

            {hasNewMessages && (
                <button onClick={scrollToBottom} className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-3 py-1 rounded-full shadow">
                    New messages ↓
                </button>
            )}
        </div>
    );
}

export default ChatWindow;