'use client';

import { useEffect, useState } from 'react';
import { getTeams, getPlayers, getGoalies, getUpcomingGames, getAllGames, getRecentGames } from '@/lib/db';
import { Team, Player, Goalie, Game } from '@/types';
import Link from 'next/link';

export default function Home() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [goalies, setGoalies] = useState<Goalie[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [recentGames, setRecentGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDivision, setSelectedDivision] = useState<'A' | 'B'>('A');
  const [showAllGames, setShowAllGames] = useState(false);
  const [loadingGames, setLoadingGames] = useState(false);
  const [showAllPlayers, setShowAllPlayers] = useState(false);
  const [gamesDivision, setGamesDivision] = useState<'all' | 'A' | 'B'>('all');
  const [recentGamesDivision, setRecentGamesDivision] = useState<'all' | 'A' | 'B'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        );

        const dataPromise = Promise.all([
          getTeams(selectedDivision),
          getPlayers(selectedDivision),
          getGoalies(),
          showAllGames
            ? getAllGames(gamesDivision === 'all' ? undefined : gamesDivision)
            : getUpcomingGames(7, gamesDivision === 'all' ? undefined : gamesDivision),
          getRecentGames(7, recentGamesDivision === 'all' ? undefined : recentGamesDivision)
        ]);

        const [teamsData, playersData, goaliesData, gamesData, recentGamesData] = await Promise.race([
          dataPromise,
          timeoutPromise
        ]) as [Team[], Player[], Goalie[], Game[], Game[]];

        setTeams(teamsData);
        setPlayers(showAllPlayers ? playersData : playersData.slice(0, 10));
        setGoalies(goaliesData
          .sort((a, b) => b.savePercentage - a.savePercentage)
          .slice(0, 10)
        ); // Top 10 goalies by save percentage
        setGames(gamesData);
        setRecentGames(recentGamesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDivision, showAllGames, showAllPlayers, gamesDivision, recentGamesDivision]);

  const toggleGamesView = async () => {
    setLoadingGames(true);
    setShowAllGames(!showAllGames);
    // The useEffect will handle fetching the data
    setTimeout(() => setLoadingGames(false), 500);
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

        {/* Player Stats */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
              {showAllPlayers ? 'All Players' : 'Top Players'}
            </h2>
            <button
              onClick={() => setShowAllPlayers(!showAllPlayers)}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 rounded-lg font-semibold transition bg-[#e9ca8a] text-black hover:bg-[#d4b577] text-sm sm:text-base"
            >
              {showAllPlayers ? 'Show Top 10' : 'View All Players'}
            </button>
          </div>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="table-scroll-wrapper">
              <table className="w-full mobile-compact-table">
                <thead className="bg-[#faf6ee] border-b">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700 sticky left-0 bg-[#faf6ee] z-10">Player</th>
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

        {/* Upcoming Games */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
              {showAllGames ? 'All Games' : 'Upcoming Games (Next 7 Days)'}
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setGamesDivision('all')}
                  className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg font-semibold transition text-sm ${
                    gamesDivision === 'all'
                      ? 'bg-[#e9ca8a] text-black'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setGamesDivision('A')}
                  className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg font-semibold transition text-sm ${
                    gamesDivision === 'A'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Div A
                </button>
                <button
                  onClick={() => setGamesDivision('B')}
                  className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg font-semibold transition text-sm ${
                    gamesDivision === 'B'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Div B
                </button>
              </div>
              <button
                onClick={toggleGamesView}
                disabled={loadingGames}
                className={`w-full sm:w-auto px-4 sm:px-6 py-2 rounded-lg font-semibold transition text-sm ${
                  loadingGames
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-black text-[#e9ca8a] hover:bg-gray-900'
                }`}
              >
                {loadingGames ? 'Loading...' : (showAllGames ? 'Show Upcoming Only' : 'View All Games')}
              </button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => {
              const gameDate = game.date instanceof Date ? game.date : new Date(game.date);
              return (
                <div key={game.id} className="bg-white rounded-lg shadow p-4 sm:p-6">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-xs sm:text-sm text-gray-500">
                      {gameDate && !isNaN(gameDate.getTime()) ? gameDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      }) : 'Date TBD'}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      game.division === 'A' ? 'bg-[#faf6ee] text-[#c9a865]' : 'bg-green-100 text-green-800'
                    }`}>
                      Div {game.division}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-center flex-1">
                      <div className="font-semibold text-base sm:text-lg text-gray-900 break-words">{game.awayTeamId}</div>
                      <div className="text-xs sm:text-sm text-gray-500">Away</div>
                      {game.status === 'completed' && game.awayScore !== undefined && (
                        <div className="text-xl sm:text-2xl font-bold text-[#e9ca8a] mt-1">{game.awayScore}</div>
                      )}
                    </div>
                    <div className="px-2 sm:px-4 text-gray-400 font-semibold text-sm">
                      {game.status === 'completed' ? 'vs' : '@'}
                    </div>
                    <div className="text-center flex-1">
                      <div className="font-semibold text-base sm:text-lg text-gray-900 break-words">{game.homeTeamId}</div>
                      <div className="text-xs sm:text-sm text-gray-500">Home</div>
                      {game.status === 'completed' && game.homeScore !== undefined && (
                        <div className="text-xl sm:text-2xl font-bold text-[#e9ca8a] mt-1">{game.homeScore}</div>
                      )}
                    </div>
                  </div>
                  {game.venue && (
                    <div className="mt-3 text-xs sm:text-sm text-gray-500 text-center break-words">
                      {game.venue}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {games.length === 0 && (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No upcoming games scheduled
            </div>
          )}
        </section>

        {/* Recent Games (Last 7 Days) */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Recent Games</h2>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setRecentGamesDivision('all')}
                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg font-semibold transition text-sm ${
                  recentGamesDivision === 'all'
                    ? 'bg-[#e9ca8a] text-black'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setRecentGamesDivision('A')}
                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg font-semibold transition text-sm ${
                  recentGamesDivision === 'A'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Div A
              </button>
              <button
                onClick={() => setRecentGamesDivision('B')}
                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg font-semibold transition text-sm ${
                  recentGamesDivision === 'B'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Div B
              </button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentGames.map((game) => {
              const gameDate = game.date instanceof Date ? game.date : new Date(game.date);
              return (
                <div key={game.id} className="bg-white rounded-lg shadow p-4 sm:p-6">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-xs sm:text-sm text-gray-500">
                      {gameDate && !isNaN(gameDate.getTime()) ? gameDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      }) : 'Date TBD'}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      game.division === 'A' ? 'bg-[#faf6ee] text-[#c9a865]' : 'bg-green-100 text-green-800'
                    }`}>
                      Div {game.division}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-center flex-1">
                      <div className="font-semibold text-base sm:text-lg text-gray-900 break-words">{game.awayTeamId}</div>
                      <div className="text-xs sm:text-sm text-gray-500">Away</div>
                      {game.status === 'completed' && game.awayScore !== undefined && (
                        <div className="text-xl sm:text-2xl font-bold text-[#e9ca8a] mt-1">{game.awayScore}</div>
                      )}
                    </div>
                    <div className="px-2 sm:px-4 text-gray-400 font-semibold text-sm">vs</div>
                    <div className="text-center flex-1">
                      <div className="font-semibold text-base sm:text-lg text-gray-900 break-words">{game.homeTeamId}</div>
                      <div className="text-xs sm:text-sm text-gray-500">Home</div>
                      {game.status === 'completed' && game.homeScore !== undefined && (
                        <div className="text-xl sm:text-2xl font-bold text-[#e9ca8a] mt-1">{game.homeScore}</div>
                      )}
                    </div>
                  </div>
                  {game.venue && (
                    <div className="mt-3 text-xs sm:text-sm text-gray-500 text-center break-words">
                      {game.venue}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {recentGames.length === 0 && (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No games in the last 7 days
            </div>
          )}
        </section>

      </main>

      <footer className="bg-black text-[#e9ca8a] py-4 sm:py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm sm:text-base">&copy; {new Date().getFullYear()} Hockey League. All rights reserved.</p>
          <Link href="/admin/login" className="inline-block mt-3 sm:mt-4 bg-[#e9ca8a] text-black px-4 sm:px-6 py-2 rounded-lg hover:bg-[#d4b574] transition-colors font-semibold text-sm sm:text-base">
            Admin Dashboard
          </Link>
        </div>
      </footer>
    </div>
  );
}