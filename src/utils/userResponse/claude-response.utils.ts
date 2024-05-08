import { IClaude } from "../../interfaces/claude/claude.interface";

export const claudeResponseData = (claude: IClaude) => {
  return {
    _id: claude._id,
    user: claude.user,
    chats: claude.chats,
    createdAt: claude.createdAt,
    updatedAt: claude.updatedAt,
  };
}


 