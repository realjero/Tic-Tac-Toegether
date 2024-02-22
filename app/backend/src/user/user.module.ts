import { Module } from '@nestjs/common';
import { UserController } from './controller/user/user.controller';
import { UserService } from './services/user/user.service';
import { DatabaseModule } from '../database/database.module';
import { UtilsService } from './services/utils/utils.service';
import { AuthenticationModule } from '../authentication/authentication.module';

@Module({
  controllers: [UserController],
  providers: [UserService, UtilsService],
  imports: [DatabaseModule, AuthenticationModule],
})
export class UserModule {}
