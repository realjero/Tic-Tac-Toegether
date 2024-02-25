import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthenticationModule } from './authentication/authentication.module';
import { DatabaseModule } from './database/database.module';
import { APP_GUARD } from '@nestjs/core';
import { HttpAuthenticationGuard } from './authentication/guard/http-authentication/http-authentication.guard';
import { UserModule } from './user/user.module';
import { TictactoeModule } from './tictactoe/tictactoe.module';
@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', '..', 'frontend', 'dist'),
        }),

        AuthenticationModule,
        DatabaseModule,
        UserModule,
        TictactoeModule,
    ],
    controllers: [AppController],
    providers: [
        // All routes need http-authentication!
        {
            provide: APP_GUARD,
            useClass: HttpAuthenticationGuard,
        },
    ],
})
export class AppModule {}
