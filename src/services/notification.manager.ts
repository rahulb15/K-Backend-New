import {
  producer,
  consumer,
  connectProducer,
  connectConsumer,
} from "../config/kafka.config";
import { broadcastNotification } from "../helpers/websocket-server";

interface Notification {
  id: string;
  userId: string;
  message: string;
  createdAt: Date;
}

export const sendNotification = async (
  notification: Notification
): Promise<void> => {
  try {
    await connectProducer();
    await producer.send({
      topic: "notifications",
      messages: [{ value: JSON.stringify(notification) }],
    });
    console.log("Notification sent to Kafka successfully:", notification);
  } catch (error) {
    console.error("Error sending notification to Kafka: ", error);
    throw error;
  } finally {
    await producer.disconnect();
  }
};

export const subscribeToNotifications = async (): Promise<void> => {
  try {
    await connectConsumer();
    await consumer.subscribe({ topic: "notifications", fromBeginning: true });
    console.log("Subscribed to notifications topic");
  } catch (error) {
    console.error("Error subscribing to notifications: ", error);
    throw error;
  }
};

export const startNotificationConsumer = async (): Promise<void> => {
  try {
    await consumer.run({
      eachMessage: async ({ topic, partition, message }: any) => {
        const notification: Notification = JSON.parse(
          message.value!.toString()
        );
        console.log("Received notification from Kafka:", notification);
        await broadcastNotification(notification);
      },
    });
    console.log("Notification consumer started");
  } catch (error) {
    console.error("Error in notification consumer: ", error);
    throw error;
  }
};

export const initializeNotificationSystem = async (): Promise<void> => {
  try {
    await subscribeToNotifications();
    await startNotificationConsumer();
    console.log("Notification system initialized successfully");
  } catch (error) {
    console.error("Error initializing notification system: ", error);
    throw error;
  }
};
