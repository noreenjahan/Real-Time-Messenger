import type { Message } from "../types/message";

interface ChatState {
  messages: Message[];
}

type ChatAction =
  | { type: 'SEND_MESSAGE'; payload: { message: Message } }
  | { type: 'RECEIVE_MESSAGE'; payload: { message: Message } }
  | { type: 'UPDATE_STATUS'; payload: { messageId: string; status: 'sent' | 'delivered' | 'read' } };

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SEND_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload.message]
      };

    case 'RECEIVE_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload.message]
      };

    case 'UPDATE_STATUS':
      return {
        ...state,
        messages: state.messages.map(message =>
          message.id === action.payload.messageId
            ? { ...message, status: action.payload.status }
            : message
        )
      };

    default:
      return state;
  }
}

export type { ChatState, ChatAction };
export default chatReducer;