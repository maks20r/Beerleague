'use client';

import { useEffect, useState } from 'react';
import { getAllGames, getTeams, getPlayers, getGoalies, addGame, updateGame, deleteGame, updateTeamStandings, updatePlayerStatsFromGame, updateGoalieStatsFromGame } from '@/lib/db';
import { Game, Team, Player, Goalie } from '@/types';

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [goalies, setGoalies] = useState<Goalie[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'results'>('overview');
  const [showEmptyNetGoals, setShowEmptyNetGoals] = useState(false);

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    homeTeamId: '',
    awayTeamId: '',
    division: 'A' as 'A' | 'B',
    homeGoalie: '',
    awayGoalie: '',
    referee: '',
    venue: '',
    homeScore: '',
    awayScore: '',
    homeEmptyNetGoals: '',
    awayEmptyNetGoals: '',
    shootout: false
  });

  const [resultsData, setResultsData] = useState({
    homeShots: '',
    awayShots: '',
    homeGoals: [] as Array<{
      scorer: string;
      assist1: string;
      assist2: string;
      time: string;
    }>,
    awayGoals: [] as Array<{
      scorer: string;
      assist1: string;
      assist2: string;
      time: string;
    }>,
    homePenalties: [] as Array<{
      player: string;
      infraction: string;
      minutes: string;
    }>,
    awayPenalties: [] as Array<{
      player: string;
      infraction: string;
      minutes: string;
    }>
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [gamesData, teamsData, playersData, goaliesData] = await Promise.all([
        getAllGames(),
        getTeams(),
        getPlayers(),
        getGoalies()
      ]);
      setGames(gamesData);
      setTeams(teamsData);
      setPlayers(playersData);
      setGoalies(goaliesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const gameDate = new Date(`${formData.date}T${formData.time}`);

    // Auto-determine game status based on scores
    const homeScore = formData.homeScore !== '' ? parseInt(formData.homeScore) : undefined;
    const awayScore = formData.awayScore !== '' ? parseInt(formData.awayScore) : undefined;
    const gameStatus = (homeScore !== undefined && awayScore !== undefined) ? 'completed' : 'scheduled';

    const homeEmptyNetGoals = formData.homeEmptyNetGoals !== '' ? parseInt(formData.homeEmptyNetGoals) : undefined;
    const awayEmptyNetGoals = formData.awayEmptyNetGoals !== '' ? parseInt(formData.awayEmptyNetGoals) : undefined;

    const gameData = {
      date: gameDate,
      homeTeamId: formData.homeTeamId,
      awayTeamId: formData.awayTeamId,
      division: formData.division,
      homeGoalie: formData.homeGoalie,
      awayGoalie: formData.awayGoalie,
      referee: formData.referee,
      venue: formData.venue,
      status: gameStatus,
      ...(homeScore !== undefined && { homeScore }),
      ...(awayScore !== undefined && { awayScore }),
      ...(homeEmptyNetGoals !== undefined && { homeEmptyNetGoals }),
      ...(awayEmptyNetGoals !== undefined && { awayEmptyNetGoals }),
      shootout: formData.shootout,
      homeShots: resultsData.homeShots ? parseInt(resultsData.homeShots) : 0,
      awayShots: resultsData.awayShots ? parseInt(resultsData.awayShots) : 0,
      homeGoals: resultsData.homeGoals.length > 0 ? resultsData.homeGoals : [],
      awayGoals: resultsData.awayGoals.length > 0 ? resultsData.awayGoals : [],
      homePenalties: resultsData.homePenalties.length > 0 ? resultsData.homePenalties : [],
      awayPenalties: resultsData.awayPenalties.length > 0 ? resultsData.awayPenalties : [],
    };

    console.log('Saving game data:', gameData);

    try {
      setSaving(true);
      let gameId: string;

      if (editingGame) {
        await updateGame(editingGame.id, gameData);
        gameId = editingGame.id;

        // Update team standings if game is completed with scores
        // Pass old scores if the game was previously completed
        if (gameStatus === 'completed' && homeScore !== undefined && awayScore !== undefined) {
          const oldGame = editingGame.status === 'completed' ? {
            homeScore: editingGame.homeScore,
            awayScore: editingGame.awayScore
          } : undefined;
          await updateTeamStandings(gameId, oldGame);

          // Prepare old game data for stats update
          const oldPlayerGameData = editingGame.status === 'completed' ? {
            homeTeamId: editingGame.homeTeamId,
            awayTeamId: editingGame.awayTeamId,
            homeGoals: editingGame.homeGoals || [],
            awayGoals: editingGame.awayGoals || [],
            homePenalties: editingGame.homePenalties || [],
            awayPenalties: editingGame.awayPenalties || []
          } : undefined;

          // Update player stats from game results
          await updatePlayerStatsFromGame(gameId, {
            homeTeamId: formData.homeTeamId,
            awayTeamId: formData.awayTeamId,
            homeGoals: resultsData.homeGoals,
            awayGoals: resultsData.awayGoals,
            homePenalties: resultsData.homePenalties,
            awayPenalties: resultsData.awayPenalties
          }, oldPlayerGameData);

          // Update goalie stats from game results
          if (formData.homeGoalie || formData.awayGoalie) {
            const oldGoalieGameData = editingGame.status === 'completed' ? {
              homeTeamId: editingGame.homeTeamId,
              awayTeamId: editingGame.awayTeamId,
              homeGoalie: editingGame.homeGoalie,
              awayGoalie: editingGame.awayGoalie,
              homeScore: editingGame.homeScore || 0,
              awayScore: editingGame.awayScore || 0,
              homeShots: editingGame.homeShots || 0,
              awayShots: editingGame.awayShots || 0,
              homeEmptyNetGoals: editingGame.homeEmptyNetGoals || 0,
              awayEmptyNetGoals: editingGame.awayEmptyNetGoals || 0
            } : undefined;

            await updateGoalieStatsFromGame(gameId, {
              homeTeamId: formData.homeTeamId,
              awayTeamId: formData.awayTeamId,
              homeGoalie: formData.homeGoalie,
              awayGoalie: formData.awayGoalie,
              homeScore: homeScore,
              awayScore: awayScore,
              homeShots: resultsData.homeShots ? parseInt(resultsData.homeShots) : 0,
              awayShots: resultsData.awayShots ? parseInt(resultsData.awayShots) : 0,
              homeEmptyNetGoals: homeEmptyNetGoals,
              awayEmptyNetGoals: awayEmptyNetGoals
            }, oldGoalieGameData);
          }
        }
      } else {
        const docRef = await addGame(gameData as Omit<Game, 'id'>);
        gameId = docRef.id;

        // Update team standings if game is completed with scores
        if (gameStatus === 'completed' && homeScore !== undefined && awayScore !== undefined) {
          await updateTeamStandings(gameId);

          // Update player stats from game results
          await updatePlayerStatsFromGame(gameId, {
            homeTeamId: formData.homeTeamId,
            awayTeamId: formData.awayTeamId,
            homeGoals: resultsData.homeGoals,
            awayGoals: resultsData.awayGoals,
            homePenalties: resultsData.homePenalties,
            awayPenalties: resultsData.awayPenalties
          });

          // Update goalie stats from game results
          if (formData.homeGoalie || formData.awayGoalie) {
            await updateGoalieStatsFromGame(gameId, {
              homeTeamId: formData.homeTeamId,
              awayTeamId: formData.awayTeamId,
              homeGoalie: formData.homeGoalie,
              awayGoalie: formData.awayGoalie,
              homeScore: homeScore,
              awayScore: awayScore,
              homeShots: resultsData.homeShots ? parseInt(resultsData.homeShots) : 0,
              awayShots: resultsData.awayShots ? parseInt(resultsData.awayShots) : 0,
              homeEmptyNetGoals: homeEmptyNetGoals,
              awayEmptyNetGoals: awayEmptyNetGoals
            });
          }
        }
      }

      await fetchData();
      resetForm();
    } catch (error) {
      console.error('Error saving game:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (game: Game) => {
    console.log('Editing game:', game);
    setEditingGame(game);
    const gameDate = new Date(game.date);
    setFormData({
      date: gameDate.toISOString().split('T')[0],
      time: gameDate.toTimeString().slice(0, 5),
      homeTeamId: game.homeTeamId,
      awayTeamId: game.awayTeamId,
      division: game.division,
      homeGoalie: game.homeGoalie || '',
      awayGoalie: game.awayGoalie || '',
      referee: game.referee || '',
      venue: game.venue || '',
      homeScore: game.homeScore?.toString() || '',
      awayScore: game.awayScore?.toString() || '',
      homeEmptyNetGoals: game.homeEmptyNetGoals?.toString() || '',
      awayEmptyNetGoals: game.awayEmptyNetGoals?.toString() || '',
      shootout: game.shootout || false
    });
    const loadedResultsData = {
      homeShots: game.homeShots?.toString() || '',
      awayShots: game.awayShots?.toString() || '',
      homeGoals: game.homeGoals || [],
      awayGoals: game.awayGoals || [],
      homePenalties: game.homePenalties || [],
      awayPenalties: game.awayPenalties || []
    };
    console.log('Loading results data:', loadedResultsData);
    setResultsData(loadedResultsData);
    // Show empty net goals section if there are any empty net goals
    setShowEmptyNetGoals(!!(game.homeEmptyNetGoals || game.awayEmptyNetGoals));
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this game?')) {
      try {
        await deleteGame(id);
        await fetchData();
      } catch (error) {
        console.error('Error deleting game:', error);
      }
    }
  };

  const addGoal = (team: 'home' | 'away') => {
    const key = team === 'home' ? 'homeGoals' : 'awayGoals';
    setResultsData({
      ...resultsData,
      [key]: [...resultsData[key], { scorer: '', assist1: '', assist2: '', time: '' }]
    });
  };

  const removeGoal = (team: 'home' | 'away', index: number) => {
    const key = team === 'home' ? 'homeGoals' : 'awayGoals';
    const newGoals = resultsData[key].filter((_, i) => i !== index);
    setResultsData({ ...resultsData, [key]: newGoals });
  };

  const updateGoal = (team: 'home' | 'away', index: number, field: string, value: string) => {
    const key = team === 'home' ? 'homeGoals' : 'awayGoals';
    const newGoals = [...resultsData[key]];
    newGoals[index] = { ...newGoals[index], [field]: value };
    setResultsData({ ...resultsData, [key]: newGoals });
  };

  const addPenalty = (team: 'home' | 'away') => {
    const key = team === 'home' ? 'homePenalties' : 'awayPenalties';
    setResultsData({
      ...resultsData,
      [key]: [...resultsData[key], { player: '', infraction: '', minutes: '' }]
    });
  };

  const removePenalty = (team: 'home' | 'away', index: number) => {
    const key = team === 'home' ? 'homePenalties' : 'awayPenalties';
    const newPenalties = resultsData[key].filter((_, i) => i !== index);
    setResultsData({ ...resultsData, [key]: newPenalties });
  };

  const updatePenalty = (team: 'home' | 'away', index: number, field: string, value: string) => {
    const key = team === 'home' ? 'homePenalties' : 'awayPenalties';
    const newPenalties = [...resultsData[key]];
    newPenalties[index] = { ...newPenalties[index], [field]: value };
    setResultsData({ ...resultsData, [key]: newPenalties });
  };

  const resetForm = () => {
    setFormData({
      date: '',
      time: '',
      homeTeamId: '',
      awayTeamId: '',
      division: 'A',
      homeGoalie: '',
      awayGoalie: '',
      referee: '',
      venue: '',
      homeScore: '',
      awayScore: '',
      homeEmptyNetGoals: '',
      awayEmptyNetGoals: '',
      shootout: false
    });
    setResultsData({
      homeShots: '',
      awayShots: '',
      homeGoals: [],
      awayGoals: [],
      homePenalties: [],
      awayPenalties: []
    });
    setEditingGame(null);
    setShowModal(false);
    setActiveTab('overview');
    setShowEmptyNetGoals(false);
  };

  // Helper function to get players for a team
  const getTeamPlayers = (teamName: string) => {
    const team = teams.find(t => t.name === teamName);
    if (!team) return [];
    return players.filter(p => p.teamId === team.id);
  };

  // Helper function to get goalies (all goalies available since they're not team-specific)
  const getTeamGoalies = (teamName: string) => {
    // Return all goalies since they can play for any team
    return goalies;
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Game Schedule</h2>
          <p className="text-gray-600 mt-1">Manage game schedules and scores</p>
        </div>
        <button
          onClick={() => {
            // Set default time to 7:00 PM (19:00) when opening form
            const now = new Date();
            const today = now.toISOString().split('T')[0];
            setFormData({
              date: today,
              time: '19:00',
              homeTeamId: '',
              awayTeamId: '',
              division: 'A',
              homeGoalie: '',
              awayGoalie: '',
              referee: '',
              venue: '',
              homeScore: '',
              awayScore: '',
              homeEmptyNetGoals: '',
              awayEmptyNetGoals: ''
            });
            setShowModal(true);
          }}
          className="bg-[#e9ca8a] text-black px-6 py-3 rounded-lg hover:bg-[#d4b577] transition font-semibold shadow-lg hover:shadow-xl"
        >
          + Add New Game
        </button>
      </div>

      {/* Full Page Form */}
      {showModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-white overflow-y-auto" style={{zIndex: 900}}>
          <div className="min-h-screen pt-32">
            {/* Tabs */}
            <div className="py-6">
              <div className="max-w-2xl mx-auto flex gap-4 justify-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`px-12 py-4 font-semibold text-lg transition-all rounded-lg ${
                    activeTab === 'overview'
                      ? 'bg-[#e9ca8a] text-black shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Game Overview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('results')}
                  className={`px-12 py-4 font-semibold text-lg transition-all rounded-lg ${
                    activeTab === 'results'
                      ? 'bg-[#e9ca8a] text-black shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Game Results
                </button>
              </div>
            </div>

            <form id="game-form" onSubmit={handleSubmit} className="max-w-4xl mx-auto p-8 space-y-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="p-10 bg-white rounded-2xl border-2 border-black shadow-[0_4px_20px_rgba(233,202,138,0.15),0_8px_40px_rgba(0,0,0,0.1)] relative overflow-hidden">

              {/* Date and Time Section */}
              <div className="mb-12 relative">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Date & Time</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Game Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                      className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-black focus:border-[#e9ca8a] transition text-gray-900 font-medium text-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Game Time *
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      required
                      step="900"
                      className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-black focus:border-[#e9ca8a] transition text-gray-900 font-medium text-lg bg-white"
                      placeholder="HH:MM"
                    />
                    <p className="text-xs text-gray-600 mt-1">Use 24-hour format (e.g., 19:00 for 7:00 PM)</p>
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div className="h-0.5 bg-gradient-to-r from-transparent via-[#e9ca8a] to-transparent mb-12"></div>

              {/* Teams Section */}
              <div className="mb-12 relative">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Teams</h4>
                
                {/* Division Selection */}
                <div className="mb-8">
                  <label className="block text-sm font-bold text-gray-800 mb-4 uppercase tracking-wide">
                    Select Division *
                  </label>
                  <div className="grid grid-cols-2 gap-6">
                    <label className={`relative flex flex-col items-center justify-center px-8 py-6 rounded-xl cursor-pointer border-3 transition-all duration-300 ${formData.division === 'A' ? 'bg-gradient-to-br from-[#e9ca8a] to-[#d4b574] border-[#e9ca8a] text-black shadow-[0_0_20px_rgba(233,202,138,0.4)] scale-105' : 'bg-white border-gray-300 text-gray-700 hover:border-[#e9ca8a] hover:shadow-lg'}`}>
                      {formData.division === 'A' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"></div>
                      )}
                      <input
                        type="radio"
                        name="division"
                        value="A"
                        checked={formData.division === 'A'}
                        onChange={(e) => setFormData({ ...formData, division: e.target.value as 'A' | 'B' })}
                        className="sr-only"
                      />
                      <span className="text-4xl font-black mb-2 relative z-10">A</span>
                      <span className="font-bold text-sm uppercase tracking-wider relative z-10">Division A</span>
                      {formData.division === 'A' && (
                        <div className="absolute top-2 right-2 w-3 h-3 bg-black rounded-full animate-pulse"></div>
                      )}
                    </label>
                    <label className={`relative flex flex-col items-center justify-center px-8 py-6 rounded-xl cursor-pointer border-3 transition-all duration-300 ${formData.division === 'B' ? 'bg-gradient-to-br from-black to-gray-800 border-black text-[#e9ca8a] shadow-[0_0_20px_rgba(0,0,0,0.4)] scale-105' : 'bg-white border-gray-300 text-gray-700 hover:border-black hover:shadow-lg'}`}>
                      {formData.division === 'B' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#e9ca8a]/20 to-transparent -skew-x-12"></div>
                      )}
                      <input
                        type="radio"
                        name="division"
                        value="B"
                        checked={formData.division === 'B'}
                        onChange={(e) => setFormData({ ...formData, division: e.target.value as 'A' | 'B' })}
                        className="sr-only"
                      />
                      <span className="text-4xl font-black mb-2 relative z-10">B</span>
                      <span className="font-bold text-sm uppercase tracking-wider relative z-10">Division B</span>
                      {formData.division === 'B' && (
                        <div className="absolute top-2 right-2 w-3 h-3 bg-[#e9ca8a] rounded-full animate-pulse"></div>
                      )}
                    </label>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Home Team *
                    </label>
                    <input
                      type="text"
                      value={formData.homeTeamId}
                      onChange={(e) => setFormData({ ...formData, homeTeamId: e.target.value })}
                      required
                      className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-black focus:border-[#e9ca8a] transition text-gray-900 font-medium bg-white"
                      placeholder="Home team name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Away Team *
                    </label>
                    <input
                      type="text"
                      value={formData.awayTeamId}
                      onChange={(e) => setFormData({ ...formData, awayTeamId: e.target.value })}
                      required
                      className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-black focus:border-[#e9ca8a] transition text-gray-900 font-medium bg-white"
                      placeholder="Away team name"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Home Goalie
                    </label>
                    <select
                      value={formData.homeGoalie}
                      onChange={(e) => setFormData({ ...formData, homeGoalie: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-black focus:border-[#e9ca8a] transition text-gray-900 font-medium bg-white"
                    >
                      <option value="">Select Goalie (optional)</option>
                      {getTeamGoalies(formData.homeTeamId).map(goalie => (
                        <option key={goalie.id} value={goalie.name}>{goalie.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Away Goalie
                    </label>
                    <select
                      value={formData.awayGoalie}
                      onChange={(e) => setFormData({ ...formData, awayGoalie: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-black focus:border-[#e9ca8a] transition text-gray-900 font-medium bg-white"
                    >
                      <option value="">Select Goalie (optional)</option>
                      {getTeamGoalies(formData.awayTeamId).map(goalie => (
                        <option key={goalie.id} value={goalie.name}>{goalie.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div className="h-0.5 bg-gradient-to-r from-transparent via-[#e9ca8a] to-transparent mb-12"></div>

              {/* Referee Section */}
              <div className="mb-12 relative">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Referee</h4>
                <input
                  type="text"
                  value={formData.referee}
                  onChange={(e) => setFormData({ ...formData, referee: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-black focus:border-[#e9ca8a] transition text-gray-900 font-medium bg-white"
                  placeholder="Referee name (optional)"
                />
              </div>

              {/* Separator */}
              <div className="h-0.5 bg-gradient-to-r from-transparent via-[#e9ca8a] to-transparent mb-12"></div>

              {/* Venue Section */}
              <div className="mb-0 relative">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Venue</h4>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-black focus:border-[#e9ca8a] transition text-gray-900 font-medium bg-white"
                  placeholder="Arena name (optional)"
                />
              </div>

                </div>
              )}

              {/* Results Tab */}
              {activeTab === 'results' && (
                <div className="p-10 bg-white rounded-2xl border-2 border-black shadow-[0_4px_20px_rgba(233,202,138,0.15),0_8px_40px_rgba(0,0,0,0.1)] relative overflow-hidden space-y-12">

                  {/* Score Section */}
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Final Score</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {formData.homeTeamId || 'Home Team'} Final Score
                        </label>
                        <input
                          type="number"
                          value={formData.homeScore}
                          onChange={(e) => setFormData({ ...formData, homeScore: e.target.value })}
                          min="0"
                          className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-black focus:border-[#e9ca8a] transition text-gray-900 font-bold text-2xl bg-white"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {formData.awayTeamId || 'Away Team'} Final Score
                        </label>
                        <input
                          type="number"
                          value={formData.awayScore}
                          onChange={(e) => setFormData({ ...formData, awayScore: e.target.value })}
                          min="0"
                          className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-black focus:border-[#e9ca8a] transition text-gray-900 font-bold text-2xl bg-white"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Empty Net Goals Checkbox */}
                    <div className="mt-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showEmptyNetGoals}
                          onChange={(e) => {
                            setShowEmptyNetGoals(e.target.checked);
                            // Clear empty net goals if unchecked
                            if (!e.target.checked) {
                              setFormData({ ...formData, homeEmptyNetGoals: '', awayEmptyNetGoals: '' });
                            }
                          }}
                          className="w-5 h-5 text-[#e9ca8a] border-gray-300 rounded focus:ring-[#e9ca8a]"
                        />
                        <span className="ml-3 text-sm font-semibold text-gray-700">
                          Were there any empty net goals in this game?
                        </span>
                      </label>
                    </div>

                    {/* Shootout Checkbox */}
                    <div className="mt-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.shootout}
                          onChange={(e) => {
                            setFormData({ ...formData, shootout: e.target.checked });
                          }}
                          className="w-5 h-5 text-[#e9ca8a] border-gray-300 rounded focus:ring-[#e9ca8a]"
                        />
                        <span className="ml-3 text-sm font-semibold text-gray-700">
                          Was this game decided by shootout?
                        </span>
                      </label>
                      {formData.shootout && (
                        <p className="ml-8 mt-2 text-sm text-gray-600">
                          <strong>Note:</strong> For shootout games, the team with the higher final score will receive 2 points, and the losing team will receive 1 point.
                        </p>
                      )}
                    </div>

                    {/* Empty Net Goals Fields - Show only when checkbox is checked */}
                    {showEmptyNetGoals && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-black">
                        <p className="text-sm text-gray-700 mb-3">
                          <strong>Note:</strong> The final score above should include ALL goals scored (including empty net goals). Empty net goals are tracked separately below for goalie statistics.
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              {formData.homeTeamId || 'Home Team'} Empty Net Goals
                            </label>
                            <input
                              type="number"
                              value={formData.homeEmptyNetGoals}
                              onChange={(e) => setFormData({ ...formData, homeEmptyNetGoals: e.target.value })}
                              min="0"
                              className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-[#e9ca8a] focus:border-[#e9ca8a] transition text-gray-900 font-medium bg-white"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              {formData.awayTeamId || 'Away Team'} Empty Net Goals
                            </label>
                            <input
                              type="number"
                              value={formData.awayEmptyNetGoals}
                              onChange={(e) => setFormData({ ...formData, awayEmptyNetGoals: e.target.value })}
                              min="0"
                              className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-[#e9ca8a] focus:border-[#e9ca8a] transition text-gray-900 font-medium bg-white"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Separator */}
                  <div className="h-0.5 bg-gradient-to-r from-transparent via-[#e9ca8a] to-transparent"></div>

                  {/* Shots Section */}
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Total Shots</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {formData.homeTeamId || 'Home Team'} Shots
                        </label>
                        <input
                          type="number"
                          value={resultsData.homeShots}
                          onChange={(e) => setResultsData({ ...resultsData, homeShots: e.target.value })}
                          min="0"
                          className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-black focus:border-[#e9ca8a] transition text-gray-900 font-bold text-xl bg-white"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {formData.awayTeamId || 'Away Team'} Shots
                        </label>
                        <input
                          type="number"
                          value={resultsData.awayShots}
                          onChange={(e) => setResultsData({ ...resultsData, awayShots: e.target.value })}
                          min="0"
                          className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-black focus:border-[#e9ca8a] transition text-gray-900 font-bold text-xl bg-white"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Separator */}
                  <div className="h-0.5 bg-gradient-to-r from-transparent via-[#e9ca8a] to-transparent"></div>

                  {/* Goals Section */}
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Goals</h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Home Team Goals */}
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <h5 className="font-semibold text-gray-700">{formData.homeTeamId || 'Home Team'}</h5>
                          <button
                            type="button"
                            onClick={() => addGoal('home')}
                            className="bg-[#e9ca8a] text-black px-5 py-2.5 rounded-lg font-bold text-sm transition"
                          >
                            + Add Goal
                          </button>
                        </div>
                        <div className="space-y-3">
                          {resultsData.homeGoals.map((goal, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg border-2 border-black">
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-bold text-gray-900">Goal #{index + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => removeGoal('home', index)}
                                  className="text-black text-sm font-semibold hover:text-red-600 transition-colors"
                                >
                                  Remove
                                </button>
                              </div>
                              <div className="space-y-2">
                                <select
                                  value={goal.scorer}
                                  onChange={(e) => updateGoal('home', index, 'scorer', e.target.value)}
                                  className="w-full px-3 py-2.5 border-2 border-black rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-black transition"
                                >
                                  <option value="">Select Scorer</option>
                                  {getTeamPlayers(formData.homeTeamId).map(player => (
                                    <option key={player.id} value={player.name}>{player.name}</option>
                                  ))}
                                </select>
                                <select
                                  value={goal.assist1}
                                  onChange={(e) => updateGoal('home', index, 'assist1', e.target.value)}
                                  className="w-full px-3 py-2.5 border-2 border-black rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-black transition"
                                >
                                  <option value="">Assist 1 (optional)</option>
                                  {getTeamPlayers(formData.homeTeamId).map(player => (
                                    <option key={player.id} value={player.name}>{player.name}</option>
                                  ))}
                                </select>
                                <select
                                  value={goal.assist2}
                                  onChange={(e) => updateGoal('home', index, 'assist2', e.target.value)}
                                  className="w-full px-3 py-2.5 border-2 border-black rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-black transition"
                                >
                                  <option value="">Assist 2 (optional)</option>
                                  {getTeamPlayers(formData.homeTeamId).map(player => (
                                    <option key={player.id} value={player.name}>{player.name}</option>
                                  ))}
                                </select>
                                <input
                                  type="text"
                                  value={goal.time}
                                  onChange={(e) => updateGoal('home', index, 'time', e.target.value)}
                                  placeholder="Time (e.g., 34:30)"
                                  className="w-full px-3 py-2.5 border-2 border-black rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-black transition"
                                />
                              </div>
                            </div>
                          ))}
                          {resultsData.homeGoals.length === 0 && (
                            <p className="text-gray-400 text-center py-3 text-sm">No goals yet</p>
                          )}
                        </div>
                      </div>

                      {/* Away Team Goals */}
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <h5 className="font-semibold text-gray-700">{formData.awayTeamId || 'Away Team'}</h5>
                          <button
                            type="button"
                            onClick={() => addGoal('away')}
                            className="bg-black text-[#e9ca8a] px-5 py-2.5 rounded-lg font-bold text-sm transition"
                          >
                            + Add Goal
                          </button>
                        </div>
                        <div className="space-y-3">
                          {resultsData.awayGoals.map((goal, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg border-2 border-black">
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-bold text-gray-900">Goal #{index + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => removeGoal('away', index)}
                                  className="text-black text-sm font-semibold hover:text-red-600 transition-colors"
                                >
                                  Remove
                                </button>
                              </div>
                              <div className="space-y-2">
                                <select
                                  value={goal.scorer}
                                  onChange={(e) => updateGoal('away', index, 'scorer', e.target.value)}
                                  className="w-full px-3 py-2.5 border-2 border-black rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-black transition"
                                >
                                  <option value="">Select Scorer</option>
                                  {getTeamPlayers(formData.awayTeamId).map(player => (
                                    <option key={player.id} value={player.name}>{player.name}</option>
                                  ))}
                                </select>
                                <select
                                  value={goal.assist1}
                                  onChange={(e) => updateGoal('away', index, 'assist1', e.target.value)}
                                  className="w-full px-3 py-2.5 border-2 border-black rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-black transition"
                                >
                                  <option value="">Assist 1 (optional)</option>
                                  {getTeamPlayers(formData.awayTeamId).map(player => (
                                    <option key={player.id} value={player.name}>{player.name}</option>
                                  ))}
                                </select>
                                <select
                                  value={goal.assist2}
                                  onChange={(e) => updateGoal('away', index, 'assist2', e.target.value)}
                                  className="w-full px-3 py-2.5 border-2 border-black rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-black transition"
                                >
                                  <option value="">Assist 2 (optional)</option>
                                  {getTeamPlayers(formData.awayTeamId).map(player => (
                                    <option key={player.id} value={player.name}>{player.name}</option>
                                  ))}
                                </select>
                                <input
                                  type="text"
                                  value={goal.time}
                                  onChange={(e) => updateGoal('away', index, 'time', e.target.value)}
                                  placeholder="Time (e.g., 34:30)"
                                  className="w-full px-3 py-2.5 border-2 border-black rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-black transition"
                                />
                              </div>
                            </div>
                          ))}
                          {resultsData.awayGoals.length === 0 && (
                            <p className="text-gray-400 text-center py-3 text-sm">No goals yet</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Separator */}
                  <div className="h-0.5 bg-gradient-to-r from-transparent via-[#e9ca8a] to-transparent"></div>

                  {/* Penalties Section */}
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Penalties</h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Home Team Penalties */}
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <h5 className="font-semibold text-gray-700">{formData.homeTeamId || 'Home Team'}</h5>
                          <button
                            type="button"
                            onClick={() => addPenalty('home')}
                            className="bg-[#e9ca8a] text-black px-5 py-2.5 rounded-lg font-bold text-sm transition"
                          >
                            + Add Penalty
                          </button>
                        </div>
                        <div className="space-y-3">
                          {resultsData.homePenalties.map((penalty, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg border-2 border-black">
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-bold text-gray-900">Penalty #{index + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => removePenalty('home', index)}
                                  className="text-black text-sm font-semibold hover:text-red-600 transition-colors"
                                >
                                  Remove
                                </button>
                              </div>
                              <div className="space-y-2">
                                <select
                                  value={penalty.player}
                                  onChange={(e) => updatePenalty('home', index, 'player', e.target.value)}
                                  className="w-full px-3 py-2.5 border-2 border-black rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-black transition"
                                >
                                  <option value="">Select Player</option>
                                  {getTeamPlayers(formData.homeTeamId).map(player => (
                                    <option key={player.id} value={player.name}>{player.name}</option>
                                  ))}
                                </select>
                                <input
                                  type="text"
                                  value={penalty.infraction}
                                  onChange={(e) => updatePenalty('home', index, 'infraction', e.target.value)}
                                  placeholder="Infraction (e.g., Tripping)"
                                  className="w-full px-3 py-2.5 border-2 border-black rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-black transition"
                                />
                                <input
                                  type="number"
                                  value={penalty.minutes}
                                  onChange={(e) => updatePenalty('home', index, 'minutes', e.target.value)}
                                  placeholder="Minutes"
                                  min="0"
                                  className="w-full px-3 py-2.5 border-2 border-black rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-black transition"
                                />
                              </div>
                            </div>
                          ))}
                          {resultsData.homePenalties.length === 0 && (
                            <p className="text-gray-400 text-center py-3 text-sm">No penalties yet</p>
                          )}
                        </div>
                      </div>

                      {/* Away Team Penalties */}
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <h5 className="font-semibold text-gray-700">{formData.awayTeamId || 'Away Team'}</h5>
                          <button
                            type="button"
                            onClick={() => addPenalty('away')}
                            className="bg-black text-[#e9ca8a] px-5 py-2.5 rounded-lg font-bold text-sm transition"
                          >
                            + Add Penalty
                          </button>
                        </div>
                        <div className="space-y-3">
                          {resultsData.awayPenalties.map((penalty, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg border-2 border-black">
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-bold text-gray-900">Penalty #{index + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => removePenalty('away', index)}
                                  className="text-black text-sm font-semibold hover:text-red-600 transition-colors"
                                >
                                  Remove
                                </button>
                              </div>
                              <div className="space-y-2">
                                <select
                                  value={penalty.player}
                                  onChange={(e) => updatePenalty('away', index, 'player', e.target.value)}
                                  className="w-full px-3 py-2.5 border-2 border-black rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-black transition"
                                >
                                  <option value="">Select Player</option>
                                  {getTeamPlayers(formData.awayTeamId).map(player => (
                                    <option key={player.id} value={player.name}>{player.name}</option>
                                  ))}
                                </select>
                                <input
                                  type="text"
                                  value={penalty.infraction}
                                  onChange={(e) => updatePenalty('away', index, 'infraction', e.target.value)}
                                  placeholder="Infraction (e.g., Tripping)"
                                  className="w-full px-3 py-2.5 border-2 border-black rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-black transition"
                                />
                                <input
                                  type="number"
                                  value={penalty.minutes}
                                  onChange={(e) => updatePenalty('away', index, 'minutes', e.target.value)}
                                  placeholder="Minutes"
                                  min="0"
                                  className="w-full px-3 py-2.5 border-2 border-black rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-black transition"
                                />
                              </div>
                            </div>
                          ))}
                          {resultsData.awayPenalties.length === 0 && (
                            <p className="text-gray-400 text-center py-3 text-sm">No penalties yet</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </form>

            {/* Action Buttons */}
            <div className="max-w-4xl mx-auto px-8 pb-8 flex gap-4 justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="px-10 py-4 bg-gray-200 hover:bg-gray-300 border border-gray-300 rounded-lg transition-all duration-300 font-bold text-base text-gray-700 hover:text-gray-900"
              >
                Close
              </button>
              <button
                type="submit"
                form="game-form"
                disabled={saving}
                className={`relative overflow-hidden flex items-center justify-center gap-2 px-12 py-4 rounded-lg transition-all duration-500 font-bold text-base tracking-wide uppercase ${
                  saving
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-200'
                    : 'bg-[#e9ca8a] text-black border-2 border-[#e9ca8a] hover:bg-[#d4b574] hover:border-[#d4b574] hover:scale-105 hover:shadow-2xl'
                }`}
              >
                {saving && (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                <span>{saving ? 'Saving...' : (editingGame ? 'Update Game' : 'Create Game')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Games Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <table className="w-full">
          <thead className="bg-[#faf6ee] border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left font-bold text-gray-700">Game #</th>
              <th className="px-6 py-4 text-left font-bold text-gray-700">Date/Time</th>
              <th className="px-6 py-4 text-left font-bold text-gray-700">Matchup</th>
              <th className="px-6 py-4 text-center font-bold text-gray-700">Division</th>
              <th className="px-6 py-4 text-left font-bold text-gray-700">Venue</th>
              <th className="px-6 py-4 text-center font-bold text-gray-700">Score</th>
              <th className="px-6 py-4 text-center font-bold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game, index) => {
              return (
                <tr key={game.id} className={`border-b hover:bg-[#fcfaf5] transition ${index % 2 === 0 ? 'bg-white' : 'bg-[#faf6ee]'}`}>
                  <td className="px-6 py-4 text-black font-bold text-lg">
                    #{game.gameNumber}
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {new Date(game.date).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-semibold">
                    {game.awayTeamId} <span className="text-gray-500">@</span> {game.homeTeamId}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      game.division === 'A' ? 'bg-[#e9ca8a] text-black' : 'bg-black text-[#e9ca8a]'
                    }`}>
                      Division {game.division}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{game.venue || '-'}</td>
                  <td className="px-6 py-4 text-center text-gray-900 font-bold text-lg">
                    {game.homeScore !== undefined && game.awayScore !== undefined
                      ? `${game.awayScore} - ${game.homeScore}`
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleEdit(game)}
                      className="text-black hover:opacity-60 font-semibold mr-4 transition"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(game.id)}
                      className="text-red-600 hover:text-red-800 font-semibold hover:underline"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {games.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">🏒</div>
            <p className="text-lg font-semibold">No games scheduled yet</p>
            <p className="text-sm mt-2">Click "Add New Game" to create your first game</p>
          </div>
        )}
      </div>
    </div>
  );
}