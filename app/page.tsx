'use client';

import { useEffect, useState } from 'react';
import { getTeams } from '@/lib/db';
import { Team } from '@/types';

export default function Home() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDivision, setSelectedDivision] = useState<'A' | 'B'>('A');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        );

        const dataPromise = getTeams(selectedDivision);

        const teamsData = await Promise.race([
          dataPromise,
          timeoutPromise
        ]) as Team[];

        setTeams(teamsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDivision]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Team Standings */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Team Standings</h2>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setSelectedDivision('A')}
                className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2 rounded-lg font-semibold transition text-sm sm:text-base ${
                  selectedDivision === 'A'
                    ? 'bg-[#e9ca8a] text-black'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Division A
              </button>
              <button
                onClick={() => setSelectedDivision('B')}
                className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2 rounded-lg font-semibold transition text-sm sm:text-base ${
                  selectedDivision === 'B'
                    ? 'bg-[#e9ca8a] text-black'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Division B
              </button>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="table-scroll-wrapper">
              <table className="w-full mobile-compact-table">
                <thead className="bg-[#faf6ee] border-b">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700 sticky left-0 bg-[#faf6ee] z-10">Team</th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-700">GP</th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-700">W</th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-700">L</th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-700">T</th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-700">PTS</th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-700">GF</th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-700">GA</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team, index) => (
                    <tr key={team.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#faf6ee]'}>
                      <td className="px-6 py-4 font-medium text-gray-900 sticky left-0 z-10" style={{backgroundColor: index % 2 === 0 ? '#ffffff' : '#faf6ee'}}>{team.name}</td>
                      <td className="px-6 py-4 text-center text-gray-700">{team.wins + team.losses + team.ties}</td>
                      <td className="px-6 py-4 text-center text-gray-700">{team.wins}</td>
                      <td className="px-6 py-4 text-center text-gray-700">{team.losses}</td>
                      <td className="px-6 py-4 text-center text-gray-700">{team.ties}</td>
                      <td className="px-6 py-4 text-center font-semibold text-gray-900">{team.points}</td>
                      <td className="px-6 py-4 text-center text-gray-700">{team.goalsFor}</td>
                      <td className="px-6 py-4 text-center text-gray-700">{team.goalsAgainst}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
