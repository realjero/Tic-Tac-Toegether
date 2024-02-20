import { Module } from '@nestjs/common';
import {AuthenticationController} from "./controller/authentication.controller";
import {DatabaseModule} from "../database/database.module";
import {PasswordService} from "./services/password/password.service";

@Module({
  controllers: [AuthenticationController],
  providers: [PasswordService],
  imports: [DatabaseModule]
})
export class AuthenticationModule {}
