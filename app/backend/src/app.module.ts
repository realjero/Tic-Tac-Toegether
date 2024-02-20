import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {ServeStaticModule} from "@nestjs/serve-static";
import { join } from 'path';
import { AuthenticationModule } from './authentication/authentication.module';
import { DatabaseModule } from './database/database.module';
@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', '..', 'frontend', 'dist'),
        }),
        AuthenticationModule,
        DatabaseModule,
    ],
    controllers: [AppController],
    providers: [],
})
export class AppModule {
}
