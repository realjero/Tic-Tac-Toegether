import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './services/user/user.service';
import { UserEntity } from './models/UserEntity';
import { GameResultService } from './services/game-result/game-result.service';
import { GameResultEntity } from './models/GameResultEntity';
import { UserEloRatingService } from './services/user-elo-rating/user-elo-rating.service';
import { UserEloRatingEntity } from './models/UserEloRatingEntity';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'sqlite',
            database: '../../database.sqlite',
            entities: [UserEntity, GameResultEntity, UserEloRatingEntity],
            synchronize: true,
        }),
    ],
    providers: [UserService, GameResultService, UserEloRatingService],
    exports: [UserService, GameResultService, UserEloRatingService],
})
export class DatabaseModule {}
