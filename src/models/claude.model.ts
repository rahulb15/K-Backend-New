import mongoose from "mongoose";

import { IClaude } from "../interfaces/claude/claude.interface";

const claudeChatsSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true },
    chatsData: [
      {
        ai_response: { type: String, required: true },
        answered: { type: Boolean, required: true },
        answer: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const claudeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    chats: [claudeChatsSchema],
  },
  { timestamps: true }
);

const Claude = mongoose.model<IClaude>("Claude", claudeSchema);

export default Claude;
