import { ChatMessage, AIConfig } from "../interfaces/chat-message.interface";
import { openai } from "../config/openai.config";
import { anthropic } from "../config/anthropic.config";

import { hf, agent } from "../config/huggingface.config";
import { broadcastMessage } from "../helpers/websocket-server";



export const generateAIResponse = async (message: ChatMessage, aiConfig: AIConfig): Promise<ChatMessage> => {
    console.log('Generating AI response for message:', message);
    try {
      let aiResponse: string;
  
      switch (aiConfig.model) {
        case 'gpt':
          const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              { role: 'system', content: aiConfig.initialPrompt },
              { role: 'user', content: message.message },
            ],
          });
          aiResponse = response.choices[0].message.content as string;
          break;
        case 'claude':
          const claudeResponse = await anthropic.messages.create({
            model: "claude-3-sonnet-20240229",
            max_tokens: 1000,
            messages: [
              { role: 'user', content: aiConfig.initialPrompt },
              { role: 'assistant', content: "Understood. I'm ready to assist with questions about the NFT marketplace." },
              { role: 'user', content: message.message },
            ],
          });
          aiResponse = claudeResponse.content[0].text;
          break;
        case 'huggingface':
          aiResponse = await generateHuggingFaceResponse(message.message);
          break;
        default:
          throw new Error('Invalid AI model specified');
      }
  
      console.log('AI response generated:', aiResponse);
  
      return {
        id: `ai-${Date.now()}`,
        senderId: 'AI',
        recipientId: message.senderId,
        message: aiResponse,
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error('Error generating AI response:', error.message);
      if (error.code === 'insufficient_quota' || error.status === 429) {
        console.error('Quota exceeded, unable to generate AI response:', error.message);
        return {
          id: `ai-${Date.now()}`,
          senderId: 'AI',
          recipientId: message.senderId,
          message: "I'm currently unable to respond due to high demand. Please try again later.",
          timestamp: new Date(),
        };
      } else {
        console.error('Error generating AI response:', error.message);
        throw error;
      }
    }
  };


async function generateHuggingFaceResponse(message: string): Promise<string> {
    try {
      const result = await hf.textGeneration({
        model: 'gpt2',
        inputs: message,
        parameters: {
          max_new_tokens: 100,
          temperature: 0.7,
        },
      });
      return result.generated_text;
    } catch (error) {
      console.error('Error generating Hugging Face response:', error);
      throw error;
    }
  }
  
  async function classifyImage(imageUrl: string): Promise<Array<{ label: string; score: number }>> {
    try {
      const imageData = await fetch(imageUrl).then((r) => r.arrayBuffer());
      const result = await hf.imageClassification({
        model: 'google/vit-base-patch16-224',
        data: imageData,
      });
      return result;
    } catch (error) {
      console.error('Error classifying image:', error);
      throw error;
    }
  }
  
  async function runHfAgent(task: string): Promise<any> {
    try {
      return await agent.run(task);
    } catch (error) {
      console.error('Error running Hugging Face agent:', error);
      throw error;
    }
  }


// The rest of your code (sendChatMessage, subscribeToChatMessages, startChatConsumer, initializeChatSystem, processChatMessage) remains the same

// New function to handle image classification requests
export const handleImageClassification = async (imageUrl: string): Promise<void> => {
    try {
      const classifications = await classifyImage(imageUrl);
      const response = `Image classification results:\n${classifications.map(c => `${c.label}: ${c.score.toFixed(2)}`).join('\n')}`;
      await broadcastMessage({
        id: `ai-${Date.now()}`,
        senderId: 'AI',
        recipientId: 'all',
        message: response,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error handling image classification:', error);
    }
  };
  
  // New function to handle Hugging Face agent tasks
  export const handleHfAgentTask = async (task: string): Promise<void> => {
    try {
      const result = await runHfAgent(task);
      await broadcastMessage({
        id: `ai-${Date.now()}`,
        senderId: 'AI',
        recipientId: 'all',
        message: JSON.stringify(result, null, 2),
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error handling Hugging Face agent task:', error);
    }
  };