import {Injectable} from '@nestjs/common';
import {UserService as UserServiceDatabase} from '../../../database/services/user/user.service';
import {
    GameResultService as GameResultServiceDatabase
} from '../../../database/services/game-result/game-result.service';

import {UserDTO} from '../../payload/UserDTO';
import {GameStatsDTO} from '../../payload/GameStatsDTO';
import {UserEntity} from '../../../database/models/UserEntity';
import {GameHistoryDTO} from '../../payload/GameHistoryDTO';
import {
    UserEloRatingService as UserEloRatingServiceDatabase
} from '../../../database/services/user-elo-rating/user-elo-rating.service';
import {UsernameEloDTO} from "../../../tictactoe/payload/UsernameEloDTO";

/**
 * `UserService` is responsible for user-related operations, including transforming user data into Data Transfer Objects (DTOs)
 * for easy transport and consumption by the client side of the application. It interacts with various database services
 * to fetch user information, user Elo ratings, and game results to compile comprehensive user profiles and statistics.
 *
 * @Injectable Decorator that marks this class as a provider within the NestJS dependency injection system,
 * allowing it to be injected into other classes as needed.
 */
@Injectable()
export class UserService {
    /**
     * Constructs a new instance of `UserService` with injected dependencies for database access and operations.
     *
     * @param {UserServiceDatabase} userServiceDatabase - Service for accessing user-related data from the database.
     * @param {GameResultServiceDatabase} gameResultServiceDatabase - Service for accessing game result data from the database.
     * @param {UserEloRatingServiceDatabase} userEloDatabaseService - Service for accessing user Elo rating data from the database.
     */
    constructor(
        private userServiceDatabase: UserServiceDatabase,
        private gameResultServiceDatabase: GameResultServiceDatabase,
        private userEloDatabaseService: UserEloRatingServiceDatabase
    ) {}

    /**
     * Converts a username into a `UserDTO`, including the user's basic information and game statistics.
     *
     * @param {string} username - The username of the user to transform into a DTO.
     * @returns {Promise<UserDTO | undefined>} A promise that resolves to a `UserDTO` if the user is found, or `undefined` if not.
     */
    async transformUsernameToUserDTO(username: string): Promise<UserDTO | undefined> {
        const user = await this.userServiceDatabase.findUserByUsername(username);
        if (!user) return undefined;

        return new UserDTO(
            user.username,
            await this.userEloDatabaseService.getLatestEloRatingFromUserId(user.id),
            user.isAdmin,
            user.createdAt,
            await this.calculateUserStats(user.id)
        );
    }

    /**
     * Converts a user ID into a `UserDTO`, including the user's basic information and game statistics.
     *
     * @param {number} userId - The ID of the user to transform into a DTO.
     * @returns {Promise<UserDTO | undefined>} A promise that resolves to a `UserDTO` if the user is found, or `undefined` if not.
     */
    async transformUserIdToUserDTO(userId: number): Promise<UserDTO | undefined> {
        const user = await this.userServiceDatabase.findUserByUserId(userId);
        if (!user) return undefined;

        return new UserDTO(
            user.username,
            await this.userEloDatabaseService.getLatestEloRatingFromUserId(userId),
            user.isAdmin,
            user.createdAt,
            await this.calculateUserStats(userId)
        );
    }

    /**
     * Calculates and compiles game statistics for a user, such as the total number of games played, won, lost, and drawn.
     *
     * @param {number} userId - The ID of the user for whom to calculate game statistics.
     * @returns {Promise<GameStatsDTO>} A promise that resolves to a `GameStatsDTO` containing the user's game statistics.
     */
    async calculateUserStats(userId: number): Promise<GameStatsDTO> {
        const gamesWhereUserWasAPart = await this.gameResultServiceDatabase.findGamesByUser(userId);

        let draws = 0;
        let wins = 0;
        let looses = 0;
        const totalGames = gamesWhereUserWasAPart.length;

        for (const game of gamesWhereUserWasAPart) {
            const winner = await game.winner;

            if (!winner) {
                draws++;
            } else if (winner.id === userId) {
                wins++;
            } else {
                looses++;
            }
        }

        return new GameStatsDTO(totalGames, wins, looses, draws);
    }

    /**
     * Retrieves the game history for a user identified by their username. This method fetches the user's
     * details based on their username and then delegates to `getGameHistoryById` to obtain the game history.
     *
     * @param {string} username - The username of the user whose game history is to be retrieved.
     * @returns {Promise<GameHistoryDTO[]>} A promise that resolves to an array of `GameHistoryDTO` objects representing the user's game history.
     */
    async getGameHistoryByUsername(username: string): Promise<GameHistoryDTO[]> {
        const user = await this.userServiceDatabase.findUserByUsername(username);
        return this.getGameHistoryById(user.id);
    }

    /**
     * Retrieves the game history for a user identified by their user ID. It fetches all games where the user
     * participated and constructs an array of `GameHistoryDTO` objects to represent each game's details.
     *
     * @param {number} userId - The unique identifier of the user whose game history is to be retrieved.
     * @returns {Promise<GameHistoryDTO[]>} A promise that resolves to an array of `GameHistoryDTO` objects representing the user's game history.
     */
    async getGameHistoryById(userId: number): Promise<GameHistoryDTO[]> {
        const gamesWhereUserWasAPart = await this.gameResultServiceDatabase.findGamesByUser(userId);

        return await Promise.all(gamesWhereUserWasAPart.map(async (game) => {
            const me = game.player1.player.id === userId ? game.player1 : game.player2;
            const opponent = game.player1.player.id === userId ? game.player2 : game.player1;

            return new GameHistoryDTO(
                game.created_at,
                me.elo,
                opponent.elo,
                opponent.player ? opponent.player.username : undefined,
                game.winner ? game.winner.username : undefined
            );
        }));
    }

    /**
     * Updates the username for a given user identified by their user ID. It relies on the user service database
     * to perform the update operation.
     *
     * @param {number} userId - The unique identifier of the user whose username is to be updated.
     * @param {string} username - The new username to be assigned to the user.
     * @returns {Promise<UserEntity | undefined>} A promise that resolves to the updated `UserEntity` or `undefined` if the operation failed.
     */
    async updateUserName(userId: number, username: string): Promise<UserEntity | undefined> {
        return await this.userServiceDatabase.updateUser(userId, username);
    }

    /**
     * Saves a profile image for a given user identified by their user ID. The image is provided as a file, and
     * its contents are stored for the user.
     *
     * @param {number} userId - The unique identifier of the user whose image is to be saved.
     * @param {Express.Multer.File} file - The image file to be saved for the user.
     * @returns {Promise<UserEntity | undefined>} A promise that resolves to the updated `UserEntity` with the new image or `undefined` if the operation failed.
     */
    async saveImage(userId: number, file: Express.Multer.File) {
        return await this.userServiceDatabase.saveImage(userId, file.buffer);
    }

    /**
     * Retrieves the profile image for a user identified by their username. The method fetches the user's details
     * and then retrieves the image stored for that user.
     *
     * @param {string} username - The username of the user whose image is to be retrieved.
     * @returns {Promise<Buffer | undefined>} A promise that resolves to the image data as a `Buffer` or `undefined` if no image is found.
     */
    async getImageByUsername(username: string) {
        const user = await this.userServiceDatabase.findUserByUsername(username);
        return user
            ? await this.userServiceDatabase.getImageAsByteArrayByUserId(user.id)
            : undefined;
    }

    /**
     * Updates the password for a given user identified by their user ID. The new password is provided as a plain string
     * and should be securely hashed before being stored.
     *
     * @param {number} userId - The unique identifier of the user whose password is to be updated.
     * @param {string} password - The new password to be set for the user.
     * @returns {Promise<UserEntity | undefined>} A promise that resolves to the updated `UserEntity` or `undefined` if the operation failed.
     */
    async updateUserPassword(userId: number, password: string): Promise<UserEntity | undefined> {
        return await this.userServiceDatabase.updateUserPassword(userId, password);
    }

    /**
     * Checks if a username already exists in the database. This is used to ensure usernames are unique across the application.
     *
     * @param {string} username - The username to check for existence.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the username exists, or `false` otherwise.
     */
    async doesUserNameExist(username: string): Promise<boolean> {
        return (await this.userServiceDatabase.findUserByUsername(username)) !== null;
    }

    /**
     * Retrieves a list of all users along with their current Elo rating. This method is useful for administrative purposes,
     * allowing for a quick overview of all users and their performance ratings.
     *
     * @returns {Promise<UsernameEloDTO[]>} A promise that resolves to an array of `UsernameEloDTO` objects representing all users and their Elo ratings.
     */
    async getAllUsers(): Promise<UsernameEloDTO[]> {
        const users = await this.userServiceDatabase.getAllUsers();
        return Promise.all(users.map(async user => {
            const eloRating = await this.userEloDatabaseService.getLatestEloRatingFromUserId(user.id);
            return new UsernameEloDTO(user.username, eloRating);
        }));
    }
}
