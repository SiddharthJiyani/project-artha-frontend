// Component exports
export { ChatSidebar } from './components/ChatSidebar';
export { ThinkingBubble } from './components/ThinkingBubble';
export { MessageBubble } from './components/MessageBubble';
export { LiveThinkingIndicator } from './components/LiveThinkingIndicator';
export { ChatSuggestions } from './components/ChatSuggestions';
export { ChatInput } from './components/ChatInput';
export { ChatHeader } from './components/ChatHeader';
export { ConnectionStatus } from './components/ConnectionStatus';

// Utility exports
export { 
  getChatSuggestions, 
  transformFirebaseMessages,
  type FirebaseMessage,
  type Message,
  type ChatSession 
} from './utils/chatUtils';
