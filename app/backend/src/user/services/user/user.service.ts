import { Injectable } from '@nestjs/common';
import { UserService as UserServiceDatabase } from '../../../database/services/user/user.service';
import { GameResultService as GameResultServiceDatabase } from '../../../database/services/game-result/game-result.service';

import { UserDTO } from '../../payload/UserDTO';
import { GameStatsDTO } from '../../payload/GameStatsDTO';
import { UserEntity } from '../../../database/models/UserEntity';

@Injectable()
export class UserService {
  constructor(
    private userServiceDatabase: UserServiceDatabase,
    private gameResultServiceDatabase: GameResultServiceDatabase,
  ) {}

  async transformUserIdToUserDTO(userId: number): Promise<UserDTO | undefined> {
    const user = await this.userServiceDatabase.findUserByUserId(userId);
    if (!user) return undefined;

    return new UserDTO(
      user.username,
      user.elo,
      user.isAdmin,
      await this.calculateUserStats(userId),
    );
  }

  async calculateUserStats(userId: number): Promise<GameStatsDTO> {
    const gamesWhereUserWasAPart =
      await this.gameResultServiceDatabase.findGamesByUser(userId);

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

  async updateUserName(
    userId,
    username: string,
  ): Promise<UserEntity | undefined> {
    return await this.userServiceDatabase.updateUser(userId, username);
  }

  async saveImage(userId: number, file: Express.Multer.File) {
    return await this.userServiceDatabase.saveImage(userId, file.buffer);
  }

  async getImage(userId: number) {
    return await this.userServiceDatabase.getImageAsByteArray(userId);
  }
}
