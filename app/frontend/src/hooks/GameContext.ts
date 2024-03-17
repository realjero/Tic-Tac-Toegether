import { createContext, useContext } from 'react';
import { Board, ChatItem, GameData, GameState } from '../types/types';

interface GameContextProps {
    joinQueue: () => void;
    leaveQueue: () => void;
    setPiece: (x: number, y: number) => void;
    resetGame: () => void;
    gameData: GameData | undefined;
    gameState: GameState | undefined;
    board: Board;
    chat: ChatItem[];
    sendChat: (message: string) => void;
}

export const GameContext = createContext<GameContextProps | undefined>(undefined);

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameContext.Provider');
    }
    return context;
};
