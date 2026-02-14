import { socket, clearSession } from '../socket';

export default function GameOver({ gameOverData, isHost }) {
  const handleRestart = () => {
    socket.emit('restart_game');
  };

  const handleNewGame = () => {
    clearSession();
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden stars-bg text-white">
      {/* Cosmic Background */}
      <div className="bottom-ray" />
      <div className="absolute w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] -top-20 -left-20 pointer-events-none" />
      <div className="absolute w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -bottom-20 -right-20 pointer-events-none" />

      <div className="max-w-4xl w-full z-10 py-8 animate-slide-up">
        {/* Winner Announcement */}
        <div className="text-center mb-8">
          <h1 className="text-6xl md:text-7xl font-black mb-4 tracking-wider drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            {gameOverData.winner === 'players' ? '🎉 PLAYERS WIN!' : '😈 IMPOSTERS WIN!'}
          </h1>
          <p className="text-xl text-gray-300">
            {gameOverData.winner === 'players' 
              ? 'All imposters have been eliminated!' 
              : 'Imposters have taken over!'}
          </p>
        </div>

        {/* Word Reveal */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-3xl mb-6">
          <h2 className="text-3xl font-semibold mb-6 text-center">The Words Were:</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-600/30 border-2 border-green-500 p-8 rounded-2xl text-center backdrop-blur-sm">
              <p className="text-sm text-green-400 mb-3 font-medium">Players' Word</p>
              <p className="text-5xl font-black">{gameOverData.actualWord}</p>
            </div>
            <div className="bg-red-600/30 border-2 border-red-500/50 p-8 rounded-2xl text-center backdrop-blur-sm">
              <p className="text-sm text-red-300 mb-3 font-medium">Imposters' Word</p>
              <p className="text-5xl font-black">
                {gameOverData.imposterWord || 'No Word'}
              </p>
            </div>
          </div>
        </div>

        {/* Players List */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-3xl mb-6">
          <h2 className="text-3xl font-semibold mb-6">Final Roles</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {gameOverData.players.map((player) => (
              <div
                key={player.id}
                className={`p-5 rounded-2xl border-2 backdrop-blur-sm ${
                  player.role === 'imposter'
                    ? 'bg-red-500/5 border-red-500/50'
                    : 'bg-green-500/5 border-green-500/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-xl text-white">{player.name}</p>
                    <p className={`text-sm font-normal ${
                      player.role === 'imposter' ? 'text-red-300' : 'text-green-300'
                    }`}>
                      {player.role === 'imposter' ? 'Imposter' : 'Player'}
                    </p>
                  </div>
                  {player.word && (
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Word</p>
                      <p className="font-medium text-lg text-white">{player.word}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        {isHost ? (
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={handleRestart}
              className="bg-[#3b82f6] hover:bg-blue-700 text-white font-bold py-5 px-6 rounded-xl text-xl transition-all btn-glow-blue hover:scale-[1.02] active:scale-95"
            >
              Play Again
            </button>
            <button
              onClick={handleNewGame}
              className="bg-white/10 hover:bg-white/15 border-2 border-white/20 hover:border-white/30 text-white font-bold py-5 px-6 rounded-xl text-xl transition-all"
            >
              New Game
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-5 rounded-2xl text-center">
              <p className="text-gray-300"> Waiting for host to start a new game</p>
            </div>
            <button
              onClick={handleNewGame}
              className="w-full bg-gray-300/20 hover:bg-white/15 border-2 border-white/20 hover:border-white/30 text-white font-bold py-4 px-6 rounded-xl transition-all"
            >
               Leave & Start New Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
}