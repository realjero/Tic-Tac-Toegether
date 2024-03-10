import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { GameResultEntity } from '../../models/GameResultEntity';
import { UserEloRatingEntity } from '../../models/UserEloRatingEntity';

@Injectable()
export class GameResultService {
    private readonly gameResultRepository: Repository<GameResultEntity>;
    constructor(private dataSource: DataSource) {
        this.gameResultRepository = dataSource.getRepository(GameResultEntity);
    }

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

    async saveGame(user1NewEloEntry: UserEloRatingEntity, user2NewEloEntry: UserEloRatingEntity, winnerId: number): Promise<GameResultEntity> {
        const gameResultEntity = new GameResultEntity(
            user1NewEloEntry,
            user2NewEloEntry,
            user1NewEloEntry.player.id === winnerId ? user1NewEloEntry.player : user2NewEloEntry.player
        );
        return await this.gameResultRepository.save(gameResultEntity);
    }
}
