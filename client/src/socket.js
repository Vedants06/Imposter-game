import { io } from 'socket.io-client';

const URL = import.meta.env.PROD ? window.location.origin : 'http://localhost:3000';

export const socket = io(URL, {
  autoConnect: true
});
