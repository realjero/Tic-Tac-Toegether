import { Module } from '@nestjs/common';
import {AuthenticationController} from "./controller/authentication.controller";
import {DatabaseModule} from "../database/database.module";
import {PasswordService} from "./services/password/password.service";
import {JwtModule} from "@nestjs/jwt";
import {jwtKey} from "./constants";

@Module({
  controllers: [AuthenticationController],
  providers: [PasswordService],
  imports: [
      DatabaseModule,
      JwtModule.register({
        global: true,
        secret: jwtKey.secret,
        signOptions: { expiresIn: '7d' },
    }),
  ]
})
export class AuthenticationModule {}
