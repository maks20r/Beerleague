'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getPlayerById, updatePlayer, getTeams } from '@/lib/db';
import { Player, Team } from '@/types';

interface EditPlayerClientProps {
  playerId: string;
}

export default function EditPlayerClient({ playerId }: EditPlayerClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const teamId = searchParams.get('teamId');

  const [player, setPlayer] = useState<Player | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [playerForm, setPlayerForm] = useState({
    name: '',
    teamId: '',
    jerseyNumber: '',
    position: 'C' as 'C' | 'LW' | 'RW' | 'D' | 'G',
    goals: '0',
    assists: '0',
    points: '0',
    penaltyMinutes: '0'
  });

  useEffect(() => {
    fetchData();
  }, [playerId]);

  const fetchData = async () => {
    try {
      const [playerData, teamsData] = await Promise.all([
        getPlayerById(playerId),
        getTeams()
      ]);

      if (!playerData) {
        alert('Player not found');
        router.push('/admin/rosters');
        return;
      }

      setPlayer(playerData);
      setTeams(teamsData);

      // Pre-fill form with existing player data
      setPlayerForm({
        name: playerData.name,
        teamId: playerData.teamId,
        jerseyNumber: playerData.jerseyNumber.toString(),
        position: playerData.position,
        goals: playerData.goals.toString(),
        assists: playerData.assists.toString(),
        points: playerData.points.toString(),
        penaltyMinutes: playerData.penaltyMinutes.toString()
      });
    } catch (error) {
      console.error('Error fetching player:', error);
      alert('Error loading player data');
      router.push('/admin/rosters');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const playerData = {
      name: playerForm.name,
      teamId: playerForm.teamId,
      jerseyNumber: parseInt(playerForm.jerseyNumber),
      position: playerForm.position,
      goals: parseInt(playerForm.goals),
      assists: parseInt(playerForm.assists),
      points: parseInt(playerForm.goals) + parseInt(playerForm.assists),
      penaltyMinutes: parseInt(playerForm.penaltyMinutes)
    };

    try {
      await updatePlayer(playerId, playerData);
      // Redirect back with teamId to preserve the selected team view
      const redirectUrl = teamId ? `/admin/rosters?teamId=${teamId}` : '/admin/rosters';
      router.push(redirectUrl);
    } catch (error) {
      console.error('Error updating player:', error);
      alert('Error updating player. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading player...</div>;
  }

  if (!player) {
    return <div className="text-center py-12">Player not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <div className="mb-6">
          <button
            onClick={() => {
              const backUrl = teamId ? `/admin/rosters?teamId=${teamId}` : '/admin/rosters';
              router.push(backUrl);
            }}
            className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2 mb-4"
          >
            ← Back to Rosters
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Player: {player.name}</h1>
        </div>

        <form id="player-form" onSubmit={handleSubmit} className="space-y-6 overflow-x-hidden">
          <div className="p-4 sm:p-10 bg-white rounded-2xl border-2 border-black shadow-[0_4px_20px_rgba(233,202,138,0.15),0_8px_40px_rgba(0,0,0,0.1)] relative overflow-hidden">

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Player Name *
                </label>
                <input
                  type="text"
                  value={playerForm.name}
                  onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-black focus:border-[#e9ca8a] transition text-gray-900 font-medium text-lg bg-white"
                  placeholder="Player name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Team *
                </label>
                <select
                  value={playerForm.teamId}
                  onChange={(e) => setPlayerForm({ ...playerForm, teamId: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-black focus:border-[#e9ca8a] transition text-gray-900 font-medium text-lg bg-white"
                >
                  <option value="">Select team</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Jersey Number *
                  </label>
                  <input
                    type="number"
                    value={playerForm.jerseyNumber}
                    onChange={(e) => setPlayerForm({ ...playerForm, jerseyNumber: e.target.value })}
                    required
                    min="0"
                    max="99"
                    className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-black focus:border-[#e9ca8a] transition text-gray-900 font-medium text-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Position *
                  </label>
                  <select
                    value={playerForm.position}
                    onChange={(e) => setPlayerForm({ ...playerForm, position: e.target.value as any })}
                    className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-black focus:border-[#e9ca8a] transition text-gray-900 font-medium text-lg bg-white"
                  >
                    <option value="C">Center (C)</option>
                    <option value="LW">Left Wing (LW)</option>
                    <option value="RW">Right Wing (RW)</option>
                    <option value="D">Defense (D)</option>
                    <option value="G">Goalie (G)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Goals
                  </label>
                  <input
                    type="number"
                    value={playerForm.goals}
                    onChange={(e) => setPlayerForm({ ...playerForm, goals: e.target.value })}
                    min="0"
                    className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-black focus:border-[#e9ca8a] transition text-gray-900 font-medium text-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Assists
                  </label>
                  <input
                    type="number"
                    value={playerForm.assists}
                    onChange={(e) => setPlayerForm({ ...playerForm, assists: e.target.value })}
                    min="0"
                    className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-black focus:border-[#e9ca8a] transition text-gray-900 font-medium text-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Penalty Minutes
                  </label>
                  <input
                    type="number"
                    value={playerForm.penaltyMinutes}
                    onChange={(e) => setPlayerForm({ ...playerForm, penaltyMinutes: e.target.value })}
                    min="0"
                    className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-black focus:border-[#e9ca8a] transition text-gray-900 font-medium text-lg bg-white"
                  />
                </div>
              </div>
            </div>

          </div>
        </form>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end mt-6">
          <button
            type="button"
            onClick={() => {
              const cancelUrl = teamId ? `/admin/rosters?teamId=${teamId}` : '/admin/rosters';
              router.push(cancelUrl);
            }}
            className="w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 bg-gray-200 hover:bg-gray-300 border border-gray-300 rounded-lg transition-all duration-300 font-bold text-sm sm:text-base text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="player-form"
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
            <span>{saving ? 'Saving...' : 'Update Player'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
