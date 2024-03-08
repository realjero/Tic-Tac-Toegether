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

@Injectable()
export class AdminPanelService {
    constructor(
        private userDatabaseService: UserService,
        private userEloDatabaseService: UserEloRatingService,
        private matchmakingService: MatchmakingService,
        private gameService: GameService,
    ) {}

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
