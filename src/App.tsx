import ChatWindow from "./component/ChatWindow";
import type { Message } from "./types/message";

const dummyMessages: Message[] = [
  { id: '1', senderID: 'me', content: 'hey, you free later?', timestamp: Date.now() - 60000, status: 'read' },
  { id: '2', senderID: 'alice', content: 'yeah whats up', timestamp: Date.now() - 45000, status: 'read' },
  { id: '3', senderID: 'me', content: 'wanna review the ping assignment', timestamp: Date.now() - 30000, status: 'delivered' },
];

const App = () => {
  return (
    <div>
      <ChatWindow messages={dummyMessages} />
    </div>
  );
}

export default App;