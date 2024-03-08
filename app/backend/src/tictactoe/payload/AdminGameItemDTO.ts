import {UsernameEloSymbolDTO} from "./UsernameEloSymbolDTO";

export class AdminGameItemDTO {
    user1: UsernameEloSymbolDTO;
    user2: UsernameEloSymbolDTO;
    playerThatStarted: UsernameEloSymbolDTO;
    gameId: string;

    constructor(user1: UsernameEloSymbolDTO, user2: UsernameEloSymbolDTO, playerThatStarted: UsernameEloSymbolDTO, gameId: string) {
        this.user1 = user1;
        this.user2 = user2;
        this.playerThatStarted = playerThatStarted;
        this.gameId = gameId;
    }
}
