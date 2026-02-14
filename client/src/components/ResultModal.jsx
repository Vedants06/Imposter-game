import { useEffect, useState } from 'react';

export default function ResultModal({ eliminationData }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    setShow(true);
    const timer = setTimeout(() => {
      setShow(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [eliminationData]);

  if (!show || !eliminationData) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-3xl p-8 max-w-md w-full text-center animate-in zoom-in">
        <h2 className="text-4xl font-black text-white mb-6 tracking-wider">
          PLAYER ELIMINATED
        </h2>
        
        {/* Revote/Tiebreaker Badge */}
        {eliminationData.wasRevote && (
          <div className="mb-6">
            {eliminationData.wasTiebreaker ? (
              <span className="bg-red-500/30 border-2 border-red-500/50 text-red-200 px-4 py-2 rounded-full text-sm font-bold">
                 Still Tied - Random Elimination
              </span>
            ) : (
              <span className="bg-yellow-500/30 border-2 border-yellow-500/50 text-yellow-200 px-4 py-2 rounded-full text-sm font-bold">
                Decided by Revote
              </span>
            )}
          </div>
        )}
        
        <div className={`backdrop-blur-sm p-8 rounded-2xl mb-6 border-2 ${
          eliminationData.role === 'imposter' 
            ? 'bg-red-300 border-red-700' 
            : 'bg-blue-400 border-blue-700'
        }`}>
          <p className="text-3xl font-semibold mb-3 text-black">{eliminationData.playerName}</p>
          <p className="text-xl">
            was {eliminationData.role === 'imposter' ? 'an' : 'a'}{' '}
            <span className={`font-black uppercase ${
              eliminationData.role === 'imposter' ? 'text-red-800' : 'text-blue-800'
            }`}>
              {eliminationData.role === 'imposter' ? ' IMPOSTER' : ' PLAYER'}
            </span>
          </p>
        </div>

        {eliminationData.voteCounts && (
          <div className="bg-white/10 border border-white/20 p-5 rounded-2xl mb-6">
            <h3 className="font-bold mb-4 text-gray-200">
              {eliminationData.wasRevote ? 'Revote Results:' : 'Vote Results:'}
            </h3>
            <div className="space-y-2 text-sm">
              {Object.entries(eliminationData.voteCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([playerId, votes], index) => (
                  <div 
                    key={playerId} 
                    className="flex justify-between bg-white/5 px-4 py-2 rounded-lg"
                  >
                    <span className="text-gray-300">#{index + 1}</span>
                    <span className="font-mono font-bold text-white">
                      {votes} {votes === 1 ? 'vote' : 'votes'}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        <p className="text-gray-200 text-sm">
          {eliminationData.role === 'imposter' 
            ? 'Good job! You eliminated an imposter!' 
            : eliminationData.wasTiebreaker
            ? 'Random elimination due to persistent tie...'
            : 'Oops! That was a regular player...'}
        </p>

        <div className="mt-6 text-xs text-gray-400">
          Closing in 5 seconds
        </div>
      </div>
    </div>
  );
}