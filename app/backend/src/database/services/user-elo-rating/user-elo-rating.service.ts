import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserEloRatingEntity } from '../../models/UserEloRatingEntity';
import { UserService } from '../user/user.service';

/**
 * `UserEloRatingService` provides services related to managing users' Elo ratings, such as saving new Elo ratings
 * for users and retrieving the latest Elo ratings. It interacts with the `UserEloRatingEntity` repository to perform
 * database operations concerning user Elo rating entities. Additionally, it relies on the `UserService` for user-related
 * queries.
 *
 * @Injectable Decorator that marks the class as a provider within the NestJS dependency injection system,
 * allowing it to be injected into other classes as needed.
 */
@Injectable()
export class UserEloRatingService {
    private readonly userEloRatingRepository: Repository<UserEloRatingEntity>;

    /**
     * Initializes a new instance of `UserEloRatingService` and sets up the repository for `UserEloRatingEntity`.
     * It also injects the `UserService` for accessing user-related operations.
     *
     * @param dataSource The data source instance used to access the database and its repositories.
     * @param userService The service that provides user management functionalities.
     */
    constructor(
        private dataSource: DataSource,
        private userService: UserService
    ) {
        this.userEloRatingRepository = dataSource.getRepository(UserEloRatingEntity);
    }

    /**
     * Saves a new Elo rating for a user, identified by their user ID, into the database. This method first
     * retrieves the user entity using the `UserService` and then creates a new `UserEloRatingEntity` to be saved.
     *
     * @param {number} userId The unique identifier of the user for whom the Elo rating is being saved.
     * @param {number} elo The Elo rating to be saved for the user.
     * @returns {Promise<UserEloRatingEntity>} A promise that resolves to the newly created and saved `UserEloRatingEntity`.
     */
    async saveUserEloRating(userId: number, elo: number): Promise<UserEloRatingEntity> {
        const user = await this.userService.findUserByUserId(userId);

        return await this.userEloRatingRepository.save(new UserEloRatingEntity(user, elo));
    }

    /**
     * Retrieves the latest Elo rating for a user, identified by their user ID, from the database. This method
     * queries the `UserEloRatingEntity` repository to find the most recent Elo rating associated with the user.
     *
     * @param {number} userId The unique identifier of the user whose latest Elo rating is being retrieved.
     * @returns {Promise<number | undefined>} A promise that resolves to the latest Elo rating for the user, or `undefined` if not found.
     */
    async getLatestEloRatingFromUserId(userId: number): Promise<number | undefined> {
        const userEloRating = await this.userEloRatingRepository
            .createQueryBuilder('userEloRating')
            .leftJoinAndSelect('userEloRating.player', 'player')
            .where('player.id = :userId', { userId })
            .orderBy('userEloRating.id', 'DESC')
            .getOne();

        return userEloRating ? userEloRating.elo : undefined;
    }
}
