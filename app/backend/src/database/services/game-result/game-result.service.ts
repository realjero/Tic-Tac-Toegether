import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { GameResultEntity } from '../../models/GameResultEntity';
import { UserEloRatingEntity } from '../../models/UserEloRatingEntity';

/**
 * `GameResultService` provides services related to game results, including retrieving game results
 * for a specific user and saving new game results. It interacts with the `GameResultEntity` repository
 * to perform database operations.
 *
 * @Injectable Decorator that marks the class as a provider within the NestJS dependency injection system,
 * allowing it to be injected into other classes as needed.
 */
@Injectable()
export class GameResultService {
    private readonly gameResultRepository: Repository<GameResultEntity>;

    /**
     * Initializes a new instance of `GameResultService` and sets up the repository for `GameResultEntity`.
     *
     * @param dataSource The data source instance used to access the database and its repositories.
     */
    constructor(private dataSource: DataSource) {
        this.gameResultRepository = dataSource.getRepository(GameResultEntity);
    }

    /**
     * Retrieves all game results involving a specific user, identified by their user ID. This method
     * performs a complex query that joins the necessary tables to gather complete information about
     * each game, including player details and the winner of the game.
     *
     * @param {number} userId The unique identifier of the user for whom game results are being retrieved.
     * @returns {Promise<GameResultEntity[]>} A promise that resolves to an array of `GameResultEntity` instances.
     */
    async findGamesByUser(userId: number): Promise<GameResultEntity[]> {
        return await this.gameResultRepository
            .createQueryBuilder('gameResult')
            .leftJoinAndSelect('gameResult.player1', 'player1')
            .leftJoinAndSelect('player1.player', 'player1_user')
            .leftJoinAndSelect('gameResult.player2', 'player2')
            .leftJoinAndSelect('player2.player', 'player2_user')
            .leftJoinAndSelect('gameResult.winner', 'winner')
            .where('player1.player.id = :userId', { userId })
            .orWhere('player2.player.id = :userId', { userId })
            .orWhere('winner.id = :userId', { userId })
            .getMany();
    }

    /**
     * Saves a new game result to the database, including the Elo rating entries for both players involved
     * in the game and identifying the winner, if applicable. This method constructs a new `GameResultEntity`
     * instance with the provided information and persists it using the game result repository.
     *
     * @param {UserEloRatingEntity} user1NewEloEntry The new Elo rating entry for the first player.
     * @param {UserEloRatingEntity} user2NewEloEntry The new Elo rating entry for the second player.
     * @param {number} winnerId The unique identifier of the winning user, or `null` if the game was a draw.
     * @returns {Promise<GameResultEntity>} A promise that resolves to the saved `GameResultEntity` instance.
     */
    async saveGame(user1NewEloEntry: UserEloRatingEntity, user2NewEloEntry: UserEloRatingEntity, winnerId: number): Promise<GameResultEntity> {
        const gameResultEntity = new GameResultEntity(
            user1NewEloEntry,
            user2NewEloEntry,
            winnerId
                ?  user1NewEloEntry.player.id === winnerId
                    ? user1NewEloEntry.player
                    : user2NewEloEntry.player
                : undefined
        );
        return await this.gameResultRepository.save(gameResultEntity);
    }
}
