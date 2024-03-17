import { useCallback, useEffect, useState } from 'react';
import { GameContext } from './GameContext';
import { useNavigate } from 'react-router-dom';
import { useModal } from './ModalContext';
import { useUser } from './UserContext';
import { Board, ChatItem, GameData, GameState } from '../types/types';

const initialBoard: Board = {
    board: [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
    ],
    nextTurn: undefined
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const { closeModal } = useModal();
    const [gameData, setGameData] = useState<GameData | undefined>();
    const { socket, fetchUser } = useUser();
    const [chat, setChat] = useState<ChatItem[]>([]);

    const [board, setBoard] = useState<Board>(initialBoard);
    const [gameState, setGameState] = useState<GameState | undefined>();

    /**
     * Function to set a piece on the game board.
     * @param {number} x - The x-coordinate of the piece.
     * @param {number} y - The y-coordinate of the piece.
     */
    const setPiece = (x: number, y: number) => {
        socket.emit('game.move', { gameId: gameData?.gameId, move: { x, y } });
    };

    /**
     * Function to join the game queue.
     */
    const joinQueue = () => {
        socket.connect();
        socket.emit('queue');
        socket.on('queue', () => {});
    };

    /**
     * Function to leave the game queue.
     */
    const leaveQueue = () => {
        socket.off('queue');
        socket.disconnect();
    };

    /**
     * Function to reset the game state.
     */
    const resetGame = useCallback(() => {
        setBoard(initialBoard);
        setGameData(undefined);
        setGameState(undefined);
        setChat([]);
        socket.disconnect();
    }, [socket]);

    /**
     * Function to send a chat message.
     * @param {string} message - The message to send.
     */
    const sendChat = (message: string) => {
        socket.emit('game.chat', { message: message });
    };

    useEffect(() => {
        /**
         * Handles the event when a match is found.
         * @param {{ gameId: string; ownSymbol: string; opponentUsername: string; opponentElo: number; opponentSymbol: string; startingPlayer: string; }} data - Data about the found match.
         */
        const handleMatchFound = (data: {
            gameId: string;
            ownSymbol: string;
            opponentUsername: string;
            opponentElo: number;
            opponentSymbol: string;
            startingPlayer: string;
        }) => {
            navigate('/play');
            closeModal();

            setGameData(data);
            setBoard((value) => ({ ...value, nextTurn: data.startingPlayer }));
            socket.emit('joinGameRoom', { gameId: data.gameId });
        };

        /**
         * Handles the event when the game board is updated.
         * @param {{ gameBoard: string[][]; nextPlayer: string; }} data - Updated game board data.
         */
        const handleGameBoardUpdate = (data: { gameBoard: string[][]; nextPlayer: string }) => {
            setBoard({ board: data.gameBoard, nextTurn: data.nextPlayer });
        };

        /**
         * Handles the event when the game ends.
         * @param {{ winner: string; gameState: string; newXElo: number; newOElo: number; }} data - Data about the end of the game.
         */
        const handleGameEnd = (data: {
            winner: string;
            gameState: string;
            newXElo: number;
            newOElo: number;
        }) => {
            setGameState({
                winner: data.winner ? gameData?.ownSymbol === data.winner : undefined,
                youNewElo: gameData?.ownSymbol === 'X' ? data.newXElo : data.newOElo,
                oppNewElo: gameData?.opponentSymbol === 'X' ? data.newXElo : data.newOElo
            });
            socket.off('queue');
            socket.off('match-found');
            fetchUser();
        };

        /**
         * Handles the event when a chat message is received.
         * @param {ChatItem} data - Received chat message.
         */
        const handleChatReceived = (data: ChatItem) => {
            setChat((chat) => [
                ...chat,
                { message: data.message, sender: data.sender, timestamp: new Date(data.timestamp) }
            ]);
        };

        socket.on('match-found', handleMatchFound);
        socket.on('game.gameboard', handleGameBoardUpdate);
        socket.on('game.gameend', handleGameEnd);
        socket.on('game.abort', handleGameEnd);
        socket.on('game.chat', handleChatReceived);

        return () => {
            socket.off('match-found', handleMatchFound);
            socket.off('game.gameboard', handleGameBoardUpdate);
            socket.off('game.gameend', handleGameEnd);
            socket.off('game.abort', handleGameEnd);
            socket.off('game.chat', handleChatReceived);
        };
    }, [navigate, closeModal, gameData, socket, fetchUser]);

    return (
        <GameContext.Provider
            value={{
                joinQueue,
                leaveQueue,
                setPiece,
                resetGame,
                board,
                gameData,
                gameState,
                chat,
                sendChat
            }}>
            {children}
        </GameContext.Provider>
    );
};
