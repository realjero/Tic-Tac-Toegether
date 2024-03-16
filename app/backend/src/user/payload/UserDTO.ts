import { GameStatsDTO } from './GameStatsDTO';
import {ApiProperty} from "@nestjs/swagger";

/**
 * `UserDTO` is a data transfer object that encapsulates essential information about a user, including
 * their username, Elo rating, admin status, and game statistics. It is used to represent user profiles
 * in various parts of the application, especially when communicating user details to clients.
 *
 * @class UserDTO
 */
export class UserDTO {
    @ApiProperty({ example: 'john_doe', description: 'Username of the user' })
    username: string;

    @ApiProperty({ example: 1500, description: 'Elo rating of the user' })
    elo: number;

    @ApiProperty({ example: false, description: 'Whether the user has admin privileges' })
    isAdmin: boolean;

    @ApiProperty({ example: new Date(), description: 'account creation date of the user' })
    createdAt: Date;

    @ApiProperty({ type: GameStatsDTO, description: 'Game statistics for the user' })
    gameStats: GameStatsDTO;

    constructor(username: string, elo: number, isAdmin: boolean, createdAt: Date, gameStats: GameStatsDTO) {
        this.username = username;
        this.elo = elo;
        this.isAdmin = isAdmin;
        this.gameStats = gameStats;
        this.createdAt = createdAt;
    }
}
