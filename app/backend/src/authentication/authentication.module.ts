import { Module } from '@nestjs/common';
import { AuthenticationController } from './controller/authentication.controller';
import { DatabaseModule } from '../database/database.module';
import { PasswordService } from './services/password/password.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtKey } from './constants';
import { ValidationExceptionFilter } from './filters/validation-exception/validation-exception.filter';
import { WsAuthenticationGuard } from './guard/ws-authentication/ws-authentication.guard';
import { HttpAuthenticationGuard } from './guard/http-authentication/http-authentication.guard';
import { JwtHelperService } from './services/jwt-helper/jwt-helper.service';

@Module({
    controllers: [AuthenticationController],
    providers: [PasswordService, ValidationExceptionFilter, WsAuthenticationGuard, HttpAuthenticationGuard, JwtHelperService],
    imports: [
        DatabaseModule,
        JwtModule.register({
            global: true,
            secret: jwtKey.secret,
            signOptions: { expiresIn: '7d' },
        }),
    ],
    exports: [PasswordService, ValidationExceptionFilter, WsAuthenticationGuard, JwtHelperService],
})
export class AuthenticationModule {}
