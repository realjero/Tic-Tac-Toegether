import { Injectable } from '@nestjs/common';
import {DataSource, Repository} from "typeorm";
import {UserEntity} from "../../../models/UserEntity";
import {PasswordService} from "../../../../authentication/services/password/password.service";
import {DatabaseModule} from "../../../database.module";
import {UserService} from "../../user/user.service";
import {UserEloRatingEntity} from "../../../models/UserEloRatingEntity";
import {GameResultEntity} from "../../../models/GameResultEntity";
import {EloService} from "../../../../tictactoe/services/elo/elo.service";
import {UserEloRatingService} from "../../user-elo-rating/user-elo-rating.service";
import {GameOutcome} from "../../../../tictactoe/model/GameOutcome";

/**
 * Service responsible for initializing and seeding the database with initial data.
 * It handles the creation of initial users, their Elo ratings, and game results to simulate a pre-existing state.
 */
@Injectable()
export class InitSeederService {
    private readonly userRepository: Repository<UserEntity>;
    private readonly userEloRatingEntityRepository: Repository<UserEloRatingEntity>;
    private readonly gameResultRepository: Repository<GameResultEntity>;

    /**
     * Constructs the service with necessary dependencies.
     * @param dataSource The data source used to access the database.
     * @param passwordService Service for hashing passwords.
     * @param userService Service for user-related operations.
     * @param userEloRatingEntityService Service for Elo rating-related operations.
     * @param eloService Service for calculating Elo ratings.
     */
    constructor(
        private dataSource: DataSource,
        private passwordService: PasswordService,
        private userService: UserService,
        private userEloRatingEntityService: UserEloRatingService,
        private eloService: EloService
    ) {
        this.userRepository = dataSource.getRepository(UserEntity);
        this.userEloRatingEntityRepository = dataSource.getRepository(UserEloRatingEntity);
        this.gameResultRepository = dataSource.getRepository(GameResultEntity);
    }

    /**
     * Initializes the seeding process on module initialization. It sequentially seeds users,
     * their Elo ratings, and game results.
     */
    async onModuleInit() {
        await this.seedUsers();
        await this.seedUserEloRatings();
        await this.seedGames();
    }

    /**
     * Seeds initial users into the database. Users are created with predefined credentials and creation dates.
     */
    private async seedUsers() {
        if (DatabaseModule.isDatabaseFileCreated) {
            const incrementPerUserInMilliseconds = 24 * 60 * 60 * 1000; // Increment by 1 day for each subsequent user

            const baseDate = new Date('2024-03-01T12:00:00');

            const stefanCreationDate = new Date(baseDate.getTime() - incrementPerUserInMilliseconds); // 1 day before base date
            const kamalaCreationDate = new Date(stefanCreationDate.getTime() - incrementPerUserInMilliseconds); // 2 days before base date
            const paulaCreationDate = new Date(kamalaCreationDate.getTime() - incrementPerUserInMilliseconds); // 3 days before base date
            const adminCreationDate = new Date(paulaCreationDate.getTime() - incrementPerUserInMilliseconds); // 4 days before base date

            const users = [
                new UserEntity('Administrator', await this.passwordService.hashPassword('adminPassword123!'), adminCreationDate), //admin user
                new UserEntity('PaulaP', await this.passwordService.hashPassword('Wasd123!'), paulaCreationDate),
                new UserEntity('Kamala', await this.passwordService.hashPassword('Kamala123!'), kamalaCreationDate),
                new UserEntity('Stefan', await this.passwordService.hashPassword('Stefan123!'), stefanCreationDate),
            ];

            users[0].isAdmin = true;

            await this.userRepository.save(users);
            console.log('Users have been seeded');
        }
    }

    /**
     * Seeds initial Elo ratings for all users in the database. Each user starts with a default Elo rating.
     */
    private async seedUserEloRatings() {
        if (DatabaseModule.isDatabaseFileCreated) {
            const users = await this.userService.getAllUsers();

            //seed init data
            for (const user of users) {
                await this.userEloRatingEntityRepository.save(new UserEloRatingEntity(user, 1000));
            }
            console.log('UserInitElo have been seeded');
        }
    }

    /**
     * Seeds a predefined number of game results between random pairs of users with random outcomes and hardcoded dates.
     */
    private async seedGames() {
        if (DatabaseModule.isDatabaseFileCreated) {
            const users = await this.userService.getAllUsers();

            const gameDates = [
                new Date('2024-03-01T12:00:00'),
                new Date('2024-03-02T13:00:00'),
                new Date('2024-03-03T14:00:00'),
                new Date('2024-03-04T15:00:00'),
                new Date('2024-03-05T16:00:00'),
                new Date('2024-03-06T17:00:00'),
                new Date('2024-03-07T18:00:00'),
                new Date('2024-03-08T19:00:00'),
                new Date('2024-03-09T20:00:00'),
                new Date('2024-03-10T21:00:00'),
                new Date('2024-03-11T22:00:00'),
                new Date('2024-03-12T23:00:00'),
                new Date('2024-03-13T12:00:00'),
                new Date('2024-03-14T13:00:00'),
                new Date('2024-03-15T14:00:00'),
            ];

            const totalGames = 15;
            for (let i = 0; i < totalGames; i++) {
                const { user1, user2 } = this.selectRandomUsers(users);
                const outcome = this.getRandomOutcome();

                await this.processGameBetweenUsers(user1, user2, outcome, gameDates[i]);
            }

            //seed init data
            console.log('InitGames have been seeded');
        }
    }

    /**
     * Selects two random and distinct users from the provided list.
     * @param users The list of user entities to select from.
     * @returns An object containing two distinct user entities.
     */
    private selectRandomUsers(users) {
        let index1 = Math.floor(Math.random() * users.length);
        let index2 = Math.floor(Math.random() * users.length);

        while (index1 === index2) {
            index2 = Math.floor(Math.random() * users.length);
        }

        return { user1: users[index1], user2: users[index2] };
    }

    /**
     * Randomly selects a game outcome from the set of possible outcomes.
     * @returns A randomly selected game outcome.
     */
    private getRandomOutcome() {
        const outcomes = [GameOutcome.Win, GameOutcome.Lose, GameOutcome.Draw];
        const randomIndex = Math.floor(Math.random() * outcomes.length);
        return outcomes[randomIndex];
    }

    /**
     * Processes a game between two users, updating their Elo ratings based on the game outcome, and saving the game result.
     * @param user1 The first user entity participating in the game.
     * @param user2 The second user entity participating in the game.
     * @param outcome The outcome of the game.
     * @param date The date when the game took place.
     */
    private async processGameBetweenUsers(user1, user2, outcome, date) {
        const { newEloUser1, newEloUser2 } = await this.calculateEloRatingsForPair(user1, user2, outcome);
        const userEloRatingUser1 = await this.userEloRatingEntityService.saveUserEloRating(user1.id, newEloUser1);
        const userEloRatingUser2 = await this.userEloRatingEntityService.saveUserEloRating(user2.id, newEloUser2);

        await this.gameResultRepository.save(new GameResultEntity(
            userEloRatingUser1,
            userEloRatingUser2,
            outcome === GameOutcome.Draw ? null : user1,
            date)
        );
    }

    /**
     * Calculates the new Elo ratings for a pair of users based on a game's outcome.
     * @param user1 The first user entity.
     * @param user2 The second user entity.
     * @param outcome The outcome of the game affecting the users' Elo ratings.
     * @returns An object containing the new Elo ratings for both users.
     */
    private async calculateEloRatingsForPair(user1, user2, outcome) {
        const user1InitialElo = await this.userEloRatingEntityService.getLatestEloRatingFromUserId(user1.id);
        const user2InitialElo = await this.userEloRatingEntityService.getLatestEloRatingFromUserId(user2.id);

        const newEloUser1 = this.eloService.calculateNewRating(user1InitialElo, user2InitialElo, outcome);
        const newEloUser2 = this.eloService.calculateNewRating(user2InitialElo, user1InitialElo, this.getOppositeOutcome(outcome));

        return { newEloUser1, newEloUser2 };
    }

    /**
     * Determines the opposite game outcome. Useful for calculating the Elo rating change for the opponent.
     * @param outcome The original game outcome.
     * @returns The opposite game outcome.
     */
    private getOppositeOutcome(outcome) {
        switch (outcome) {
            case GameOutcome.Win:
                return GameOutcome.Lose;
            case GameOutcome.Lose:
                return GameOutcome.Win;
            case GameOutcome.Draw:
                return GameOutcome.Draw;
            default:
                throw new Error('Invalid game outcome');
        }
    }
}
