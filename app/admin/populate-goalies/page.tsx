'use client';

import { useState } from 'react';
import { collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

const goalieNames = [
  'Alex Bort',
  'Alex Litva',
  'Arttu Makela',
  'Benoit Ferland',
  'Charles Secker',
  'Chris Yeryk',
  'Christian Montpetit',
  'Fedor Glushchenko',
  'Gianpietro Iseppi',
  'Gino Ka',
  'Greg Kerr',
  'Jace Montpetit',
  'James Jackson',
  'Jeffery Smylski',
  'Keaton Wright',
  'Kevin Hutchinson',
  'Kevin McCarthy',
  'Leon Moore',
  'Lukasz Bogacz',
  'Marko Laukkanen',
  'Maksim Rashchupkin',
  'Nolan Harmatiuk',
  'Pavel Bilik',
  'Pavel Popkov',
  'Rodric Haddad',
  'Roman Tovstokor',
  'Sarre Lenstra',
  'Shoaib-Hasan Shaikh',
  'Tero Kilpela',
  'Trevor Warren',
  'Vijay Oberoi',
];

export default function PopulateGoalies() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const populateGoalies = async () => {
    try {
      setLoading(true);
      setError('');
      setStatus('Removing existing goalies...');

      // Remove all existing goalies
      const goaliesCol = collection(db, 'goalies');
      const goaliesSnapshot = await getDocs(goaliesCol);

      for (const goalieDoc of goaliesSnapshot.docs) {
        await deleteDoc(goalieDoc.ref);
      }

      setStatus(`Removed ${goaliesSnapshot.docs.length} existing goalies. Adding new goalies...`);

      // Add all goalies without team assignment
      for (let i = 0; i < goalieNames.length; i++) {
        const goalie = {
          name: goalieNames[i],
          teamId: '', // No team assignment - available for any team
          gamesPlayed: 0,
          totalShots: 0,
          goalsAllowed: 0,
          saves: 0,
          savePercentage: 0,
        };

        await addDoc(goaliesCol, goalie);
        setStatus(`Adding goalie ${i + 1}/${goalieNames.length}: ${goalieNames[i]}`);
      }

      setStatus(`✅ Successfully added ${goalieNames.length} goalies!`);
      setTimeout(() => {
        router.push('/admin');
      }, 2000);

    } catch (err) {
      console.error('Error populating goalies:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Populate Goalies</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-900">
          This will add {goalieNames.length} goalies to the database.
          All goalies will be available for any team to select.
        </p>
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

      <button
        onClick={populateGoalies}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? 'Populating...' : 'Populate Goalies'}
      </button>

      <button
        onClick={() => router.push('/admin')}
        className="ml-4 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
      >
        Back to Admin
      </button>
    </div>
  );
}
