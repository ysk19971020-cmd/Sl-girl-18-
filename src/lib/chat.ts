import { ChatMessage } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const MESSAGES_KEY = 'privateconnect_messages';

export const getMessages = (): ChatMessage[] => {
  const data = localStorage.getItem(MESSAGES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveMessages = (messages: ChatMessage[]) => {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
};

export const sendMessage = (
  sessionId: string,
  senderId: string,
  receiverId: string,
  message: string
): ChatMessage => {
  const messages = getMessages();
  
  const chatMessage: ChatMessage = {
    id: uuidv4(),
    sessionId,
    senderId,
    receiverId,
    message,
    timestamp: new Date().toISOString(),
    read: false,
  };
  
  messages.push(chatMessage);
  saveMessages(messages);
  
  return chatMessage;
};

export const getSessionMessages = (sessionId: string): ChatMessage[] => {
  const messages = getMessages();
  return messages.filter(m => m.sessionId === sessionId);
};

export const markMessagesAsRead = (sessionId: string, userId: string) => {
  const messages = getMessages();
  const updated = messages.map(m => {
    if (m.sessionId === sessionId && m.receiverId === userId && !m.read) {
      return { ...m, read: true };
    }
    return m;
  });
  saveMessages(updated);
};
