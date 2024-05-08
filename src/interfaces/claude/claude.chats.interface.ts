export interface IClaudeChats {
  _id?: string;
  prompt?: string;
  chatsData: {
    _id: string;
    ai_response: string;
    answered: boolean;
    answer: string;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}
