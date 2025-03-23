import { io } from 'socket.io-client';

// Initialize socket connection - replace with your server URL
let backend_url = import.meta.env.VITE_APP_SERVER_URL;

export const socket = io(backend_url, {
  transports: ["polling"],
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

// Connect when we have authentication
export const connectSocket = (token) => {
  if (token) {
    socket.auth = { token };
    socket.connect();
  }
};