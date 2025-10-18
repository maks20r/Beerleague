import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, Timestamp } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Parse date and time from CSV format
function parseDateTime(dateStr: string, timeStr: string): Date {
  // Remove day name and clean up date
  const cleanDate = dateStr.replace(/^[A-Za-z]+,\s*/, '').trim();
  
  // Parse date parts
  const [day, month, year] = cleanDate.split(' ');
  const monthMap: { [key: string]: number } = {
    'January': 0, 'February': 1, 'March': 2, 'April': 3,
    'May': 4, 'June': 5, 'July': 6, 'August': 7,
    'September': 8, 'October': 9, 'November': 10, 'December': 11
  };
  
  // Parse time
  const [time, period] = timeStr.split(' ');
  const [hours, minutes] = time.split(':');
  let hour = parseInt(hours);
  
  if (period === 'pm' && hour !== 12) {
    hour += 12;
  } else if (period === 'am' && hour === 12) {
    hour = 0;
  }
  
  return new Date(parseInt(year), monthMap[month], parseInt(day), hour, parseInt(minutes));
}

async function clearGamesCollection() {
  console.log('Clearing existing games...');
  const gamesCol = collection(db, 'games');
  const snapshot = await getDocs(gamesCol);
  
  for (const doc of snapshot.docs) {
    await deleteDoc(doc.ref);
  }
  console.log(`Deleted ${snapshot.size} existing games`);
}

async function populateGames() {
  try {
    // Clear existing games first
    await clearGamesCollection();
    
    // Read CSV file
    const csvPath = '/Users/maksimrashchupkin/Downloads/Al Nasr Leisureland 25-26 schedule - Sheet1.csv';
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    // Parse CSV lines
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    let gameNumber = 1;
    const games = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip winter break line
      if (line.includes('Winter Break')) {
        continue;
      }
      
      // Parse CSV line
      const parts = line.split(',').map(p => p.replace(/"/g, '').trim());
      
      if (parts.length >= 5) {
        const [dateStr, timeStr, division, homeTeam, awayTeam] = parts;
        
        // Parse date and time
        const gameDate = parseDateTime(dateStr, timeStr);
        
        // Create game object
        const game = {
          gameNumber: gameNumber++,
          date: Timestamp.fromDate(gameDate),
          homeTeamId: homeTeam,
          awayTeamId: awayTeam,
          division: division as 'A' | 'B',
          status: 'scheduled' as const,
          venue: 'Al Nasr Leisureland',
          homeScore: null,
          awayScore: null,
        };
        
        games.push(game);
      }
    }
    
    // Add games to Firestore
    console.log(`Adding ${games.length} games to Firestore...`);
    const gamesCol = collection(db, 'games');
    
    for (const game of games) {
      await addDoc(gamesCol, game);
      console.log(`Added game ${game.gameNumber}: ${game.awayTeamId} @ ${game.homeTeamId}`);
    }
    
    console.log('Successfully populated all games!');
  } catch (error) {
    console.error('Error populating games:', error);
  }
}

// Run the script
populateGames();