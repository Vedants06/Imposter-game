import { useState, useEffect } from 'react';
import { socket, saveSession, getSession, clearSession } from './socket';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import Reveal from './pages/Reveal';
import Chat from './pages/Chat';
import Voting from './pages/Voting';
import GameOver from './pages/GameOver';
import ResultModal from './components/ResultModal';

function App() {
  const [currentPlayerId, setCurrentPlayerId] = useState(null);
  const [room, setRoom] = useState(null);
  const [roleData, setRoleData] = useState(null);
  const [error, setError] = useState('');
  const [eliminationData, setEliminationData] = useState(null);
  const [gameOverData, setGameOverData] = useState(null);
  const [reconnecting, setReconnecting] = useState(true);
  const [reconnectTimeout, setReconnectTimeout] = useState(false);

  useEffect(() => {
    setCurrentPlayerId(socket.id);

    // Try to reconnect if session exists
    const session = getSession();
    if (session) {
      console.log('Attempting to reconnect...', session);
      socket.emit('reconnect_to_room', {
        roomCode: session.roomCode,
        playerName: session.playerName
      });

      // Set timeout for 10 seconds
      const timeout = setTimeout(() => {
        setReconnectTimeout(true);
      }, 10000);

      // Cleanup function
      return () => clearTimeout(timeout);
    } else {
      setReconnecting(false);
    }
  }, []); // Run only once on mount

  useEffect(() => {
    const handleConnect = () => {
      setCurrentPlayerId(socket.id);
      console.log('Connected:', socket.id);
    };

    const handleReconnectSuccess = ({ roomCode }) => {
      console.log('Reconnected to room:', roomCode);
      setReconnecting(false);
      setReconnectTimeout(false);
    };

    const handleReconnectFailed = ({ message }) => {
      console.log('Reconnection failed:', message);
      clearSession();
      setReconnecting(false);
      setReconnectTimeout(false);
      setError(message);
      setTimeout(() => setError(''), 5000);
    };

    const handleRoomCreated = ({ roomCode }) => {
      console.log('Room created:', roomCode);
      const session = getSession();
      if (session) {
        saveSession(roomCode, session.playerName);
      }
    };

    const handleRoomJoined = ({ roomCode }) => {
      console.log('Room joined:', roomCode);
      const session = getSession();
      if (session) {
        saveSession(roomCode, session.playerName);
      }
    };

    const handleRoomUpdate = (roomData) => {
      setRoom(roomData);
      setError('');
    };

    const handleRoleAssigned = (data) => {
      setRoleData(data);
    };

    const handlePhaseChanged = ({ phase }) => {
      console.log('Phase changed:', phase);
      if (phase === 'reveal') {
        setEliminationData(null);
        setGameOverData(null);
      }
    };

    const handlePlayerEliminated = (data) => {
      setEliminationData(data);
    };

    const handleGameOver = (data) => {
      setGameOverData(data);
    };

    const handleError = ({ message }) => {
      setError(message);
      setTimeout(() => setError(''), 5000);
    };

    socket.on('connect', handleConnect);
    socket.on('reconnect_success', handleReconnectSuccess);
    socket.on('reconnect_failed', handleReconnectFailed);
    socket.on('room_created', handleRoomCreated);
    socket.on('room_joined', handleRoomJoined);
    socket.on('room_update', handleRoomUpdate);
    socket.on('role_assigned', handleRoleAssigned);
    socket.on('phase_changed', handlePhaseChanged);
    socket.on('player_eliminated', handlePlayerEliminated);
    socket.on('game_over', handleGameOver);
    socket.on('error_message', handleError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('reconnect_success', handleReconnectSuccess);
      socket.off('reconnect_failed', handleReconnectFailed);
      socket.off('room_created', handleRoomCreated);
      socket.off('room_joined', handleRoomJoined);
      socket.off('room_update', handleRoomUpdate);
      socket.off('role_assigned', handleRoleAssigned);
      socket.off('phase_changed', handlePhaseChanged);
      socket.off('player_eliminated', handlePlayerEliminated);
      socket.off('game_over', handleGameOver);
      socket.off('error_message', handleError);
    };
  }, []);

  const ErrorToast = () => {
    if (!error) return null;
    
    return (
      <div className="fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
        {error}
      </div>
    );
  };

  if (reconnecting) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl mb-2">Reconnecting...</p>
          <p className="text-sm text-gray-400">Please wait</p>
          
          {reconnectTimeout && (
            <div className="mt-8 p-6 bg-gray-800 rounded-lg max-w-md mx-auto">
              <p className="text-gray-300 mb-4">Taking too long?</p>
              <p className="text-sm text-gray-400 mb-6">
                The room might not exist anymore or connection failed.
              </p>
              <button
                onClick={() => {
                  // Clear session first
                  clearSession();
                  // Reload the page for a fresh start
                  window.location.reload();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition"
              >
                Return to Home
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <>
        <Home />
        <ErrorToast />
      </>
    );
  }

  const isHost = room.hostId === currentPlayerId;

  if (room.phase === 'game_over' && gameOverData) {
    return (
      <>
        <GameOver gameOverData={gameOverData} isHost={isHost} />
        <ErrorToast />
      </>
    );
  }

  if (room.phase === 'lobby') {
    return (
      <>
        <Lobby room={room} isHost={isHost} />
        <ErrorToast />
      </>
    );
  }

  if (room.phase === 'reveal') {
    return (
      <>
        <Reveal roleData={roleData} room={room} />
        <ErrorToast />
      </>
    );
  }

  if (room.phase === 'chat') {
    return (
      <>
        <Chat room={room} currentPlayerId={currentPlayerId} />
        <ErrorToast />
      </>
    );
  }

  if (room.phase === 'voting') {
    return (
      <>
        <Voting room={room} currentPlayerId={currentPlayerId} />
        <ErrorToast />
      </>
    );
  }

  if (room.phase === 'revote') {
    return (
      <>
        <Voting room={room} currentPlayerId={currentPlayerId} />
        <ErrorToast />
      </>
    );
  }

  if (room.phase === 'result') {
    return (
      <>
        <Voting room={room} currentPlayerId={currentPlayerId} />
        <ResultModal eliminationData={eliminationData} />
        <ErrorToast />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
      <ErrorToast />
    </>
  );
}

export default App;