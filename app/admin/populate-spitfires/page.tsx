'use client';

import { useState } from 'react';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

const spitfiresPlayers = [
  { name: 'Maksim Mershiev', jerseyNumber: 9, position: 'C' as const },
  { name: 'Ilya Fatkhutdinov', jerseyNumber: 12, position: 'LW' as const },
  { name: 'Aleksandr Kretov', jerseyNumber: 13, position: 'RW' as const },
  { name: 'Nik Malakov', jerseyNumber: 55, position: 'LW' as const },
  { name: 'Andrei Andreev', jerseyNumber: 77, position: 'C' as const },
  { name: 'Andrey Tsurkan', jerseyNumber: 80, position: 'C' as const },
  { name: 'Francois-Yves Giguere', jerseyNumber: 87, position: 'C' as const },
  { name: 'Robert Redling', jerseyNumber: 88, position: 'C' as const },
  { name: 'Roman Smolyaninov', jerseyNumber: 10, position: 'C' as const },
  { name: 'Matthew Brown', jerseyNumber: 44, position: 'D' as const },
  { name: 'Oleg Tereschenko', jerseyNumber: 17, position: 'D' as const },
  { name: 'Yevgeniy Kabysh', jerseyNumber: 25, position: 'D' as const },
  { name: 'Anthony Lapierre', jerseyNumber: 82, position: 'D' as const },
];

export default function PopulateSpitfires() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const populateRoster = async () => {
    try {
      setLoading(true);
      setError('');
      setStatus('Finding Spitfires team...');

      // Find Spitfires team
      const teamsCol = collection(db, 'teams');
      const q = query(teamsCol, where('name', '==', 'Spitfires'));
      const teamsSnapshot = await getDocs(q);

      if (teamsSnapshot.empty) {
        setError('Spitfires team not found! Please create the team first.');
        setLoading(false);
        return;
      }

      const spitfiresTeam = teamsSnapshot.docs[0];
      const teamId = spitfiresTeam.id;

      // First, delete existing Spitfires players
      setStatus(`Found Spitfires team (ID: ${teamId}). Removing existing players...`);
      const playersCol = collection(db, 'players');
      const existingPlayersQuery = query(playersCol, where('teamId', '==', teamId));
      const existingPlayersSnapshot = await getDocs(existingPlayersQuery);

      for (const playerDoc of existingPlayersSnapshot.docs) {
        await deleteDoc(doc(db, 'players', playerDoc.id));
      }

      setStatus(`Removed ${existingPlayersSnapshot.size} existing players. Adding ${spitfiresPlayers.length} new players...`);

      for (let i = 0; i < spitfiresPlayers.length; i++) {
        const player = spitfiresPlayers[i];

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
        setStatus(`Added ${i + 1}/${spitfiresPlayers.length}: ${player.name} (#${player.jerseyNumber} - ${player.position})`);
      }

      setStatus(`✓ Successfully added all ${spitfiresPlayers.length} players to Spitfires roster!`);

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
      <h2 className="text-3xl font-bold mb-8 text-gray-900">Populate Spitfires Roster</h2>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Players to be Added:</h3>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h4 className="font-semibold text-green-900 mb-3">Spitfires ({spitfiresPlayers.length} players)</h4>
          <div className="grid md:grid-cols-2 gap-2">
            {spitfiresPlayers.map((player, index) => {
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
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-700 mb-6">
          This will add all {spitfiresPlayers.length} players to the Spitfires roster with default stats (0 goals, assists, etc.).
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 font-semibold mb-2">⚠️ Warning</p>
          <p className="text-yellow-700">
            This will delete all existing Spitfires players and replace them with the new roster.
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
          {loading ? 'Populating...' : 'Populate Spitfires Roster'}
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