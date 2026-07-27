import type { Message } from "../types/message";

// Events the mock server can push to subscribers
type MockSocketEvent =
  | { type: 'message'; payload: Message }
  | { type: 'typing'; payload: { userId: string; isTyping: boolean } }
  | { type: 'status'; payload: { messageId: string; status: 'sent' | 'delivered' | 'read' } };

type Listener = (event: MockSocketEvent) => void;

export const FAKE_CONTACTS = ['alice', 'bob'];
const FAKE_REPLIES = [
  "haha true",
  "no way really?",
  "let me check and get back to you",
  "sounds good",
  "on it",
];

class MockWebSocket {
  private listeners: Listener[] = [];
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // every 4-8s, simulate an incoming message from a random fake contact
    this.intervalId = setInterval(() => {
      const contact = FAKE_CONTACTS[Math.floor(Math.random() * FAKE_CONTACTS.length)];
      const reply = FAKE_REPLIES[Math.floor(Math.random() * FAKE_REPLIES.length)];

      // show "typing" first, then the message a bit later — feels real
      this.emit({ type: 'typing', payload: { userId: contact, isTyping: true } });

      setTimeout(() => {
        this.emit({ type: 'typing', payload: { userId: contact, isTyping: false } });
        this.emit({
          type: 'message',
          payload: {
            id: crypto.randomUUID(),
            senderID: contact,
            content: reply,
            timestamp: Date.now(),
            status: 'delivered',
          },
        });
      }, 1200 + Math.random() * 800); // 1.2-2s of "typing" before the message lands
    }, 4000 + Math.random() * 4000); // next incoming message in 4-8s
  }

  on(listener: Listener): void {
    this.listeners.push(listener);
  }

  send(message: Message): void {
    // simulate network delay before "delivered", then a bit more before "read"
    setTimeout(() => {
      this.emit({
        type: 'status',
        payload: { messageId: message.id, status: 'delivered' },
      });

      setTimeout(() => {
        this.emit({
          type: 'status',
          payload: { messageId: message.id, status: 'read' },
        });
      }, 1000 + Math.random() * 1500);
    }, 300 + Math.random() * 600); // 300-900ms as the spec asks
  }

  disconnect(): void {
    if (this.intervalId) clearInterval(this.intervalId);
    this.listeners = [];
  }

  private emit(event: MockSocketEvent): void {
    this.listeners.forEach((listener) => listener(event));
  }
}

export type { MockSocketEvent };
export default MockWebSocket;