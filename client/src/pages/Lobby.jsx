import { socket } from '../socket';

const categories = ['random', 'Places', 'Movies', 'Food', 'Animals', 'Sports'];

export default function Lobby({ room, isHost }) {
  const handleSettingChange = (setting, value) => {
    socket.emit('update_settings', { [setting]: value });
  };

  const handleStartGame = () => {
    socket.emit('start_game');
  };

  const maxImposters = Math.floor(room.players.length / 2);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden stars-bg text-white">
      {/* Cosmic Background Elements */}
      <div className="bottom-ray" />
      <div className="absolute w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] -top-20 -left-20 pointer-events-none" />
      <div className="absolute w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -bottom-20 -right-20 pointer-events-none" />

      <div className="max-w-4xl w-full z-10 py-8 animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-wider mb-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            LOBBY
          </h1>
          <div className="inline-block backdrop-blur-xl bg-white/5 border border-white/10 px-8 py-4 rounded-2xl">
            <p className="text-gray-400 text-sm mb-1">Room Code</p>
            <p className="text-4xl font-mono font-bold tracking-widest">{room.roomCode}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Players List */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-3xl">
            <h2 className="text-2xl font-medium mb-4 pl-2 flex tracking-wide items-center gap-2">
              Players: {room.players.length}
            </h2>
            <div className="space-y-2">
              {room.players.map((player, index) => (
                <div
                  key={player.id}
                  className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl flex items-center justify-between hover:bg-white/10 transition-all"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="font-medium">{player.name}</span>
                  {player.id === room.hostId && (
                    <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg">
                      Host
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-3xl">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              Game Settings
            </h2>
            
            {isHost ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Number of Imposters
                  </label>
                  <select
                    value={room.impostersCount}
                    onChange={(e) => handleSettingChange('impostersCount', parseInt(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  >
                    {[...Array(maxImposters)].map((_, i) => (
                      <option key={i + 1} value={i + 1} className="bg-gray-900">
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Category
                  </label>
                  <select
                    value={room.category}
                    onChange={(e) => handleSettingChange('category', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-gray-900">
                        {cat === 'random' ? 'Random' : cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Game Mode
                  </label>
                  <select
                    value={room.mode}
                    onChange={(e) => handleSettingChange('mode', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  >
                    <option value="different_word" className="bg-gray-900">Different Word</option>
                    <option value="no_word" className="bg-gray-900">No Word (Category + Hint)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleStartGame}
                    disabled={room.players.length < 3}
                    className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                      room.players.length < 3
                        ? 'bg-gray-600 cursor-not-allowed opacity-50'
                        : 'bg-[#22c55e] btn-glow-green hover:scale-[1.02] active:scale-95'
                    }`}
                  >
                    {room.players.length < 3 ? 'Need at least 3 players' : 'Start Game'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-xl">
                  <p className="text-sm text-gray-400 mb-1">Imposters</p>
                  <p className="text-xl font-bold text-red-400">{room.impostersCount}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl">
                  <p className="text-sm text-gray-400 mb-1">Category</p>
                  <p className="text-xl font-bold text-blue-400">
                    {room.category === 'random' ? 'Random' : room.category}
                  </p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl">
                  <p className="text-sm text-gray-400 mb-1">Mode</p>
                  <p className="text-xl font-semibold text-purple-400">
                    {room.mode === 'different_word' ? 'Different Word' : 'No Word'}
                  </p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl text-center mt-6">
                  <p className="text-blue-300 animate-pulse">
                    Waiting for host to start the game
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* How to Play */}
        <div className="mt-6 backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-3xl">
          <h3 className="font-bold text-xl mb-3 text-blue-300">How to Play</h3>
          <ul className="text-sm text-gray-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span>Players get a word, imposters get a similar word (or just a hint)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span>Take turns giving clues about your word without saying it</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span>Vote to eliminate who you think is the imposter</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span>Players win if all imposters are eliminated</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span>Imposters win if they equal or outnumber the players</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}