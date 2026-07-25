export interface Message {
    id: string;
    senderID: 'me' | string;
    content: string;
    timestamp: number;
    status: 'sent' | 'delivered' | 'read';
}