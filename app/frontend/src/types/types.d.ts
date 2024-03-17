export interface User {
    username: string;
    image?: string;
    elo: number;
    isAdmin: boolean;
    createdAt: Date;
    gameStats: {
        totalGames: number;
        wonGames: number;
        lostGames: number;
        drawGames: number;
    };
}

export interface UserImages {
    [key: string]: string | undefined;
}

export interface UserProfileItem {
    username: string;
    elo: number;
}

export interface GameData {
    gameId: string;
    ownSymbol: string;
    opponentUsername: string;
    opponentElo: number;
    opponentSymbol: string;
    startingPlayer: string;
}

export interface GameState {
    winner?: boolean;
    youNewElo: number;
    oppNewElo: number;
}

export interface Board {
    board: string[][];
    nextTurn?: string;
}

export interface ChatItem {
    message: string;
    sender: string;
    timestamp: Date;
}

export interface HistoryItem {
    opponentEloAtTimestamp: number;
    opponentName: string;
    ownEloAtTimestamp: number;
    timestamp: Date;
    winner: string;
}

export interface QueueItem {
    gameId: number;
    user: UserProfileItem;
}

export interface MatchItem {
    user1: UserProfileItem;
    user2: UserProfileItem;
    playerThatStarted: UserProfileItem;
    matchId: string;
}
