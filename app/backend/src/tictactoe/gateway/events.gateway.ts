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
import { UserEloRatingService } from '../../database/services/user-elo-rating/user-elo-rating.service';
import { GameResultService } from '../../database/services/game-result/game-result.service';
import {AdminPanelService} from "../services/admin-panel/admin-panel.service";

/**
 * `EventsGateway` serves as a WebSocket gateway for real-time event handling in the application, particularly
 * for features like matchmaking queues, game room interactions, and admin updates. It integrates various
 * services for authentication, matchmaking, game management, Elo rating calculations, and administrative functions.
 * It employs guards for security and provides lifecycle event handling for WebSocket connections.
 *
 * @UseGuards Decorator that applies the `WsAuthenticationGuard` to all incoming WebSocket connections, ensuring they are authenticated.
 * @WebSocketGateway Decorator that declares this class as a WebSocket gateway, with CORS settings allowing all origins.
 * @implements {OnGatewayConnection} Interface indicating this class handles WebSocket connection events.
 * @implements {OnGatewayDisconnect} Interface indicating this class handles WebSocket disconnection events.
 */
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
        private eloService: EloService,
        private userEloDatabaseService: UserEloRatingService,
        private gameResultDatabaseService: GameResultService,
        private adminPanelService: AdminPanelService,
    ) {}

    /**
     * Validates and decodes the JWT token provided by a client during the WebSocket handshake.
     * Throws an error if the token is missing or invalid.
     *
     * @param {Socket} client The client attempting to establish a WebSocket connection.
     * @returns {Promise<any>} A promise that resolves to the decoded token payload if the token is valid.
     */
    private async validateAndDecodeToken(client: Socket): Promise<any> {
        const token = client.handshake.auth?.token;
        if (!token) throw new Error('No authorization token');

        const [bearer, actualToken] = token.split(' ');
        if (bearer !== 'Bearer' || !actualToken) throw new Error('Invalid token format');

        return await this.jwtHelperService.verifyJWTToken(actualToken);
    }

    /**
     * Handles new WebSocket connections. It validates the client's token and logs the connection.
     * Unfortunately Nest.js doesn't support guards at lifecycle events.
     * If the token is invalid, the connection is rejected.
     *
     * @param {Socket} client The client attempting to connect.
     */
    async handleConnection(client: Socket) {
        try {
            const user = await this.validateAndDecodeToken(client);
            console.log(`Client connected: ${client.id} with user ID: ${user.userId}`);
        } catch (error) {
            this.rejectConnection(client, error.message);
        }
    }

    /**
     * Handles WebSocket disconnections. It removes the user from the matchmaking queue, updates Elo ratings
     * if the user was in a game, and logs the disconnection.
     *
     * @param {Socket} client The client that disconnected.
     */
    async handleDisconnect(client: Socket) {
        try {
            await this.matchmakingService.dequeueUser(client.id);
            const {gameId, game} = await this.gameService.getGameBySocketId(client.id);

            if (game && gameId) {
                const opponentUserId = game.user1Info.socketId === client.id ? game.user2Info.userId : game.user1Info.userId;

                await this.updateEloRatings(game, opponentUserId);
                await this.sendGameEnd(gameId, opponentUserId, true, "abort");
            }

            console.log(`Client disconnected: ${client.id}`);
        } catch (error) {
            console.error(`Error during disconnect: ${error.message}`);
        }
    }

    /**
     * Rejects a WebSocket connection, emitting an error to the client and disconnecting them.
     *
     * @param {Socket} client The client whose connection is being rejected.
     * @param {string} errorMessage The reason for rejecting the connection.
     */
    private rejectConnection(client: Socket, errorMessage: string) {
        client.emit('connectionError', errorMessage);
        client.disconnect();
    }

    /**
     * Handles the 'matchmaking.match-found' event when a matchmaking process finds a match for players.
     * It retrieves user details for both matched players and emits a 'match-found' event to both clients
     * with the game details, including opponent information and starting player.
     *
     * @OnEvent Decorator that specifies this method handles the 'matchmaking.match-found' event.
     * @param {GameUserInfo} user1Info - Information about the first user in the match.
     * @param {GameUserInfo} user2Info - Information about the second user in the match.
     * @param {EGameSymbol} startingPlayer - The symbol (X or O) of the starting player.
     * @param {string} gameId - The unique identifier for the game session created for these players.
     */
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

    /**
     * Emits a 'match-found' event to a specific client, providing details about the match including
     * the game ID, player symbols, opponent's username and Elo rating, and the starting player symbol.
     *
     * @param {string} socketId - The socket ID of the client to whom the match details will be emitted.
     * @param {string} gameId - The unique identifier of the game session.
     * @param {GameUserInfo} userInfo - The user information of the client.
     * @param {UserEntity} opponentDetails - The opponent's user entity containing their details.
     * @param {EGameSymbol} startingPlayer - The symbol (X or O) of the starting player.
     */
    private async emitMatchFound(socketId: string, gameId: string, userInfo: GameUserInfo, opponentDetails: UserEntity, startingPlayer: EGameSymbol) {
        this.server
            .to(socketId)
            .emit(
                'match-found',
                new MatchFoundDTO(
                    gameId,
                    EGameSymbol[userInfo.symbol],
                    opponentDetails.username,
                    await this.userEloDatabaseService.getLatestEloRatingFromUserId(opponentDetails.id),
                    EGameSymbol[userInfo.symbol === EGameSymbol.X ? EGameSymbol.O : EGameSymbol.X],
                    EGameSymbol[startingPlayer]
                )
            );
    }

    /**
     * Handles the 'queue' WebSocket message from clients. When a client sends a 'queue' message,
     * this method enqueues the user for matchmaking and emits a response indicating the success or
     * failure of the queue join attempt.
     *
     * @SubscribeMessage Decorator that specifies this method handles 'queue' messages from clients.
     * @param {Socket} client - The client socket that sent the 'queue' message.
     * @returns {Promise<void>} A promise that resolves when the operation is complete.
     */
    @SubscribeMessage('queue')
    async handleQueueEvent(client: Socket): Promise<void> {
        const userId = client.data.user.userId;
        console.log(`Client ${userId} with socketId: ${client.id} joined the queue`);
        const result = await this.matchmakingService.enqueueUser(userId, await this.userEloDatabaseService.getLatestEloRatingFromUserId(userId), client.id);
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

    /**
     * Handles the 'joinGameRoom' WebSocket message from clients, allowing them to join a specific
     * game room based on the game ID provided in the message. This is typically used when a match is
     * found and players need to join the same room to receive game-related events.
     *
     * @SubscribeMessage Decorator that specifies this method handles 'joinGameRoom' messages from clients.
     * @param {Object} data - The data sent by the client, containing the 'gameId'.
     * @param {Socket} client - The client socket that sent the 'joinGameRoom' message.
     */
    @SubscribeMessage('joinGameRoom')
    async handleJoinGameRoom(@MessageBody() data: { gameId: string }, @ConnectedSocket() client: Socket) {
        client.join(`game-${data.gameId}`);
    }

    /**
     * Handles 'game.move' WebSocket messages from clients, representing a player's move in a game.
     * It processes the move, updates the game state, and broadcasts the updated game board to all
     * participants in the game room. Additionally, it checks for game completion and handles Elo rating
     * updates and game end notifications.
     *
     * @SubscribeMessage Decorator that specifies this method handles 'game.move' messages from clients.
     * @param {Object} data - The data sent by the client, containing the 'gameId' and the 'move'.
     * @param {Socket} client - The client socket that sent the 'game.move' message.
     */
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
            await this.updateEloRatings(await this.gameService.getGameByGameId(data.gameId), this.gameService.checkWin(data.gameId, userId) ? userId : undefined);
            await this.sendGameEnd(data.gameId, userId, this.gameService.checkWin(data.gameId, userId), "gameend");
        }
    }

    /**
     * Sends a game end event to all participants in a game room, notifying them of the game's conclusion.
     * It includes the final game state, the outcome, and the updated Elo ratings for both players.
     *
     * @param {string} gameId - The unique identifier of the game session that has ended.
     * @param {number} userId - The user ID of the player who made the final move or null in case of a draw.
     * @param {boolean} isWin - Indicates whether the game ended in a win or a draw.
     * @param {string} endpoint - The WebSocket event name to emit for the game end notification.
     */
    async sendGameEnd(gameId: string, userId: number, isWin: boolean, endpoint: string) {
        const game = await this.gameService.getGameByGameId(gameId);
        const user1Elo = await this.userEloDatabaseService.getLatestEloRatingFromUserId(game.user1Info.userId);
        const user2Elo = await this.userEloDatabaseService.getLatestEloRatingFromUserId(game.user2Info.userId);

        const gameEndDTO = new GameEndDTO(
            isWin
                ? game.user1Info.userId === userId
                    ? EGameSymbol[game.user1Info.symbol]
                    : EGameSymbol[game.user2Info.symbol]
                : undefined,
            isWin ? EGameEndDTO[EGameEndDTO.WIN] : EGameEndDTO[EGameEndDTO.DRAW],
            user1Elo,
            user2Elo
        );

        this.server.to(`game-${gameId}`).emit('game.' + endpoint, gameEndDTO);
        await this.gameService.removeGameByGameId(gameId);
    }

    /**
     * Updates the Elo ratings for both players involved in a game based on the game's outcome.
     * It calculates the new Elo ratings, saves them, and records the game result in the database.
     *
     * @param {Game} game - The game object containing information about the game and its participants.
     * @param {number | undefined} winnerUserId - The user ID of the winning player, or undefined if the game was a draw.
     */
    async updateEloRatings(game: Game, winnerUserId: number | undefined): Promise<void> {
        if (!game) return;

        try {
            const player1Elo = await this.userEloDatabaseService.getLatestEloRatingFromUserId(game.user1Info.userId);
            const player2Elo = await this.userEloDatabaseService.getLatestEloRatingFromUserId(game.user2Info.userId);

            const player1NewElo = this.eloService.calculateNewRating(
                player1Elo,
                player2Elo,
                await this.getGameOutcomeFromIds(winnerUserId, game.user1Info.userId)
            );
            const player2NewElo = this.eloService.calculateNewRating(
                player2Elo,
                player1Elo,
                await this.getGameOutcomeFromIds(winnerUserId, game.user2Info.userId)
            );

            const user1UpdatedEloEntry = await this.userEloDatabaseService.saveUserEloRating(game.user1Info.userId, player1NewElo);
            const user2UpdatedEloEntry = await this.userEloDatabaseService.saveUserEloRating(game.user2Info.userId, player2NewElo);

            await this.gameResultDatabaseService.saveGame(user1UpdatedEloEntry, user2UpdatedEloEntry, winnerUserId);
        } catch (error) {
            console.error(`Failed to update Elo ratings for game ${game.gameBoard}: ${error}`);
        }
    }

    /**
     * Determines the outcome of a game for a specific user based on the winner's ID and the user's ID.
     * It returns 'Win' if the user is the winner, 'Lose' if the user is not the winner, and 'Draw' if there
     * was no winner.
     *
     * @param {number} winnerId - The user ID of the winning player, or `undefined` if the game was a draw.
     * @param {number} userId - The user ID of the player for whom the outcome is being determined.
     * @returns {Promise<GameOutcome>} A promise that resolves to the game outcome for the specified user.
     */
    async getGameOutcomeFromIds(winnerId: number, userId: number): Promise<GameOutcome> {
        return winnerId === undefined ? GameOutcome.Draw : winnerId === userId ? GameOutcome.Win : GameOutcome.Lose;
    }

    /**
     * Handles updates to the admin queue. This method is triggered by the 'admin.queue' event and
     * broadcasts the current matchmaking queue to all connected clients. This is primarily used for
     * administrative monitoring of the matchmaking system.
     *
     * @OnEvent Decorator that specifies this method handles the 'admin.queue' event, making it respond
     * whenever the specified event is emitted within the application.
     */
    @OnEvent('admin.queue')
    async handleAdminQueueUpdate() {
        this.server.emit('admin.queue', await this.adminPanelService.getMatchmakingQueue());
    }

    /**
     * Handles updates to the admin game list. This method is triggered by the 'admin.game' event and
     * broadcasts the list of all games to all connected clients. This feature is intended for admin
     * users to monitor ongoing and completed games within the platform.
     *
     * @OnEvent Decorator that specifies this method handles the 'admin.game' event, enabling it to react
     * to such events being emitted across the application.
     */
    @OnEvent('admin.game')
    async handleAdminGameUpdate() {
        this.server.emit('admin.game', await this.adminPanelService.getAllGames());
    }
}
