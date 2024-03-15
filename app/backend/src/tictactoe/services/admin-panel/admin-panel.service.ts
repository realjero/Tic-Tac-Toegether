import {Injectable} from '@nestjs/common';
import {MatchmakingService} from "../matchmaking/matchmaking.service";
import {GameService} from "../game/game.service";
import {AdminQueueItemDTO} from "../../payload/AdminQueueItemDTO";
import {UserService} from "../../../database/services/user/user.service";
import {UsernameEloDTO} from "../../payload/UsernameEloDTO";
import {AdminGameItemDTO} from "../../payload/AdminGameItemDTO";
import {UsernameEloSymbolDTO} from "../../payload/UsernameEloSymbolDTO";
import {UserEloRatingService} from "../../../database/services/user-elo-rating/user-elo-rating.service";
import {EGameSymbol} from "../../model/EGameSymbol";

/**
 * `AdminPanelService` provides administrative functionalities, particularly for managing and
 * viewing the matchmaking queue and the list of all games within the admin panel. It leverages
 * other services such as `UserService`, `UserEloRatingService`, `MatchmakingService`, and
 * `GameService` to gather the necessary data.
 *
 * @Injectable Decorator that marks this class as a provider within the NestJS dependency injection system,
 * allowing it to be injected into other classes as needed.
 */
@Injectable()
export class AdminPanelService {
    /**
     * Constructs a new instance of `AdminPanelService` with injected dependencies for user management,
     * Elo rating management, matchmaking, and game services.
     *
     * @param userDatabaseService Service for user-related database operations.
     * @param userEloDatabaseService Service for managing user Elo ratings in the database.
     * @param matchmakingService Service for handling matchmaking logic and queue management.
     * @param gameService Service for managing game sessions and retrieving game data.
     */
    constructor(
        private userDatabaseService: UserService,
        private userEloDatabaseService: UserEloRatingService,
        private matchmakingService: MatchmakingService,
        private gameService: GameService,
    ) {}


    /**
     * Retrieves the current matchmaking queue, including user information and Elo ratings for each
     * user in the queue, formatted as an array of `AdminQueueItemDTO` objects for administrative viewing.
     *
     * @returns {Promise<AdminQueueItemDTO[]>} A promise that resolves to an array of `AdminQueueItemDTO` objects,
     * representing the current state of the matchmaking queue.
     */
    async getMatchmakingQueue(): Promise<AdminQueueItemDTO[]> {
        const queueItems = await this.matchmakingService.getMatchmakingQueue();
        if(!queueItems)
            return [];

        return await Promise.all(queueItems.map(async item => {
            const user = await this.userDatabaseService.findUserByUserId(item.userId);
            return new AdminQueueItemDTO(
                new UsernameEloDTO(user.username, item.elo),
                item.bucket
            );
        }));
    }

    /**
     * Retrieves a list of all ongoing and completed game sessions, formatted as an array of
     * `AdminGameItemDTO` objects for administrative viewing. This includes detailed information
     * about the players in each game and the game's unique identifier.
     *
     * @returns {Promise<AdminGameItemDTO[]>} A promise that resolves to an array of `AdminGameItemDTO` objects,
     * representing all games within the system.
     */
    async getAllGames(): Promise<AdminGameItemDTO[]> {
        const games = await this.gameService.getAllGames();

        return await Promise.all(games.map(async game => {
            const user1 = await this.userDatabaseService.findUserByUserId(game.user1Id);
            const user2 = await this.userDatabaseService.findUserByUserId(game.user2Id);

            const user1DTO= new UsernameEloSymbolDTO(
                user1.username,
                await this.userEloDatabaseService.getLatestEloRatingFromUserId(game.user1Id),
                EGameSymbol[game.user1Symbol]
            );

            const user2DTO= new UsernameEloSymbolDTO(
                user2.username,
                await this.userEloDatabaseService.getLatestEloRatingFromUserId(game.user2Id),
                EGameSymbol[game.user2Symbol]
            );

            return new AdminGameItemDTO(
                user1DTO,
                user2DTO,
                game.startedWithPlayer1 ? user1DTO : user1DTO,
                game.gameId
            );
        }));
    }
}
