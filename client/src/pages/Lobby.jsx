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
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Lobby</h1>
          <div className="inline-block bg-gray-800 px-6 py-3 rounded-lg">
            <p className="text-gray-400 text-sm">Room Code</p>
            <p className="text-3xl font-mono font-bold">{room.roomCode}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Players List */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">
              Players ({room.players.length})
            </h2>
            <div className="space-y-2">
              {room.players.map((player) => (
                <div
                  key={player.id}
                  className="bg-gray-700 px-4 py-3 rounded flex items-center justify-between"
                >
                  <span className="font-medium">{player.name}</span>
                  {player.id === room.hostId && (
                    <span className="bg-yellow-600 text-xs px-2 py-1 rounded">
                      HOST
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Game Settings</h2>
            
            {isHost ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Number of Imposters
                  </label>
                  <select
                    value={room.impostersCount}
                    onChange={(e) => handleSettingChange('impostersCount', parseInt(e.target.value))}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                  >
                    {[...Array(maxImposters)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category
                  </label>
                  <select
                    value={room.category}
                    onChange={(e) => handleSettingChange('category', e.target.value)}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === 'random' ? 'Random' : cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Game Mode
                  </label>
                  <select
                    value={room.mode}
                    onChange={(e) => handleSettingChange('mode', e.target.value)}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                  >
                    <option value="different_word">Different Word</option>
                    <option value="no_word">No Word (Category + Hint)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleStartGame}
                    disabled={room.players.length < 3}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded transition"
                  >
                    {room.players.length < 3 ? 'Need at least 3 players' : 'Start Game'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-gray-300">
                <div>
                  <p className="text-sm text-gray-400">Imposters</p>
                  <p className="text-lg font-semibold">{room.impostersCount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Category</p>
                  <p className="text-lg font-semibold">
                    {room.category === 'random' ? 'Random' : room.category}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Mode</p>
                  <p className="text-lg font-semibold">
                    {room.mode === 'different_word' ? 'Different Word' : 'No Word'}
                  </p>
                </div>
                <p className="text-sm text-gray-400 pt-4">
                  Waiting for host to start the game...
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-gray-800 p-4 rounded-lg">
          <h3 className="font-bold mb-2">How to Play:</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Players get a word, imposters get a similar word (or just a hint)</li>
            <li>• Take turns giving clues about your word without saying it</li>
            <li>• Vote to eliminate who you think is the imposter</li>
            <li>• Players win if all imposters are eliminated</li>
            <li>• Imposters win if they equal or outnumber the players</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
