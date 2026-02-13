import { useState, useEffect, useRef } from 'react';
import { socket } from '../socket';

export default function Chat({ room, currentPlayerId }) {
  const [clue, setClue] = useState('');
  const [timeLeft, setTimeLeft] = useState(40);
  const [waitingForVoting, setWaitingForVoting] = useState(false);
  const cluesEndRef = useRef(null);

  const currentPlayer = room.players[room.turnIndex];
  const isMyTurn = currentPlayer?.id === currentPlayerId;
  
  const allClues = room.clues || [];
  const currentRoundClues = allClues.filter(c => c.round === room.round);

  // Auto-scroll to latest clue
  useEffect(() => {
    cluesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allClues]);

  useEffect(() => {
    setTimeLeft(40);
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
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-3">
            <h1 className="text-2xl font-bold">Round {room.round}</h1>
            <p className="text-sm text-gray-400">Give clues about your word</p>
          </div>

          {/* Waiting for voting message */}
          {waitingForVoting && (
            <div className="bg-blue-900 border-2 border-blue-600 p-3 rounded-lg text-center">
              <p className="font-semibold">All players have given clues!</p>
              <p className="text-xs text-gray-300 mt-1">Moving to voting in a few seconds...</p>
            </div>
          )}

          {/* Turn Indicator */}
          {!waitingForVoting && (
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs text-gray-400">Current Turn</p>
                  <p className="text-lg font-bold">
                    {currentPlayer?.name}
                    {isMyTurn && <span className="text-green-500"> (You)</span>}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">Time</p>
                  <p className={`text-2xl font-bold font-mono ${timeLeft <= 5 ? 'text-red-500' : ''}`}>
                    {timeLeft}s
                  </p>
                </div>
              </div>

              {/* Timer Bar */}
              <div className="bg-gray-600 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-1000 ${
                    timeLeft <= 5 ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${(timeLeft / 40) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Clues List - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-2">
          {allClues.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-center">
                No clues yet. Waiting for first player...
              </p>
            </div>
          ) : (
            <>
              {allClues.map((clueData, index) => {
                const isCurrentRound = clueData.round === room.round;
                const isMyClue = clueData.playerId === currentPlayerId;
                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      isMyClue
                        ? 'bg-blue-900 ml-8'
                        : isCurrentRound 
                        ? 'bg-gray-700 mr-8' 
                        : 'bg-gray-700 opacity-60 mr-8'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{clueData.playerName}</span>
                        <span className="text-xs bg-blue-600 px-2 py-0.5 rounded">
                          R{clueData.round}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        #{index + 1}
                      </span>
                    </div>
                    <p className="text-gray-100">{clueData.clue}</p>
                  </div>
                );
              })}
              <div ref={cluesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Clue Input - Fixed at bottom */}
      {isMyTurn && !waitingForVoting && (
        <div className="p-4 bg-gray-800 border-t border-gray-700">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmitClue} className="flex gap-2">
              <input
                type="text"
                value={clue}
                onChange={(e) => setClue(e.target.value)}
                className="flex-1 bg-gray-700 text-white px-4 py-3 rounded border border-gray-600 focus:outline-none focus:border-green-500"
                placeholder="Type your clue..."
                maxLength={100}
                autoFocus
              />
              <button
                type="submit"
                disabled={!clue.trim()}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold px-6 rounded transition"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Info bar when not your turn */}
      {!isMyTurn && !waitingForVoting && (
        <div className="p-3 bg-gray-800 border-t border-gray-700">
          <div className="max-w-4xl mx-auto text-center text-sm text-gray-400">
            Waiting for {currentPlayer?.name} to give their clue...
          </div>
        </div>
      )}
    </div>
  );
}