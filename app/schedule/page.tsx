'use client';

import { useEffect, useState } from 'react';
import { getUpcomingGames, getAllGames, getRecentGames } from '@/lib/db';
import { Game } from '@/types';

export default function SchedulePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllGames, setShowAllGames] = useState(false);
  const [loadingGames, setLoadingGames] = useState(false);
  const [gamesDivision, setGamesDivision] = useState<'all' | 'A' | 'B'>('all');
  const [allGamesDivision, setAllGamesDivision] = useState<'all' | 'A' | 'B'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        );

        const dataPromise = Promise.all([
          showAllGames
            ? getAllGames(gamesDivision === 'all' ? undefined : gamesDivision)
            : getUpcomingGames(7, gamesDivision === 'all' ? undefined : gamesDivision),
          getAllGames(allGamesDivision === 'all' ? undefined : allGamesDivision)
        ]);

        const [gamesData, allGamesData] = await Promise.race([
          dataPromise,
          timeoutPromise
        ]) as [Game[], Game[]];

        setGames(gamesData);
        setAllGames(allGamesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showAllGames, gamesDivision, allGamesDivision]);

  const toggleGamesView = async () => {
    setLoadingGames(true);
    setShowAllGames(!showAllGames);
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
                      ? 'bg-[#e9ca8a] text-black'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Div A
                </button>
                <button
                  onClick={() => setGamesDivision('B')}
                  className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg font-semibold transition text-sm ${
                    gamesDivision === 'B'
                      ? 'bg-[#e9ca8a] text-black'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Div B
                </button>
              </div>
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
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold ${
                      game.division === 'A' ? 'bg-[#e9ca8a] text-black' : 'bg-black text-[#e9ca8a]'
                    }`}>
                      <span className="hidden sm:inline">Division </span>{game.division}
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

        {/* All Games Table */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">All Games</h2>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setAllGamesDivision('all')}
                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg font-semibold transition text-sm ${
                  allGamesDivision === 'all'
                    ? 'bg-[#e9ca8a] text-black'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setAllGamesDivision('A')}
                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg font-semibold transition text-sm ${
                  allGamesDivision === 'A'
                    ? 'bg-[#e9ca8a] text-black'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Div A
              </button>
              <button
                onClick={() => setAllGamesDivision('B')}
                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg font-semibold transition text-sm ${
                  allGamesDivision === 'B'
                    ? 'bg-[#e9ca8a] text-black'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Div B
              </button>
            </div>
          </div>

          {/* Games Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="table-scroll-wrapper">
              <table className="w-full mobile-compact-table">
                <thead className="bg-[#faf6ee] border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-gray-700 sticky left-0 bg-[#faf6ee] z-10">Game #</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-700">Date/Time</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-700">Matchup</th>
                    <th className="px-6 py-4 text-center font-bold text-gray-700">Div</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-700 hidden md:table-cell">Venue</th>
                    <th className="px-6 py-4 text-center font-bold text-gray-700">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {allGames.map((game, index) => {
                    const gameDate = game.date instanceof Date ? game.date : new Date(game.date);
                    return (
                      <tr key={game.id} className={`border-b hover:bg-[#fcfaf5] transition ${index % 2 === 0 ? 'bg-white' : 'bg-[#faf6ee]'}`}>
                        <td className="px-6 py-4 text-black font-bold text-base sm:text-lg sticky left-0 z-10" style={{backgroundColor: index % 2 === 0 ? '#ffffff' : '#faf6ee'}}>
                          #{game.gameNumber}
                        </td>
                        <td className="px-6 py-4 text-gray-700 font-medium text-sm sm:text-base">
                          {gameDate && !isNaN(gameDate.getTime()) ? gameDate.toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          }) : 'Date TBD'}
                        </td>
                        <td className="px-6 py-4 text-gray-900 font-semibold text-sm sm:text-base">
                          {game.awayTeamId} <span className="text-gray-500">@</span> {game.homeTeamId}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold ${
                            game.division === 'A' ? 'bg-[#e9ca8a] text-black' : 'bg-black text-[#e9ca8a]'
                          }`}>
                            <span className="hidden sm:inline">Division </span>{game.division}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700 hidden md:table-cell">{game.venue || '-'}</td>
                        <td className="px-6 py-4 text-center text-gray-900 font-bold text-base sm:text-lg">
                          {game.homeScore !== undefined && game.awayScore !== undefined
                            ? `${game.awayScore} - ${game.homeScore}`
                            : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {allGames.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl sm:text-6xl mb-4">🏒</div>
                <p className="text-base sm:text-lg font-semibold">No games scheduled yet</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
