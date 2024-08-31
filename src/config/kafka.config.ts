// src/config/kafka.ts

import { Kafka, Producer, Consumer, KafkaConfig } from 'kafkajs';
import dotenv from 'dotenv';

dotenv.config();

const kafkaConfig: KafkaConfig = {
  clientId: 'notification-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  ssl: process.env.KAFKA_USE_SSL === 'true',
  sasl: process.env.KAFKA_USE_SASL === 'true'
    ? {
        mechanism: 'plain',
        username: process.env.KAFKA_SASL_USERNAME || '',
        password: process.env.KAFKA_SASL_PASSWORD || '',
      }
    : undefined,
};

const kafka = new Kafka(kafkaConfig);

export const producer: Producer = kafka.producer();
export const consumer: Consumer = kafka.consumer({ groupId: 'notification-group' });

export const connectProducer = async (): Promise<void> => {
  try {
    await producer.connect();
    console.log('Producer connected successfully');
  } catch (error) {
    console.error('Error connecting the producer: ', error);
    throw error;
  }
};

export const connectConsumer = async (): Promise<void> => {
  try {
    await consumer.connect();
    console.log('Consumer connected successfully');
  } catch (error) {
    console.error('Error connecting the consumer: ', error);
    throw error;
  }
};

export const disconnectProducer = async (): Promise<void> => {
  try {
    await producer.disconnect();
    console.log('Producer disconnected successfully');
  } catch (error) {
    console.error('Error disconnecting the producer: ', error);
    throw error;
  }
};

export const disconnectConsumer = async (): Promise<void> => {
  try {
    await consumer.disconnect();
    console.log('Consumer disconnected successfully');
  } catch (error) {
    console.error('Error disconnecting the consumer: ', error);
    throw error;
  }
};