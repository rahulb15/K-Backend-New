import { IClaude } from "../interfaces/claude/claude.interface";
import { IClaudeManager } from "../interfaces/claude/claude.manager.interface";
import Claude from "../models/claude.model";

export class ClaudeManager implements IClaudeManager {
  private static instance: ClaudeManager;

  // private constructor() {}

  public static getInstance(): ClaudeManager {
    if (!ClaudeManager.instance) {
      ClaudeManager.instance = new ClaudeManager();
    }

    return ClaudeManager.instance;
  }

  public async create(claude: IClaude): Promise<IClaude> {
    const newClaude = new Claude(claude);
    return newClaude.save();
  }

  public async getAll(): Promise<IClaude[]> {
    return Claude.find();
  }

  public async getById(id: string): Promise<IClaude> {
    const claude: IClaude = (await Claude.findById(id)) as IClaude;
    return claude;
  }
}

export default ClaudeManager.getInstance();
