import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserEloRatingEntity } from '../../models/UserEloRatingEntity';
import { UserService } from '../user/user.service';

@Injectable()
export class UserEloRatingService {
    private readonly userEloRatingRepository: Repository<UserEloRatingEntity>;
    constructor(
        private dataSource: DataSource,
        private userService: UserService
    ) {
        this.userEloRatingRepository = dataSource.getRepository(UserEloRatingEntity);
    }

    async saveUserEloRating(userId: number, elo: number): Promise<UserEloRatingEntity> {
        const user = await this.userService.findUserByUserId(userId);

        return await this.userEloRatingRepository.save(new UserEloRatingEntity(user, elo));
    }

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
