import { Server } from 'socket.io';

let io = null;

/**
 * Initialize Socket.IO and attach it to the HTTP server.
 * @param {import('http').Server} httpServer
 * @returns {import('socket.io').Server}
 */
export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Get the current Socket.IO instance.
 * Returns null if not yet initialized.
 * @returns {import('socket.io').Server | null}
 */
export const getIO = () => io;
