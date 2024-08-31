//websocket-server.ts
import { Server as SocketIOServer } from 'socket.io';

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

    socket.on('disconnect', () => {
      console.log('Socket.IO connection closed', socket.id);
      // Remove the client from the map when the connection is closed
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

export function broadcastNotification(notification: any) {
  const socketId = clients.get(notification.userId);
  console.log('Broadcasting notification to client:', notification.userId, 'Socket ID:', socketId);
  if (socketId) {
    const io = (global as any).io; // Assuming you've made io globally accessible
    io.to(socketId).emit('notification', notification);
    console.log('Notification sent successfully');
  } else {
    console.log('Client not found for userId:', notification.userId);
  }
}