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
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
        <h2 className="text-3xl font-bold mb-4">Player Eliminated</h2>
        
        {/* Revote/Tiebreaker Badge */}
        {eliminationData.wasRevote && (
          <div className="mb-4">
            {eliminationData.wasTiebreaker ? (
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Still Tied - Random Elimination
              </span>
            ) : (
              <span className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Decided by Revote
              </span>
            )}
          </div>
        )}
        
        <div className={`p-6 rounded-lg mb-6 ${
          eliminationData.role === 'imposter' ? 'bg-red-900' : 'bg-blue-900'
        }`}>
          <p className="text-2xl font-bold mb-2">{eliminationData.playerName}</p>
          <p className="text-xl">
            was a <span className="font-bold uppercase">{eliminationData.role}</span>
          </p>
        </div>

        {eliminationData.voteCounts && (
          <div className="bg-gray-700 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-3">
              {eliminationData.wasRevote ? 'Revote Results:' : 'Vote Results:'}
            </h3>
            <div className="space-y-2 text-sm">
              {Object.entries(eliminationData.voteCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([playerId, votes]) => (
                  <div key={playerId} className="flex justify-between">
                    <span className="font-mono">{votes} {votes === 1 ? 'vote' : 'votes'}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        <p className="text-gray-400 text-sm">
          {eliminationData.role === 'imposter' 
            ? 'Good job! You eliminated an imposter!' 
            : eliminationData.wasTiebreaker
            ? 'Random elimination due to persistent tie...'
            : 'Oops! That was a regular player...'}
        </p>
      </div>
    </div>
  );
}