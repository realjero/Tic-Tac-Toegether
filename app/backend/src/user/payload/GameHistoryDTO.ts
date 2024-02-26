export class GameHistoryDTO {
    timestamp: Date;
    ownEloAtTimestamp: number;
    opponentEloAtTimestamp: number;
    opponentName: string;
    winner: string;

    constructor(timestamp: Date, ownEloAtTimestamp: number, opponentEloAtTimestamp: number, opponentName: string, winner: string) {
        this.timestamp = timestamp;
        this.ownEloAtTimestamp = ownEloAtTimestamp;
        this.opponentEloAtTimestamp = opponentEloAtTimestamp;
        this.opponentName = opponentName;
        this.winner = winner;
    }
}
