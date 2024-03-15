/**
 * A data transfer object that represents the state of a game.
 */
export class GameStateDTO {
  /**
   * The game board, represented as a 2D array of strings, where each string represents a row of the board.
   */
  gameBoard: string[][];

  /**
   * The player who is next in turn.
   */
  nextPlayer: string;

  /**
   * Creates a new instance of GameStateDTO.
   * @param gameBoard - The game board.
   * @param nextPlayer - The player who is next in turn.
   */
  constructor(gameBoard: string[][], nextPlayer: string) {
    this.gameBoard = gameBoard;
    this.nextPlayer = nextPlayer;
  }
}
