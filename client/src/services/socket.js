import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    const explicitUrl = import.meta.env.VITE_SOCKET_URL;
    const apiUrl = import.meta.env.VITE_API_URL;
    let serverUrl;
    if (explicitUrl) {
      serverUrl = explicitUrl;
    } else if (apiUrl && apiUrl.startsWith('http')) {
      serverUrl = apiUrl.replace(/\/api\/?$/, '');
    } else {
      // Connect to same origin via Vite proxy or Vercel routing
      serverUrl = undefined;
    }

    socket = io(serverUrl, {
      withCredentials: true,
      autoConnect: true,
    });
  }
  return socket;
};

export const joinBusinessRoom = (businessId) => {
  const s = getSocket();
  if (s && businessId) {
    s.emit('joinBusiness', businessId);
  }
};

export const joinUserRoom = (userId) => {
  const s = getSocket();
  if (s && userId) {
    s.emit('joinUser', userId);
  }
};
