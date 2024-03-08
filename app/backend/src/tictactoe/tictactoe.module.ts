import { Module } from '@nestjs/common';
import { EventsGateway } from './gateway/events.gateway';
import { AuthenticationModule } from '../authentication/authentication.module';
import { MatchmakingService } from './services/matchmaking/matchmaking.service';
import { DatabaseModule } from '../database/database.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GameService } from './services/game/game.service';
import { EloService } from './services/elo/elo.service';
import {AdminPanelController} from "./controller/admin-panel/admin-panel.controller";
import {AdminPanelService} from "./services/admin-panel/admin-panel.service";

@Module({
    controllers: [AdminPanelController],
    providers: [EventsGateway, MatchmakingService, GameService, EloService, AdminPanelService],
    imports: [AuthenticationModule, DatabaseModule, EventEmitterModule.forRoot()],
})
export class TictactoeModule {}
