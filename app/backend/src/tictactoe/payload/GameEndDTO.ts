/**
 * `GameEndDTO` is a data transfer object used to convey the outcome of a game, including the winner,
 * the final state of the game, and the new Elo ratings for both players.
 *
 * @class GameEndDTO
 */
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
