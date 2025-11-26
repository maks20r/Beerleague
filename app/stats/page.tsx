'use client';

import { useEffect, useState } from 'react';
import { getPlayers, getGoalies, getTeams } from '@/lib/db';
import { Player, Goalie, Team } from '@/types';

export default function StatsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [goalies, setGoalies] = useState<Goalie[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDivision, setSelectedDivision] = useState<'A' | 'B'>('A');
  const [showAllPlayers, setShowAllPlayers] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        );

        const dataPromise = Promise.all([
          getPlayers(selectedDivision),
          getGoalies(),
          getTeams()
        ]);

        const [playersData, goaliesData, teamsData] = await Promise.race([
          dataPromise,
          timeoutPromise
        ]) as [Player[], Goalie[], Team[]];

        setPlayers(showAllPlayers ? playersData : playersData.slice(0, 10));
        setGoalies(goaliesData
          .sort((a, b) => b.savePercentage - a.savePercentage)
          .slice(0, 10)
        );
        setTeams(teamsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDivision, showAllPlayers]);

  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown';
  };

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
        {/* Player Stats */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
              {showAllPlayers ? 'All Players' : 'Top Players'}
            </h2>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="flex gap-2">
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
              <button
                onClick={() => setShowAllPlayers(!showAllPlayers)}
                className="w-full sm:w-auto text-gray-700 hover:text-gray-900 underline text-sm sm:text-base"
              >
                {showAllPlayers ? 'Show Top 10' : 'View All Players'}
              </button>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="table-scroll-wrapper">
              <table className="w-full mobile-compact-table">
                <thead className="bg-[#faf6ee] border-b">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700 sticky left-0 bg-[#faf6ee] z-10">Player</th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-700">Team</th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-700">Pos</th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-700">#</th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-700">G</th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-700">A</th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-700">PTS</th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-700">PIM</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player, index) => (
                    <tr key={player.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#faf6ee]'}>
                      <td className="px-6 py-4 font-medium text-gray-900 sticky left-0 z-10" style={{backgroundColor: index % 2 === 0 ? '#ffffff' : '#faf6ee'}}>{player.name}</td>
                      <td className="px-6 py-4 text-center text-gray-700">{getTeamName(player.teamId)}</td>
                      <td className="px-6 py-4 text-center text-gray-700">{player.position}</td>
                      <td className="px-6 py-4 text-center text-gray-700">{player.jerseyNumber}</td>
                      <td className="px-6 py-4 text-center text-gray-700">{player.goals}</td>
                      <td className="px-6 py-4 text-center text-gray-700">{player.assists}</td>
                      <td className="px-6 py-4 text-center font-semibold text-gray-900">{player.points}</td>
                      <td className="px-6 py-4 text-center text-gray-700">{player.penaltyMinutes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Goalie Stats */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">Top Goalies</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="table-scroll-wrapper">
              <table className="w-full mobile-compact-table">
                <thead className="bg-[#faf6ee] border-b">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700 sticky left-0 bg-[#faf6ee] z-10">Goalie</th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-700">GP</th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-700">Shots</th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-700">GA</th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-700">Saves</th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-700">SV%</th>
                  </tr>
                </thead>
                <tbody>
                  {goalies.map((goalie, index) => (
                    <tr key={goalie.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#faf6ee]'}>
                      <td className="px-6 py-4 font-medium text-gray-900 sticky left-0 z-10" style={{backgroundColor: index % 2 === 0 ? '#ffffff' : '#faf6ee'}}>{goalie.name}</td>
                      <td className="px-6 py-4 text-center text-gray-700">{goalie.gamesPlayed}</td>
                      <td className="px-6 py-4 text-center text-gray-700">{goalie.totalShots}</td>
                      <td className="px-6 py-4 text-center text-gray-700">{goalie.goalsAllowed}</td>
                      <td className="px-6 py-4 text-center text-gray-700">{goalie.saves}</td>
                      <td className="px-6 py-4 text-center font-semibold text-gray-900">
                        {goalie.savePercentage.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {goalies.length === 0 && (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No goalie stats available yet
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
