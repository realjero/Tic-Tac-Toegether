import { XMarkIcon, TrophyIcon, ScaleIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useGame } from '../hooks/GameContext';
import { useUser } from '../hooks/UserContext';
import { useNavigate } from 'react-router-dom';
import UserProfileImage from '../components/UserProfileImage';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { getProfileImage } from '../lib/api';

const Game = () => {
    const { setPiece, resetGame, board, gameData, gameState, chat, sendChat } = useGame();
    const navigate = useNavigate();
    const { user } = useUser();
    const [chatMessage, setChatMessage] = useState('');

    const [enemyImage, setEnemyImage] = useState<string | undefined>(undefined);

    /**
     * Handles sending a chat message.
     * @param {React.FormEvent<HTMLFormElement>} e - The form event.
     */
    const handleChat = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        sendChat(chatMessage);
        setChatMessage('');
    };

    /**
     * Resets the game when the component is unmounted.
     */
    useEffect(() => {
        return () => {
            resetGame();
        };
    }, [resetGame]);

    /**
     * Redirects to the homepage if user or gameId is not available.
     */
    useEffect(() => {
        if (!user || !gameData?.gameId) navigate('/');
    }, [user, gameData?.gameId, navigate]);

    /**
     * Fetches opponent image when opponent username is available.
     */
    useEffect(() => {
        if (!gameData?.opponentUsername) return;

        const fetchImage = async () => {
            const result = await getProfileImage(gameData.opponentUsername);
            if (!result?.ok) return;

            const image = URL.createObjectURL(await result.blob());
            setEnemyImage(image);
        };

        fetchImage();

        return () => {
            setEnemyImage(undefined);
        };
    }, [gameData?.opponentUsername]);

    /**
     * Render a game piece based on the provided piece type.
     * @param {string} piece - The type of game piece ('X' or 'O').
     * @returns {React.ReactElement | null} The rendered game piece component or null if piece type is invalid.
     */
    const renderPiece = (piece: string) => {
        if (piece === 'O') {
            return (
                <div className="aspect-square h-full w-full rounded-full border-[1rem] border-text"></div>
            );
        } else if (piece === 'X') {
            return (
                <div className="relative flex aspect-square h-full w-full items-center justify-center">
                    <div className="absolute h-4 w-full rotate-[45deg] rounded-l-full rounded-r-full bg-text"></div>
                    <div className="h-full w-4 rotate-[45deg] rounded-l-full rounded-r-full bg-text"></div>
                </div>
            );
        }
    };

    return (
        user &&
        gameData && (
            <>
                {/* WINNER MODAL */}
                {gameState && (
                    <div className="fixed bottom-0 left-0 right-0 top-0 z-20 flex flex-col items-center justify-center backdrop-blur-lg">
                        <p className="pb-4 text-9xl font-black text-text">
                            {gameState.winner === undefined ? (
                                <ScaleIcon className="size-24 text-text" />
                            ) : gameState.winner ? (
                                <TrophyIcon className="size-24 text-yellow-400" />
                            ) : (
                                <XMarkIcon className="size-24 text-accent-500" />
                            )}
                        </p>

                        <p className="text-5xl font-black text-text">
                            {gameState.winner === undefined
                                ? 'DRAW'
                                : gameState.winner
                                  ? 'Victory Royale!'
                                  : 'Defeat!'}
                        </p>
                        <p className="pt-14 text-4xl font-black text-text">
                            You: {gameState.youNewElo}
                        </p>
                        <p className="pb-14 text-4xl font-black text-text">
                            Opponent: {gameState.oppNewElo}
                        </p>
                        <button
                            onClick={() => {
                                navigate('/');
                                resetGame();
                            }}
                            className="rounded border border-primary-500 px-3 py-2 text-3xl font-black text-text">
                            Home
                        </button>
                    </div>
                )}

                <div className="flex h-full grow items-center justify-center">
                    <div className="grid w-full items-center text-text xl:grid-cols-2">
                        {/* MAIN GAME VIEW */}
                        <div className="mx-auto w-full p-12 md:max-w-[55vw] xl:max-w-[30vw]">
                            {/* GAME INFO */}
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <span className="absolute -left-10 -top-3 me-2 rounded bg-secondary-400 px-2.5 py-0.5 text-xs font-medium text-secondary-800">
                                            {user.elo}
                                        </span>
                                        <UserProfileImage image={user.image} size={12} />
                                    </div>
                                    <p className="font-bold text-text">{user.username}</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <p className="font-bold text-text">
                                        {gameData.opponentUsername}
                                    </p>
                                    <div className="relative">
                                        <span className="absolute -right-10 -top-3 me-2 rounded bg-secondary-400 px-2.5 py-0.5 text-xs font-medium text-secondary-800">
                                            {gameData.opponentElo}
                                        </span>
                                        <UserProfileImage image={enemyImage} size={12} />
                                    </div>
                                </div>
                            </div>

                            {/* BOARD */}
                            <div className="grid aspect-square grid-cols-3 gap-4">
                                {board.board.map((data, x) =>
                                    data.map((piece, y) => (
                                        <div
                                            key={`${x}${y}`}
                                            onClick={() => setPiece(x, y)}
                                            className={`aspect-square rounded-xl bg-secondary-400 p-2 md:p-4 ${piece === '' && board.nextTurn === gameData.ownSymbol ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                                            {renderPiece(piece)}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* SELECT SYMBOL */}
                            <div className="mt-4 flex justify-center">
                                <div className="relative flex h-10 w-20 items-center rounded-full bg-white">
                                    <span
                                        className={`absolute z-10 flex h-10 w-10 items-center justify-center rounded-full bg-secondary-600 transition-all duration-200 
                                        ${board.nextTurn === gameData.opponentSymbol ? 'translate-x-full' : 'translate-x-0'}`}>
                                        {board.nextTurn === gameData.opponentSymbol ? (
                                            gameData.opponentSymbol === 'X' ? (
                                                <XSymbol className="bg-white" />
                                            ) : (
                                                <OSymbol className="border-white" />
                                            )
                                        ) : gameData.ownSymbol === 'X' ? (
                                            <XSymbol className="bg-white" />
                                        ) : (
                                            <OSymbol className="border-white" />
                                        )}
                                    </span>
                                    <div className="absolute left-4">
                                        {gameData.ownSymbol === 'X' ? (
                                            <XSymbol className="bg-secondary-600" />
                                        ) : (
                                            <OSymbol className="-translate-x-1 border-secondary-600" />
                                        )}
                                    </div>

                                    <div className="absolute right-4">
                                        {gameData.opponentSymbol === 'X' ? (
                                            <XSymbol className="bg-secondary-600" />
                                        ) : (
                                            <OSymbol className="translate-x-1 border-secondary-600" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CHAT */}
                        <div className="m-4 md:mx-12">
                            <h2 className="mb-1 text-center text-3xl font-medium">Chat</h2>
                            <div className="rounded-lg bg-background">
                                <div className="flex h-[30vh] flex-col gap-3 overflow-y-scroll p-5 md:h-[50vh]">
                                    <p className="my-2 text-center text-xs">
                                        {chat[0] && chat[0].timestamp.toLocaleDateString('en')}
                                    </p>
                                    {chat.map((message, index) => (
                                        <>
                                            {index !== 0 &&
                                                chat[index - 1].timestamp.getDate() !==
                                                    message.timestamp.getDate() && (
                                                    <p className="my-2 text-center text-xs">
                                                        {message.timestamp.toLocaleDateString('en')}
                                                    </p>
                                                )}
                                            {user?.username === message.sender ? (
                                                <div className="flex justify-end">
                                                    <div>
                                                        <p className="break-all rounded-md bg-primary-500 px-2 py-1">
                                                            {message.message}
                                                        </p>
                                                        <p className="float-right text-xs">
                                                            {message.timestamp.toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex">
                                                    <div>
                                                        <p className="break-all rounded-md bg-secondary-300 px-2 py-1">
                                                            {message.message}
                                                        </p>
                                                        <p className="text-xs">
                                                            {message.timestamp.toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ))}
                                </div>
                            </div>
                            <form
                                className="mt-1 flex w-full items-center gap-1 rounded-lg bg-background p-1"
                                onSubmit={handleChat}>
                                <input
                                    value={chatMessage}
                                    onChange={(e) => setChatMessage(e.target.value)}
                                    type="text"
                                    className="w-full rounded-lg border border-text bg-background px-2 py-1"
                                />
                                <div>
                                    <button
                                        type="submit"
                                        className="rounded-full bg-primary-500 p-1">
                                        <PaperAirplaneIcon className="size-6" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </>
        )
    );
};

interface SymbolProps {
    className?: string;
}

const XSymbol = ({ className }: SymbolProps) => {
    return (
        <div className="relative flex aspect-square h-full w-full items-center justify-center">
            <div
                className={`absolute h-[4px] w-4 rotate-[45deg] rounded-l-full rounded-r-full ${className}`}></div>
            <div
                className={`h-4 w-[4px] rotate-[45deg] rounded-l-full rounded-r-full ${className}`}></div>
        </div>
    );
};

const OSymbol = ({ className }: SymbolProps) => {
    return <div className={`aspect-square size-4 rounded-full border-[4px] ${className}`}></div>;
};

export default Game;
