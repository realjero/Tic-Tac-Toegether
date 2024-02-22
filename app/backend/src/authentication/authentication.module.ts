import { Module } from '@nestjs/common';
import { AuthenticationController } from './controller/authentication.controller';
import { DatabaseModule } from '../database/database.module';
import { PasswordService } from './services/password/password.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtKey } from './constants';
import { ValidationExceptionFilter } from './filters/validation-exception/validation-exception.filter';

@Module({
  controllers: [AuthenticationController],
  providers: [PasswordService, ValidationExceptionFilter],
  imports: [
    DatabaseModule,
    JwtModule.register({
      global: true,
      secret: jwtKey.secret,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  exports: [PasswordService, ValidationExceptionFilter],
})
export class AuthenticationModule {}
