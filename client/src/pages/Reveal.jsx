import { useState } from 'react';
import { socket } from '../socket';

export default function Reveal({ roleData, room }) {
  const [revealed, setRevealed] = useState(false);

  const handleReveal = () => {
    setRevealed(true);
    socket.emit('reveal_word');
  };

  const playersRevealed = room.players.filter(p => p.hasRevealed).length;
  const totalPlayers = room.players.length;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-4xl font-bold mb-8">Your Assignment</h1>

        {!revealed ? (
          <div>
            <div className="bg-gray-800 p-12 rounded-lg mb-6">
              <div className="w-32 h-32 mx-auto mb-6 bg-gray-700 rounded-full flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <p className="text-gray-400 mb-6">
                Click below to reveal your role and word
              </p>
              <button
                onClick={handleReveal}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition"
              >
                Reveal
              </button>
            </div>
            <p className="text-gray-400 text-sm">
              Make sure no one else can see your screen
            </p>
          </div>
        ) : (
          <div>
            <div className={`p-8 rounded-lg mb-6 ${
              roleData.role === 'imposter' ? 'bg-red-900 border-2 border-red-600' : 'bg-green-900 border-2 border-green-600'
            }`}>
              <p className="text-2xl font-bold mb-4">
                You are a {roleData.role === 'imposter' ? 'IMPOSTER' : 'PLAYER'}
              </p>
              
              {roleData.word ? (
                <div>
                  <p className="text-gray-300 mb-2">Your word is:</p>
                  <p className="text-5xl font-bold">{roleData.word}</p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-300 mb-2">Category:</p>
                  <p className="text-3xl font-bold mb-4">{roleData.category}</p>
                  <p className="text-gray-300 mb-2">Hint:</p>
                  <p className="text-xl">{roleData.hint}</p>
                </div>
              )}
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <p className="text-gray-400 mb-2">
                {playersRevealed === totalPlayers 
                  ? '✓ Everyone has revealed! Game starting in 5 seconds...'
                  : 'Waiting for other players to reveal...'}
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(playersRevealed / totalPlayers) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-mono">
                  {playersRevealed}/{totalPlayers}
                </span>
              </div>
            </div>

            {roleData.role === 'imposter' ? (
              <div className="mt-6 bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-300">
                  <strong>Your mission:</strong> Blend in with the players. Give clues that seem related but don't reveal you don't know the actual word.
                </p>
              </div>
            ) : (
              <div className="mt-6 bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-300">
                  <strong>Your mission:</strong> Give clues about your word to help identify imposters, but don't make it too obvious!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
