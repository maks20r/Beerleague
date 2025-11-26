'use client';

import { useState } from 'react';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

const angryBeaversPlayers = [
  { name: 'Adam Steinwold', jerseyNumber: 3, position: 'C' as const },
  { name: 'Simon McGuiness', jerseyNumber: 6, position: 'C' as const },
  { name: 'Nils Remess', jerseyNumber: 10, position: 'C' as const },
  { name: 'Hayez Mohairbi', jerseyNumber: 11, position: 'C' as const },
  { name: 'Jason Taleb', jerseyNumber: 13, position: 'C' as const },
  { name: 'Yuya Kimura', jerseyNumber: 14, position: 'C' as const },
  { name: 'Jeff Fucik', jerseyNumber: 18, position: 'C' as const },
  { name: 'Jeff Smylski', jerseyNumber: 21, position: 'C' as const },
  { name: 'Yu Nakasone', jerseyNumber: 23, position: 'C' as const },
  { name: 'Andrej Aleksukhin', jerseyNumber: 29, position: 'C' as const },
  { name: 'Paul Prall', jerseyNumber: 44, position: 'C' as const },
  { name: 'Dirk DeJaeger', jerseyNumber: 73, position: 'C' as const },
  { name: 'Pascal Reuse', jerseyNumber: 87, position: 'C' as const },
  { name: 'Patrice Kerner', jerseyNumber: 92, position: 'C' as const },
];

export default function PopulateAngryBeavers() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const populateRoster = async () => {
    try {
      setLoading(true);
      setError('');
      setStatus('Finding Angry Beavers team...');

      // Find Angry Beavers team
      const teamsCol = collection(db, 'teams');
      const q = query(teamsCol, where('name', '==', 'Angry Beavers'));
      const teamsSnapshot = await getDocs(q);

      if (teamsSnapshot.empty) {
        setError('Angry Beavers team not found! Please create the team first.');
        setLoading(false);
        return;
      }

      const angryBeaversTeam = teamsSnapshot.docs[0];
      const teamId = angryBeaversTeam.id;

      // First, delete existing Angry Beavers players
      setStatus(`Found Angry Beavers team (ID: ${teamId}). Removing existing players...`);
      const playersCol = collection(db, 'players');
      const existingPlayersQuery = query(playersCol, where('teamId', '==', teamId));
      const existingPlayersSnapshot = await getDocs(existingPlayersQuery);

      for (const playerDoc of existingPlayersSnapshot.docs) {
        await deleteDoc(doc(db, 'players', playerDoc.id));
      }

      setStatus(`Removed ${existingPlayersSnapshot.size} existing players. Adding ${angryBeaversPlayers.length} new players...`);

      for (let i = 0; i < angryBeaversPlayers.length; i++) {
        const player = angryBeaversPlayers[i];

        const playerData = {
          name: player.name,
          teamId: teamId,
          jerseyNumber: player.jerseyNumber,
          position: player.position,
          goals: 0,
          assists: 0,
          points: 0,
          penaltyMinutes: 0
        };

        await addDoc(playersCol, playerData);
        setStatus(`Added ${i + 1}/${angryBeaversPlayers.length}: ${player.name} (#${player.jerseyNumber})`);
      }

      setStatus(`✓ Successfully added all ${angryBeaversPlayers.length} players to Angry Beavers roster!`);

      // Redirect to rosters page after 2 seconds
      setTimeout(() => {
        router.push('/admin/rosters');
      }, 2000);

    } catch (error) {
      console.error('Error populating roster:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-gray-900">Populate Angry Beavers Roster</h2>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Players to be Added:</h3>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-3">Angry Beavers ({angryBeaversPlayers.length} players)</h4>
          <div className="grid md:grid-cols-2 gap-2">
            {angryBeaversPlayers.map((player, index) => {
              return (
                <div key={index} className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                  <span className="text-blue-800">
                    #{player.jerseyNumber} {player.name} ({player.position})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-700 mb-6">
          This will add all {angryBeaversPlayers.length} players to the Angry Beavers roster with default stats (0 goals, assists, etc.).
        </p>

        <button
          onClick={populateRoster}
          disabled={loading}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? 'Populating...' : 'Populate Angry Beavers Roster'}
        </button>

        {status && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700 font-mono text-sm">{status}</p>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
