'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getGameById, updateGame, getTeams, getPlayers, getGoalies, updateTeamStandings, updatePlayerStatsFromGame, updateGoalieStatsFromGame } from '@/lib/db';
import { Game, Team, Player, Goalie } from '@/types';

interface EditGameClientProps {
  gameId: string;
}

export default function EditGameClient({ gameId }: EditGameClientProps) {
  const router = useRouter();

  const [game, setGame] = useState<Game | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [goalies, setGoalies] = useState<Goalie[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'results'>('overview');
  const [goalsActiveTeam, setGoalsActiveTeam] = useState<'home' | 'away'>('home');
  const [penaltiesActiveTeam, setPenaltiesActiveTeam] = useState<'home' | 'away'>('home');

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

  const [showEmptyNetGoals, setShowEmptyNetGoals] = useState(false);

  useEffect(() => {
    fetchData();
  }, [gameId]);

  // Auto-add new goal when last one is filled
  useEffect(() => {
    // Check home goals
    const lastHomeGoal = resultsData.homeGoals[resultsData.homeGoals.length - 1];
    if (!lastHomeGoal || (lastHomeGoal.scorer || lastHomeGoal.assist1 || lastHomeGoal.assist2 || lastHomeGoal.time)) {
      // If there's no last goal or the last goal has some data, ensure there's an empty one
      const hasEmptyHomeGoal = resultsData.homeGoals.some(goal => !goal.scorer && !goal.assist1 && !goal.assist2 && !goal.time);
      if (!hasEmptyHomeGoal) {
        setResultsData(prev => ({
          ...prev,
          homeGoals: [...prev.homeGoals, { scorer: '', assist1: '', assist2: '', time: '' }]
        }));
      }
    }

    // Check away goals
    const lastAwayGoal = resultsData.awayGoals[resultsData.awayGoals.length - 1];
    if (!lastAwayGoal || (lastAwayGoal.scorer || lastAwayGoal.assist1 || lastAwayGoal.assist2 || lastAwayGoal.time)) {
      // If there's no last goal or the last goal has some data, ensure there's an empty one
      const hasEmptyAwayGoal = resultsData.awayGoals.some(goal => !goal.scorer && !goal.assist1 && !goal.assist2 && !goal.time);
      if (!hasEmptyAwayGoal) {
        setResultsData(prev => ({
          ...prev,
          awayGoals: [...prev.awayGoals, { scorer: '', assist1: '', assist2: '', time: '' }]
        }));
      }
    }

    // Check home penalties
    const lastHomePenalty = resultsData.homePenalties[resultsData.homePenalties.length - 1];
    if (!lastHomePenalty || (lastHomePenalty.player || lastHomePenalty.infraction || lastHomePenalty.minutes)) {
      // If there's no last penalty or the last penalty has some data, ensure there's an empty one
      const hasEmptyHomePenalty = resultsData.homePenalties.some(penalty => !penalty.player && !penalty.infraction && !penalty.minutes);
      if (!hasEmptyHomePenalty) {
        setResultsData(prev => ({
          ...prev,
          homePenalties: [...prev.homePenalties, { player: '', infraction: '', minutes: '' }]
        }));
      }
    }

    // Check away penalties
    const lastAwayPenalty = resultsData.awayPenalties[resultsData.awayPenalties.length - 1];
    if (!lastAwayPenalty || (lastAwayPenalty.player || lastAwayPenalty.infraction || lastAwayPenalty.minutes)) {
      // If there's no last penalty or the last penalty has some data, ensure there's an empty one
      const hasEmptyAwayPenalty = resultsData.awayPenalties.some(penalty => !penalty.player && !penalty.infraction && !penalty.minutes);
      if (!hasEmptyAwayPenalty) {
        setResultsData(prev => ({
          ...prev,
          awayPenalties: [...prev.awayPenalties, { player: '', infraction: '', minutes: '' }]
        }));
      }
    }
  }, [resultsData.homeGoals, resultsData.awayGoals, resultsData.homePenalties, resultsData.awayPenalties]);

  const fetchData = async () => {
    try {
      const [gameData, teamsData, playersData, goaliesData] = await Promise.all([
        getGameById(gameId),
        getTeams(),
        getPlayers(),
        getGoalies()
      ]);

      if (!gameData) {
        alert('Game not found');
        router.push('/admin/games');
        return;
      }

      setGame(gameData);
      setTeams(teamsData);
      setPlayers(playersData);
      setGoalies(goaliesData);

      // Pre-fill form with existing game data
      const gameDate = new Date(gameData.date);
      setFormData({
        date: gameDate.toISOString().split('T')[0],
        time: gameDate.toTimeString().slice(0, 5),
        homeTeamId: gameData.homeTeamId,
        awayTeamId: gameData.awayTeamId,
        division: gameData.division,
        homeGoalie: gameData.homeGoalie || '',
        awayGoalie: gameData.awayGoalie || '',
        referee: gameData.referee || '',
        venue: gameData.venue || '',
        homeScore: gameData.homeScore?.toString() || '',
        awayScore: gameData.awayScore?.toString() || '',
        homeEmptyNetGoals: gameData.homeEmptyNetGoals?.toString() || '',
        awayEmptyNetGoals: gameData.awayEmptyNetGoals?.toString() || '',
        shootout: gameData.shootout || false
      });

      setResultsData({
        homeShots: gameData.homeShots?.toString() || '',
        awayShots: gameData.awayShots?.toString() || '',
        homeGoals: (gameData.homeGoals && gameData.homeGoals.length > 0) ? gameData.homeGoals : [{ scorer: '', assist1: '', assist2: '', time: '' }],
        awayGoals: (gameData.awayGoals && gameData.awayGoals.length > 0) ? gameData.awayGoals : [{ scorer: '', assist1: '', assist2: '', time: '' }],
        homePenalties: (gameData.homePenalties && gameData.homePenalties.length > 0) ? gameData.homePenalties : [{ player: '', infraction: '', minutes: '' }],
        awayPenalties: (gameData.awayPenalties && gameData.awayPenalties.length > 0) ? gameData.awayPenalties : [{ player: '', infraction: '', minutes: '' }]
      });
    } catch (error) {
      console.error('Error fetching game:', error);
      alert('Error loading game data');
      router.push('/admin/games');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const gameDate = new Date(`${formData.date}T${formData.time}`);
      const homeScore = formData.homeScore !== '' ? parseInt(formData.homeScore) : null;
      const awayScore = formData.awayScore !== '' ? parseInt(formData.awayScore) : null;
      const gameStatus = (homeScore !== null && awayScore !== null) ? 'completed' : 'scheduled';

      const gameData: any = {
        date: gameDate,
        homeTeamId: formData.homeTeamId,
        awayTeamId: formData.awayTeamId,
        division: formData.division,
        homeGoalie: formData.homeGoalie || '',
        awayGoalie: formData.awayGoalie || '',
        referee: formData.referee || '',
        venue: formData.venue || '',
        shootout: formData.shootout,
        status: gameStatus,
        homeGoals: resultsData.homeGoals.filter(g => g.scorer || g.assist1 || g.assist2 || g.time),
        awayGoals: resultsData.awayGoals.filter(g => g.scorer || g.assist1 || g.assist2 || g.time),
        homePenalties: resultsData.homePenalties.filter(p => p.player || p.infraction || p.minutes),
        awayPenalties: resultsData.awayPenalties.filter(p => p.player || p.infraction || p.minutes)
      };

      // Only add fields if they have values
      if (homeScore !== null) gameData.homeScore = homeScore;
      if (awayScore !== null) gameData.awayScore = awayScore;
      if (formData.homeEmptyNetGoals !== '') gameData.homeEmptyNetGoals = parseInt(formData.homeEmptyNetGoals);
      if (formData.awayEmptyNetGoals !== '') gameData.awayEmptyNetGoals = parseInt(formData.awayEmptyNetGoals);
      if (resultsData.homeShots !== '') gameData.homeShots = parseInt(resultsData.homeShots);
      if (resultsData.awayShots !== '') gameData.awayShots = parseInt(resultsData.awayShots);

      await updateGame(gameId, gameData);

      // Update team standings if game is completed
      if (gameStatus === 'completed' && homeScore !== null && awayScore !== null) {
        // Pass the old game data so standings can be properly updated
        const oldGameData = game ? {
          homeScore: game.homeScore,
          awayScore: game.awayScore,
          shootout: game.shootout
        } : undefined;
        await updateTeamStandings(gameId, oldGameData);

        // Prepare old game data for stats update
        const oldPlayerGameData = game && game.homeScore !== undefined && game.awayScore !== undefined ? {
          homeTeamId: game.homeTeamId,
          awayTeamId: game.awayTeamId,
          homeGoals: game.homeGoals || [],
          awayGoals: game.awayGoals || [],
          homePenalties: game.homePenalties || [],
          awayPenalties: game.awayPenalties || []
        } : undefined;

        // Update player stats from game results
        await updatePlayerStatsFromGame(gameId, {
          homeTeamId: formData.homeTeamId,
          awayTeamId: formData.awayTeamId,
          homeGoals: resultsData.homeGoals.filter(g => g.scorer || g.assist1 || g.assist2 || g.time),
          awayGoals: resultsData.awayGoals.filter(g => g.scorer || g.assist1 || g.assist2 || g.time),
          homePenalties: resultsData.homePenalties.filter(p => p.player || p.infraction || p.minutes),
          awayPenalties: resultsData.awayPenalties.filter(p => p.player || p.infraction || p.minutes)
        }, oldPlayerGameData);

        // Update goalie stats from game results
        if (formData.homeGoalie || formData.awayGoalie) {
          const oldGoalieGameData = game && game.homeScore !== undefined && game.awayScore !== undefined ? {
            homeTeamId: game.homeTeamId,
            awayTeamId: game.awayTeamId,
            homeGoalie: game.homeGoalie,
            awayGoalie: game.awayGoalie,
            homeScore: game.homeScore || 0,
            awayScore: game.awayScore || 0,
            homeShots: game.homeShots || 0,
            awayShots: game.awayShots || 0,
            homeEmptyNetGoals: game.homeEmptyNetGoals || 0,
            awayEmptyNetGoals: game.awayEmptyNetGoals || 0
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
            homeEmptyNetGoals: formData.homeEmptyNetGoals !== '' ? parseInt(formData.homeEmptyNetGoals) : 0,
            awayEmptyNetGoals: formData.awayEmptyNetGoals !== '' ? parseInt(formData.awayEmptyNetGoals) : 0
          }, oldGoalieGameData);
        }
      }

      router.push('/admin/games');
    } catch (error) {
      console.error('Error updating game:', error);
      alert('Error updating game. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const removeGoal = (team: 'home' | 'away', index: number) => {
    if (team === 'home') {
      setResultsData({ ...resultsData, homeGoals: resultsData.homeGoals.filter((_, i) => i !== index) });
    } else {
      setResultsData({ ...resultsData, awayGoals: resultsData.awayGoals.filter((_, i) => i !== index) });
    }
  };

  const updateGoal = (team: 'home' | 'away', index: number, field: string, value: string) => {
    if (team === 'home') {
      const updated = [...resultsData.homeGoals];
      updated[index] = { ...updated[index], [field]: value };
      setResultsData({ ...resultsData, homeGoals: updated });
    } else {
      const updated = [...resultsData.awayGoals];
      updated[index] = { ...updated[index], [field]: value };
      setResultsData({ ...resultsData, awayGoals: updated });
    }
  };

  const removePenalty = (team: 'home' | 'away', index: number) => {
    if (team === 'home') {
      setResultsData({ ...resultsData, homePenalties: resultsData.homePenalties.filter((_, i) => i !== index) });
    } else {
      setResultsData({ ...resultsData, awayPenalties: resultsData.awayPenalties.filter((_, i) => i !== index) });
    }
  };

  const updatePenalty = (team: 'home' | 'away', index: number, field: string, value: string) => {
    if (team === 'home') {
      const updated = [...resultsData.homePenalties];
      updated[index] = { ...updated[index], [field]: value };
      setResultsData({ ...resultsData, homePenalties: updated });
    } else {
      const updated = [...resultsData.awayPenalties];
      updated[index] = { ...updated[index], [field]: value };
      setResultsData({ ...resultsData, awayPenalties: updated });
    }
  };

  const getTeamPlayers = (teamName: string) => {
    const team = teams.find(t => t.name === teamName);
    if (!team) return [];
    return players.filter(p => p.teamId === team.id);
  };

  const getTeamGoalies = () => {
    // Return all goalies since they can play for any team
    return goalies;
  };

  const resolvePlayerByJersey = (input: string, teamPlayers: Player[]) => {
    // If input is empty, return empty
    if (!input.trim()) return '';
    
    // Check if input is a number (jersey number)
    const jerseyNumber = parseInt(input.trim());
    if (!isNaN(jerseyNumber)) {
      const player = teamPlayers.find(p => p.jerseyNumber === jerseyNumber);
      return player ? player.name : '';
    }
    
    // If not a number, treat as player name
    return input;
  };

  if (loading) {
    return <div className="text-center py-12">Loading game...</div>;
  }

  if (!game) {
    return <div className="text-center py-12">Game not found</div>;
  }

  const homeTeamPlayers = getTeamPlayers(formData.homeTeamId);
  const awayTeamPlayers = getTeamPlayers(formData.awayTeamId);
  const homeTeamGoalies = getTeamGoalies();
  const awayTeamGoalies = getTeamGoalies();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/games')}
            className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2 mb-4"
          >
            ← Back to Games
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Game #{game.gameNumber}</h1>
        </div>

        {/* Tabs */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-6 sm:px-12 py-3 sm:py-4 font-semibold text-base sm:text-lg transition-all rounded-lg ${
              activeTab === 'overview'
                ? 'bg-[#e9ca8a] text-black shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Game Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('results')}
            className={`px-6 sm:px-12 py-3 sm:py-4 font-semibold text-base sm:text-lg transition-all rounded-lg ${
              activeTab === 'results'
                ? 'bg-[#e9ca8a] text-black shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Game Results
          </button>
        </div>

        <form id="game-form" onSubmit={handleSubmit} className="space-y-6 overflow-x-hidden">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-4 sm:p-10 bg-white rounded-2xl border-2 border-black shadow-[0_4px_20px_rgba(233,202,138,0.15),0_8px_40px_rgba(0,0,0,0.1)] relative overflow-hidden">

              {/* Date and Time Section */}
              <div className="mb-8 relative">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Date & Time</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Game Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                      className="w-full max-w-full box-border px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-black focus:border-[#e9ca8a] transition text-gray-900 font-medium text-lg bg-white"
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
                      className="w-full max-w-full box-border px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-black focus:border-[#e9ca8a] transition text-gray-900 font-medium text-lg bg-white"
                      placeholder="HH:MM"
                    />
                    <p className="text-xs text-gray-600 mt-1">Use 24-hour format (e.g., 19:00 for 7:00 PM)</p>
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div className="h-0.5 bg-gradient-to-r from-transparent via-[#e9ca8a] to-transparent mb-8"></div>

              {/* Teams Section */}
              <div className="mb-8 relative">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Teams</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Home Team *
                    </label>
                    <select
                      value={formData.homeTeamId}
                      onChange={(e) => setFormData({ ...formData, homeTeamId: e.target.value })}
                      required
                      className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-black focus:border-[#e9ca8a] transition text-gray-900 font-medium text-lg bg-white"
                    >
                      <option value="">Select home team</option>
                      {teams.filter(t => t.division === formData.division).map(team => (
                        <option key={team.id} value={team.name}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Away Team *
                    </label>
                    <select
                      value={formData.awayTeamId}
                      onChange={(e) => setFormData({ ...formData, awayTeamId: e.target.value })}
                      required
                      className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-black focus:border-[#e9ca8a] transition text-gray-900 font-medium text-lg bg-white"
                    >
                      <option value="">Select away team</option>
                      {teams.filter(t => t.division === formData.division && t.name !== formData.homeTeamId).map(team => (
                        <option key={team.id} value={team.name}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Additional Details Section */}
              <div className="mb-8">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Additional Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Venue
                    </label>
                    <input
                      type="text"
                      value={formData.venue}
                      onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-black focus:border-[#e9ca8a] transition text-gray-900 font-medium text-lg bg-white"
                      placeholder="Enter venue name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Referee
                    </label>
                    <input
                      type="text"
                      value={formData.referee}
                      onChange={(e) => setFormData({ ...formData, referee: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-black focus:border-[#e9ca8a] transition text-gray-900 font-medium text-lg bg-white"
                      placeholder="Enter referee name"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && (
            <div className="p-4 sm:p-10 bg-white rounded-2xl border-2 border-black shadow-[0_4px_20px_rgba(233,202,138,0.15),0_8px_40px_rgba(0,0,0,0.1)] relative overflow-hidden">

              {/* Scores Section */}
              <div className="mb-8">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Final Score</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Home Score {formData.homeTeamId && `(${formData.homeTeamId})`}
                    </label>
                    <input
                      type="number"
                      value={formData.homeScore}
                      onChange={(e) => setFormData({ ...formData, homeScore: e.target.value })}
                      min="0"
                      className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-black focus:border-[#e9ca8a] transition text-gray-900 font-medium text-lg bg-white"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Away Score {formData.awayTeamId && `(${formData.awayTeamId})`}
                    </label>
                    <input
                      type="number"
                      value={formData.awayScore}
                      onChange={(e) => setFormData({ ...formData, awayScore: e.target.value })}
                      min="0"
                      className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-black focus:border-[#e9ca8a] transition text-gray-900 font-medium text-lg bg-white"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Special Options */}
                {/* Shootout Toggle */}
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="shootout"
                    checked={formData.shootout}
                    onChange={(e) => setFormData({ ...formData, shootout: e.target.checked })}
                    className="w-5 h-5 text-[#e9ca8a] border-gray-300 rounded focus:ring-[#e9ca8a]"
                  />
                  <label htmlFor="shootout" className="ml-3 text-sm font-semibold text-gray-700">
                    Game decided by shootout
                  </label>
                </div>

                {/* Empty Net Goals Toggle */}
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="emptyNetGoals"
                    checked={showEmptyNetGoals}
                    onChange={(e) => setShowEmptyNetGoals(e.target.checked)}
                    className="w-5 h-5 text-[#e9ca8a] border-gray-300 rounded focus:ring-[#e9ca8a]"
                  />
                  <label htmlFor="emptyNetGoals" className="ml-3 text-sm font-semibold text-gray-700">
                    Track empty net goals
                  </label>
                </div>

                {/* Empty Net Goals Inputs */}
                {showEmptyNetGoals && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Home Empty Net Goals
                      </label>
                      <input
                        type="number"
                        value={formData.homeEmptyNetGoals}
                        onChange={(e) => setFormData({ ...formData, homeEmptyNetGoals: e.target.value })}
                        min="0"
                        className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-black focus:border-[#e9ca8a] transition text-gray-900 font-medium text-lg bg-white"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Away Empty Net Goals
                      </label>
                      <input
                        type="number"
                        value={formData.awayEmptyNetGoals}
                        onChange={(e) => setFormData({ ...formData, awayEmptyNetGoals: e.target.value })}
                        min="0"
                        className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-black focus:border-[#e9ca8a] transition text-gray-900 font-medium text-lg bg-white"
                        placeholder="0"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Separator */}
              <div className="h-0.5 bg-gradient-to-r from-transparent via-[#e9ca8a] to-transparent mb-8"></div>

              {/* Goalies Section */}
              <div className="mb-8">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Goalies</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Home Goalie
                    </label>
                    <select
                      value={formData.homeGoalie}
                      onChange={(e) => setFormData({ ...formData, homeGoalie: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-black focus:border-[#e9ca8a] transition text-gray-900 font-medium text-lg bg-white"
                    >
                      <option value="">Select goalie</option>
                      {homeTeamGoalies.map(goalie => (
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
                      className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-black focus:border-[#e9ca8a] transition text-gray-900 font-medium text-lg bg-white"
                    >
                      <option value="">Select goalie</option>
                      {awayTeamGoalies.map(goalie => (
                        <option key={goalie.id} value={goalie.name}>{goalie.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div className="h-0.5 bg-gradient-to-r from-transparent via-[#e9ca8a] to-transparent mb-8"></div>

              {/* Shots Section */}
              <div className="mb-8">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Shots on Goal</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Home Shots
                    </label>
                    <input
                      type="number"
                      value={resultsData.homeShots}
                      onChange={(e) => setResultsData({ ...resultsData, homeShots: e.target.value })}
                      min="0"
                      className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-black focus:border-[#e9ca8a] transition text-gray-900 font-medium text-lg bg-white"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Away Shots
                    </label>
                    <input
                      type="number"
                      value={resultsData.awayShots}
                      onChange={(e) => setResultsData({ ...resultsData, awayShots: e.target.value })}
                      min="0"
                      className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-black focus:border-[#e9ca8a] transition text-gray-900 font-medium text-lg bg-white"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div className="h-0.5 bg-gradient-to-r from-transparent via-[#e9ca8a] to-transparent mb-8"></div>

              {/* Goals Section */}
              <div className="mb-8">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Goals</h4>

                {/* Mobile Team Tabs - Goals */}
                <div className="lg:hidden mb-4">
                  <div className="flex border-b border-gray-200">
                    <button
                      type="button"
                      onClick={() => setGoalsActiveTeam('home')}
                      className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                        goalsActiveTeam === 'home'
                          ? 'border-[#e9ca8a] text-gray-900 bg-[#e9ca8a]/10'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {formData.homeTeamId || 'Home Team'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setGoalsActiveTeam('away')}
                      className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                        goalsActiveTeam === 'away'
                          ? 'border-[#e9ca8a] text-gray-900 bg-[#e9ca8a]/10'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {formData.awayTeamId || 'Away Team'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Home Team Goals */}
                  <div className={`lg:block ${goalsActiveTeam === 'home' ? 'block' : 'hidden'}`}>
                    <div className="mb-3 hidden lg:block">
                      <h5 className="text-lg font-semibold text-gray-800">
                        {formData.homeTeamId || 'Home Team'} Goals
                      </h5>
                    </div>
                    {resultsData.homeGoals.map((goal, index) => (
                      <div key={index} className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-4 gap-1 sm:gap-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Time</label>
                            <input
                              type="text"
                              value={goal.time}
                              onChange={(e) => updateGoal('home', index, 'time', e.target.value)}
                              placeholder="00:00"
                              className="w-full px-1 sm:px-2 py-1 border border-gray-300 rounded text-xs bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Scorer</label>
                            <input
                              type="text"
                              value={goal.scorer}
                              onChange={(e) => {
                                const resolvedName = resolvePlayerByJersey(e.target.value, homeTeamPlayers);
                                updateGoal('home', index, 'scorer', resolvedName || e.target.value);
                              }}
                              placeholder="Jersey # or name"
                              className="w-full px-1 sm:px-2 py-1 border border-gray-300 rounded text-xs bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Assist 1</label>
                            <input
                              type="text"
                              value={goal.assist1}
                              onChange={(e) => {
                                const resolvedName = resolvePlayerByJersey(e.target.value, homeTeamPlayers);
                                updateGoal('home', index, 'assist1', resolvedName || e.target.value);
                              }}
                              placeholder="Jersey # or name"
                              className="w-full px-1 sm:px-2 py-1 border border-gray-300 rounded text-xs bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Assist 2</label>
                            <input
                              type="text"
                              value={goal.assist2}
                              onChange={(e) => {
                                const resolvedName = resolvePlayerByJersey(e.target.value, homeTeamPlayers);
                                updateGoal('home', index, 'assist2', resolvedName || e.target.value);
                              }}
                              placeholder="Jersey # or name"
                              className="w-full px-1 sm:px-2 py-1 border border-gray-300 rounded text-xs bg-white"
                            />
                          </div>
                        </div>
                        {(goal.scorer || goal.assist1 || goal.assist2 || goal.time) && (
                          <button
                            type="button"
                            onClick={() => removeGoal('home', index)}
                            className="text-red-600 hover:text-red-800 text-xs font-medium mt-2"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Away Team Goals */}
                  <div className={`lg:block ${goalsActiveTeam === 'away' ? 'block' : 'hidden'}`}>
                    <div className="mb-3 hidden lg:block">
                      <h5 className="text-lg font-semibold text-gray-800">
                        {formData.awayTeamId || 'Away Team'} Goals
                      </h5>
                    </div>
                    {resultsData.awayGoals.map((goal, index) => (
                      <div key={index} className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-4 gap-1 sm:gap-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Time</label>
                            <input
                              type="text"
                              value={goal.time}
                              onChange={(e) => updateGoal('away', index, 'time', e.target.value)}
                              placeholder="00:00"
                              className="w-full px-1 sm:px-2 py-1 border border-gray-300 rounded text-xs bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Scorer</label>
                            <input
                              type="text"
                              value={goal.scorer}
                              onChange={(e) => {
                                const resolvedName = resolvePlayerByJersey(e.target.value, awayTeamPlayers);
                                updateGoal('away', index, 'scorer', resolvedName || e.target.value);
                              }}
                              placeholder="Jersey # or name"
                              className="w-full px-1 sm:px-2 py-1 border border-gray-300 rounded text-xs bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Assist 1</label>
                            <input
                              type="text"
                              value={goal.assist1}
                              onChange={(e) => {
                                const resolvedName = resolvePlayerByJersey(e.target.value, awayTeamPlayers);
                                updateGoal('away', index, 'assist1', resolvedName || e.target.value);
                              }}
                              placeholder="Jersey # or name"
                              className="w-full px-1 sm:px-2 py-1 border border-gray-300 rounded text-xs bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Assist 2</label>
                            <input
                              type="text"
                              value={goal.assist2}
                              onChange={(e) => {
                                const resolvedName = resolvePlayerByJersey(e.target.value, awayTeamPlayers);
                                updateGoal('away', index, 'assist2', resolvedName || e.target.value);
                              }}
                              placeholder="Jersey # or name"
                              className="w-full px-1 sm:px-2 py-1 border border-gray-300 rounded text-xs bg-white"
                            />
                          </div>
                        </div>
                        {(goal.scorer || goal.assist1 || goal.assist2 || goal.time) && (
                          <button
                            type="button"
                            onClick={() => removeGoal('away', index)}
                            className="text-red-600 hover:text-red-800 text-xs font-medium mt-2"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div className="h-0.5 bg-gradient-to-r from-transparent via-[#e9ca8a] to-transparent mb-8"></div>

              {/* Penalties Section */}
              <div className="mb-8">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Penalties</h4>

                {/* Mobile Team Tabs - Penalties */}
                <div className="lg:hidden mb-4">
                  <div className="flex border-b border-gray-200">
                    <button
                      type="button"
                      onClick={() => setPenaltiesActiveTeam('home')}
                      className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                        penaltiesActiveTeam === 'home'
                          ? 'border-[#e9ca8a] text-gray-900 bg-[#e9ca8a]/10'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {formData.homeTeamId || 'Home Team'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPenaltiesActiveTeam('away')}
                      className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                        penaltiesActiveTeam === 'away'
                          ? 'border-[#e9ca8a] text-gray-900 bg-[#e9ca8a]/10'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {formData.awayTeamId || 'Away Team'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Home Team Penalties */}
                  <div className={`lg:block ${penaltiesActiveTeam === 'home' ? 'block' : 'hidden'}`}>
                    <div className="mb-3 hidden lg:block">
                      <h5 className="text-lg font-semibold text-gray-800">
                        {formData.homeTeamId || 'Home Team'} Penalties
                      </h5>
                    </div>
                    {resultsData.homePenalties.map((penalty, index) => (
                      <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                        <div className="grid grid-cols-3 gap-1 sm:gap-3 mb-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Player</label>
                            <input
                              type="text"
                              value={penalty.player}
                              onChange={(e) => {
                                const resolvedName = resolvePlayerByJersey(e.target.value, homeTeamPlayers);
                                updatePenalty('home', index, 'player', resolvedName || e.target.value);
                              }}
                              placeholder="Jersey # or name"
                              className="w-full px-1 sm:px-2 py-1 border border-gray-300 rounded text-xs bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Infraction</label>
                            <input
                              type="text"
                              value={penalty.infraction}
                              onChange={(e) => updatePenalty('home', index, 'infraction', e.target.value)}
                              placeholder="Tripping"
                              className="w-full px-1 sm:px-2 py-1 border border-gray-300 rounded text-xs bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Minutes</label>
                            <input
                              type="number"
                              value={penalty.minutes}
                              onChange={(e) => updatePenalty('home', index, 'minutes', e.target.value)}
                              placeholder="2"
                              min="0"
                              className="w-full px-1 sm:px-2 py-1 border border-gray-300 rounded text-xs bg-white"
                            />
                          </div>
                        </div>
                        {(penalty.player || penalty.infraction || penalty.minutes) && (
                          <button
                            type="button"
                            onClick={() => removePenalty('home', index)}
                            className="text-red-600 hover:text-red-800 text-xs font-medium mt-2"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Away Team Penalties */}
                  <div className={`lg:block ${penaltiesActiveTeam === 'away' ? 'block' : 'hidden'}`}>
                    <div className="mb-3 hidden lg:block">
                      <h5 className="text-lg font-semibold text-gray-800">
                        {formData.awayTeamId || 'Away Team'} Penalties
                      </h5>
                    </div>
                    {resultsData.awayPenalties.map((penalty, index) => (
                      <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                        <div className="grid grid-cols-3 gap-1 sm:gap-3 mb-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Player</label>
                            <input
                              type="text"
                              value={penalty.player}
                              onChange={(e) => {
                                const resolvedName = resolvePlayerByJersey(e.target.value, awayTeamPlayers);
                                updatePenalty('away', index, 'player', resolvedName || e.target.value);
                              }}
                              placeholder="Jersey # or name"
                              className="w-full px-1 sm:px-2 py-1 border border-gray-300 rounded text-xs bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Infraction</label>
                            <input
                              type="text"
                              value={penalty.infraction}
                              onChange={(e) => updatePenalty('away', index, 'infraction', e.target.value)}
                              placeholder="Tripping"
                              className="w-full px-1 sm:px-2 py-1 border border-gray-300 rounded text-xs bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Minutes</label>
                            <input
                              type="number"
                              value={penalty.minutes}
                              onChange={(e) => updatePenalty('away', index, 'minutes', e.target.value)}
                              placeholder="2"
                              min="0"
                              className="w-full px-1 sm:px-2 py-1 border border-gray-300 rounded text-xs bg-white"
                            />
                          </div>
                        </div>
                        {(penalty.player || penalty.infraction || penalty.minutes) && (
                          <button
                            type="button"
                            onClick={() => removePenalty('away', index)}
                            className="text-red-600 hover:text-red-800 text-xs font-medium mt-2"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}
        </form>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end mt-6">
          <button
            type="button"
            onClick={() => router.push('/admin/games')}
            className="w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 bg-gray-200 hover:bg-gray-300 border border-gray-300 rounded-lg transition-all duration-300 font-bold text-sm sm:text-base text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="game-form"
            disabled={saving}
            className={`w-full sm:w-auto relative overflow-hidden flex items-center justify-center gap-2 px-8 sm:px-12 py-3 sm:py-4 rounded-lg transition-all duration-500 font-bold text-sm sm:text-base tracking-wide uppercase ${
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
            <span>{saving ? 'Saving...' : 'Update Game'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
