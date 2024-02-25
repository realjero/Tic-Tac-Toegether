import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './services/user/user.service';
import { UserEntity } from './models/UserEntity';
import { GameResultService } from './services/game-result/game-result.service';
import { GameResultEntity } from './models/GameResultEntity';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'sqlite',
            database: '../../database.sqlite',
            entities: [UserEntity, GameResultEntity],
            synchronize: true,
        }),
    ],
    providers: [UserService, GameResultService],
    exports: [UserService, GameResultService],
})
export class DatabaseModule {}
