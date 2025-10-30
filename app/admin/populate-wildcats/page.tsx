'use client';

import { useState } from 'react';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

const wildcatsPlayers = [
  { name: 'Matthias S', jerseyNumber: 5, position: 'C' as const },
  { name: 'Thomas L', jerseyNumber: 10, position: 'C' as const },
  { name: 'Dieter D', jerseyNumber: 11, position: 'C' as const },
  { name: 'Patrick W', jerseyNumber: 14, position: 'C' as const },
  { name: 'Andrew S', jerseyNumber: 17, position: 'C' as const },
  { name: 'Alejandro', jerseyNumber: 18, position: 'C' as const },
  { name: 'Mohammed I', jerseyNumber: 24, position: 'C' as const },
  { name: 'Shaun H', jerseyNumber: 27, position: 'C' as const },
  { name: 'Tim M', jerseyNumber: 29, position: 'C' as const },
  { name: 'Sav H', jerseyNumber: 43, position: 'C' as const },
  { name: 'Fiona', jerseyNumber: 60, position: 'C' as const },
  { name: 'Ivan S', jerseyNumber: 69, position: 'C' as const },
];

export default function PopulateWildcats() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const populateRoster = async () => {
    try {
      setLoading(true);
      setError('');
      setStatus('Finding Wildcats team...');

      // Find Wildcats team
      const teamsCol = collection(db, 'teams');
      const q = query(teamsCol, where('name', '==', 'Wildcats'));
      const teamsSnapshot = await getDocs(q);

      if (teamsSnapshot.empty) {
        setError('Wildcats team not found! Please create the team first.');
        setLoading(false);
        return;
      }

      const wildcatsTeam = teamsSnapshot.docs[0];
      const teamId = wildcatsTeam.id;

      // First, delete existing Wildcats players
      setStatus(`Found Wildcats team (ID: ${teamId}). Removing existing players...`);
      const playersCol = collection(db, 'players');
      const existingPlayersQuery = query(playersCol, where('teamId', '==', teamId));
      const existingPlayersSnapshot = await getDocs(existingPlayersQuery);

      for (const playerDoc of existingPlayersSnapshot.docs) {
        await deleteDoc(doc(db, 'players', playerDoc.id));
      }

      setStatus(`Removed ${existingPlayersSnapshot.size} existing players. Adding ${wildcatsPlayers.length} new players...`);

      for (let i = 0; i < wildcatsPlayers.length; i++) {
        const player = wildcatsPlayers[i];

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
        setStatus(`Added ${i + 1}/${wildcatsPlayers.length}: ${player.name} (#${player.jerseyNumber})`);
      }

      setStatus(`✓ Successfully added all ${wildcatsPlayers.length} players to Wildcats roster!`);

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
      <h2 className="text-3xl font-bold mb-8 text-gray-900">Populate Wildcats Roster</h2>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Players to be Added:</h3>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h4 className="font-semibold text-green-900 mb-3">Wildcats ({wildcatsPlayers.length} players)</h4>
          <div className="grid md:grid-cols-2 gap-2">
            {wildcatsPlayers.map((player, index) => {
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
          This will add all {wildcatsPlayers.length} players to the Wildcats roster with default stats (0 goals, assists, etc.).
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 font-semibold mb-2">⚠️ Warning</p>
          <p className="text-yellow-700">
            This will delete all existing Wildcats players and replace them with the new roster.
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
          {loading ? 'Populating...' : 'Populate Wildcats Roster'}
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