import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Team, Player, Game, GameStat, Goalie } from '@/types';

// Teams
export const getTeams = async (division?: 'A' | 'B'): Promise<Team[]> => {
  const teamsCol = collection(db, 'teams');
  let q = query(teamsCol, orderBy('points', 'desc'));

  if (division) {
    q = query(teamsCol, where('division', '==', division), orderBy('points', 'desc'));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
};

export const addTeam = async (team: Omit<Team, 'id'>) => {
  return await addDoc(collection(db, 'teams'), team);
};

export const updateTeam = async (id: string, team: Partial<Team>) => {
  const teamRef = doc(db, 'teams', id);
  return await updateDoc(teamRef, team);
};

export const getTeamByName = async (teamName: string): Promise<Team | null> => {
  const teamsCol = collection(db, 'teams');
  const q = query(teamsCol, where('name', '==', teamName));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return null;
  }
  
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Team;
};

// Players
export const getPlayers = async (division?: 'A' | 'B'): Promise<Player[]> => {
  const playersCol = collection(db, 'players');

  // If division is specified, first get teams in that division
  if (division) {
    const teams = await getTeams(division);
    const teamIds = teams.map(team => team.id);

    // If no teams in division, return empty array
    if (teamIds.length === 0) {
      return [];
    }

    // Fetch all players and filter by team IDs
    const snapshot = await getDocs(query(playersCol, orderBy('points', 'desc')));
    const allPlayers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player));
    return allPlayers.filter(player => teamIds.includes(player.teamId));
  }

  // If no division specified, return all players
  const snapshot = await getDocs(query(playersCol, orderBy('points', 'desc')));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player));
};

export const getPlayersByTeam = async (teamId: string): Promise<Player[]> => {
  const playersCol = collection(db, 'players');
  const q = query(playersCol, where('teamId', '==', teamId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player));
};

export const addPlayer = async (player: Omit<Player, 'id'>) => {
  return await addDoc(collection(db, 'players'), player);
};

export const updatePlayer = async (id: string, player: Partial<Player>) => {
  const playerRef = doc(db, 'players', id);
  return await updateDoc(playerRef, player);
};

export const deletePlayer = async (id: string) => {
  const playerRef = doc(db, 'players', id);
  return await deleteDoc(playerRef);
};

export const getPlayerByName = async (playerName: string, teamId: string): Promise<Player | null> => {
  const playersCol = collection(db, 'players');
  const q = query(playersCol, where('name', '==', playerName), where('teamId', '==', teamId));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const playerDoc = snapshot.docs[0];
  return { id: playerDoc.id, ...playerDoc.data() } as Player;
};

// Goalies
export const getGoalies = async (): Promise<Goalie[]> => {
  const goaliesCol = collection(db, 'goalies');
  const snapshot = await getDocs(query(goaliesCol, orderBy('savePercentage', 'desc')));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goalie));
};

export const getGoaliesByTeam = async (teamId: string): Promise<Goalie[]> => {
  const goaliesCol = collection(db, 'goalies');
  const q = query(goaliesCol, where('teamId', '==', teamId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goalie));
};

export const getGoalieByName = async (goalieName: string): Promise<Goalie | null> => {
  const goaliesCol = collection(db, 'goalies');
  const q = query(goaliesCol, where('name', '==', goalieName));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const goalieDoc = snapshot.docs[0];
  return { id: goalieDoc.id, ...goalieDoc.data() } as Goalie;
};

export const addGoalie = async (goalie: Omit<Goalie, 'id'>) => {
  return await addDoc(collection(db, 'goalies'), goalie);
};

export const updateGoalie = async (id: string, goalie: Partial<Goalie>) => {
  const goalieRef = doc(db, 'goalies', id);
  return await updateDoc(goalieRef, goalie);
};

export const deleteGoalie = async (id: string) => {
  const goalieRef = doc(db, 'goalies', id);
  return await deleteDoc(goalieRef);
};

// Games
export const getUpcomingGames = async (days: number = 7, division?: 'A' | 'B'): Promise<Game[]> => {
  const gamesCol = collection(db, 'games');
  const now = new Date();
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  let q = query(
    gamesCol,
    where('date', '>=', Timestamp.fromDate(now)),
    where('date', '<=', Timestamp.fromDate(future)),
    orderBy('date', 'asc')
  );

  // Add division filter if specified
  if (division) {
    q = query(
      gamesCol,
      where('division', '==', division),
      where('date', '>=', Timestamp.fromDate(now)),
      where('date', '<=', Timestamp.fromDate(future)),
      orderBy('date', 'asc')
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: data.date ? data.date.toDate() : new Date(),
      homeGoals: data.homeGoals || [],
      awayGoals: data.awayGoals || [],
      homePenalties: data.homePenalties || [],
      awayPenalties: data.awayPenalties || [],
      homeShots: data.homeShots || 0,
      awayShots: data.awayShots || 0,
    } as Game;
  });
};

export const getRecentGames = async (days: number = 7, division?: 'A' | 'B'): Promise<Game[]> => {
  const gamesCol = collection(db, 'games');
  const now = new Date();
  const past = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  let q = query(
    gamesCol,
    where('date', '>=', Timestamp.fromDate(past)),
    where('date', '<=', Timestamp.fromDate(now)),
    orderBy('date', 'desc')
  );

  // Add division filter if specified
  if (division) {
    q = query(
      gamesCol,
      where('division', '==', division),
      where('date', '>=', Timestamp.fromDate(past)),
      where('date', '<=', Timestamp.fromDate(now)),
      orderBy('date', 'desc')
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: data.date ? data.date.toDate() : new Date(),
      homeGoals: data.homeGoals || [],
      awayGoals: data.awayGoals || [],
      homePenalties: data.homePenalties || [],
      awayPenalties: data.awayPenalties || [],
      homeShots: data.homeShots || 0,
      awayShots: data.awayShots || 0,
    } as Game;
  });
};

export const getAllGames = async (division?: 'A' | 'B'): Promise<Game[]> => {
  const gamesCol = collection(db, 'games');

  let q = query(gamesCol, orderBy('date', 'asc'));

  // Add division filter if specified
  if (division) {
    q = query(gamesCol, where('division', '==', division), orderBy('date', 'asc'));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: data.date ? data.date.toDate() : new Date(),
      homeGoals: data.homeGoals || [],
      awayGoals: data.awayGoals || [],
      homePenalties: data.homePenalties || [],
      awayPenalties: data.awayPenalties || [],
      homeShots: data.homeShots || 0,
      awayShots: data.awayShots || 0,
    } as Game;
  });
};

export const getGameById = async (id: string): Promise<Game | null> => {
  const gameRef = doc(db, 'games', id);
  const gameDoc = await getDoc(gameRef);

  if (!gameDoc.exists()) {
    return null;
  }

  const data = gameDoc.data();
  return {
    id: gameDoc.id,
    ...data,
    date: data.date ? data.date.toDate() : new Date(),
    homeGoals: data.homeGoals || [],
    awayGoals: data.awayGoals || [],
    homePenalties: data.homePenalties || [],
    awayPenalties: data.awayPenalties || [],
    homeShots: data.homeShots || 0,
    awayShots: data.awayShots || 0,
  } as Game;
};

export const addGame = async (game: Omit<Game, 'id' | 'gameNumber'>) => {
  // Get the highest game number and increment
  const gamesCol = collection(db, 'games');
  const snapshot = await getDocs(query(gamesCol, orderBy('gameNumber', 'desc')));
  const highestGameNumber = snapshot.empty ? 0 : (snapshot.docs[0].data().gameNumber || 0);

  return await addDoc(collection(db, 'games'), {
    ...game,
    gameNumber: highestGameNumber + 1,
    date: Timestamp.fromDate(game.date)
  });
};

export const updateGame = async (id: string, game: Partial<Game>) => {
  const gameRef = doc(db, 'games', id);
  const updateData = { ...game };
  if (game.date) {
    updateData.date = Timestamp.fromDate(game.date) as any;
  }

  // Update the game
  await updateDoc(gameRef, updateData);

  // Note: Team standings are updated in the calling function
  // to properly handle old scores when editing
};

export const deleteGame = async (id: string) => {
  const gameRef = doc(db, 'games', id);
  return await deleteDoc(gameRef);
};

// Game Stats
export const getGameStats = async (gameId: string): Promise<GameStat[]> => {
  const statsCol = collection(db, 'game_stats');
  const q = query(statsCol, where('gameId', '==', gameId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GameStat));
};

export const addGameStat = async (stat: Omit<GameStat, 'id'>) => {
  return await addDoc(collection(db, 'game_stats'), stat);
};

export const updateGameStat = async (id: string, stat: Partial<GameStat>) => {
  const statRef = doc(db, 'game_stats', id);
  return await updateDoc(statRef, stat);
};

// Team Standings Management
export const updateTeamStandings = async (gameId: string, oldGame?: { homeScore?: number; awayScore?: number }) => {
  try {
    // Get the game details
    const gameRef = doc(db, 'games', gameId);
    const gameDoc = await getDoc(gameRef);

    if (!gameDoc.exists()) {
      console.error('Game not found:', gameId);
      return;
    }

    const game = { id: gameDoc.id, ...gameDoc.data() } as Game;

    // Get both teams
    const [homeTeam, awayTeam] = await Promise.all([
      getTeamByName(game.homeTeamId),
      getTeamByName(game.awayTeamId)
    ]);

    if (!homeTeam || !awayTeam) {
      console.error('Teams not found:', game.homeTeamId, game.awayTeamId);
      return;
    }

    // If editing an existing completed game, first reverse the old stats
    if (oldGame && oldGame.homeScore !== undefined && oldGame.awayScore !== undefined) {
      const oldHomeScore = oldGame.homeScore;
      const oldAwayScore = oldGame.awayScore;
      const oldIsShootout = (oldGame as any).shootout || false;

      let oldHomeWins = 0, oldHomeLosses = 0, oldHomeTies = 0, oldHomePoints = 0;
      let oldAwayWins = 0, oldAwayLosses = 0, oldAwayTies = 0, oldAwayPoints = 0;

      if (oldHomeScore > oldAwayScore) {
        oldHomeWins = 1;
        oldHomePoints = 2;
        oldAwayLosses = 1;
        oldAwayPoints = oldIsShootout ? 1 : 0;
      } else if (oldAwayScore > oldHomeScore) {
        oldAwayWins = 1;
        oldAwayPoints = 2;
        oldHomeLosses = 1;
        oldHomePoints = oldIsShootout ? 1 : 0;
      } else {
        oldHomeTies = 1;
        oldHomePoints = 1;
        oldAwayTies = 1;
        oldAwayPoints = 1;
      }

      // Subtract old stats
      await Promise.all([
        updateTeam(homeTeam.id, {
          wins: homeTeam.wins - oldHomeWins,
          losses: homeTeam.losses - oldHomeLosses,
          ties: homeTeam.ties - oldHomeTies,
          goalsFor: homeTeam.goalsFor - oldHomeScore,
          goalsAgainst: homeTeam.goalsAgainst - oldAwayScore,
          points: homeTeam.points - oldHomePoints
        }),
        updateTeam(awayTeam.id, {
          wins: awayTeam.wins - oldAwayWins,
          losses: awayTeam.losses - oldAwayLosses,
          ties: awayTeam.ties - oldAwayTies,
          goalsFor: awayTeam.goalsFor - oldAwayScore,
          goalsAgainst: awayTeam.goalsAgainst - oldHomeScore,
          points: awayTeam.points - oldAwayPoints
        })
      ]);

      // Refresh team data after subtraction
      const [updatedHomeTeam, updatedAwayTeam] = await Promise.all([
        getTeamByName(game.homeTeamId),
        getTeamByName(game.awayTeamId)
      ]);

      if (!updatedHomeTeam || !updatedAwayTeam) return;

      Object.assign(homeTeam, updatedHomeTeam);
      Object.assign(awayTeam, updatedAwayTeam);
    }

    // Only update standings for completed games with scores
    if (game.status !== 'completed' || game.homeScore === undefined || game.awayScore === undefined) {
      return;
    }

    // Calculate new game result
    const homeScore = game.homeScore;
    const awayScore = game.awayScore;
    const isShootout = game.shootout || false;

    let homeWins = 0, homeLosses = 0, homeTies = 0, homePoints = 0;
    let awayWins = 0, awayLosses = 0, awayTies = 0, awayPoints = 0;

    if (homeScore > awayScore) {
      // Home team wins
      homeWins = 1;
      homePoints = 2;
      awayLosses = 1;
      awayPoints = isShootout ? 1 : 0; // Loser gets 1 point in shootout, 0 otherwise
    } else if (awayScore > homeScore) {
      // Away team wins
      awayWins = 1;
      awayPoints = 2;
      homeLosses = 1;
      homePoints = isShootout ? 1 : 0; // Loser gets 1 point in shootout, 0 otherwise
    } else {
      // Tie game (no shootout, or shootout not marked)
      homeTies = 1;
      homePoints = 1;
      awayTies = 1;
      awayPoints = 1;
    }

    // Update team standings (increment with new values)
    const homeTeamUpdate = {
      wins: homeTeam.wins + homeWins,
      losses: homeTeam.losses + homeLosses,
      ties: homeTeam.ties + homeTies,
      goalsFor: homeTeam.goalsFor + homeScore,
      goalsAgainst: homeTeam.goalsAgainst + awayScore,
      points: homeTeam.points + homePoints
    };

    const awayTeamUpdate = {
      wins: awayTeam.wins + awayWins,
      losses: awayTeam.losses + awayLosses,
      ties: awayTeam.ties + awayTies,
      goalsFor: awayTeam.goalsFor + awayScore,
      goalsAgainst: awayTeam.goalsAgainst + homeScore,
      points: awayTeam.points + awayPoints
    };

    // Update both teams
    await Promise.all([
      updateTeam(homeTeam.id, homeTeamUpdate),
      updateTeam(awayTeam.id, awayTeamUpdate)
    ]);

    console.log('Team standings updated for game:', gameId);
  } catch (error) {
    console.error('Error updating team standings:', error);
  }
};

// Player Stats Management
export const updatePlayerStatsFromGame = async (
  gameId: string,
  gameData: {
    homeTeamId: string;
    awayTeamId: string;
    homeGoals: Array<{ scorer: string; assist1: string; assist2: string }>;
    awayGoals: Array<{ scorer: string; assist1: string; assist2: string }>;
    homePenalties: Array<{ player: string; minutes: string }>;
    awayPenalties: Array<{ player: string; minutes: string }>;
  },
  oldGameData?: {
    homeTeamId: string;
    awayTeamId: string;
    homeGoals: Array<{ scorer: string; assist1: string; assist2: string }>;
    awayGoals: Array<{ scorer: string; assist1: string; assist2: string }>;
    homePenalties: Array<{ player: string; minutes: string }>;
    awayPenalties: Array<{ player: string; minutes: string }>;
  }
) => {
  try {
    // Get team IDs
    const [homeTeam, awayTeam] = await Promise.all([
      getTeamByName(gameData.homeTeamId),
      getTeamByName(gameData.awayTeamId)
    ]);

    if (!homeTeam || !awayTeam) {
      console.error('Teams not found:', gameData.homeTeamId, gameData.awayTeamId);
      return;
    }

    // If we have old game data, first subtract the old stats
    if (oldGameData) {
      const [oldHomeTeam, oldAwayTeam] = await Promise.all([
        getTeamByName(oldGameData.homeTeamId),
        getTeamByName(oldGameData.awayTeamId)
      ]);

      if (oldHomeTeam && oldAwayTeam) {
        const oldPlayerUpdates: Map<string, { goals: number; assists: number; penaltyMinutes: number }> = new Map();

        // Process old home team goals
        for (const goal of oldGameData.homeGoals) {
          if (goal.scorer) {
            const current = oldPlayerUpdates.get(goal.scorer) || { goals: 0, assists: 0, penaltyMinutes: 0 };
            oldPlayerUpdates.set(goal.scorer, { ...current, goals: current.goals + 1 });
          }
          if (goal.assist1) {
            const current = oldPlayerUpdates.get(goal.assist1) || { goals: 0, assists: 0, penaltyMinutes: 0 };
            oldPlayerUpdates.set(goal.assist1, { ...current, assists: current.assists + 1 });
          }
          if (goal.assist2) {
            const current = oldPlayerUpdates.get(goal.assist2) || { goals: 0, assists: 0, penaltyMinutes: 0 };
            oldPlayerUpdates.set(goal.assist2, { ...current, assists: current.assists + 1 });
          }
        }

        // Process old away team goals
        for (const goal of oldGameData.awayGoals) {
          if (goal.scorer) {
            const current = oldPlayerUpdates.get(goal.scorer) || { goals: 0, assists: 0, penaltyMinutes: 0 };
            oldPlayerUpdates.set(goal.scorer, { ...current, goals: current.goals + 1 });
          }
          if (goal.assist1) {
            const current = oldPlayerUpdates.get(goal.assist1) || { goals: 0, assists: 0, penaltyMinutes: 0 };
            oldPlayerUpdates.set(goal.assist1, { ...current, assists: current.assists + 1 });
          }
          if (goal.assist2) {
            const current = oldPlayerUpdates.get(goal.assist2) || { goals: 0, assists: 0, penaltyMinutes: 0 };
            oldPlayerUpdates.set(goal.assist2, { ...current, assists: current.assists + 1 });
          }
        }

        // Process old home team penalties
        for (const penalty of oldGameData.homePenalties) {
          if (penalty.player && penalty.minutes) {
            const current = oldPlayerUpdates.get(penalty.player) || { goals: 0, assists: 0, penaltyMinutes: 0 };
            oldPlayerUpdates.set(penalty.player, {
              ...current,
              penaltyMinutes: current.penaltyMinutes + parseInt(penalty.minutes)
            });
          }
        }

        // Process old away team penalties
        for (const penalty of oldGameData.awayPenalties) {
          if (penalty.player && penalty.minutes) {
            const current = oldPlayerUpdates.get(penalty.player) || { goals: 0, assists: 0, penaltyMinutes: 0 };
            oldPlayerUpdates.set(penalty.player, {
              ...current,
              penaltyMinutes: current.penaltyMinutes + parseInt(penalty.minutes)
            });
          }
        }

        // Subtract old stats from all affected players
        for (const [playerName, stats] of oldPlayerUpdates) {
          // Try to find player in old home team first, then old away team
          let player = await getPlayerByName(playerName, oldHomeTeam.id);
          if (!player) {
            player = await getPlayerByName(playerName, oldAwayTeam.id);
          }

          if (player) {
            const updatedStats = {
              goals: player.goals - stats.goals,
              assists: player.assists - stats.assists,
              points: player.points - stats.goals - stats.assists,
              penaltyMinutes: player.penaltyMinutes - stats.penaltyMinutes
            };

            await updatePlayer(player.id, updatedStats);
            console.log(`Subtracted old stats for ${playerName}:`, stats);
          } else {
            console.warn(`Player not found for old stats removal: ${playerName}`);
          }
        }
      }
    }

    // Track player updates
    const playerUpdates: Map<string, { goals: number; assists: number; penaltyMinutes: number }> = new Map();

    // Process home team goals
    for (const goal of gameData.homeGoals) {
      if (goal.scorer) {
        const current = playerUpdates.get(goal.scorer) || { goals: 0, assists: 0, penaltyMinutes: 0 };
        playerUpdates.set(goal.scorer, { ...current, goals: current.goals + 1 });
      }
      if (goal.assist1) {
        const current = playerUpdates.get(goal.assist1) || { goals: 0, assists: 0, penaltyMinutes: 0 };
        playerUpdates.set(goal.assist1, { ...current, assists: current.assists + 1 });
      }
      if (goal.assist2) {
        const current = playerUpdates.get(goal.assist2) || { goals: 0, assists: 0, penaltyMinutes: 0 };
        playerUpdates.set(goal.assist2, { ...current, assists: current.assists + 1 });
      }
    }

    // Process away team goals
    for (const goal of gameData.awayGoals) {
      if (goal.scorer) {
        const current = playerUpdates.get(goal.scorer) || { goals: 0, assists: 0, penaltyMinutes: 0 };
        playerUpdates.set(goal.scorer, { ...current, goals: current.goals + 1 });
      }
      if (goal.assist1) {
        const current = playerUpdates.get(goal.assist1) || { goals: 0, assists: 0, penaltyMinutes: 0 };
        playerUpdates.set(goal.assist1, { ...current, assists: current.assists + 1 });
      }
      if (goal.assist2) {
        const current = playerUpdates.get(goal.assist2) || { goals: 0, assists: 0, penaltyMinutes: 0 };
        playerUpdates.set(goal.assist2, { ...current, assists: current.assists + 1 });
      }
    }

    // Process home team penalties
    for (const penalty of gameData.homePenalties) {
      if (penalty.player && penalty.minutes) {
        const current = playerUpdates.get(penalty.player) || { goals: 0, assists: 0, penaltyMinutes: 0 };
        playerUpdates.set(penalty.player, {
          ...current,
          penaltyMinutes: current.penaltyMinutes + parseInt(penalty.minutes)
        });
      }
    }

    // Process away team penalties
    for (const penalty of gameData.awayPenalties) {
      if (penalty.player && penalty.minutes) {
        const current = playerUpdates.get(penalty.player) || { goals: 0, assists: 0, penaltyMinutes: 0 };
        playerUpdates.set(penalty.player, {
          ...current,
          penaltyMinutes: current.penaltyMinutes + parseInt(penalty.minutes)
        });
      }
    }

    // Update all players with new stats
    for (const [playerName, stats] of playerUpdates) {
      // Try to find player in home team first, then away team
      let player = await getPlayerByName(playerName, homeTeam.id);
      if (!player) {
        player = await getPlayerByName(playerName, awayTeam.id);
      }

      if (player) {
        const updatedStats = {
          goals: player.goals + stats.goals,
          assists: player.assists + stats.assists,
          points: player.points + stats.goals + stats.assists,
          penaltyMinutes: player.penaltyMinutes + stats.penaltyMinutes,
          // Only increment games played if this is a new game (no old data)
          ...(oldGameData ? {} : { gamesPlayed: player.gamesPlayed + 1 })
        };

        await updatePlayer(player.id, updatedStats);
        console.log(`Updated stats for ${playerName}:`, stats);
      } else {
        console.warn(`Player not found: ${playerName}`);
      }
    }

    console.log('Player stats updated for game:', gameId);
  } catch (error) {
    console.error('Error updating player stats:', error);
  }
};

// Goalie Stats Management
export const updateGoalieStatsFromGame = async (
  gameId: string,
  gameData: {
    homeTeamId: string;
    awayTeamId: string;
    homeGoalie?: string;
    awayGoalie?: string;
    homeScore: number;
    awayScore: number;
    homeShots: number;
    awayShots: number;
    homeEmptyNetGoals?: number;
    awayEmptyNetGoals?: number;
  },
  oldGameData?: {
    homeTeamId: string;
    awayTeamId: string;
    homeGoalie?: string;
    awayGoalie?: string;
    homeScore: number;
    awayScore: number;
    homeShots: number;
    awayShots: number;
    homeEmptyNetGoals?: number;
    awayEmptyNetGoals?: number;
  }
) => {
  try {
    // Get team IDs
    const [homeTeam, awayTeam] = await Promise.all([
      getTeamByName(gameData.homeTeamId),
      getTeamByName(gameData.awayTeamId)
    ]);

    if (!homeTeam || !awayTeam) {
      console.error('Teams not found:', gameData.homeTeamId, gameData.awayTeamId);
      return;
    }

    // If we have old game data, first subtract the old stats
    if (oldGameData) {
      // Subtract old home goalie stats
      if (oldGameData.homeGoalie) {
        const homeGoalie = await getGoalieByName(oldGameData.homeGoalie);

        if (homeGoalie) {
          const oldShotsAgainst = oldGameData.awayShots;
          // Subtract empty net goals from goals against (home goalie faces away team)
          const oldEmptyNetGoals = oldGameData.awayEmptyNetGoals || 0;
          const oldGoalsAgainst = oldGameData.awayScore - oldEmptyNetGoals;
          const oldSaves = oldShotsAgainst - oldGoalsAgainst;
          const totalShots = homeGoalie.totalShots - oldShotsAgainst;
          const totalGoalsAllowed = homeGoalie.goalsAllowed - oldGoalsAgainst;
          const totalSaves = homeGoalie.saves - oldSaves;
          const savePercentage = totalShots > 0 ? (totalSaves / totalShots) * 100 : 0;

          await updateGoalie(homeGoalie.id, {
            totalShots: totalShots,
            goalsAllowed: totalGoalsAllowed,
            saves: totalSaves,
            savePercentage: parseFloat(savePercentage.toFixed(2))
          });

          console.log(`Subtracted old stats for goalie ${oldGameData.homeGoalie}`);
        }
      }

      // Subtract old away goalie stats
      if (oldGameData.awayGoalie) {
        const awayGoalie = await getGoalieByName(oldGameData.awayGoalie);

        if (awayGoalie) {
          const oldShotsAgainst = oldGameData.homeShots;
          // Subtract empty net goals from goals against (away goalie faces home team)
          const oldEmptyNetGoals = oldGameData.homeEmptyNetGoals || 0;
          const oldGoalsAgainst = oldGameData.homeScore - oldEmptyNetGoals;
          const oldSaves = oldShotsAgainst - oldGoalsAgainst;
          const totalShots = awayGoalie.totalShots - oldShotsAgainst;
          const totalGoalsAllowed = awayGoalie.goalsAllowed - oldGoalsAgainst;
          const totalSaves = awayGoalie.saves - oldSaves;
          const savePercentage = totalShots > 0 ? (totalSaves / totalShots) * 100 : 0;

          await updateGoalie(awayGoalie.id, {
            totalShots: totalShots,
            goalsAllowed: totalGoalsAllowed,
            saves: totalSaves,
            savePercentage: parseFloat(savePercentage.toFixed(2))
          });

          console.log(`Subtracted old stats for goalie ${oldGameData.awayGoalie}`);
        }
      }
    }

    // Update home goalie stats (if specified)
    if (gameData.homeGoalie) {
      const homeGoalie = await getGoalieByName(gameData.homeGoalie);

      if (homeGoalie) {
        const shotsAgainst = gameData.awayShots;
        // Subtract empty net goals from goals against (home goalie faces away team)
        const emptyNetGoals = gameData.awayEmptyNetGoals || 0;
        const goalsAgainst = gameData.awayScore - emptyNetGoals;
        const saves = shotsAgainst - goalsAgainst;
        const totalShots = homeGoalie.totalShots + shotsAgainst;
        const totalGoalsAllowed = homeGoalie.goalsAllowed + goalsAgainst;
        const totalSaves = homeGoalie.saves + saves;
        const savePercentage = totalShots > 0 ? (totalSaves / totalShots) * 100 : 0;

        await updateGoalie(homeGoalie.id, {
          // Only increment games played if this is a new game (no old data)
          ...(oldGameData ? {} : { gamesPlayed: homeGoalie.gamesPlayed + 1 }),
          totalShots: totalShots,
          goalsAllowed: totalGoalsAllowed,
          saves: totalSaves,
          savePercentage: parseFloat(savePercentage.toFixed(2))
        });

        console.log(`Updated stats for goalie ${gameData.homeGoalie}: ${saves} saves, ${savePercentage.toFixed(2)}% save percentage`);
      } else {
        console.warn(`Home goalie not found: ${gameData.homeGoalie}`);
      }
    }

    // Update away goalie stats (if specified)
    if (gameData.awayGoalie) {
      const awayGoalie = await getGoalieByName(gameData.awayGoalie);

      if (awayGoalie) {
        const shotsAgainst = gameData.homeShots;
        // Subtract empty net goals from goals against (away goalie faces home team)
        const emptyNetGoals = gameData.homeEmptyNetGoals || 0;
        const goalsAgainst = gameData.homeScore - emptyNetGoals;
        const saves = shotsAgainst - goalsAgainst;
        const totalShots = awayGoalie.totalShots + shotsAgainst;
        const totalGoalsAllowed = awayGoalie.goalsAllowed + goalsAgainst;
        const totalSaves = awayGoalie.saves + saves;
        const savePercentage = totalShots > 0 ? (totalSaves / totalShots) * 100 : 0;

        await updateGoalie(awayGoalie.id, {
          // Only increment games played if this is a new game (no old data)
          ...(oldGameData ? {} : { gamesPlayed: awayGoalie.gamesPlayed + 1 }),
          totalShots: totalShots,
          goalsAllowed: totalGoalsAllowed,
          saves: totalSaves,
          savePercentage: parseFloat(savePercentage.toFixed(2))
        });

        console.log(`Updated stats for goalie ${gameData.awayGoalie}: ${saves} saves, ${savePercentage.toFixed(2)}% save percentage`);
      } else {
        console.warn(`Away goalie not found: ${gameData.awayGoalie}`);
      }
    }

    console.log('Goalie stats updated for game:', gameId);
  } catch (error) {
    console.error('Error updating goalie stats:', error);
  }
};