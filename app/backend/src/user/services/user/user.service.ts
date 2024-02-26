import { Injectable } from '@nestjs/common';
import { UserService as UserServiceDatabase } from '../../../database/services/user/user.service';
import { GameResultService as GameResultServiceDatabase } from '../../../database/services/game-result/game-result.service';

import { UserDTO } from '../../payload/UserDTO';
import { GameStatsDTO } from '../../payload/GameStatsDTO';
import { UserEntity } from '../../../database/models/UserEntity';
import { GameHistoryDTO } from '../../payload/GameHistoryDTO';
import { UserEloRatingService as UserEloRatingServiceDatabase } from '../../../database/services/user-elo-rating/user-elo-rating.service';

@Injectable()
export class UserService {
    constructor(
        private userServiceDatabase: UserServiceDatabase,
        private gameResultServiceDatabase: GameResultServiceDatabase,
        private userEloDatabaseService: UserEloRatingServiceDatabase
    ) {}

    async transformUserIdToUserDTO(userId: number): Promise<UserDTO | undefined> {
        const user = await this.userServiceDatabase.findUserByUserId(userId);
        if (!user) return undefined;

        return new UserDTO(
            user.username,
            await this.userEloDatabaseService.getLatestEloRatingFromUserId(userId),
            user.isAdmin,
            await this.calculateUserStats(userId)
        );
    }

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

    async getGameHistory(userId: number): Promise<GameHistoryDTO[]> {
        const gamesWhereUserWasAPart = await this.gameResultServiceDatabase.findGamesByUser(userId);

        return gamesWhereUserWasAPart.map(game => {
            const me = game.player1.id === userId ? game.player1 : game.player2;
            const opponent = game.player1.id === userId ? game.player2 : game.player1;
            return new GameHistoryDTO(
                game.created_at,
                me.elo,
                opponent.elo,
                opponent.player ? opponent.player.username : undefined,
                game.winner ? game.winner.username : undefined
            );
        });
    }

    async updateUserName(userId: number, username: string): Promise<UserEntity | undefined> {
        return await this.userServiceDatabase.updateUser(userId, username);
    }

    async saveImage(userId: number, file: Express.Multer.File) {
        return await this.userServiceDatabase.saveImage(userId, file.buffer);
    }

    async getImageByUserId(userId: number) {
        return await this.userServiceDatabase.getImageAsByteArrayByUserId(userId);
    }

    async getImageByUsername(username: string) {
        return await this.userServiceDatabase.getImageAsByteArrayByUserId((await this.userServiceDatabase.findUserByUsername(username)).id);
    }

    async updateUserPassword(userId: number, password: string): Promise<UserEntity | undefined> {
        return await this.userServiceDatabase.updateUserPassword(userId, password);
    }

    async doesUserNameExist(username: string): Promise<boolean> {
        return (await this.userServiceDatabase.findUserByUsername(username)) !== null;
    }
}
