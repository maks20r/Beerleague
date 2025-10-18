'use client';

import { useState } from 'react';
import { collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { addGame, getTeams, updateTeam } from '@/lib/db';
import { useRouter } from 'next/navigation';

// CSV data embedded directly - 2025-26 Season Schedule
const csvData = `,Game Number ,Date:,Time:,Day,Division ,Location,Home,,,,Away
1,1,10/6/2025,8:45 PM,Mon,A,Al Nasr Leisureland,Flamingos,,,,Angry Beavers
,2,10/7/2025,8:45 PM,Tues,A,Al Nasr Leisureland,Bashers,,,,Penguins
,3,10/8/2025,10:15 PM,Wed,A,Dubai Mall,Flamingos,,,,Islanders
,4,10/9/2025,8:45 PM,Thur,B,Al Nasr Leisureland,Cobras,,,,Tornados
2,5,10/13/2025,8:45 PM,Mon,B,Al Nasr Leisureland,Wildcats,,,,Spitfires
,6,10/14/2025,8:45 PM,Tues,A,Al Nasr Leisureland,Mavericks,,,,Angry Beavers
,7,10/14/2025,10:00 PM,Tues,A,Al Nasr Leisureland,Bashers,,,,Flamingos
,8,10/15/2025,8:45 PM,Weds,B,Al Nasr Leisureland,Tornados,,,,Cobras
,9,10/16/2025,8:45 PM,Thur,A,Al Nasr Leisureland,Bashers,,,,Mavericks
,10,10/16/2025,10:00 PM,Thur,A,Al Nasr Leisureland,Penguins,,,,Islanders
3,11,10/20/2025,8:45 PM,Mon,B,Al Nasr Leisureland,Wildcats,,,,Spitfires
,12,10/21/2025,8:45 PM,Tues,A,Al Nasr Leisureland,Islanders,,,,Angry Beavers
,13,10/21/2025,10:00 PM,Tues,A,Al Nasr Leisureland,Penguins,,,,Mavericks
,14,10/22/2025,10:15 PM,Wed,B,Dubai Mall,Cobras,,,,Wildcats
,15,10/23/2025,8:45 PM,Thur,B,Al Nasr Leisureland,Tornados,,,,Spitfires
4,16,10/27/2025,8:45 PM,Mon,B,Al Nasr Leisureland,Wildcats,,,,Tornados
,17,10/28/2025,8:45 PM,Tues,A,Al Nasr Leisureland,Angry Beavers,,,,Mavericks
,18,10/28/2025,10:00 PM,Tues,A,Al Nasr Leisureland,Islanders,,,,Flamingos
,19,10/29/2025,10:15 PM,Wed,A,Dubai Mall,Angry Beavers,,,,Bashers
,20,10/30/2025,8:45 PM,Thur,A,Al Nasr Leisureland,Flamingos,,,,Penguins
,21,10/30/2025,10:00 PM,Thur,B,Al Nasr Leisureland,Tornados,,,,Cobras
5,22,11/3/2025,8:45 PM,Mon,B,Al Nasr Leisureland,Wildcats,,,,Cobras
,23,11/4/2025,8:45 PM,Tues,A,Al Nasr Leisureland,Mavericks,,,,Flamingos
,24,11/4/2025,10:00 PM,Tues,A,Al Nasr Leisureland,Bashers,,,,Penguins
,25,11/5/2025,10:15 PM,Wed,B,Dubai Mall,Spitfires,,,,Tornados
6,26,11/10/2025,8:45 PM,Mon,B,Al Nasr Leisureland,Wildcats,,,,Spitfires
,27,11/11/2025,8:45 PM,Tues,A,Al Nasr Leisureland,Mavericks,,,,Islanders
,28,11/11/2025,10:00 PM,Tues,A,Al Nasr Leisureland,Angry Beavers,,,,Penguins
,29,11/12/2025,10:15 PM,Wed,A,Dubai Mall,Flamingos,,,,Bashers
,30,11/13/2025,8:45 PM,Thur,B,Al Nasr Leisureland,Cobras,,,,Tornados
7,31,11/17/2025,8:45 PM,Mon,B,Al Nasr Leisureland,Cobras,,,,Wildcats
,32,11/18/2025,8:45 PM,Tues,A,Al Nasr Leisureland,Penguins,,,,Angry Beavers
,33,11/18/2025,10:00 PM,Tues,A,Al Nasr Leisureland,Flamingos,,,,Mavericks
,34,11/19/2025,8:45 PM,Wed,B,Al Nasr Leisureland,Spitfires,,,,Tornados
,35,11/20/2025,8:45 PM,Thur,A,Al Nasr Leisureland,Penguins,,,,Islanders
,36,11/20/2025,10:00 PM,Thur,A,Al Nasr Leisureland,Mavericks,,,,Bashers
,37,11/24/2025,8:45 PM,Mon,B,Al Nasr Leisureland,Tornados,,,,Wildcats
,38,11/24/2025,10:00 PM,Mon,B,Al Nasr Leisureland,Spitfires,,,,Cobras
,39,11/25/2025,8:45 PM,Tues,A,Al Nasr Leisureland,Bashers,,,,Islanders
7,40,11/25/2025,10:00 PM,Tues,A,Al Nasr Leisureland,Angry Beavers,,,,Flamingos
,41,11/26/2025,10:15 PM,Wed,A,Dubai Mall,Mavericks,,,,Penguins
,42,11/27/2025,8:45 PM,Thur,A,Al Nasr Leisureland,Islanders,,,,Bashers
,43,11/27/2025,10:00 PM,Thur,B,Al Nasr Leisureland,Spitfires,,,,Wildcats
8,44,12/4/2025,8:45 PM,Thur,A,Al Nasr Leisureland,Islanders,,,,Mavericks
,45,12/4/2025,10:00 PM,Thur,B,Al Nasr Leisureland,Cobras,,,,Spitfires
,46,12/8/2025,8:45 PM,Mon,B,Al Nasr Leisureland,Spitfires,,,,Cobras
,47,12/8/2025,10:00 PM,Mon,B,Al Nasr Leisureland,Tornados,,,,Wildcats
,48,12/9/2025,8:45 PM,Tues,A,Al Nasr Leisureland,Angry Beavers,,,,Bashers
,49,12/10/2025,8:45 PM,Wed,A,Al Nasr Leisureland,Penguins,,,,Flamingos
,50,12/10/2025,10:00 PM,Wed,A,Al Nasr Leisureland,Islanders,,,,Angry Beavers
,51,1/5/2026,8:45 PM,Mon,A,Al Nasr Leisureland,Angry Beavers,,,,Flamingos
,52,1/6/2026,8:45 PM,Tues,A,Al Nasr Leisureland,Penguins,,,,Islanders
,53,1/7/2026,8:45 PM,Wed,B,Al Nasr Leisureland,Tornados,,,,Wildcats
,54,1/7/2026,10:00 PM,Wed,B,Al Nasr Leisureland,Cobras,,,,Spitfires
,55,1/8/2026,8:45 PM,Thur,A,Al Nasr Leisureland,Bashers,,,,Mavericks
,56,1/11/2026,8:45 PM,Sun,A,Al Nasr Leisureland,Mavericks,,,,Angry Beavers
,57,1/12/2026,8:45 PM,Mon,A,Al Nasr Leisureland,Spitfires,,,,Tornados
,58,1/14/2026,10:15 PM,Wed,B,Dubai Mall,Wildcats,,,,Cobras
,59,1/15/2026,8:45 PM,Thur,A,Al Nasr Leisureland,Penguins,,,,Bashers
,60,1/17/2026,8:00 AM,Sat,A,Al Nasr Leisureland,Flamingos,,,,Islanders
,61,1/19/2026,8:45 PM,Mon,A,Al Nasr Leisureland,Penguins,,,,Angry Beavers
,62,1/20/2026,8:45 PM,Tues,A,Al Nasr Leisureland,Flamingos,,,,Bashers
,63,1/21/2026,10:15 PM,Wed,A,Dubai Mall,Mavericks,,,,Islanders
,64,1/22/2026,8:45 PM,Thur,B,Al Nasr Leisureland,Spitfires,,,,Wildcats
,65,1/24/2026,8:00 AM,Sat,A,Al Nasr Leisureland,Bashers,,,,Mavericks
,66,1/25/2026,8:45 PM,Sun,B,Al Nasr Leisureland,Tornados,,,,Cobras
,67,1/26/2026,8:45 PM,Mon,A,Al Nasr Leisureland,Penguins,,,,Flamingos
,68,1/27/2026,8:45 PM,Tues,B,Al Nasr Leisureland,Wildcats,,,,Cobras
,69,1/28/2026,10:15 PM,Wed,B,Dubai Mall,Tornados,,,,Spitfires
,70,1/29/2026,8:45 PM,Thur,A,Al Nasr Leisureland,Islanders,,,,Angry Beavers
,71,1/31/2026,8:00 AM,Sat,A,Al Nasr Leisureland,Mavericks,,,,Penguins
,72,2/1/2026,8:45 PM,Sun,A,Al Nasr Leisureland,Islanders,,,,Bashers
,73,2/2/2026,8:45 PM,Mon,B,Al Nasr Leisureland,Cobras,,,,Spitfires
,74,2/3/2026,8:45 PM,Tues,A,Al Nasr Leisureland,Flamingos,,,,Mavericks
,75,2/4/2026,10:15 PM,Wed,A,Dubai Mall,Angry Beavers,,,,Penguins
15,76,2/5/2026,8:45 PM,Thur,B,Al Nasr Leisureland,Wildcats,,,,Tornados
,77,2/7/2026,8:00 AM,Sat,A,Al Nasr Leisureland,Bashers,,,,Angry Beavers
,78,2/8/2026,8:45 PM,Sun,A,Al Nasr Leisureland,Islanders,,,,Flamingos
,79,2/9/2026,8:45 PM,Mon,A,Al Nasr Leisureland,Mavericks,,,,Penguins
,80,2/11/2026,10:15 PM,Wed,B,Dubai Mall,Wildcats,,,,Cobras
,81,2/12/2026,8:45 PM,Thur,A,Al Nasr Leisureland,Bashers,,,,Penguins
,82,2/14/2026,8:00 AM,Sat,B,Al Nasr Leisureland,Cobras,,,,Spitfires
,83,2/15/2026,8:45 PM,Sun,B,Al Nasr Leisureland,Tornados,,,,Wildcats
,84,2/16/2026,8:45 PM,Mon,A,Al Nasr Leisureland,Angry Beavers,,,,Islanders
,85,2/18/2026,10:15 PM,Wed,B,Dubai Mall,Spitfires,,,,Tornados
,86,2/19/2026,8:45 PM,Thur,A,Al Nasr Leisureland,Angry Beavers,,,,Flamingos
,87,2/21/2026,8:00 AM,Sat,B,Al Nasr Leisureland,Spitfires,,,,Wildcats
,88,2/21/2026,9:15 AM,Sat,A,Al Nasr Leisureland,Flamingos,,,,Mavericks
,89,2/22/2026,8:45 PM,Sun,A,Al Nasr Leisureland,Islanders,,,,Bashers
,90,2/23/2026,8:45 PM,Mon,B,Al Nasr Leisureland,Cobras,,,,Tornados`;

// Function to parse CSV line properly handling quoted fields
function parseCSVLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current.trim());
  
  return result;
}

// Function to normalize team names for consistency
function normalizeTeamName(teamName: string): string {
  const normalizedNames: { [key: string]: string } = {
    'angry beavers': 'Angry Beavers',
    'cobras': 'Cobras',
    // Add more mappings as needed
  };
  
  const lower = teamName.toLowerCase();
  return normalizedNames[lower] || teamName;
}

function parseDateTime(dateStr: string, timeStr: string): Date {
  try {
    console.log('Parsing date:', dateStr, 'time:', timeStr);

    // Handle edge case where dateStr might be empty or invalid
    if (!dateStr || !timeStr) {
      console.error('Empty date or time string:', { dateStr, timeStr });
      throw new Error('Empty date or time string');
    }

    // Parse date in MM/DD/YYYY format
    const dateParts = dateStr.split('/');
    if (dateParts.length !== 3) {
      console.error('Invalid date format - expected MM/DD/YYYY:', dateStr);
      throw new Error(`Invalid date format: ${dateStr}`);
    }

    const [month, day, year] = dateParts;
    const monthNum = parseInt(month) - 1; // JavaScript months are 0-indexed
    const dayNum = parseInt(day);
    const yearNum = parseInt(year);

    console.log('Date parts:', { month: monthNum, day: dayNum, year: yearNum });

    if (isNaN(monthNum) || isNaN(dayNum) || isNaN(yearNum)) {
      console.error('Invalid date values:', { month, day, year });
      throw new Error(`Invalid date values: ${dateStr}`);
    }

    // Parse time - handle formats like "8:45 PM" or "10:00 AM"
    const timeParts = timeStr.trim().split(' ');
    if (timeParts.length !== 2) {
      console.error('Invalid time format - expected 2 parts:', timeStr, 'got:', timeParts);
      throw new Error(`Invalid time format: ${timeStr}`);
    }

    const [time, period] = timeParts;
    const timeSplit = time.split(':');
    if (timeSplit.length !== 2) {
      console.error('Invalid time format - expected HH:MM:', time);
      throw new Error(`Invalid time format: ${time}`);
    }

    const hours = parseInt(timeSplit[0]);
    const minutes = parseInt(timeSplit[1]);

    if (isNaN(hours) || isNaN(minutes)) {
      console.error('Invalid time values:', time, 'hours:', hours, 'minutes:', minutes);
      throw new Error(`Invalid time values: ${time}`);
    }

    let hour = hours;
    // Handle both uppercase and lowercase AM/PM
    if (period.toUpperCase() === 'PM' && hour !== 12) {
      hour += 12;
    } else if (period.toUpperCase() === 'AM' && hour === 12) {
      hour = 0;
    }

    console.log('Final values:', { year: yearNum, month: monthNum, day: dayNum, hour, minutes });

    const result = new Date(yearNum, monthNum, dayNum, hour, minutes);

    // Validate the date
    if (isNaN(result.getTime())) {
      console.error('Invalid date result for:', dateStr, timeStr, 'result:', result);
      throw new Error(`Invalid date result: ${result}`);
    }

    console.log('Successfully parsed date:', result);
    return result;
  } catch (error) {
    console.error('Error parsing date:', dateStr, timeStr, error);
    // Don't fall back to current date - throw error to see what's wrong
    throw error;
  }
}

export default function PopulateGames() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const clearGames = async () => {
    setStatus('Clearing existing games...');
    const gamesCol = collection(db, 'games');
    const snapshot = await getDocs(gamesCol);

    for (const doc of snapshot.docs) {
      await deleteDoc(doc.ref);
    }
    setStatus(`Deleted ${snapshot.size} existing games`);
  };

  const resetTeamStandings = async () => {
    setStatus('Resetting team standings...');
    const teams = await getTeams();

    for (const team of teams) {
      await updateTeam(team.id, {
        wins: 0,
        losses: 0,
        ties: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0
      });
    }

    setStatus(`Reset standings for ${teams.length} teams`);
  };

  const populateGames = async () => {
    try {
      setLoading(true);
      setError('');

      // Clear existing games first
      await clearGames();

      // Reset all team standings to zero
      await resetTeamStandings();

      // Parse CSV lines
      const lines = csvData.split('\n').filter(line => line.trim());
      
      console.log('Total lines found:', lines.length);
      console.log('First few lines:', lines.slice(0, 5));
      
      const games = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];

        // Parse CSV line - handle quoted fields properly
        const parts = parseCSVLine(line);

        console.log('Raw line:', line);
        console.log('Split parts:', parts);
        console.log('Parts length:', parts.length);

        // New CSV format has 12 columns:
        // [0]=blank, [1]=Game Number, [2]=Date, [3]=Time, [4]=Day, [5]=Division, [6]=Location, [7]=Home, [8-10]=blank, [11]=Away
        if (parts.length >= 12) {
          const dateStr = parts[2].trim();
          const timeStr = parts[3].trim();
          const division = parts[5].trim();
          const location = parts[6].trim();
          const homeTeam = parts[7].trim();
          const awayTeam = parts[11].trim();

          // Skip rows with missing data
          if (!division || !homeTeam || !awayTeam || !dateStr || !timeStr) {
            console.log('Skipping line with missing data:', { division, homeTeam, awayTeam, dateStr, timeStr });
            continue;
          }

          console.log('Extracted fields:', { dateStr, timeStr, division, location, homeTeam, awayTeam });

          // Parse date and time with error handling
          let gameDate;
          try {
            gameDate = parseDateTime(dateStr, timeStr);
            console.log('Parsed date successfully:', gameDate);
          } catch (error) {
            console.error('Date parsing failed:', error);
            setError(`Failed to parse date "${dateStr}" and time "${timeStr}": ${error}`);
            return;
          }

          // Create game object to match the expected structure
          const game = {
            date: gameDate, // addGame will convert this to Timestamp
            homeTeamId: normalizeTeamName(homeTeam),
            awayTeamId: normalizeTeamName(awayTeam),
            division: division as 'A' | 'B',
            status: 'scheduled' as const,
            venue: location || 'Al Nasr Leisureland', // Use location from CSV, fallback to default
            // Don't include gameNumber - addGame will auto-generate it
            // Don't include homeScore/awayScore - they're undefined by default
          };

          console.log('Created game object:', game);
          games.push(game);
        } else {
          console.log('Skipping line with insufficient parts:', line, 'parts:', parts.length);
        }
      }
      
      // Add games to Firestore using the addGame function
      setStatus(`Adding ${games.length} games to Firestore...`);
      
      for (let i = 0; i < games.length; i++) {
        const game = games[i];
        await addGame(game as any); // Use the addGame function which handles gameNumber and date conversion
        setStatus(`Added game ${i + 1}/${games.length}: ${game.awayTeamId} @ ${game.homeTeamId}`);
      }
      
      setStatus(`Successfully populated ${games.length} games!`);
      
      // Redirect to games page after 2 seconds
      setTimeout(() => {
        router.push('/admin/games');
      }, 2000);
      
    } catch (error) {
      console.error('Error populating games:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-gray-900">Populate Games from CSV</h2>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-700 mb-6">
          This will populate the games collection with the 2025-26 season schedule (October 2025 - February 2026) from Al Nasr Leisureland and Dubai Mall.
        </p>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 font-semibold mb-2">⚠️ Warning</p>
          <p className="text-yellow-700">
            This will delete all existing games and replace them with the new schedule.
          </p>
        </div>
        
        <button
          onClick={populateGames}
          disabled={loading}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? 'Populating...' : 'Populate Games'}
        </button>
        
        {status && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700 font-mono text-sm">{status}</p>
          </div>
        )}
        
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}