import {ApiProperty} from "@nestjs/swagger";

/**
 * `GameStatsDTO` is a data transfer object that summarizes the game statistics for a user, including
 * the total number of games played, the number of games won, lost, and drawn.
 *
 * @class GameStatsDTO
 */
export class GameStatsDTO {
    @ApiProperty({ example: 25, description: 'Total number of games played by the user' })
    totalGames: number;

    @ApiProperty({ example: 15, description: 'Number of games won by the user' })
    wonGames: number;

    @ApiProperty({ example: 5, description: 'Number of games lost by the user' })
    lostGames: number;

    @ApiProperty({ example: 5, description: 'Number of games that ended in a draw' })
    drawGames: number;

    constructor(totalGames: number, wonGames: number, lostGames: number, drawGames: number) {
        this.totalGames = totalGames;
        this.wonGames = wonGames;
        this.lostGames = lostGames;
        this.drawGames = drawGames;
    }
}
