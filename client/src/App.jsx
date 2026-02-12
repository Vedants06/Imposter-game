import { useState, useEffect } from 'react';
import { socket } from './socket';
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

  useEffect(() => {
    // Set player ID
    setCurrentPlayerId(socket.id);

    // Socket event listeners
    const handleConnect = () => {
      setCurrentPlayerId(socket.id);
      console.log('Connected:', socket.id);
    };

    const handleRoomCreated = ({ roomCode }) => {
      console.log('Room created:', roomCode);
    };

    const handleRoomJoined = ({ roomCode }) => {
      console.log('Room joined:', roomCode);
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

  // Error display
  const ErrorToast = () => {
    if (!error) return null;
    
    return (
      <div className="fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
        {error}
      </div>
    );
  };

  // Render appropriate page based on game state
  if (!room) {
    return (
      <>
        <Home onRoomJoined={() => {}} />
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