import { EGameSymbol } from './EGameSymbol';

export class GameUserInfo {
    userId: number;
    socketId: string;
    symbol: EGameSymbol;

    constructor(userId: number, socketId: string, symbol: EGameSymbol) {
        this.userId = userId;
        this.socketId = socketId;
        this.symbol = symbol;
    }
}
