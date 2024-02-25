export class GameStateDTO {
    gameBoard: string[][];
    nextPlayer: string;

    constructor(gameBoard: string[][], nextPlayer: string) {
        this.gameBoard = gameBoard;
        this.nextPlayer = nextPlayer;
    }
}
