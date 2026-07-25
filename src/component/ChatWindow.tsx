import type { Message } from "../types/message";
import MessageBubble from "./MessageBubble";

interface ChatWindowProps {
    messages:Message[];
}

const ChatWindow = ({messages}:ChatWindowProps) => {
    return(
        <div>
            {messages.map ((message) => (
                <MessageBubble key={message.id} message={message} />
            ))}
            <input className="border rounded p-2 m-2 w-md" 
             type="text" placeholder="Type a message..." />
            <button className="bg-blue-500 text-white px-4 py-2 rounded active:scale-95">Send</button>
        </div>
    );

}

export default ChatWindow;