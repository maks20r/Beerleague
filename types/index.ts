export interface Team {
  id: string;
  name: string;
  division: 'A' | 'B';
  logo?: string;
  wins: number;
  losses: number;
  ties: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface Player {
  id: string;
  name: string;
  teamId: string;
  jerseyNumber: number;
  position: 'C' | 'LW' | 'RW' | 'D' | 'G';
  goals: number;
  assists: number;
  points: number;
  penaltyMinutes: number;
  gamesPlayed: number;
}

export interface Goalie {
  id: string;
  name: string;
  teamId: string;
  gamesPlayed: number;
  totalShots: number;
  goalsAllowed: number;
  saves: number;
  savePercentage: number;
}

export interface Game {
  id: string;
  gameNumber: number;
  date: Date;
  homeTeamId: string;
  awayTeamId: string;
  division: 'A' | 'B';
  homeGoalie?: string;
  awayGoalie?: string;
  referee?: string;
  homeScore?: number;
  awayScore?: number;
  homeEmptyNetGoals?: number;
  awayEmptyNetGoals?: number;
  shootout?: boolean;
  status: 'scheduled' | 'completed' | 'in_progress';
  venue?: string;
  homeShots?: number;
  awayShots?: number;
  homeGoals?: Array<{
    scorer: string;
    assist1: string;
    assist2: string;
    time: string;
  }>;
  awayGoals?: Array<{
    scorer: string;
    assist1: string;
    assist2: string;
    time: string;
  }>;
  homePenalties?: Array<{
    player: string;
    infraction: string;
    minutes: string;
  }>;
  awayPenalties?: Array<{
    player: string;
    infraction: string;
    minutes: string;
  }>;
}

export interface GameStat {
  id: string;
  gameId: string;
  playerId: string;
  teamId: string;
  goals: number;
  assists: number;
  penaltyMinutes: number;
}