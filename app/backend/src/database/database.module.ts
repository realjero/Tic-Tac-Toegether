import {Module} from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserService} from "./services/user/user.service";
import {UserEntity} from "./models/UserEntity";

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: "sqlite",
            database: '../../database.sqlite',
            entities: [UserEntity],
            synchronize: true
        }),
    ],
    providers: [UserService],
    exports: [UserService]
})
export class DatabaseModule {
}
