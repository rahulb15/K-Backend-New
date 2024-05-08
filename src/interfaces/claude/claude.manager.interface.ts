import { IClaude } from "./claude.interface";
export interface IClaudeManager {
  create(claude: IClaude): Promise<IClaude>;
  getAll(): Promise<IClaude[]>;
  getById(id: string): Promise<IClaude>;
}
