export interface ChatMessage {
    id: string;
    senderId: string;
    recipientId: string;
    message: string;
    timestamp: Date;
  }

 export  interface AIConfig {
    model: 'gpt' | 'claude' | 'huggingface';
    initialPrompt: string;
  }
  