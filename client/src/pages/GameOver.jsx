import { socket } from '../socket';

export default function GameOver({ gameOverData, isHost }) {
  const handleRestart = () => {
    socket.emit('restart_game');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold mb-4">
            {gameOverData.winner === 'players' ? '🎉 Players Win!' : '😈 Imposters Win!'}
          </h1>
          <p className="text-2xl text-gray-400">
            {gameOverData.winner === 'players' 
              ? 'All imposters have been eliminated!' 
              : 'Imposters have taken over!'}
          </p>
        </div>

        {/* Word Reveal */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-2xl font-bold mb-4 text-center">The Words Were:</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-900 border-2 border-green-600 p-6 rounded-lg text-center">
              <p className="text-sm text-gray-300 mb-2">Players' Word</p>
              <p className="text-4xl font-bold">{gameOverData.actualWord}</p>
            </div>
            <div className="bg-red-900 border-2 border-red-600 p-6 rounded-lg text-center">
              <p className="text-sm text-gray-300 mb-2">Imposters' Word</p>
              <p className="text-4xl font-bold">
                {gameOverData.imposterWord || 'No Word'}
              </p>
            </div>
          </div>
        </div>

        {/* Players List */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-2xl font-bold mb-4">Final Roles</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {gameOverData.players.map((player) => (
              <div
                key={player.id}
                className={`p-4 rounded-lg border-2 ${
                  player.role === 'imposter'
                    ? 'bg-red-900 border-red-600'
                    : 'bg-green-900 border-green-600'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-lg">{player.name}</p>
                    <p className="text-sm text-gray-300">
                      {player.role === 'imposter' ? 'Imposter' : 'Player'}
                    </p>
                  </div>
                  {player.word && (
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Word</p>
                      <p className="font-semibold">{player.word}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Restart Button */}
        {isHost && (
          <button
            onClick={handleRestart}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg text-xl transition"
          >
            Play Again
          </button>
        )}

        {!isHost && (
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <p className="text-gray-400">Waiting for host to start a new game...</p>
          </div>
        )}
      </div>
    </div>
  );
}
