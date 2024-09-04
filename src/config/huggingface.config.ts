import { HfInference } from "@huggingface/inference";
import { HfAgent, LLMFromHub } from "@huggingface/agents";

const HF_TOKEN = process.env.HUGGINGFACE_API_KEY;
const hf = new HfInference(HF_TOKEN);

const agent = new HfAgent(HF_TOKEN, LLMFromHub(HF_TOKEN));

export { hf, agent };
