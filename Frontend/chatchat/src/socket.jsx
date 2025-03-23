import { io } from 'socket.io-client';

// Initialize socket connection - replace with your server URL
export const socket = io('http://localhost:4000', {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Connect when we have authentication
export const connectSocket = (token) => {
  if (token) {
    socket.auth = { token };
    socket.connect();
  }
};