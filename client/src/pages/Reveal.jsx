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
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden stars-bg text-white">
      {/* Cosmic Background */}
      <div className="bottom-ray" />
      <div className="absolute w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] -top-20 -left-20 pointer-events-none" />
      <div className="absolute w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -bottom-20 -right-20 pointer-events-none" />

      <div className="max-w-2xl w-full z-10 text-center animate-slide-up">
        <h1 className="text-5xl font-black tracking-wider mb-12 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
          WORD ASSIGNED
        </h1>

        {!revealed ? (
          <div>
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-12 rounded-3xl mb-6">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center border-2 border-white/20 animate-pulse-glow">
                <svg
                  className="w-16 h-16 text-white"
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
              <p className="text-gray-300 mb-8 text-lg">
                Click below to reveal your role and word
              </p>
              <button
                onClick={handleReveal}
                className="bg-[#3b82f6] hover:bg-blue-700 text-white font-bold py-4 px-12 rounded-xl text-xl transition-all btn-glow-blue hover:scale-[1.05] active:scale-95"
              >
                Reveal
              </button>
            </div>
            <p className="text-gray-400 text-sm backdrop-blur-sm bg-white/5 px-4 py-2 rounded-full inline-block">
               Make sure no one else can see your screen 🤭
            </p>
          </div>
        ) : (
          <div>
            <div className={`backdrop-blur-xl p-8 rounded-3xl mb-6 border-2 ${
              roleData.role === 'imposter' 
                ? 'bg-red-500/10 border-red-500/50' 
                : 'bg-green-500/10 border-green-500/50'
            }`}>
              <p className="text-3xl font-bold mb-6 tracking-wide">
                You are {roleData.role === 'imposter' ? 'an' : 'a'}{' '}
                <span className={roleData.role === 'imposter' ? 'text-red-400' : 'text-green-400 uppercase font-bold'}>
                  {roleData.role}
                </span>
              </p>
              
              {roleData.word ? (
                <div>
                  <p className="text-gray-300 mb-3 text-sm">Your word is:</p>
                  <div className="bg-white/10 border border-white/20 rounded-2xl p-6">
                    <p className="text-5xl font-black tracking-wide">{roleData.word}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white/10 border border-white/20 rounded-2xl p-4">
                    <p className="text-gray-300 mb-2 text-sm">Category:</p>
                    <p className="text-3xl font-bold text-purple-300">{roleData.category}</p>
                  </div>
                  <div className="bg-white/10 border border-white/20 rounded-2xl p-4">
                    <p className="text-gray-300 mb-2 text-sm">Hint:</p>
                    <p className="text-xl text-blue-300">{roleData.hint}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Progress */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-3xl mb-6">
              <p className="text-gray-300 mb-3">
                {playersRevealed === totalPlayers 
                  ? 'Everyone has revealed! Game starting in 5 seconds...'
                  : 'Waiting for other players to reveal'}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-white/10 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${(playersRevealed / totalPlayers) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-sans bg-white/10 px-2 py-1 rounded-full">
                  {playersRevealed}/{totalPlayers}
                </span>
              </div>
            </div>

            {/* Mission */}
            {roleData.role === 'imposter' ? (
              <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/30 p-6 rounded-3xl">
                <p className="text-sm text-gray-200">
                  <strong className="text-red-300 tracking-wide">Your mission:</strong> Blend in with the players. Give clues that seem related but don't reveal you don't know the actual word.
                </p>
              </div>
            ) : (
              <div className="backdrop-blur-xl bg-green-500/10 border border-green-500/30 p-6 rounded-3xl">
                <p className="text-sm text-gray-200">
                  <strong className="text-green-300 tracking-wide">Your role:</strong> Give clues about your word to help identify imposters, but don't make it too obvious!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}