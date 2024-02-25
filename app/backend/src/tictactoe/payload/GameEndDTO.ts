export class GameEndDTO {
    winner: string | undefined;
    gameState: string;
    newXElo: number;
    newOElo: number;

    constructor(winner: string, gameState: string, newXElo: number, newOElo: number) {
        this.winner = winner;
        this.gameState = gameState;
        this.newXElo = newXElo;
        this.newOElo = newOElo;
    }
}
