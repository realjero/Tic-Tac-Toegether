import { GameUserInfo } from './GameUserInfo';
import { Move } from './Move';

/**
 * Represents a single game session, including player information, turn management, and the game board state.
 * Provides methods to check for a draw, make moves, check for a win, and validate player actions based on turn.
 *
 * @class Game
 */
export class Game {
    user1Info: GameUserInfo;
    user2Info: GameUserInfo;

    isPlayer1Turn: boolean;
    startedWithPlayer1: boolean;

    GAME_BOARD_LENGTH: number = 3;
    gameBoard: number[][];

    /**
     * Initializes a new instance of the Game class with specified player information and starting turn.
     *
     * @param {GameUserInfo} user1Info - Information about the first player.
     * @param {GameUserInfo} user2Info - Information about the second player.
     * @param {boolean} isPlayer1Turn - Indicates if it is Player 1's turn to start.
     */
    constructor(user1Info: GameUserInfo, user2Info: GameUserInfo, isPlayer1Turn: boolean) {
        this.user1Info = user1Info;
        this.user2Info = user2Info;
        this.isPlayer1Turn = isPlayer1Turn;
        this.startedWithPlayer1 = isPlayer1Turn;
        this.gameBoard = Array.from({ length: this.GAME_BOARD_LENGTH }, () => Array(this.GAME_BOARD_LENGTH).fill(0));
    }

    /**
     * Checks if the game has ended in a draw, meaning the game board is full and no more moves can be made.
     *
     * @returns {boolean} True if the game is a draw, false otherwise.
     */
    checkDraw(): boolean {
        return this.gameBoard.every(row => row.every(cell => cell !== 0));
    }

    /**
     * Attempts to make a move on the game board for a given player. Validates the move and updates the game board and turn.
     *
     * @param {Move} move - The move to be made, including the coordinates on the game board.
     * @param {number} userId - The user ID of the player making the move.
     * @returns {boolean} True if the move was successful, false if the move was invalid.
     */
    makeMove(move: Move, userId: number): boolean {
        if (this.gameBoard[move.x][move.y] !== 0 || move.x > this.GAME_BOARD_LENGTH || move.y > this.GAME_BOARD_LENGTH) {
            return false; // Invalid move
        }

        this.gameBoard[move.x][move.y] = userId;
        this.isPlayer1Turn = !this.isPlayer1Turn;
        return true;
    }

    /**
     * Checks if a given player has won the game by analyzing the game board for any winning patterns.
     *
     * @param {number} userId - The user ID of the player to check for a win.
     * @returns {boolean | undefined} True if the player has won, false or undefined if not.
     */
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


    /**
     * Determines if the current player is allowed to perform an action based on the turn and their user ID.
     *
     * @param {number} userId - The user ID of the player attempting the action.
     * @returns {boolean} True if the player is allowed to act, false otherwise.
     */
    isCurrentPlayerAllowedToDoAction(userId) {
        return (this.user1Info.userId === userId && this.isPlayer1Turn) || (this.user2Info.userId === userId && !this.isPlayer1Turn);
    }
}
