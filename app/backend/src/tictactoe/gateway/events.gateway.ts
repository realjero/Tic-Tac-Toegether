import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsAuthenticationGuard } from '../../authentication/guard/ws-authentication/ws-authentication.guard';
import { JwtHelperService } from '../../authentication/services/jwt-helper/jwt-helper.service';
import { MatchmakingService } from '../services/matchmaking/matchmaking.service';
import { UserService } from '../../database/services/user/user.service';
import { OnEvent } from '@nestjs/event-emitter';
import { Move } from '../model/Move';
import { GameService } from '../services/game/game.service';
import { GameEndDTO } from '../payload/GameEndDTO';
import { EGameEndDTO } from '../payload/EGameEndDTO';
import { GameStateDTO } from '../payload/GameStateDTO';
import { GameUserInfo } from '../model/GameUserInfo';
import { EGameSymbol } from '../model/EGameSymbol';
import { MatchFoundDTO } from '../payload/MatchFoundDTO';
import { EloService } from '../services/elo/elo.service';
import { GameOutcome } from '../model/GameOutcome';
import { Game } from '../model/Game';
import { UserEntity } from '../../database/models/UserEntity';

@UseGuards(WsAuthenticationGuard)
@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(
        private jwtHelperService: JwtHelperService,
        private matchmakingService: MatchmakingService,
        private userDatabaseService: UserService,
        private gameService: GameService,
        private eloService: EloService
    ) {}

    private async validateAndDecodeToken(client: Socket): Promise<any> {
        const token = client.handshake.auth?.token;
        if (!token) throw new Error('No authorization token');

        const [bearer, actualToken] = token.split(' ');
        if (bearer !== 'Bearer' || !actualToken) throw new Error('Invalid token format');

        return this.jwtHelperService.verifyJWTToken(actualToken);
    }

    //Nest.js doesnt support guards at Lifecycle events!
    async handleConnection(client: Socket) {
        try {
            const user = await this.validateAndDecodeToken(client);
            console.log(`Client connected: ${client.id} with user ID: ${user.userId}`);
        } catch (error) {
            this.rejectConnection(client, error.message);
        }
    }

    //Nest.js doesnt support guards at Lifecycle events!
    async handleDisconnect(client: Socket) {
        try {
            const user = await this.validateAndDecodeToken(client);
            await this.matchmakingService.dequeueUser(user.userId);
            const game = await this.gameService.removeGameByUserId(user.userId);

            if (game) {
                const opponentUserId = game[1].user1Info.userId === client.data.user.userId
                    ? game[1].user2Info.userId
                    : game[1].user1Info.userId;

                await this.updateEloRatings(game[1], opponentUserId);
                this.notifyGameAbort(game[0], opponentUserId);
            }

            console.log(`Client disconnected: ${client.id}`);
        } catch (error) {
            console.error(`Error during disconnect: ${error.message}`);
        }
    }

    private notifyGameAbort(gameId: string, winnerUserId: number) {
        this.server.to(`game-${gameId}`).emit('game.abort', {
            message: 'Other user left the game, you won!',
            winner: winnerUserId,
        });
    }

    private rejectConnection(client: Socket, errorMessage: string) {
        client.emit('connectionError', errorMessage);
        client.disconnect();
    }

    @OnEvent('matchmaking.match-found')
    async handleMatchFoundEvent(user1Info: GameUserInfo, user2Info: GameUserInfo, startingPlayer: EGameSymbol, gameId: string) {
        const userDetails = await Promise.all([
            this.userDatabaseService.findUserByUserId(user1Info.userId),
            this.userDatabaseService.findUserByUserId(user2Info.userId),
        ]);

        [user1Info, user2Info].forEach((userInfo, index) => {
            const opponentDetails = userDetails[(index + 1) % 2];
            this.emitMatchFound(userInfo.socketId, gameId, userInfo, opponentDetails, startingPlayer);
        });
    }

    private emitMatchFound(socketId: string, gameId: string, userInfo: GameUserInfo, opponentDetails: UserEntity, startingPlayer: EGameSymbol) {
        this.server
            .to(socketId)
            .emit(
                'match-found',
                new MatchFoundDTO(
                    gameId,
                    EGameSymbol[userInfo.symbol],
                    opponentDetails.username,
                    opponentDetails.elo,
                    EGameSymbol[userInfo.symbol === EGameSymbol.X ? EGameSymbol.O : EGameSymbol.X],
                    EGameSymbol[startingPlayer]
                )
            );
    }

    @SubscribeMessage('queue')
    async handleQueueEvent(client: Socket): Promise<void> {
        const userId = client.data.user.userId;
        console.log(`Client ${userId} with socketId: ${client.id} joined the queue`);
        const result = await this.matchmakingService.enqueueUser(userId, await this.userDatabaseService.getEloFromUserId(userId), client.id);
        result
            ? client.emit('queue', {
                  status: 'success',
                  data: 'Joined the queue successfully',
              })
            : client.emit('queue', {
                  status: 'failure',
                  data: 'Queue could not be joined, you are already in the queue',
              });
    }

    @SubscribeMessage('joinGameRoom')
    async handleJoinGameRoom(@MessageBody() data: { gameId: string }, @ConnectedSocket() client: Socket) {
        client.join(`game-${data.gameId}`);
    }

    @SubscribeMessage('game.move')
    async handleGameMove(@MessageBody() data: { gameId: string; move: Move }, @ConnectedSocket() client: Socket) {
        const userId = client.data.user.userId;

        if (!this.gameService.move(data.gameId, data.move, userId)) {
            client.emit('game.error', { message: 'Move not successful' });
            return;
        }
        const gameStateDTO = new GameStateDTO(this.gameService.getGameBoard(data.gameId), this.gameService.getNextPlayer(data.gameId));
        this.server.to(`game-${data.gameId}`).emit('game.gameboard', gameStateDTO);

        if (this.gameService.checkWin(data.gameId, userId) || this.gameService.checkDraw(data.gameId)) {
            await this.updateEloRatings(await this.gameService.getGame(data.gameId), this.gameService.checkWin(data.gameId, userId) ? userId : undefined);
            await this.sendGameEnd(data.gameId, userId, this.gameService.checkWin(data.gameId, userId));
        }
    }

    async sendGameEnd(gameId: string, userId: number, isWin: boolean) {
        const game = await this.gameService.getGame(gameId);
        const user1Elo = await this.userDatabaseService.getEloFromUserId(game.user1Info.userId);
        const user2Elo = await this.userDatabaseService.getEloFromUserId(game.user2Info.userId);

        const gameEndDTO = new GameEndDTO(
            isWin ? EGameSymbol[game.user1Info.symbol] : undefined,
            isWin ? EGameEndDTO[EGameEndDTO.WIN] : EGameEndDTO[EGameEndDTO.DRAW],
            game.user1Info.userId === userId
                ? user1Elo
                : user2Elo,
            game.user1Info.userId === userId
                ? user2Elo
                : user1Elo
        );

        this.server.to(`game-${gameId}`).emit('game.gameend', gameEndDTO);
    }

    async updateEloRatings(game: Game, winnerUserId: number | undefined): Promise<void> {
        if (!game) return;

        try {
            const player1Elo = await this.userDatabaseService.getEloFromUserId(game.user1Info.userId);
            const player2Elo = await this.userDatabaseService.getEloFromUserId(game.user2Info.userId);

            const player1NewElo = this.eloService.calculateNewRating(
                player1Elo,
                player2Elo,
                winnerUserId === undefined
                    ? GameOutcome.Draw
                    : winnerUserId === game.user1Info.userId
                        ? GameOutcome.Win
                        : GameOutcome.Lose
            );
            const player2NewElo = this.eloService.calculateNewRating(
                player2Elo,
                player1Elo,
                winnerUserId === undefined
                    ? GameOutcome.Draw
                    : winnerUserId === game.user2Info.userId
                        ? GameOutcome.Win
                        : GameOutcome.Lose
            );

            await Promise.all([
                this.userDatabaseService.updateEloFromUserId(game.user1Info.userId, player1NewElo),
                this.userDatabaseService.updateEloFromUserId(game.user2Info.userId, player2NewElo),
            ]);
        } catch (error) {
            console.error(`Failed to update Elo ratings for game ${game}: ${error}`);
        }
    }
}
