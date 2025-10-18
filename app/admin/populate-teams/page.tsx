'use client';

import { useState } from 'react';
import { collection, getDocs, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

const teamsData = {
  divisionA: [
    { name: 'Flamingos', division: 'A' },
    { name: 'Angry Beavers', division: 'A' },
    { name: 'Penguins', division: 'A' },
    { name: 'Bashers', division: 'A' },
    { name: 'Mavericks', division: 'A' },
    { name: 'Islanders', division: 'A' }
  ],
  divisionB: [
    { name: 'Cobras', division: 'B' },
    { name: 'Tornados', division: 'B' },
    { name: 'Spitfires', division: 'B' },
    { name: 'Wildcats', division: 'B' }
  ]
};

export default function PopulateTeams() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const clearTeams = async () => {
    setStatus('Clearing existing teams...');
    const teamsCol = collection(db, 'teams');
    const snapshot = await getDocs(teamsCol);
    
    for (const doc of snapshot.docs) {
      await deleteDoc(doc.ref);
    }
    setStatus(`Deleted ${snapshot.size} existing teams`);
  };

  const populateTeams = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Clear existing teams first
      await clearTeams();
      
      const allTeams = [...teamsData.divisionA, ...teamsData.divisionB];
      
      setStatus(`Adding ${allTeams.length} teams to Firestore...`);
      const teamsCol = collection(db, 'teams');
      
      for (let i = 0; i < allTeams.length; i++) {
        const team = allTeams[i];
        
        // Create team object with default stats
        const teamData = {
          name: team.name,
          division: team.division,
          wins: 0,
          losses: 0,
          ties: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0
        };
        
        await addDoc(teamsCol, teamData);
        setStatus(`Added team ${i + 1}/${allTeams.length}: ${team.name} (Division ${team.division})`);
      }
      
      setStatus(`Successfully populated ${allTeams.length} teams!`);
      
      // Redirect to teams page after 2 seconds
      setTimeout(() => {
        router.push('/admin');
      }, 2000);
      
    } catch (error) {
      console.error('Error populating teams:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-gray-900">Populate Teams from Schedule Analysis</h2>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Teams to be Added:</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Division A */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3">Division A (6 teams)</h4>
            <ul className="space-y-2">
              {teamsData.divisionA.map((team, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                  <span className="text-blue-800 font-medium">{team.name}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Division B */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-green-900 mb-3">Division B (4 teams)</h4>
            <ul className="space-y-2">
              {teamsData.divisionB.map((team, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                  <span className="text-green-800 font-medium">{team.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-700 mb-6">
          This will populate the teams collection with all 10 teams from the hockey league schedule, 
          organized by their proper divisions with default stats.
        </p>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 font-semibold mb-2">⚠️ Warning</p>
          <p className="text-yellow-700">
            This will delete all existing teams and replace them with the teams from the schedule analysis.
          </p>
        </div>
        
        <button
          onClick={populateTeams}
          disabled={loading}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? 'Populating...' : 'Populate Teams'}
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