import {
  producer,
  consumer,
  connectProducer,
  connectConsumer,
  disconnectProducer,
  disconnectConsumer,
} from "../config/kafka.config";
import { broadcastMessage } from "../helpers/websocket-server";
import { ChatMessage, AIConfig } from "../interfaces/chat-message.interface";
import { generateAIResponse } from "../services/ai.service";
import { generateInitialPrompt } from "../helpers/prompt";

// Example usage remains the same
const dynamicData = {
  platformName: "Kryptomerch",
  recentTransactions: [
    {
      user: "rahul",
      wallet:
        "k:a1a5cc2c40ce6e96906426314998cd1c639f6a24ea96dc512d369d2e6dcb170a",
      action: "purchased",
      item: "NFT artwork",
      amount: "2.5 KDA",
    },
    {
      user: "rahul",
      wallet:
        "k:a1a5cc2c40ce6e96906426314998cd1c639f6a24ea96dc512d369d2e6dcb170a",
      action: "listed",
      item: "NFT",
      amount: "10 KDA",
    },
    {
      user: "rahul",
      wallet:
        "k:a1a5cc2c40ce6e96906426314998cd1c639f6a24ea96dc512d369d2e6dcb170a",
      action: "bid",
      item: "NFT auction",
      amount: "0.5 KDA",
    },
  ],
};

// In your main application logic
const aiConfig: AIConfig = {
  model: process.env.ACTIVE_AI_MODEL as "gpt" | "claude",
  initialPrompt: generateInitialPrompt(dynamicData),
};

export const sendChatMessage = async (message: ChatMessage): Promise<void> => {
  try {
    await connectProducer();
    await producer.send({
      topic: "chat_messages",
      messages: [{ value: JSON.stringify(message) }],
    });
    console.log("Chat message sent to Kafka successfully");
  } catch (error) {
    console.error("Error sending chat message to Kafka:", error);
    throw error;
  } finally {
    await disconnectProducer();
  }
};

export const subscribeToChatMessages = async (): Promise<void> => {
  try {
    await connectConsumer();
    await consumer.subscribe({ topic: "chat_messages", fromBeginning: true });
    console.log("Subscribed to chat_messages topic");
  } catch (error) {
    console.error("Error subscribing to chat messages:", error);
    throw error;
  }
};

export const startChatConsumer = async (): Promise<void> => {
  try {
    await consumer.run({
      eachMessage: async ({ message }) => {
        const chatMessage: ChatMessage = JSON.parse(message.value!.toString());
        console.log("Received chat message:", chatMessage);
        await broadcastMessage(chatMessage);

        if (chatMessage.recipientId === "AI") {
          const aiResponse = await generateAIResponse(chatMessage, aiConfig);
          await broadcastMessage(aiResponse);
        }
      },
    });
    console.log("Chat consumer started");
  } catch (error) {
    console.error("Error in chat consumer:", error);
    throw error;
  }
};

export const initializeChatSystem = async (): Promise<void> => {
  try {
    await subscribeToChatMessages();
    await startChatConsumer();
  } catch (error) {
    console.error("Error initializing chat system:", error);
    throw error;
  }
};

export const processChatMessage = async (
  message: ChatMessage
): Promise<void> => {
  try {
    await sendChatMessage(message);

    if (message.recipientId === "AI") {
      const aiResponse = await generateAIResponse(message, aiConfig);
      await broadcastMessage(aiResponse);
    } else {
      await broadcastMessage(message);
    }
  } catch (error) {
    console.error("Error processing chat message:", error);
  }
};
