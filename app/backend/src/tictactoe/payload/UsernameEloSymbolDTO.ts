export class UsernameEloSymbolDTO {
    username: string;
    elo: number;
    symbol: string;

    constructor(username: string, elo: number, symbol: string) {
        this.username = username;
        this.elo = elo;
        this.symbol = symbol;
    }
}
