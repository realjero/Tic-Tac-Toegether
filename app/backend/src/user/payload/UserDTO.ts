import { GameStatsDTO } from './GameStatsDTO';

export class UserDTO {
  username: string;
  elo: number;
  isAdmin: boolean;
  gameStats: GameStatsDTO;

  constructor(
    username: string,
    elo: number,
    isAdmin: boolean,
    gameStats: GameStatsDTO,
  ) {
    this.username = username;
    this.elo = elo;
    this.isAdmin = isAdmin;
    this.gameStats = gameStats;
  }
}
