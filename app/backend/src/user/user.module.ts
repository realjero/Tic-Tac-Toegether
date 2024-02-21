import { Module } from '@nestjs/common';
import {UserController} from "./controller/user/user.controller";
import {UserService} from "./services/user/user.service";
import {DatabaseModule} from "../database/database.module";

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [DatabaseModule]
})
export class UserModule {}
