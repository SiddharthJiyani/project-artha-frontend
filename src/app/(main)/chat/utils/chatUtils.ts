// Chat component hooks and utilities
export interface FirebaseMessage {
  llm_response: string;
  query_user: string;
  timestamp: number;
  timestamps?: number;
  llm_thinking?: string;
}

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
  messageId?: string;
  thinking?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: number;
  messageCount: number;
}

// Chat suggestions utility
export const getChatSuggestions = async ({ chatHistory }: { chatHistory: string }) => {
  return {
    suggestions: [
      "Analyze my portfolio performance",
      "Investment recommendations", 
      "Budget optimization tips",
      "Market insights today",
    ],
  };
};

// Transform Firebase messages to display format
export const transformFirebaseMessages = (chatData: any): Message[] => {
  if (!chatData) return [];

  const messages: Message[] = [];

  // Get all message entries and sort by Firebase timestamp
  const messageEntries = Object.entries(chatData) as [string, FirebaseMessage][];
  const sortedEntries = messageEntries.sort(([, a], [, b]) => {
    // Sort by Firebase timestamps (plural) field
    const timestampA = a.timestamps || a.timestamp || 0;
    const timestampB = b.timestamps || b.timestamp || 0;
    return timestampA - timestampB;
  });

  sortedEntries.forEach(([messageId, messageData]) => {
    // Use Firebase timestamps (plural) field correctly
    const firebaseTimestamp = messageData.timestamps || messageData.timestamp || 0;

    // Add user message if exists
    if (messageData.query_user) {
      messages.push({
        id: `${messageId}-user`,
        text: messageData.query_user,
        isUser: true,
        timestamp: firebaseTimestamp,
        messageId: messageId,
      });
    }

    // Handle AI thinking and response separately for animation
    if (messageData.llm_thinking || messageData.llm_response) {
      // If only thinking exists (response hasn't arrived yet), show thinking animation
      if (messageData.llm_thinking && !messageData.llm_response) {
        console.log('Thinking phase detected for message:', messageId);
      }
      
      // If response exists, show the final message with thinking data
      if (messageData.llm_response) {
        messages.push({
          id: `${messageId}-ai`,
          text: messageData.llm_response,
          isUser: false,
          timestamp: firebaseTimestamp,
          messageId: messageId,
          thinking: messageData.llm_thinking,
        });
      }
    }
  });

  return messages;
};
