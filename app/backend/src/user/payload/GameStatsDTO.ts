export class GameStatsDTO {
  totalGames: number;
  wonGames: number;
  lostGames: number;
  drawGames: number;

  constructor(
    totalGames: number,
    wonGames: number,
    lostGames: number,
    drawGames: number,
  ) {
    this.totalGames = totalGames;
    this.wonGames = wonGames;
    this.lostGames = lostGames;
    this.drawGames = drawGames;
  }
}
