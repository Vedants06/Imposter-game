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
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <div className="bg-gray-800 p-12 rounded-lg">
            <h1 className="text-4xl font-bold mb-4">
              {!currentPlayer?.alive ? 'You are eliminated' : 'You cannot vote'}
            </h1>

            <p className="text-gray-400 mb-6">
              {!currentPlayer?.alive
                ? 'Watch as the remaining players vote...'
                : 'You were tied in the previous vote and cannot participate in this revote.'}
            </p>

            <div className="bg-gray-700 p-4 rounded">
              <p className="text-sm text-gray-300">
                Votes: {votesSubmitted}/{eligibleVoters.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto p-4">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Main Voting Area - 2 columns */}
          <div className="md:col-span-2 space-y-4">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2">
                {isRevote ? 'REVOTE!' : 'Voting Time'}
              </h1>
              <p className="text-gray-400">
                {isRevote
                  ? 'The vote was tied - vote again between these players'
                  : 'Vote for who you think is the imposter'}
              </p>
            </div>

            {/* Revote Info Banner */}
            {isRevote && revoteData && (
              <div className="bg-yellow-900 border-2 border-yellow-600 p-4 rounded-lg">
                <h3 className="font-bold mb-2">Previous Vote Results:</h3>
                <div className="text-sm space-y-1">
                  {Object.entries(revoteData.voteCounts).map(([playerId, votes]) => {
                    const player = room.players.find(p => p.id === playerId);
                    return (
                      <div key={playerId} className="flex justify-between">
                        <span>{player?.name}</span>
                        <span className="font-mono">{votes} {votes === 1 ? 'vote' : 'votes'}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-3 text-yellow-200 font-semibold">
                  Tied players must face a revote!
                </p>
              </div>
            )}

            {!hasVoted ? (
              <div>
                <div className="bg-gray-800 p-6 rounded-lg mb-4">
                  <h2 className="text-xl font-bold mb-4">
                    {isRevote ? 'Vote between the tied players:' : 'Select a player to vote out:'}
                  </h2>
                  <div className="grid md:grid-cols-2 gap-3">
                    {votablePlayers.map((player) => (
                      <button
                        key={player.id}
                        onClick={() => setSelectedPlayer(player.id)}
                        className={`p-4 rounded-lg border-2 transition ${selectedPlayer === player.id
                            ? 'bg-red-900 border-red-500'
                            : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                          } ${isRevote ? 'ring-2 ring-yellow-500' : ''}`}
                      >
                        <p className="text-lg font-semibold">{player.name}</p>
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
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg text-xl transition"
                >
                  {selectedPlayer ? 'Confirm Vote' : 'Select a player'}
                </button>
              </div>
            ) : (
              <div className="bg-gray-800 p-12 rounded-lg text-center">
                <div className="mb-6">
                  <svg
                    className="w-24 h-24 mx-auto text-green-500 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h2 className="text-2xl font-bold mb-2">Vote Submitted</h2>
                  <p className="text-gray-400">
                    Waiting for other players to vote...
                  </p>
                </div>

                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Votes Received</span>
                    <span className="font-mono font-bold">
                      {votesSubmitted}/{eligibleVoters.length}
                    </span>
                  </div>
                  <div className="bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(votesSubmitted / eligibleVoters.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Player List */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="font-bold mb-3">Alive Players ({alivePlayers.length})</h3>
              <div className="grid grid-cols-2 gap-2">
                {alivePlayers.map((player) => (
                  <div
                    key={player.id}
                    className={`px-3 py-2 rounded ${player.id === currentPlayerId
                        ? 'bg-blue-700'
                        : isRevote && room.tiedPlayers.includes(player.id)
                          ? 'bg-yellow-700'
                          : 'bg-gray-700'
                      }`}
                  >
                    {player.name}
                    {isRevote && room.tiedPlayers.includes(player.id) && (
                      <span className="ml-2 text-xs">⚠️</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Clues Sidebar - 1 column */}
          <div className="md:col-span-1">
            <div className="bg-gray-800 rounded-lg overflow-hidden sticky top-4">
              <div 
                className="p-4 bg-gray-700 cursor-pointer flex justify-between items-center"
                onClick={() => setShowClues(!showClues)}
              >
                <h3 className="font-bold">All Clues ({allClues.length})</h3>
                <span className="text-sm">{showClues ? '▼' : '▶'}</span>
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
                          className="p-2 rounded bg-gray-700 text-sm"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-xs">{clueData.playerName}</span>
                            <span className="text-xs bg-blue-600 px-1.5 py-0.5 rounded">
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