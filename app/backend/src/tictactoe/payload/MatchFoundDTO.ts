/**
 * DTO for a match found event.
 */
export class MatchFoundDTO {
  /**
   * The ID of the game.
   */
  gameId: string;

  /**
   * The player who started the game.
   */
  startingPlayer: string;

  /**
   * The symbol of the player who sent the event.
   */
  ownSymbol: string;

  /**
   * The username of the opponent.
   */
  opponentUsername: string;

  /**
   * The ELO of the opponent.
   */
  opponentElo: number;

  /**
   * The symbol of the opponent.
   */
  opponentSymbol: string;

  /**
   * Creates a new MatchFoundDTO instance.
   * @param gameId - The ID of the game.
   * @param ownSymbol - The symbol of the player who sent the event.
   * @param opponentUsername - The username of the opponent.
   * @param opponentElo - The ELO of the opponent.
   * @param opponentSymbol - The symbol of the opponent.
   * @param startingPlayer - The player who started the game.
   */
  constructor(gameId: string, ownSymbol: string, opponentUsername: string, opponentElo: number, opponentSymbol: string, startingPlayer: string) {
    this.gameId = gameId;
    this.ownSymbol = ownSymbol;
    this.opponentUsername = opponentUsername;
    this.opponentElo = opponentElo;
    this.opponentSymbol = opponentSymbol;
    this.startingPlayer = startingPlayer;
  }
}
