'use client';

import { useEffect, useState } from 'react';
import { getTeams, getPlayers, addPlayer, updatePlayer, deletePlayer, addTeam } from '@/lib/db';
import { Team, Player } from '@/types';

export default function RostersPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDivision, setSelectedDivision] = useState<'A' | 'B'>('A');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  const [playerForm, setPlayerForm] = useState({
    name: '',
    teamId: '',
    jerseyNumber: '',
    position: 'C' as 'C' | 'LW' | 'RW' | 'D' | 'G',
    goals: '0',
    assists: '0',
    points: '0',
    penaltyMinutes: '0',
    gamesPlayed: '0'
  });

  const [teamForm, setTeamForm] = useState({
    name: '',
    division: 'A' as 'A' | 'B',
    wins: '0',
    losses: '0',
    ties: '0',
    goalsFor: '0',
    goalsAgainst: '0',
    points: '0'
  });

  useEffect(() => {
    fetchData();
  }, [selectedDivision]);

  const fetchData = async () => {
    try {
      const [teamsData, playersData] = await Promise.all([
        getTeams(selectedDivision),
        getPlayers()
      ]);
      setTeams(teamsData);
      setPlayers(playersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPlayer = async (e: React.FormEvent) => {
    e.preventDefault();

    const playerData = {
      name: playerForm.name,
      teamId: playerForm.teamId,
      jerseyNumber: parseInt(playerForm.jerseyNumber),
      position: playerForm.position,
      goals: parseInt(playerForm.goals),
      assists: parseInt(playerForm.assists),
      points: parseInt(playerForm.goals) + parseInt(playerForm.assists),
      penaltyMinutes: parseInt(playerForm.penaltyMinutes),
      gamesPlayed: parseInt(playerForm.gamesPlayed),
    };

    try {
      if (editingPlayer) {
        await updatePlayer(editingPlayer.id, playerData);
      } else {
        await addPlayer(playerData);
      }
      await fetchData();
      resetPlayerForm();
    } catch (error) {
      console.error('Error saving player:', error);
    }
  };

  const handleSubmitTeam = async (e: React.FormEvent) => {
    e.preventDefault();

    const teamData = {
      name: teamForm.name,
      division: teamForm.division,
      wins: parseInt(teamForm.wins),
      losses: parseInt(teamForm.losses),
      ties: parseInt(teamForm.ties),
      goalsFor: parseInt(teamForm.goalsFor),
      goalsAgainst: parseInt(teamForm.goalsAgainst),
      points: parseInt(teamForm.points),
    };

    try {
      await addTeam(teamData);
      await fetchData();
      resetTeamForm();
    } catch (error) {
      console.error('Error saving team:', error);
    }
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setPlayerForm({
      name: player.name,
      teamId: player.teamId,
      jerseyNumber: player.jerseyNumber.toString(),
      position: player.position,
      goals: player.goals.toString(),
      assists: player.assists.toString(),
      points: player.points.toString(),
      penaltyMinutes: player.penaltyMinutes.toString(),
      gamesPlayed: player.gamesPlayed.toString()
    });
    setShowPlayerForm(true);
  };

  const handleDeletePlayer = async (id: string) => {
    if (confirm('Are you sure you want to delete this player?')) {
      try {
        await deletePlayer(id);
        await fetchData();
      } catch (error) {
        console.error('Error deleting player:', error);
      }
    }
  };

  const resetPlayerForm = () => {
    setPlayerForm({
      name: '',
      teamId: selectedTeamId,
      jerseyNumber: '',
      position: 'C',
      goals: '0',
      assists: '0',
      points: '0',
      penaltyMinutes: '0',
      gamesPlayed: '0'
    });
    setEditingPlayer(null);
    setShowPlayerForm(false);
  };

  const resetTeamForm = () => {
    setTeamForm({
      name: '',
      division: 'A',
      wins: '0',
      losses: '0',
      ties: '0',
      goalsFor: '0',
      goalsAgainst: '0',
      points: '0'
    });
    setShowTeamForm(false);
  };

  const filteredPlayers = selectedTeamId
    ? players.filter(p => p.teamId === selectedTeamId)
    : [];

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Teams & Rosters</h2>
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


      {/* Team Form */}
      {showTeamForm && (
        <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
          <div className="min-h-screen">
            <div className="bg-green-600 text-white px-8 py-6 shadow-md">
              <div className="max-w-4xl mx-auto flex justify-between items-center">
                <div>
                  <h3 className="text-3xl font-bold">Add New Team</h3>
                  <p className="text-green-100 mt-1">Create a new team</p>
                </div>
                <button
                  onClick={resetTeamForm}
                  className="bg-green-700 hover:bg-green-800 px-6 py-3 rounded-lg transition font-semibold"
                >
                  ← Back
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitTeam} className="max-w-4xl mx-auto p-8 space-y-6">
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    value={teamForm.name}
                    onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-gray-900 font-medium"
                    placeholder="Team name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Division *
                  </label>
                  <select
                    value={teamForm.division}
                    onChange={(e) => setTeamForm({ ...teamForm, division: e.target.value as 'A' | 'B' })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-gray-900 font-medium"
                  >
                    <option value="A">Division A</option>
                    <option value="B">Division B</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={resetTeamForm}
                  className="px-8 py-4 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition font-bold text-lg"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teams Table */}
      <div className="bg-white rounded-lg shadow-lg mb-8 overflow-hidden">
        <div className="table-scroll-wrapper">
          <table className="w-full mobile-compact-table">
            <thead className="bg-[#faf6ee] border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 sticky left-0 bg-[#faf6ee] z-10">Team Name</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Players</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">W</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">L</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">T</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">PTS</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 hidden md:table-cell">GF</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 hidden md:table-cell">GA</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team, index) => {
                const teamPlayers = players.filter(p => p.teamId === team.id);
                return (
                  <tr key={team.id} className={`border-b hover:bg-[#faf6ee] ${index % 2 === 0 ? 'bg-white' : 'bg-[#faf6ee]'}`}>
                    <td className="px-6 py-4 text-gray-900 font-semibold sticky left-0 z-10" style={{backgroundColor: index % 2 === 0 ? '#ffffff' : '#faf6ee'}}>{team.name}</td>
                    <td className="px-6 py-4 text-center text-gray-700">{teamPlayers.length}</td>
                    <td className="px-6 py-4 text-center text-gray-700">{team.wins}</td>
                    <td className="px-6 py-4 text-center text-gray-700">{team.losses}</td>
                    <td className="px-6 py-4 text-center text-gray-700">{team.ties}</td>
                    <td className="px-6 py-4 text-center font-semibold text-gray-900">{team.points}</td>
                    <td className="px-6 py-4 text-center text-gray-700 hidden md:table-cell">{team.goalsFor}</td>
                    <td className="px-6 py-4 text-center text-gray-700 hidden md:table-cell">{team.goalsAgainst}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedTeamId(team.id)}
                        className="bg-[#e9ca8a] hover:bg-[#d4b577] text-black font-medium px-2 sm:px-3 py-1 rounded transition text-xs sm:text-sm"
                      >
                        <span className="hidden sm:inline">View Roster</span>
                        <span className="sm:hidden">View</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {teams.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            <div className="text-4xl sm:text-6xl mb-4">🏒</div>
            <p className="text-base sm:text-lg font-semibold">No teams yet</p>
            <p className="text-xs sm:text-sm mt-2">Click "Add New Team" to create your first team</p>
          </div>
        )}
      </div>

      {/* Player Roster Section */}
      {selectedTeamId && (
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
              {teams.find(t => t.id === selectedTeamId)?.name} Roster
            </h3>
            <button
              onClick={() => {
                setPlayerForm({ ...playerForm, teamId: selectedTeamId });
                setShowPlayerForm(true);
              }}
              className="w-full sm:w-auto bg-[#e9ca8a] text-black px-4 sm:px-6 py-3 rounded-lg hover:bg-[#d4b577] transition font-semibold text-sm sm:text-base"
            >
              + Add Player
            </button>
          </div>

          {/* Player Form */}
          {showPlayerForm && (
            <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
              <div className="min-h-screen">
                <div className="bg-[#e9ca8a] text-black px-8 py-6 shadow-md">
                  <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div>
                      <h3 className="text-3xl font-bold">
                        {editingPlayer ? 'Edit Player' : 'Add New Player'}
                      </h3>
                      <p className="text-[#faf6ee] mt-1">Fill in the player details</p>
                    </div>
                    <button
                      onClick={resetPlayerForm}
                      className="bg-[#d4b577] hover:bg-[#c9a865] px-6 py-3 rounded-lg transition font-semibold"
                    >
                      ← Back
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmitPlayer} className="max-w-4xl mx-auto p-8 space-y-6">
                  <div className="bg-white rounded-lg p-6 border border-gray-200 shadow space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Player Name *
                      </label>
                      <input
                        type="text"
                        value={playerForm.name}
                        onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e9ca8a] focus:border-[#e9ca8a] transition text-gray-900 font-medium"
                        placeholder="Player name"
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
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
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e9ca8a] focus:border-[#e9ca8a] transition text-gray-900 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Position *
                        </label>
                        <select
                          value={playerForm.position}
                          onChange={(e) => setPlayerForm({ ...playerForm, position: e.target.value as any })}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e9ca8a] focus:border-[#e9ca8a] transition text-gray-900 font-medium"
                        >
                          <option value="C">Center (C)</option>
                          <option value="LW">Left Wing (LW)</option>
                          <option value="RW">Right Wing (RW)</option>
                          <option value="D">Defense (D)</option>
                          <option value="G">Goalie (G)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Games Played
                        </label>
                        <input
                          type="number"
                          value={playerForm.gamesPlayed}
                          onChange={(e) => setPlayerForm({ ...playerForm, gamesPlayed: e.target.value })}
                          min="0"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e9ca8a] focus:border-[#e9ca8a] transition text-gray-900 font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Goals
                        </label>
                        <input
                          type="number"
                          value={playerForm.goals}
                          onChange={(e) => setPlayerForm({ ...playerForm, goals: e.target.value })}
                          min="0"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e9ca8a] focus:border-[#e9ca8a] transition text-gray-900 font-medium"
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
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e9ca8a] focus:border-[#e9ca8a] transition text-gray-900 font-medium"
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
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e9ca8a] focus:border-[#e9ca8a] transition text-gray-900 font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={resetPlayerForm}
                      className="px-8 py-4 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-[#e9ca8a] text-black px-8 py-4 rounded-lg hover:bg-[#d4b577] transition font-bold text-lg"
                    >
                      {editingPlayer ? 'Update Player' : 'Add Player'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Players Table */}
          <div className="table-scroll-wrapper">
            <table className="w-full mobile-compact-table">
              <thead className="bg-[#faf6ee] border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">#</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 sticky left-0 bg-[#faf6ee] z-10">Name</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Pos</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 hidden sm:table-cell">GP</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">G</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">A</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">PTS</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 hidden sm:table-cell">PIM</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((player, index) => (
                  <tr key={player.id} className={`border-b hover:bg-[#faf6ee] ${index % 2 === 0 ? 'bg-white' : 'bg-[#faf6ee]'}`}>
                    <td className="px-6 py-4 text-gray-700">{player.jerseyNumber}</td>
                    <td className="px-6 py-4 text-gray-900 font-semibold sticky left-0 z-10" style={{backgroundColor: index % 2 === 0 ? '#ffffff' : '#faf6ee'}}>{player.name}</td>
                    <td className="px-6 py-4 text-center text-gray-700">{player.position}</td>
                    <td className="px-6 py-4 text-center text-gray-700 hidden sm:table-cell">{player.gamesPlayed}</td>
                    <td className="px-6 py-4 text-center text-gray-700">{player.goals}</td>
                    <td className="px-6 py-4 text-center text-gray-700">{player.assists}</td>
                    <td className="px-6 py-4 text-center font-semibold text-gray-900">{player.points}</td>
                    <td className="px-6 py-4 text-center text-gray-700 hidden sm:table-cell">{player.penaltyMinutes}</td>
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex flex-row gap-4 items-center justify-center">
                        <button
                          onClick={() => handleEditPlayer(player)}
                          className="text-black hover:opacity-60 font-medium transition text-xs sm:text-sm whitespace-nowrap"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeletePlayer(player.id)}
                          className="text-red-600 hover:text-red-800 font-medium text-xs sm:text-sm whitespace-nowrap"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredPlayers.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500 text-sm">
              No players on this team yet. Click "Add Player" to get started.
            </div>
          )}
        </div>
      )}
    </div>
  );
}