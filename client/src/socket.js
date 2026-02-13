import { io } from 'socket.io-client';

const URL = import.meta.env.PROD ? window.location.origin : 'http://localhost:3000';

export const socket = io(URL, {
  autoConnect: true
});

// Session management
export const saveSession = (roomCode, playerName) => {
  localStorage.setItem('imposter_session', JSON.stringify({
    roomCode,
    playerName,
    timestamp: Date.now()
  }));
};

export const getSession = () => {
  const session = localStorage.getItem('imposter_session');
  if (!session) return null;
  
  const data = JSON.parse(session);
  // Clear session if older than 24 hours
  if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
    clearSession();
    return null;
  }
  
  return data;
};

export const clearSession = () => {
  localStorage.removeItem('imposter_session');
};