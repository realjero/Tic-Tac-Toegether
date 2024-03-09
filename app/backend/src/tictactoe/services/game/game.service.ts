import { Injectable } from '@nestjs/common';
import { Game } from '../../model/Game';
import { v4 as uuidv4 } from 'uuid';
import { Move } from '../../model/Move';
import { GameUserInfo } from '../../model/GameUserInfo';
import { EGameSymbol } from '../../model/EGameSymbol';
import {EventEmitter2} from "@nestjs/event-emitter";

@Injectable()
export class GameService {
    private games = new Map<string, Game>();
    constructor(private eventEmitter: EventEmitter2) {
    }
    generateGameId(): string {
        return uuidv4();
    }

    async addGameToActiveGamesList(gameId: string, user1Info: GameUserInfo, user2Info: GameUserInfo) {
        this.games.set(gameId, new Game(user1Info, user2Info, Math.random() >= 0.5));
        this.eventEmitter.emit('admin.game');
    }

    move(gameId: string, move: Move, userId: number): boolean {
        if (this.games.has(gameId)) {
            const game = this.games.get(gameId);
            if (!game.isCurrentPlayerAllowedToDoAction(userId)) return false;
            return game.makeMove(move, userId);
        }
        return false;
    }

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

    checkWin(gameId: string, userId: number): boolean {
        return this.games.has(gameId) ? this.games.get(gameId).checkWin(userId) : undefined;
    }

    checkDraw(gameId: string): boolean {
        return this.games.has(gameId) ? this.games.get(gameId).checkDraw() : undefined;
    }

    getNextPlayer(gameId: string): string | undefined {
        if (!this.games.has(gameId)) {
            return undefined;
        }

        const game = this.games.get(gameId);
        return game.isPlayer1Turn ? EGameSymbol[game.user1Info.symbol] : EGameSymbol[game.user2Info.symbol];
    }

    async getGameByGameId(gameId: string): Promise<Game | undefined> {
        return this.games.has(gameId) ? this.games.get(gameId) : null;
    }

    async getGameBySocketId(socketId: string): Promise<{ gameId: string, game: Game } | undefined> {
        for (const [gameId, game] of this.games.entries()) {
            if (game.user1Info.socketId === socketId || game.user2Info.socketId === socketId) {
                return { gameId, game };
            }
        }
        return { gameId: null, game: null };
    }

    async isUserInAnyGame(userId: number): Promise<boolean> {
        for (const game of this.games.values()) {
            if (game.user1Info.userId === userId || game.user2Info.userId === userId) return true;
        }
        return false;
    }

    async removeGameByGameId(gameId: string): Promise<[string, Game] | undefined> {
        if (this.games.has(gameId)) {
            const game = this.games.get(gameId);
            this.games.delete(gameId);
            this.eventEmitter.emit('admin.game');
            return [gameId, game];
        }
        return undefined;
    }

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
