import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './services/user/user.service';
import { UserEntity } from './models/UserEntity';
import { GameResultService } from './services/game-result/game-result.service';
import { GameResultEntity } from './models/GameResultEntity';
import { UserEloRatingService } from './services/user-elo-rating/user-elo-rating.service';
import { UserEloRatingEntity } from './models/UserEloRatingEntity';
import * as fs from "fs";
import {PasswordService} from "../authentication/services/password/password.service";
import {EloService} from "../tictactoe/services/elo/elo.service";
import {InitSeederService} from "./services/seeders/init-seeder/init-seeder.service";

const databasePath = '../../database.sqlite';
const isDatabaseFileCreated = !fs.existsSync(databasePath);

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'sqlite',
            database: databasePath,
            entities: [UserEntity, GameResultEntity, UserEloRatingEntity],
            synchronize: true,
        }),

    ],
    providers: [UserService, GameResultService, UserEloRatingService, PasswordService, EloService, InitSeederService],
    exports: [UserService, GameResultService, UserEloRatingService],
})

export class DatabaseModule {
    static isDatabaseFileCreated = isDatabaseFileCreated;
}
