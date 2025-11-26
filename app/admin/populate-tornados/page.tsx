'use client';

import { useState } from 'react';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

const tornadosPlayers = [
  { name: 'Henning', jerseyNumber: 8, position: 'C' as const },
  { name: 'Nick', jerseyNumber: 10, position: 'C' as const },
  { name: 'Vincent', jerseyNumber: 11, position: 'C' as const },
  { name: 'Simon', jerseyNumber: 13, position: 'C' as const },
  { name: 'Saif', jerseyNumber: 14, position: 'C' as const },
  { name: 'Jason', jerseyNumber: 17, position: 'C' as const },
  { name: 'Roman', jerseyNumber: 23, position: 'C' as const },
  { name: 'Sergey', jerseyNumber: 24, position: 'C' as const },
  { name: 'Daniel', jerseyNumber: 29, position: 'C' as const },
  { name: 'Roland', jerseyNumber: 43, position: 'C' as const },
  { name: 'Pierre', jerseyNumber: 77, position: 'C' as const },
  { name: 'Pascal', jerseyNumber: 92, position: 'C' as const },
];

export default function PopulateTornados() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const populateRoster = async () => {
    try {
      setLoading(true);
      setError('');
      setStatus('Finding Tornados team...');

      // Find Tornados team
      const teamsCol = collection(db, 'teams');
      const q = query(teamsCol, where('name', '==', 'Tornados'));
      const teamsSnapshot = await getDocs(q);

      if (teamsSnapshot.empty) {
        setError('Tornados team not found! Please create the team first.');
        setLoading(false);
        return;
      }

      const tornadosTeam = teamsSnapshot.docs[0];
      const teamId = tornadosTeam.id;

      // First, delete existing Tornados players
      setStatus(`Found Tornados team (ID: ${teamId}). Removing existing players...`);
      const playersCol = collection(db, 'players');
      const existingPlayersQuery = query(playersCol, where('teamId', '==', teamId));
      const existingPlayersSnapshot = await getDocs(existingPlayersQuery);

      for (const playerDoc of existingPlayersSnapshot.docs) {
        await deleteDoc(doc(db, 'players', playerDoc.id));
      }

      setStatus(`Removed ${existingPlayersSnapshot.size} existing players. Adding ${tornadosPlayers.length} new players...`);

      for (let i = 0; i < tornadosPlayers.length; i++) {
        const player = tornadosPlayers[i];

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
        setStatus(`Added ${i + 1}/${tornadosPlayers.length}: ${player.name} (#${player.jerseyNumber})`);
      }

      setStatus(`✓ Successfully added all ${tornadosPlayers.length} players to Tornados roster!`);

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
      <h2 className="text-3xl font-bold mb-8 text-gray-900">Populate Tornados Roster</h2>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Players to be Added:</h3>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h4 className="font-semibold text-green-900 mb-3">Tornados ({tornadosPlayers.length} players)</h4>
          <div className="grid md:grid-cols-2 gap-2">
            {tornadosPlayers.map((player, index) => {
              return (
                <div key={index} className="flex items-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                  <span className="text-green-800">
                    #{player.jerseyNumber} {player.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-700 mb-6">
          This will add all {tornadosPlayers.length} players to the Tornados roster with default stats (0 goals, assists, etc.).
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 font-semibold mb-2">⚠️ Warning</p>
          <p className="text-yellow-700">
            This will delete all existing Tornados players and replace them with the new roster.
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
          {loading ? 'Populating...' : 'Populate Tornados Roster'}
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