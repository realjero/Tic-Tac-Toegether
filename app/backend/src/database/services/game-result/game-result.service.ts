import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { GameResultEntity } from '../../models/GameResultEntity';

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
      .leftJoinAndSelect('gameResult.player2', 'player2')
      .leftJoinAndSelect('gameResult.winner', 'winner')
      .where('player1.id = :userId', { userId })
      .orWhere('player2.id = :userId', { userId })
      .orWhere('winner.id = :userId', { userId })
      .getMany();
  }
}
