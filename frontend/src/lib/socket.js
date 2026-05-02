import { io } from 'socket.io-client';

import { getToken } from './auth';

export const createSocket = () =>
  io(import.meta.env.VITE_API_URL, {
    autoConnect: true,
    auth: {
      token: getToken()
    }
  });
