export class MatchFoundDTO {
    gameId: string;
    startingPlayer: string;

    ownSymbol: string;

    opponentUsername: string;
    opponentElo: number;
    opponentSymbol: string;

    constructor(gameId: string, ownSymbol: string, opponentUsername: string, opponentElo: number, opponentSymbol: string, startingPlayer: string) {
        this.gameId = gameId;
        this.ownSymbol = ownSymbol;
        this.opponentUsername = opponentUsername;
        this.opponentElo = opponentElo;
        this.opponentSymbol = opponentSymbol;

        this.startingPlayer = startingPlayer;
    }
}
