import { useState, useEffect } from 'react';
import { socket } from '../socket';

export default function Voting({ room, currentPlayerId }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [votesSubmitted, setVotesSubmitted] = useState(0);
  const [revoteData, setRevoteData] = useState(null);
  const [showClues, setShowClues] = useState(true);

  const alivePlayers = room.players.filter(p => p.alive);
  const currentPlayer = room.players.find(p => p.id === currentPlayerId);
  const isRevote = room.phase === 'revote';
  const isTiedPlayer = isRevote && room.tiedPlayers.includes(currentPlayerId);

  const eligibleVoters = isRevote
    ? alivePlayers.filter(p => !room.tiedPlayers.includes(p.id))
    : alivePlayers;

  const votablePlayers = isRevote
    ? room.players.filter(p => room.tiedPlayers.includes(p.id))
    : alivePlayers.filter(p => p.id !== currentPlayerId);

  const allClues = room.clues || [];

  useEffect(() => {
    const handleVoteCast = (data) => {
      setVotesSubmitted(data.votesSubmitted);
      if (data.voterId === currentPlayerId) {
        setHasVoted(true);
      }
    };

    const handleRevoteStarted = (data) => {
      setRevoteData(data);
      setHasVoted(false);
      setSelectedPlayer(null);
      setVotesSubmitted(0);
    };

    socket.on('vote_cast', handleVoteCast);
    socket.on('revote_started', handleRevoteStarted);

    return () => {
      socket.off('vote_cast', handleVoteCast);
      socket.off('revote_started', handleRevoteStarted);
    };
  }, [currentPlayerId]);

  const handleVote = () => {
    if (!selectedPlayer || hasVoted || !currentPlayer?.alive || isTiedPlayer) return;
    socket.emit('cast_vote', { targetId: selectedPlayer });
  };

  if (!currentPlayer?.alive || isTiedPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden stars-bg text-white">
        <div className="bottom-ray" />
        <div className="absolute w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] -top-20 -left-20 pointer-events-none" />
        <div className="absolute w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -bottom-20 -right-20 pointer-events-none" />

        <div className="max-w-2xl w-full z-10 text-center">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-12 rounded-3xl">
            <h1 className="text-4xl font-black mb-6">
              {!currentPlayer?.alive ? 'You are eliminated' : 'You cannot vote'}
            </h1>
            <p className="text-gray-300 mb-8">
              {!currentPlayer?.alive
                ? 'Watch as the remaining players vote...'
                : 'You were tied in the previous vote and cannot participate in this revote.'}
            </p>
            <div className="bg-white/10 border border-white/20 p-4 rounded-xl">
              <p className="text-sm text-gray-300">
                Votes: <span className="font-bold text-white">{votesSubmitted}/{eligibleVoters.length}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden stars-bg text-white">
      <div className="absolute w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px] -top-20 -left-20 pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] -bottom-20 -right-20 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto p-4 pt-8">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Main Voting Area */}
          <div className="md:col-span-2 space-y-4x gap-3">
            <div className="text-center md:text-end pb-9">
              <h1 className="text-5xl font-black tracking-wider pt-3 mb-2">
                {isRevote ? 'REVOTE!' : 'VOTING TIME'}
              </h1>
              <p className="text-gray-300 mr-9">
                {isRevote
                  ? 'The vote was tied - vote again between these players'
                  : 'Vote for who you think is the imposter'}
              </p>
            </div>

            {/* Revote Info */}
            {isRevote && revoteData && (
              <div className="backdrop-blur-xl bg-yellow-500/10 border-2 border-yellow-500/50 p-4 rounded-2xl">
                <h3 className="font-bold mb-3 text-yellow-200">Previous Vote Results:</h3>
                <div className="text-sm space-y-2">
                  {Object.entries(revoteData.voteCounts).map(([playerId, votes]) => {
                    const player = room.players.find(p => p.id === playerId);
                    return (
                      <div key={playerId} className="flex justify-between bg-white/10 px-3 py-2 rounded-lg">
                        <span className="text-white">{player?.name}</span>
                        <span className="font-mono font-bold text-yellow-300">{votes} {votes === 1 ? 'vote' : 'votes'}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-3 text-yellow-200 font-semibold text-center">
                  Tied players must face a revote!
                </p>
              </div>
            )}

            {!hasVoted ? (
              <div className='pb-5'>
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-3xl mb-4">
                  <h2 className="text-lg font-normal mb-4 text-gray-200">
                    {isRevote ? 'Vote between the tied players:' : 'Select a player to vote out:'}
                  </h2>
                  <div className="grid md:grid-cols-2 gap-3">
                    {votablePlayers.map((player) => (
                      <button
                        key={player.id}
                        onClick={() => setSelectedPlayer(player.id)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          selectedPlayer === player.id
                            ? 'bg-red-500/30 border-red-500 scale-105'
                            : 'bg-white/10 border-white/20 hover:border-white/40 hover:bg-white/15'
                        } ${isRevote ? 'ring-2 ring-yellow-500/50' : ''}`}
                      >
                        <p className="text-lg font-bold text-white">{player.name}</p>
                        {isRevote && (
                          <p className="text-xs text-yellow-300 mt-1">Tied in previous vote</p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleVote}
                  disabled={!selectedPlayer}
                  className={`w-full font-bold py-4 px-6 rounded-xl text-xl transition-all ${
                    selectedPlayer
                      ? 'bg-red-600 hover:bg-red-700 hover:scale-[1.01]'
                      : 'bg-gray-600 opacity-50 cursor-not-allowed'
                  }`}
                >
                  {selectedPlayer ? 'Confirm Vote' : 'Select a player'}
                </button>
              </div>
            ) : (
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-12 mb-5 rounded-3xl text-center">
                <div className="mb-6">
                  <div className="w-24 h-24 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500/50">
                    <svg
                      className="w-12 h-12 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-white">Vote Submitted</h2>
                  <p className="text-gray-300">
                    Waiting for other players to vote...
                  </p>
                </div>

                <div className="bg-white/10 border border-white/20 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">Votes Received</span>
                    <span className="text-xs pr-1 text-white">
                      {votesSubmitted}/{eligibleVoters.length}
                    </span>
                  </div>
                  <div className="bg-white/10 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${(votesSubmitted / eligibleVoters.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Player List */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-3xl">
              <h3 className="font-semibold mb-3 pl-2 text-gray-200">Alive Players: {alivePlayers.length}</h3>
              <div className="grid grid-cols-2 gap-2">
                {alivePlayers.map((player) => (
                  <div
                    key={player.id}
                    className={`px-3 py-2 rounded-xl font-medium ${
                      player.id === currentPlayerId
                        ? 'bg-blue-500/30 border border-blue-500/50 text-white'
                        : isRevote && room.tiedPlayers.includes(player.id)
                        ? 'bg-yellow-500/30 border border-yellow-500/50 text-white'
                        : 'bg-white/10 border border-white/20 text-gray-200'
                    }`}
                  >
                    {player.name}
                    {isRevote && room.tiedPlayers.includes(player.id) && (
                      <span className="ml-2">⚠️</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Clues Sidebar */}
          <div className="md:col-span-1 md:pt-32">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden sticky top-4">
              <div 
                className="p-4 bg-white/10 cursor-pointer flex justify-between items-center hover:bg-white/15 transition-all"
                onClick={() => setShowClues(!showClues)}
              >
                <h3 className="font-semibold text-white">Clues history</h3>
                <span className="text-sm text-gray-300">{showClues ? '▼' : '▶'}</span>
              </div>
              
              {showClues && (
                <div className="p-4 max-h-[70vh] overflow-y-auto">
                  {allClues.length === 0 ? (
                    <p className="text-gray-400 text-center text-sm py-4">
                      No clues yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {allClues.map((clueData, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-xl bg-white/10 border border-white/20 text-sm"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-xs text-white">{clueData.playerName}</span>
                            <span className="text-xs bg-purple-500/30 border border-purple-500/50 px-2 py-0.5 rounded-full">
                              R{clueData.round}
                            </span>
                          </div>
                          <p className="text-gray-200 text-xs">{clueData.clue}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}