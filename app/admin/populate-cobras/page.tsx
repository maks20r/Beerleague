'use client';

import { useState } from 'react';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

const cobrasPlayers = [
  { name: 'Kam', jerseyNumber: 55, position: 'RW' as const },
  { name: 'JB', jerseyNumber: 77, position: 'C' as const }, // Using C as primary from LD/C/LW
  { name: 'Eden', jerseyNumber: 69, position: 'C' as const }, // Using C for "Any"
  { name: 'Kevin', jerseyNumber: 21, position: 'LW' as const }, // W mapped to LW
  { name: 'Sergio', jerseyNumber: 18, position: 'LW' as const }, // W or D, using W->LW
  { name: 'Alfred', jerseyNumber: 6, position: 'LW' as const },
  { name: 'Soso', jerseyNumber: 3, position: 'LW' as const },
  { name: 'Nora', jerseyNumber: 2, position: 'C' as const }, // Using C as primary from C/RW
  { name: 'Nico', jerseyNumber: 34, position: 'LW' as const }, // W mapped to LW
  { name: 'Josh', jerseyNumber: 29, position: 'C' as const }, // Using C as primary from RD/C/RW
  { name: 'Julien', jerseyNumber: 11, position: 'C' as const }, // No position specified, defaulting to C
  { name: 'Jae', jerseyNumber: 4, position: 'C' as const }, // No position specified, defaulting to C
];

export default function PopulateCobras() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const populateRoster = async () => {
    try {
      setLoading(true);
      setError('');
      setStatus('Finding Cobras team...');

      // Find Cobras team
      const teamsCol = collection(db, 'teams');
      const q = query(teamsCol, where('name', '==', 'Cobras'));
      const teamsSnapshot = await getDocs(q);

      if (teamsSnapshot.empty) {
        setError('Cobras team not found! Please create the team first.');
        setLoading(false);
        return;
      }

      const cobrasTeam = teamsSnapshot.docs[0];
      const teamId = cobrasTeam.id;

      // First, delete existing Cobras players
      setStatus(`Found Cobras team (ID: ${teamId}). Removing existing players...`);
      const playersCol = collection(db, 'players');
      const existingPlayersQuery = query(playersCol, where('teamId', '==', teamId));
      const existingPlayersSnapshot = await getDocs(existingPlayersQuery);

      for (const playerDoc of existingPlayersSnapshot.docs) {
        await deleteDoc(doc(db, 'players', playerDoc.id));
      }

      setStatus(`Removed ${existingPlayersSnapshot.size} existing players. Adding ${cobrasPlayers.length} new players...`);

      for (let i = 0; i < cobrasPlayers.length; i++) {
        const player = cobrasPlayers[i];

        const playerData = {
          name: player.name,
          teamId: teamId,
          jerseyNumber: player.jerseyNumber,
          position: player.position,
          goals: 0,
          assists: 0,
          points: 0,
          penaltyMinutes: 0,
          gamesPlayed: 0,
        };

        await addDoc(playersCol, playerData);
        setStatus(`Added ${i + 1}/${cobrasPlayers.length}: ${player.name} (#${player.jerseyNumber} - ${player.position})`);
      }

      setStatus(`✓ Successfully added all ${cobrasPlayers.length} players to Cobras roster!`);

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
      <h2 className="text-3xl font-bold mb-8 text-gray-900">Populate Cobras Roster</h2>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Players to be Added:</h3>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h4 className="font-semibold text-green-900 mb-3">Cobras ({cobrasPlayers.length} players)</h4>
          <div className="grid md:grid-cols-2 gap-2">
            {cobrasPlayers.map((player, index) => {
              return (
                <div key={index} className="flex items-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                  <span className="text-green-800">
                    #{player.jerseyNumber} {player.name} ({player.position})
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <p className="text-blue-800 font-semibold mb-2">ℹ️ Position Mapping Notes:</p>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• JB: LD/C/LW → C (Center)</li>
            <li>• Eden: Any → C (Center)</li>
            <li>• Kevin, Sergio, Nico: W → LW (Left Wing)</li>
            <li>• Nora: C/RW → C (Center)</li>
            <li>• Josh: RD/C/RW → C (Center)</li>
            <li>• Julien, Jae: No position specified → C (Center)</li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-700 mb-6">
          This will add all {cobrasPlayers.length} players to the Cobras roster with default stats (0 goals, assists, etc.).
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 font-semibold mb-2">⚠️ Warning</p>
          <p className="text-yellow-700">
            This will delete all existing Cobras players and replace them with the new roster.
          </p>
        </div>

        <button
          onClick={populateRoster}
          disabled={loading}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {loading ? 'Populating...' : 'Populate Cobras Roster'}
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