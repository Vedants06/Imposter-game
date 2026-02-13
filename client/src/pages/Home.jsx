import { useState } from 'react';
import { socket } from '../socket';
import { AuroraText } from "@/components/ui/aurora-text"

export default function Home({ onRoomJoined }) {
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

    socket.emit('join_room', {
      roomCode: roomCode.trim().toUpperCase(),
      playerName: playerName.trim()
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#0b1120] to-[#020617] text-white">

      {/* Background Glow Effects */}
      <div className="absolute w-96 h-96 bg-purple-600/30 rounded-full blur-3xl top-[-100px] left-[-100px]" />
      <div className="absolute w-96 h-96 bg-blue-600/30 rounded-full blur-3xl bottom-[-100px] right-[-100px]" />

      <div className="max-w-md w-full z-10">

        {/* Title Section */}
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-wide bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
            <AuroraText>Aurora Text</AuroraText>
          </h1>
          <p className="text-gray-400 mt-3 text-lg">
            Find the imposters among us
          </p>
        </div>

        {/* Main Buttons */}
        {!mode ? (
          <div className="space-y-5">

            <button
              onClick={() => setMode('create')}
              className="w-full py-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-10 transition-all duration-300 shadow-lg shadow-blue-500/30"
            >
              Create Room
            </button>

            <button
              onClick={() => setMode('join')}
              className="w-full py-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-10 transition-all duration-300 shadow-lg shadow-green-500/30"
            >
              Join Room
            </button>

            <p className="text-gray-500 text-sm text-center mt-6">
              made by vedant
            </p>

          </div>
        ) : (

          <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-2xl shadow-2xl">

            <h2 className="text-2xl font-bold mb-6 text-center">
              {mode === 'create' ? 'Create Room' : 'Join Room'}
            </h2>

            <form
              onSubmit={mode === 'create' ? handleCreateRoom : handleJoinRoom}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm mb-2 text-gray-300">
                  Your Name
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={20}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
              </div>

              {mode === 'join' && (
                <div>
                  <label className="block text-sm mb-2 text-gray-300">
                    Room Code
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="Enter 6-letter code"
                    maxLength={6}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 uppercase focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                  />
                </div>
              )}

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setMode(null)}
                  className="flex-1 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition"
                >
                  Back
                </button>

                <button
                  type="submit"
                  className={`flex-1 py-3 rounded-lg font-semibold transition shadow-lg ${
                    mode === 'create'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-blue-500/30'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-500/30'
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
