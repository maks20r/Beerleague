'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addTeam } from '@/lib/db';

export default function NewTeamPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

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
      router.push('/admin/rosters');
    } catch (error) {
      console.error('Error saving team:', error);
      alert('Error creating team. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/rosters')}
            className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2 mb-4"
          >
            ← Back to Rosters
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add New Team</h1>
        </div>

        <form id="team-form" onSubmit={handleSubmit} className="space-y-6 overflow-x-hidden">
          <div className="p-4 sm:p-10 bg-white rounded-2xl border-2 border-black shadow-[0_4px_20px_rgba(233,202,138,0.15),0_8px_40px_rgba(0,0,0,0.1)] relative overflow-hidden">

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Team Name *
                </label>
                <input
                  type="text"
                  value={teamForm.name}
                  onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-black focus:border-[#e9ca8a] transition text-gray-900 font-medium text-lg bg-white"
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
                  className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-black focus:border-[#e9ca8a] transition text-gray-900 font-medium text-lg bg-white"
                >
                  <option value="A">Division A</option>
                  <option value="B">Division B</option>
                </select>
              </div>
            </div>

          </div>
        </form>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end mt-6">
          <button
            type="button"
            onClick={() => router.push('/admin/rosters')}
            className="w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 bg-gray-200 hover:bg-gray-300 border border-gray-300 rounded-lg transition-all duration-300 font-bold text-sm sm:text-base text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="team-form"
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
            <span>{saving ? 'Saving...' : 'Create Team'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
