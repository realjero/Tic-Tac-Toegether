import {ApiProperty} from "@nestjs/swagger";

/**
 * DTO that contains username, elo rating, and symbol of a user
 */
export class UsernameEloSymbolDTO {
  /**
   * username of the user
   */
  @ApiProperty({ description: 'Username of the user' })
  username: string;

  /**
   * elo rating of the user
   */
  @ApiProperty({ description: 'Elo rating of the user' })
  elo: number;

  /**
   * symbol associated with the user
   */
  @ApiProperty({ description: 'Symbol associated with the user' })
  symbol: string;

  /**
   * constructor for the DTO
   * @param username username of the user
   * @param elo elo rating of the user
   * @param symbol symbol associated with the user
   */
  constructor(username: string, elo: number, symbol: string) {
    this.username = username;
    this.elo = elo;
    this.symbol = symbol;
  }
}
