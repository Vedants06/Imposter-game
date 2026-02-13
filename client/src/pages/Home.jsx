import { useState } from 'react';
import { socket, saveSession } from '../socket';

export default function Home() {
  const [mode, setMode] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');

  const handleCreateRoom = (e) => {
    e.preventDefault();
    setError('');
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    saveSession('', playerName.trim());
    socket.emit('create_room', { playerName: playerName.trim() });
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    setError('');
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!roomCode.trim()) {
      setError('Please enter room code');
      return;
    }
    
    saveSession(roomCode.trim().toUpperCase(), playerName.trim());
    socket.emit('join_room', {
      roomCode: roomCode.trim().toUpperCase(),
      playerName: playerName.trim()
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden stars-bg text-white">
      
      {/* High Intensity Corner Ray Wrapper */}
      <div className="bottom-ray" />

      {/* Static deep-space orbs for constant ambient color */}
      <div className="absolute w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] -top-20 -left-20 pointer-events-none" />
      <div className="absolute w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -bottom-20 -right-20 pointer-events-none" />

      <div className="max-w-md w-full z-10 text-center animate-slide-up">
        
        {/* Stark White Bold Title */}
        <div className="mb-12">
          <h1 className="text-6xl md:text-7xl font-black tracking-[0.12em] text-white uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            Imposter
          </h1>
          <p className="text-gray-400 mt-5 text-base font-normal font-mono opacity-90">
            Find the imposters among us
          </p>
        </div>

        {!mode ? (
          <div className="space-y-4 max-w-xl mx-auto">
            <button
              onClick={() => setMode('create')}
              className="w-full py-4 rounded-xl font-semibold text-lg bg-[#3b82f6] text-white transition-all duration-300 btn-glow-blue hover:scale-[1.02] active:scale-95"
            >
              Create Room
            </button>

            <button
              onClick={() => setMode('join')}
              className="w-full py-4 rounded-xl font-semibold text-lg bg-[#22c55e] text-white transition-all duration-300 btn-glow-green hover:scale-[1.02] active:scale-95"
            >
              Join Room
            </button>

            <p className="text-gray-400 text-xs text-center mt-12 font-sans opacity-50">
              made by vedant
            </p>
          </div>
        ) : (
          /* Glassmorphism Form Container */
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-3xl shadow-xl animate-in fade-in zoom-in duration-100 text-left">
            <h2 className="text-2xl font-normal mb-8 text-center text-white tracking-wide ">
              {mode === 'create' ? 'Host Game' : 'Join Game'}
            </h2>

            <form onSubmit={mode === 'create' ? handleCreateRoom : handleJoinRoom} className="space-y-6">
              <div>
                <label className="block text-sm  text-gray-400 tracking-wide mb-2 ml-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Name"
                  maxLength={20}
                  className="w-full px-5 py-4 rounded-xl  bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>

              {mode === 'join' && (
                <div className="animate-in slide-in-from-top-2">
                  <label className="block text-sm text-gray-400 tracking-wide mb-2 ml-1.5">
                    Room Code
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="6-letter code"
                    maxLength={6}
                    className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 placeholder:text-gray-600 text-white font-mono tracking-[0.1em] focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                  />
                </div>
              )}

              {error && (
                <p className="text-red-400 text-sm text-center font-bold bg-red-400/10 py-2 rounded-lg border border-red-400/20">
                  {error}
                </p>
              )}

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => { setMode(null); setError(''); }}
                  className="flex-1 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-medium text-base text-gray-400"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-3.5 rounded-xl font-semibold transition-all text-base shadow-lg ${
                    mode === 'create' ? 'bg-[#3b82f6] btn-glow-blue' : 'bg-[#22c55e] btn-glow-green'
                  }`}
                >
                  {mode === 'create' ? 'Create' : 'Join'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}