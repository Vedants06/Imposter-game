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
    <div className="h-screen relative overflow-hidden stars-bg text-white flex flex-col">
      {/* Subtle cosmic background for chat */}
      <div className="absolute w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px] -top-20 -left-20 pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] -bottom-20 -right-20 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 p-4 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-3">
            <h1 className="text-3xl font-black tracking-wider">Round {room.round}</h1>
            <p className="text-sm text-gray-300">Give clues about your word</p>
          </div>

          {waitingForVoting && (
            <div className="bg-blue-500/20 border-2 border-blue-500/50 p-3 rounded-xl text-center backdrop-blur-sm">
              <p className="font-semibold text-blue-200">All players have given clues!</p>
              <p className="text-xs text-blue-300 mt-1">Moving to voting in a few seconds</p>
            </div>
          )}

          {!waitingForVoting && (
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-300 mb-1">Current Turn</p>
                  <p className="text-xl font-bold">
                    {currentPlayer?.name}
                    {isMyTurn && <span className="text-green-400"> (You)</span>}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-300 mb-1">Time Left</p>
                  <p className={`text-3xl font-black font-mono ${timeLeft <= 5 ? 'text-red-400' : 'text-blue-400'}`}>
                    {timeLeft}s
                  </p>
                </div>
              </div>

              <div className="bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-1000 ${
                    timeLeft <= 5 ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'
                  }`}
                  style={{ width: `${(timeLeft / 40) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Clues List - Better contrast */}
      <div className="flex-1 overflow-y-auto p-4 relative z-10">
        <div className="max-w-4xl mx-auto space-y-3">
          {allClues.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 px-6 py-4 rounded-2xl">
                <p className="text-gray-300 text-center">
                  No clues yet. Waiting for first player to start
                </p>
              </div>
            </div>
          ) : (
            <>
              {allClues.map((clueData, index) => {
                const isCurrentRound = clueData.round === room.round;
                const isMyClue = clueData.playerId === currentPlayerId;
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-2xl backdrop-blur-xl border transition-all ${
                      isMyClue
                        ? 'bg-blue-500/20 border-blue-500/50 ml-12'
                        : isCurrentRound 
                        ? 'bg-white/10 border-white/20 mr-12' 
                        : 'bg-white/5 border-white/10 opacity-60 mr-12'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{clueData.playerName}</span>
                        <span className="text-xs bg-purple-500/30 border border-purple-500/50 px-2 py-0.5 rounded-full">
                          Round {clueData.round}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 bg-white/10 px-2 py-0.5 rounded-full">
                        #{index + 1}
                      </span>
                    </div>
                    <p className="text-gray-100 text-base">{clueData.clue}</p>
                  </div>
                );
              })}
              <div ref={cluesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Input at bottom */}
      {isMyTurn && !waitingForVoting && (
        <div className="relative z-10 p-4 backdrop-blur-xl bg-white/5 border-t border-white/10">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmitClue} className="flex gap-3">
              <input
                type="text"
                value={clue}
                onChange={(e) => setClue(e.target.value)}
                className="flex-1 bg-white/10 border border-white/20 text-white px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 placeholder:text-gray-400"
                placeholder="Type your clue..."
                maxLength={100}
                autoFocus
              />
              <button
                type="submit"
                disabled={!clue.trim()}
                className="bg-[#22c55e] hover:bg-green-700 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-8 rounded-xl transition-all btn-glow-green hover:scale-[1.02]"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {!isMyTurn && !waitingForVoting && (
        <div className="relative z-10 p-3 backdrop-blur-xl bg-white/5 border-t border-white/10">
          <div className="max-w-4xl mx-auto text-center text-sm text-gray-300">
            Waiting for <span className="font-semibold text-white">{currentPlayer?.name}</span> to give their clue
          </div>
        </div>
      )}
    </div>
  );
}