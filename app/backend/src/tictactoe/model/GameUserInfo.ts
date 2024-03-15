import { EGameSymbol } from './EGameSymbol';

/**
 * Represents a user's information within a game context, including their user ID, WebSocket socket ID,
 * and the game symbol (X or O) they are assigned.
 *
 * @class GameUserInfo
 */
export class GameUserInfo {
    userId: number;
    socketId: string;
    symbol: EGameSymbol;

    /**
     * Initializes a new instance of the GameUserInfo class with the user's ID, socket ID, and assigned game symbol.
     *
     * @param {number} userId - The unique identifier of the user.
     * @param {string} socketId - The WebSocket socket ID associated with the user's connection.
     * @param {EGameSymbol} symbol - The game symbol assigned to the user (either X or O).
     */
    constructor(userId: number, socketId: string, symbol: EGameSymbol) {
        this.userId = userId;
        this.socketId = socketId;
        this.symbol = symbol;
    }
}
