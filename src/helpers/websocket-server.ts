import { Server as SocketIOServer } from 'socket.io';
import { processChatMessage } from '../services/chat.manager';
import { sendNotification } from '../services/notification.manager';

const clients: Map<string, string> = new Map(); // Map userId to socketId

export function setupSocketIOServer(io: SocketIOServer) {
  io.on('connection', (socket) => {
    console.log('New Socket.IO connection', socket.id);

    socket.emit('welcome', { message: 'Connected to Socket.IO server' });

    socket.on('authenticate', (data) => {
      try {
        const userId = data.userId;
        clients.set(userId, socket.id);
        console.log(`User ${userId} authenticated with socket ${socket.id}`);
        socket.emit('authentication_successful', { userId });
      } catch (error) {
        console.error('Error processing authentication:', error);
        socket.emit('authentication_error', { message: 'Authentication failed' });
      }
    });

    socket.on('chat_message', async (message) => {
      console.log('Received chat message:', message);
      await processChatMessage(message);
    });

    socket.on('send_notification', async (notification) => {
      console.log('Received notification request:', notification);
      await sendNotification(notification);
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO connection closed', socket.id);
      for (const [userId, socketId] of clients.entries()) {
        if (socketId === socket.id) {
          clients.delete(userId);
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
    });
  });
}

export function broadcastMessage(message: any) {
  const socketId = clients.get(message.recipientId);
  console.log('Broadcasting message to client:', message.recipientId, 'Socket ID:', socketId);
  if (socketId) {
    const io = (global as any).io;
    io.to(socketId).emit('chat_message', message);
    console.log('Message sent successfully');
  } else {
    console.log('Client not found for userId:', message.recipientId);
  }
}

export function broadcastNotification(notification: any) {
  const socketId = clients.get(notification.userId);
  console.log('Broadcasting notification to client:', notification.userId, 'Socket ID:', socketId);
  console.log('All connected clients:', Array.from(clients.entries()));
  if (socketId) {
    const io = (global as any).io;
    io.to(socketId).emit('notification', notification);
    console.log('Notification sent successfully');
  } else {
    console.error('Client not found for userId:', notification.userId);
  }
}