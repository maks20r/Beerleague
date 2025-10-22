'use client';

export default function InstructionsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Admin Instructions</h1>
        <p className="text-gray-600 mb-8">A comprehensive guide to managing your hockey league platform</p>

        {/* Section 1: Managing Games */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-[#e9ca8a]">
            1. Managing Games
          </h2>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Adding a New Game</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>Navigate to <strong>Games</strong> in the admin menu</li>
              <li>Click the <strong>"+ Add New Game"</strong> button</li>
              <li>Fill in the <strong>Game Overview</strong> tab:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li><strong>Date & Time:</strong> Select the game date and time (use 24-hour format, e.g., 19:00 for 7:00 PM)</li>
                  <li><strong>Division:</strong> Choose Division A or Division B</li>
                  <li><strong>Teams:</strong> Select home and away teams from the dropdown</li>
                  <li><strong>Venue:</strong> Enter the rink/location name</li>
                  <li><strong>Referee:</strong> Enter the referee's name (optional)</li>
                </ul>
              </li>
              <li>If the game has been played, switch to the <strong>Game Results</strong> tab and enter:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li><strong>Scores:</strong> Final score for home and away teams</li>
                  <li><strong>Goalies:</strong> Select the goalie for each team</li>
                  <li><strong>Shots:</strong> Total shots on goal for each team</li>
                  <li><strong>Goals:</strong> Click "Add Goal" for each goal scored and fill in scorer, assists, and time</li>
                  <li><strong>Penalties:</strong> Click "Add Penalty" for each penalty and enter player, infraction, and minutes</li>
                  <li><strong>Empty Net Goals:</strong> Check the box if needed and specify empty net goals for each team</li>
                  <li><strong>Shootout:</strong> Check this box if the game was decided by shootout</li>
                </ul>
              </li>
              <li>Click <strong>"Create Game"</strong> to save</li>
            </ol>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Editing an Existing Game</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>Navigate to <strong>Games</strong></li>
              <li>Find the game in the table and click <strong>"Edit"</strong></li>
              <li>Update any information in either the Overview or Results tabs</li>
              <li>Click <strong>"Update Game"</strong> to save changes</li>
            </ol>
            <div className="mt-3 p-4 bg-[#faf6ee] border-l-4 border-[#e9ca8a] rounded">
              <p className="text-sm text-gray-700">
                <strong>Important:</strong> When you update a completed game's scores or results, the system automatically recalculates:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 text-sm text-gray-700">
                <li>Team standings (wins, losses, ties, points, goals for/against)</li>
                <li>Player stats (goals, assists, points, penalty minutes, games played)</li>
                <li>Goalie stats (saves, save percentage, goals allowed, games played)</li>
              </ul>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Understanding Shootouts</h3>
            <p className="text-gray-700 mb-2">
              If a game ends in a tie and is decided by shootout:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
              <li>Enter the <strong>final score</strong> (the team that won the shootout should have 1 more goal)</li>
              <li>Check the <strong>"Game decided by shootout"</strong> checkbox</li>
              <li><strong>Point system:</strong> Winner gets 2 points, loser gets 1 point</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Deleting a Game</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>Navigate to <strong>Games</strong></li>
              <li>Find the game in the table and click <strong>"Delete"</strong></li>
              <li>Confirm the deletion</li>
            </ol>
            <div className="mt-3 p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> Deleting a game cannot be undone. If the game was completed, stats will NOT be automatically reversed.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Managing Teams (Rosters) */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-[#e9ca8a]">
            2. Managing Teams & Rosters
          </h2>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Viewing Team Rosters</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>Navigate to <strong>Teams</strong> in the admin menu</li>
              <li>Select a division (A or B) using the toggle buttons</li>
              <li>Click on any team name to view their roster</li>
              <li>You'll see all players and goalies for that team</li>
            </ol>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Adding a Player</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>Navigate to the team's roster page</li>
              <li>Click <strong>"Add Player"</strong></li>
              <li>Fill in player information:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Player name</li>
                  <li>Jersey number</li>
                  <li>Position (Forward, Defense, etc.)</li>
                </ul>
              </li>
              <li>Click <strong>"Save"</strong></li>
            </ol>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Editing Player Information</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>Navigate to the team's roster page</li>
              <li>Find the player and click <strong>"Edit"</strong></li>
              <li>Update the information</li>
              <li>Click <strong>"Save"</strong></li>
            </ol>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Adding/Editing Goalies</h3>
            <p className="text-gray-700 mb-2">
              Goalies are managed similarly to players but have different stats tracked (saves, save percentage, goals allowed).
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>Navigate to the team's roster page</li>
              <li>Scroll to the Goalies section</li>
              <li>Click <strong>"Add Goalie"</strong> or <strong>"Edit"</strong> for existing goalies</li>
              <li>Fill in goalie information and save</li>
            </ol>
          </div>
        </section>

        {/* Section 3: Understanding Stats */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-[#e9ca8a]">
            3. Understanding Stats & Calculations
          </h2>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Player Statistics</h3>
            <p className="text-gray-700 mb-3">Player stats are automatically calculated when you enter game results:</p>
            <ul className="list-disc list-inside ml-4 space-y-2 text-gray-700">
              <li><strong>GP (Games Played):</strong> Incremented when a player appears in a game's goals or penalties</li>
              <li><strong>G (Goals):</strong> Number of goals scored</li>
              <li><strong>A (Assists):</strong> Number of assists (primary or secondary)</li>
              <li><strong>PTS (Points):</strong> Total points (Goals + Assists)</li>
              <li><strong>PIM (Penalty Minutes):</strong> Total penalty minutes accumulated</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Goalie Statistics</h3>
            <p className="text-gray-700 mb-3">Goalie stats are calculated based on shots and goals:</p>
            <ul className="list-disc list-inside ml-4 space-y-2 text-gray-700">
              <li><strong>GP (Games Played):</strong> Number of games the goalie has played</li>
              <li><strong>Shots:</strong> Total shots faced</li>
              <li><strong>GA (Goals Allowed):</strong> Total goals allowed (excluding empty net goals)</li>
              <li><strong>Saves:</strong> Total saves made (Shots - Goals Allowed)</li>
              <li><strong>SV% (Save Percentage):</strong> Calculated as (Saves / Shots) × 100</li>
            </ul>
            <div className="mt-3 p-4 bg-[#faf6ee] border-l-4 border-[#e9ca8a] rounded">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> Empty net goals are tracked separately and don't count against the goalie's save percentage.
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Team Standings</h3>
            <p className="text-gray-700 mb-3">Team standings are automatically updated when game results are entered:</p>
            <ul className="list-disc list-inside ml-4 space-y-2 text-gray-700">
              <li><strong>GP (Games Played):</strong> Total games played (W + L + T)</li>
              <li><strong>W (Wins):</strong> Number of wins</li>
              <li><strong>L (Losses):</strong> Number of losses</li>
              <li><strong>T (Ties):</strong> Number of ties</li>
              <li><strong>PTS (Points):</strong> Total points
                <ul className="list-circle list-inside ml-6 mt-1">
                  <li>Win = 2 points</li>
                  <li>Tie = 1 point</li>
                  <li>Loss = 0 points</li>
                  <li>Shootout loss = 1 point</li>
                </ul>
              </li>
              <li><strong>GF (Goals For):</strong> Total goals scored</li>
              <li><strong>GA (Goals Against):</strong> Total goals allowed</li>
            </ul>
          </div>
        </section>

        {/* Section 4: Overview Page */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-[#e9ca8a]">
            4. Using the Overview Page
          </h2>

          <p className="text-gray-700 mb-4">
            The <strong>Overview</strong> page provides a comprehensive view of all league data in one place:
          </p>

          <ul className="list-disc list-inside ml-4 space-y-2 text-gray-700">
            <li><strong>Team Standings:</strong> View standings for Division A or B</li>
            <li><strong>Player Stats:</strong> See top players or all players, filtered by division</li>
            <li><strong>Goalie Stats:</strong> View top 10 goalies by save percentage</li>
            <li><strong>Upcoming Games:</strong> See games scheduled for the next 7 days (or view all games)</li>
            <li><strong>Recent Games:</strong> Review games from the last 7 days</li>
          </ul>

          <div className="mt-4 p-4 bg-[#faf6ee] border-l-4 border-[#e9ca8a] rounded">
            <p className="text-sm text-gray-700">
              <strong>Tip:</strong> Use the division filter buttons to quickly switch between Division A and Division B data.
            </p>
          </div>
        </section>

        {/* Section 5: Public Pages */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-[#e9ca8a]">
            5. Public Pages
          </h2>

          <p className="text-gray-700 mb-4">
            Public users (visitors not signed in) can view the following pages:
          </p>

          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Standings Page (Home)</h3>
            <p className="text-gray-700">
              Displays team standings with division selector. Users can switch between Division A and Division B to view rankings, wins, losses, ties, points, and goal statistics.
            </p>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Stats Page</h3>
            <p className="text-gray-700">
              Shows player statistics (top 10 or all players) and goalie statistics. Users can filter by division to see division-specific stats.
            </p>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Schedule Page</h3>
            <p className="text-gray-700 mb-2">
              Displays two sections:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
              <li><strong>Upcoming Games:</strong> Shows games scheduled for the next 7 days in card format</li>
              <li><strong>All Games:</strong> Comprehensive table view of all games (past and future) with scores, venues, and divisions</li>
            </ul>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <p className="text-sm text-blue-800">
              <strong>Real-time Updates:</strong> When you update game results, team rosters, or any other data, the changes immediately appear on the public pages. No additional steps needed!
            </p>
          </div>
        </section>

        {/* Quick Reference */}
        <section className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-[#e9ca8a]">
            Quick Reference
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-bold text-gray-800 mb-2">Navigation</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li><strong>Games:</strong> Manage game schedules & results</li>
                <li><strong>Teams:</strong> Manage team rosters & players</li>
                <li><strong>Overview:</strong> View all stats at once</li>
                <li><strong>Instructions:</strong> This guide</li>
              </ul>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-bold text-gray-800 mb-2">Point System</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li><strong>Win:</strong> 2 points</li>
                <li><strong>Tie:</strong> 1 point each</li>
                <li><strong>Loss:</strong> 0 points</li>
                <li><strong>Shootout Win:</strong> 2 points</li>
                <li><strong>Shootout Loss:</strong> 1 point</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Support Footer */}
        <div className="mt-8 p-6 bg-gradient-to-r from-[#faf6ee] to-white rounded-lg border border-[#e9ca8a]">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-gray-700 text-sm">
            If you encounter any issues or have questions not covered in this guide, please contact the platform administrator or technical support.
          </p>
        </div>
      </div>
    </div>
  );
}
