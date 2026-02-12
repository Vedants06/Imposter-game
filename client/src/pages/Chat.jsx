import { useState, useEffect } from 'react';
import { socket } from '../socket';

export default function Chat({ room, currentPlayerId }) {
  const [clue, setClue] = useState('');
  const [timeLeft, setTimeLeft] = useState(20);
  const [waitingForVoting, setWaitingForVoting] = useState(false);

  const currentPlayer = room.players[room.turnIndex];
  const isMyTurn = currentPlayer?.id === currentPlayerId;
  
  // Use clues from room state (persists across rounds)
  const allClues = room.clues || [];
  const currentRoundClues = allClues.filter(c => c.round === room.round);

  useEffect(() => {
    // Reset timer when turn changes
    setTimeLeft(20);
    setWaitingForVoting(false);
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [room.turnIndex]);

  useEffect(() => {
    const alivePlayers = room.players.filter(p => p.alive);
    const allAliveHaveSpoken = alivePlayers.every(p => 
      allClues.some(c => c.playerId === p.id && c.round === room.round)
    );
    
    if (allAliveHaveSpoken && room.phase === 'chat') {
      setWaitingForVoting(true);
    }
  }, [allClues, room.players, room.round, room.phase]);

  const handleSubmitClue = (e) => {
    e.preventDefault();
    if (!clue.trim() || !isMyTurn) return;

    socket.emit('submit_clue', { clue: clue.trim() });
    setClue('');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">Round {room.round}</h1>
          <p className="text-gray-400">Give clues about your word</p>
        </div>

        {/* Waiting for voting message */}
        {waitingForVoting && (
          <div className="bg-blue-900 border-2 border-blue-600 p-4 rounded-lg mb-6 text-center">
            <p className="text-lg font-semibold">All players have given clues!</p>
            <p className="text-sm text-gray-300 mt-1">Moving to voting in a few seconds...</p>
          </div>
        )}

        {/* Turn Indicator */}
        {!waitingForVoting && (
          <div className="bg-gray-800 p-6 rounded-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-400">Current Turn</p>
                <p className="text-2xl font-bold">
                  {currentPlayer?.name}
                  {isMyTurn && <span className="text-green-500"> (You)</span>}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400">Time Left</p>
                <p className={`text-4xl font-bold font-mono ${timeLeft <= 5 ? 'text-red-500' : ''}`}>
                  {timeLeft}s
                </p>
              </div>
            </div>

            {/* Timer Bar */}
            <div className="bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-1000 ${
                  timeLeft <= 5 ? 'bg-red-500' : 'bg-blue-500'
                }`}
                style={{ width: `${(timeLeft / 20) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Clue Input */}
        {isMyTurn && !waitingForVoting && (
          <div className="bg-green-900 border-2 border-green-600 p-6 rounded-lg mb-6">
            <p className="text-lg font-semibold mb-4">It's your turn! Give a clue:</p>
            <form onSubmit={handleSubmitClue} className="flex gap-2">
              <input
                type="text"
                value={clue}
                onChange={(e) => setClue(e.target.value)}
                className="flex-1 bg-gray-800 text-white px-4 py-3 rounded border border-gray-600 focus:outline-none focus:border-green-500"
                placeholder="Enter your clue..."
                maxLength={100}
                autoFocus
              />
              <button
                type="submit"
                disabled={!clue.trim()}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold px-6 rounded transition"
              >
                Submit
              </button>
            </form>
          </div>
        )}

        {/* Clues List - Show all clues with round indicators */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">All Clues</h2>
          {allClues.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No clues yet. Waiting for first player...
            </p>
          ) : (
            <div className="space-y-3">
              {allClues.map((clueData, index) => {
                const isCurrentRound = clueData.round === room.round;
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${
                      isCurrentRound ? 'bg-gray-700' : 'bg-gray-700 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{clueData.playerName}</span>
                        <span className="text-xs bg-blue-600 px-2 py-0.5 rounded">
                          Round {clueData.round}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        #{index + 1}
                      </span>
                    </div>
                    <p className="text-gray-200">{clueData.clue}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Current Round Summary */}
        {allClues.length > 0 && room.round > 1 && (
          <div className="mt-4 bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-400">
              Current round clues: {currentRoundClues.length} | 
              Total clues: {allClues.length}
            </p>
          </div>
        )}

        {/* Players Status */}
        <div className="mt-6 bg-gray-800 p-6 rounded-lg">
          <h3 className="font-bold mb-3">Players</h3>
          <div className="grid grid-cols-2 gap-2">
            {room.players.map((player) => (
              <div
                key={player.id}
                className={`px-3 py-2 rounded ${
                  player.alive
                    ? player.id === currentPlayer?.id && !waitingForVoting
                      ? 'bg-green-700'
                      : 'bg-gray-700'
                    : 'bg-red-900 opacity-50'
                }`}
              >
                <span className={!player.alive ? 'line-through' : ''}>
                  {player.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
