import { Injectable } from '@nestjs/common';
import { Game } from '../../model/Game';
import { v4 as uuidv4 } from 'uuid';
import { Move } from '../../model/Move';
import { GameUserInfo } from '../../model/GameUserInfo';
import { EGameSymbol } from '../../model/EGameSymbol';
import {EventEmitter2} from "@nestjs/event-emitter";

/**
 * `GameService` manages game sessions within the application, including creation, move validation,
 * and game state management. It uses a map to keep track of active games and leverages an event emitter
 * to broadcast game-related updates, especially for administrative monitoring.
 *
 * @Injectable Decorator that marks this class as a provider within the NestJS dependency injection system,
 * allowing it to be injected into other classes as needed.
 */
@Injectable()
export class GameService {
    private games = new Map<string, Game>();

    /**
     * Constructs a new instance of `GameService` with the necessary dependencies.
     *
     * @param {EventEmitter2} eventEmitter - The event emitter used for broadcasting game-related events.
     */
    constructor(private eventEmitter: EventEmitter2) {}

    /**
     * Generates a unique identifier for a new game session using UUID v4.
     *
     * @returns {string} A unique game session identifier.
     */
    generateGameId(): string {
        return uuidv4();
    }

    /**
     * Adds a new game to the active games list and emits an event for administrative updates.
     *
     * @param {string} gameId - The unique identifier for the game session.
     * @param {GameUserInfo} user1Info - Information about the first player.
     * @param {GameUserInfo} user2Info - Information about the second player.
     */
    async addGameToActiveGamesList(gameId: string, user1Info: GameUserInfo, user2Info: GameUserInfo) {
        this.games.set(gameId, new Game(user1Info, user2Info, Math.random() >= 0.5));
        this.eventEmitter.emit('admin.game');
    }

    /**
     * Processes a move in a specified game by a player and returns whether the move was successful.
     *
     * @param {string} gameId - The unique identifier of the game session where the move is made.
     * @param {Move} move - The move details, including the board coordinates.
     * @param {number} userId - The unique identifier of the player making the move.
     * @returns {boolean} True if the move was successfully made, false otherwise.
     */
    move(gameId: string, move: Move, userId: number): boolean {
        if (this.games.has(gameId)) {
            const game = this.games.get(gameId);
            if (!game.isCurrentPlayerAllowedToDoAction(userId)) return false;
            return game.makeMove(move, userId);
        }
        return false;
    }

    /**
     * Retrieves the current state of the game board for a specified game, formatted for display.
     *
     * @param {string} gameId - The unique identifier of the game session.
     * @returns {string[][] | undefined} The game board state, or undefined if the game does not exist.
     */
    getGameBoard(gameId: string): string[][] | undefined {
        if (!this.games.has(gameId)) {
            return undefined;
        }

        const game = this.games.get(gameId);

        return game.gameBoard.map(x =>
            x.map(field => {
                if (field === 0) return '';

                return field === game.user1Info.userId ? EGameSymbol[game.user1Info.symbol] : EGameSymbol[game.user2Info.symbol];
            })
        );
    }

    /**
     * Checks if a specified player has won the game.
     *
     * @param {string} gameId - The unique identifier of the game session.
     * @param {number} userId - The unique identifier of the player.
     * @returns {boolean} True if the player has won the game, false otherwise.
     */
    checkWin(gameId: string, userId: number): boolean {
        return this.games.has(gameId) ? this.games.get(gameId).checkWin(userId) : undefined;
    }

    /**
     * Checks if the game has ended in a draw.
     *
     * @param {string} gameId - The unique identifier of the game session.
     * @returns {boolean} True if the game is a draw, false otherwise.
     */
    checkDraw(gameId: string): boolean {
        return this.games.has(gameId) ? this.games.get(gameId).checkDraw() : undefined;
    }

    /**
     * Determines the symbol of the player whose turn is next in the specified game.
     *
     * @param {string} gameId - The unique identifier of the game session.
     * @returns {string | undefined} The symbol of the next player, or undefined if the game does not exist.
     */
    getNextPlayer(gameId: string): string | undefined {
        if (!this.games.has(gameId)) {
            return undefined;
        }

        const game = this.games.get(gameId);
        return game.isPlayer1Turn ? EGameSymbol[game.user1Info.symbol] : EGameSymbol[game.user2Info.symbol];
    }

    /**
     * Retrieves a game by its unique game ID.
     *
     * @param {string} gameId - The unique identifier of the game to retrieve.
     * @returns {Promise<Game | undefined>} A promise that resolves to the game if found, or undefined if not.
     */
    async getGameByGameId(gameId: string): Promise<Game | undefined> {
        return this.games.has(gameId) ? this.games.get(gameId) : null;
    }

    /**
     * Finds a game by a player's socket ID, useful for operations that start from a WebSocket context.
     *
     * @param {string} socketId - The socket ID associated with a player in a game.
     * @returns {Promise<{ gameId: string, game: Game } | undefined>} A promise that resolves to an object containing
     * the game and its ID if found, or undefined if no game is associated with the given socket ID.
     */
    async getGameBySocketId(socketId: string): Promise<{ gameId: string, game: Game } | undefined> {
        for (const [gameId, game] of this.games.entries()) {
            if (game.user1Info.socketId === socketId || game.user2Info.socketId === socketId) {
                return { gameId, game };
            }
        }
        return { gameId: null, game: null };
    }

    /**
     * Checks if a user is currently participating in any game.
     *
     * @param {number} userId - The unique identifier of the user to check.
     * @returns {Promise<boolean>} A promise that resolves to true if the user is in any game, or false otherwise.
     */
    async isUserInAnyGame(userId: number): Promise<boolean> {
        for (const game of this.games.values()) {
            if (game.user1Info.userId === userId || game.user2Info.userId === userId) return true;
        }
        return false;
    }

    /**
     * Removes a game from the active games list by its game ID and emits an administrative update event.
     *
     * @param {string} gameId - The unique identifier of the game to remove.
     * @returns {Promise<[string, Game] | undefined>} A promise that resolves to a tuple containing the game ID and the game
     * if it was successfully removed, or undefined if the game was not found.
     */
    async removeGameByGameId(gameId: string): Promise<[string, Game] | undefined> {
        if (this.games.has(gameId)) {
            const game = this.games.get(gameId);
            this.games.delete(gameId);
            this.eventEmitter.emit('admin.game');
            return [gameId, game];
        }
        return undefined;
    }

    /**
     * Retrieves a list of all current games, including metadata about each game. This method is particularly
     * useful for administrative purposes to monitor or audit ongoing games.
     *
     * @returns {Promise<Array>} A promise that resolves to an array of objects, each representing a game and its metadata.
     */
    async getAllGames() {
        const games = [];
        for (const [gameId, game] of this.games.entries()) {
            const startedBy = game.isPlayer1Turn === game.startedWithPlayer1 ? game.user1Info.userId : game.user2Info.userId;

            games.push({
                gameId: gameId,
                startedBy: startedBy,

                user1Id: game.user1Info.userId,
                user1Symbol: game.user1Info.symbol,

                user2Id: game.user2Info.userId,
                user2Symbol: game.user2Info.symbol,

                startedWithPlayer1: game.isPlayer1Turn === game.startedWithPlayer1,
            });
        }
        return games;
    }
}
