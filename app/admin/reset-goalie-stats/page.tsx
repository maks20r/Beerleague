'use client';

import { useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Goalie, Game } from '@/types';

export default function ResetGoalieStats() {
  const [loading, setLoading] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const resetGoalieStats = async () => {
    try {
      setLoading(true);
      setError('');
      setStatus('Fetching all goalies...');

      // Get all goalies
      const goaliesCol = collection(db, 'goalies');
      const goaliesSnapshot = await getDocs(goaliesCol);

      setStatus(`Found ${goaliesSnapshot.docs.length} goalies. Resetting stats...`);

      // Reset each goalie's stats
      let count = 0;
      for (const goalieDoc of goaliesSnapshot.docs) {
        const goalieRef = doc(db, 'goalies', goalieDoc.id);

        await updateDoc(goalieRef, {
          gamesPlayed: 0,
          totalShots: 0,
          goalsAllowed: 0,
          saves: 0,
          savePercentage: 0,
        });

        count++;
        setStatus(`Reset ${count}/${goaliesSnapshot.docs.length} goalies...`);
      }

      setStatus(`✅ Successfully reset stats for ${goaliesSnapshot.docs.length} goalies! Game results are preserved.`);

    } catch (err) {
      console.error('Error resetting goalie stats:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const recalculateFromGames = async () => {
    try {
      setRecalculating(true);
      setError('');
      setStatus('Fetching all games...');

      // Get all games
      const gamesCol = collection(db, 'games');
      const gamesSnapshot = await getDocs(gamesCol);

      const games: Game[] = gamesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date ? data.date.toDate() : new Date(),
        } as Game;
      });

      // Filter only completed games with goalie information
      const completedGames = games.filter(g =>
        g.status === 'completed' &&
        (g.homeGoalie || g.awayGoalie) &&
        g.homeScore !== undefined &&
        g.awayScore !== undefined
      );

      setStatus(`Found ${completedGames.length} completed games with goalie data. Recalculating stats...`);

      // Get all goalies
      const goaliesCol = collection(db, 'goalies');
      const goaliesSnapshot = await getDocs(goaliesCol);

      const goalies: Map<string, Goalie & { docId: string }> = new Map();
      goaliesSnapshot.docs.forEach(doc => {
        const goalie = { docId: doc.id, ...doc.data() } as Goalie & { docId: string };
        goalies.set(goalie.name, goalie);
      });

      // Track stats per goalie
      const goalieStats = new Map<string, {
        gamesPlayed: number;
        totalShots: number;
        goalsAllowed: number;
        saves: number;
      }>();

      // Process each completed game
      for (const game of completedGames) {
        // Home goalie stats
        if (game.homeGoalie) {
          const stats = goalieStats.get(game.homeGoalie) || {
            gamesPlayed: 0,
            totalShots: 0,
            goalsAllowed: 0,
            saves: 0,
          };

          const shotsAgainst = game.awayShots || 0;
          const goalsAgainst = game.awayScore || 0;
          const saves = shotsAgainst - goalsAgainst;

          goalieStats.set(game.homeGoalie, {
            gamesPlayed: stats.gamesPlayed + 1,
            totalShots: stats.totalShots + shotsAgainst,
            goalsAllowed: stats.goalsAllowed + goalsAgainst,
            saves: stats.saves + saves,
          });
        }

        // Away goalie stats
        if (game.awayGoalie) {
          const stats = goalieStats.get(game.awayGoalie) || {
            gamesPlayed: 0,
            totalShots: 0,
            goalsAllowed: 0,
            saves: 0,
          };

          const shotsAgainst = game.homeShots || 0;
          const goalsAgainst = game.homeScore || 0;
          const saves = shotsAgainst - goalsAgainst;

          goalieStats.set(game.awayGoalie, {
            gamesPlayed: stats.gamesPlayed + 1,
            totalShots: stats.totalShots + shotsAgainst,
            goalsAllowed: stats.goalsAllowed + goalsAgainst,
            saves: stats.saves + saves,
          });
        }
      }

      // Update each goalie with calculated stats
      let count = 0;
      for (const [goalieName, stats] of goalieStats.entries()) {
        const goalie = goalies.get(goalieName);
        if (goalie) {
          const savePercentage = stats.totalShots > 0
            ? (stats.saves / stats.totalShots) * 100
            : 0;

          const goalieRef = doc(db, 'goalies', goalie.docId);
          await updateDoc(goalieRef, {
            gamesPlayed: stats.gamesPlayed,
            totalShots: stats.totalShots,
            goalsAllowed: stats.goalsAllowed,
            saves: stats.saves,
            savePercentage: parseFloat(savePercentage.toFixed(2)),
          });

          count++;
          setStatus(`Updated ${count}/${goalieStats.size} goalies...`);
        }
      }

      setStatus(`✅ Successfully recalculated stats for ${count} goalies from ${completedGames.length} games!`);

    } catch (err) {
      console.error('Error recalculating stats:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setRecalculating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Reset Goalie Stats</h1>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-yellow-900 font-semibold mb-2">⚠️ Important Information</p>
        <ul className="list-disc list-inside text-yellow-900 space-y-1">
          <li>This will reset all goalie statistics to zero</li>
          <li>All game results will be preserved and untouched</li>
          <li>You can recalculate stats from existing games after resetting</li>
        </ul>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-900">Error: {error}</p>
        </div>
      )}

      {status && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-900">{status}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Reset Stats Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-3">Reset All Stats</h2>
          <p className="text-gray-600 mb-4">
            Reset all goalie statistics to zero. This will clear:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-1">
            <li>Games Played</li>
            <li>Total Shots</li>
            <li>Goals Allowed</li>
            <li>Saves</li>
            <li>Save Percentage</li>
          </ul>
          <button
            onClick={resetGoalieStats}
            disabled={loading || recalculating}
            className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? 'Resetting...' : 'Reset All Goalie Stats'}
          </button>
        </div>

        {/* Recalculate Stats Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-3">Recalculate from Games</h2>
          <p className="text-gray-600 mb-4">
            Recalculate all goalie statistics from completed games in the database.
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-1">
            <li>Analyzes all completed games</li>
            <li>Calculates accurate stats</li>
            <li>Updates goalie records</li>
          </ul>
          <button
            onClick={recalculateFromGames}
            disabled={loading || recalculating}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
          >
            {recalculating ? 'Recalculating...' : 'Recalculate Stats'}
          </button>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={() => router.push('/admin')}
          className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
        >
          Back to Admin
        </button>
      </div>
    </div>
  );
}
