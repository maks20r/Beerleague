import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  // This will use your .env.local file
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const mavericksPlayers = [
  { name: 'Janko Kucera', position: 'C', jerseyNumber: 11 },
  { name: 'Zee Bartos', position: 'C', jerseyNumber: 7 },
  { name: 'David Raguso', position: 'D', jerseyNumber: 4 },
  { name: 'Vitali Sevukas', position: 'LW', jerseyNumber: 9 },
  { name: 'Aaron Richert', position: 'D', jerseyNumber: 5 },
  { name: 'Julian Marszal', position: 'RW', jerseyNumber: 17 },
  { name: 'Cole James', position: 'C', jerseyNumber: 21 },
  { name: 'Adam Dubroy', position: 'D', jerseyNumber: 3 },
  { name: 'Mo Zigby', position: 'LW', jerseyNumber: 19 },
  { name: 'Pavel Sool', position: 'G', jerseyNumber: 30 },
  { name: 'Roman Gavrilin', position: 'RW', jerseyNumber: 23 },
  { name: 'Henning Bruns', position: 'D', jerseyNumber: 6 },
  { name: 'Geraud Audenaert', position: 'C', jerseyNumber: 15 },
  { name: 'Ivan Simonov', position: 'LW', jerseyNumber: 12 },
];

async function populateMavericksRoster() {
  try {
    console.log('Finding Mavericks team...');

    // Find Mavericks team
    const teamsCol = collection(db, 'teams');
    const q = query(teamsCol, where('name', '==', 'Mavericks'));
    const teamsSnapshot = await getDocs(q);

    if (teamsSnapshot.empty) {
      console.error('Mavericks team not found!');
      process.exit(1);
    }

    const mavericksTeam = teamsSnapshot.docs[0];
    const teamId = mavericksTeam.id;

    console.log(`Found Mavericks team (ID: ${teamId})`);
    console.log(`Adding ${mavericksPlayers.length} players...`);

    const playersCol = collection(db, 'players');

    for (let i = 0; i < mavericksPlayers.length; i++) {
      const player = mavericksPlayers[i];

      const playerData = {
        name: player.name,
        teamId: 'Mavericks',
        jerseyNumber: player.jerseyNumber,
        position: player.position,
        goals: 0,
        assists: 0,
        points: 0,
        penaltyMinutes: 0,
        gamesPlayed: 0,
      };

      await addDoc(playersCol, playerData);
      console.log(`✓ Added ${i + 1}/${mavericksPlayers.length}: ${player.name} (#${player.jerseyNumber} - ${player.position})`);
    }

    console.log(`\n✓ Successfully added all ${mavericksPlayers.length} players to Mavericks roster!`);
    process.exit(0);
  } catch (error) {
    console.error('Error populating roster:', error);
    process.exit(1);
  }
}

populateMavericksRoster();
