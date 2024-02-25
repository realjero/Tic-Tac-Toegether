import { GameUserInfo } from './GameUserInfo';
import { Move } from './Move';

export class Game {
    user1Info: GameUserInfo;
    user2Info: GameUserInfo;

    isPlayer1Turn: boolean;

    GAME_BOARD_LENGTH: number = 3;
    gameBoard: number[][];

    constructor(user1Info: GameUserInfo, user2Info: GameUserInfo, isPlayer1Turn: boolean) {
        this.user1Info = user1Info;
        this.user2Info = user2Info;
        this.isPlayer1Turn = isPlayer1Turn;

        this.gameBoard = Array.from({ length: this.GAME_BOARD_LENGTH }, () => Array(this.GAME_BOARD_LENGTH).fill(0));
    }

    checkDraw(): boolean {
        return this.gameBoard.every(row => row.every(cell => cell !== 0));
    }

    makeMove(move: Move, userId: number): boolean {
        if (this.gameBoard[move.x][move.y] !== 0 || move.x > this.GAME_BOARD_LENGTH || move.y > this.GAME_BOARD_LENGTH) {
            return false; // Invalid move
        }

        this.gameBoard[move.x][move.y] = userId;
        this.isPlayer1Turn = !this.isPlayer1Turn;
        return true;
    }

    checkWin(userId: number) {
        // Check rows and columns
        for (let i = 0; i < this.GAME_BOARD_LENGTH; i++) {
            if (
                (this.gameBoard[i][0] === userId && this.gameBoard[i][1] === userId && this.gameBoard[i][2] === userId) ||
                (this.gameBoard[0][i] === userId && this.gameBoard[1][i] === userId && this.gameBoard[2][i] === userId)
            ) {
                return true;
            }
        }

        // Check diagonals
        if (
            (this.gameBoard[0][0] === userId && this.gameBoard[1][1] === userId && this.gameBoard[2][2] === userId) ||
            (this.gameBoard[0][2] === userId && this.gameBoard[1][1] === userId && this.gameBoard[2][0] === userId)
        ) {
            return true;
        }
    }

    isCurrentPlayerAllowedToDoAction(userId) {
        return (this.user1Info.userId === userId && this.isPlayer1Turn) || (this.user2Info.userId === userId && !this.isPlayer1Turn);
    }
}
