import { createContext, useContext } from 'react';
import { Board, ChatItem, GameData, GameState } from '../types/types';

/**
 * Props for the GameContext component.
 */
interface GameContextProps {
    /**
     * Function to join the game queue.
     */
    joinQueue: () => void;

    /**
     * Function to leave the game queue.
     */
    leaveQueue: () => void;

    /**
     * Function to set a piece on the game board.
     * @param {number} x - The x-coordinate of the piece.
     * @param {number} y - The y-coordinate of the piece.
     */
    setPiece: (x: number, y: number) => void;

    /**
     * Function to reset the game.
     */
    resetGame: () => void;

    /**
     * Data representing the game state and information.
     */
    gameData: GameData | undefined;

    /**
     * The current state of the game.
     */
    gameState: GameState | undefined;

    /**
     * The game board.
     */
    board: Board;

    /**
     * The chat messages related to the game.
     */
    chat: ChatItem[];

    /**
     * Function to send a chat message.
     * @param {string} message - The message to send.
     */
    sendChat: (message: string) => void;
}

/**
 * Context for managing game-related functionality and state.
 */
export const GameContext = createContext<GameContextProps | undefined>(undefined);

/**
 * Hook for accessing the game context.
 * @returns {GameContextProps} - The game context.
 * @throws {Error} - If used outside of a GameContext.Provider.
 */
export const useGame = (): GameContextProps => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameContext.Provider');
    }
    return context;
};
