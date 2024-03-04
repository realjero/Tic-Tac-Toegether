import { useEffect } from 'react';
import { useGame } from '../hooks/GameContext';
import { useUser } from '../hooks/UserContext';
import { useNavigate } from 'react-router-dom';

const Game = () => {
    const { setPiece, board, gameData, gameState } = useGame();
    const navigate = useNavigate();
    const { user } = useUser();

    useEffect(() => {
        if (!user || !gameData?.gameId) navigate('/');
    });

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
                {gameState && (
                    <div className="fixed bottom-0 left-0 right-0 top-0 z-10 flex flex-col items-center justify-center backdrop-blur-lg">
                        <p className="pb-4 text-9xl font-black text-text">🏆</p>

                        <p className="text-5xl font-black text-text">
                            {gameState.winner === undefined
                                ? 'DRAW'
                                : gameState.winner
                                  ? 'Epischer Sieg'
                                  : 'Epischer Loose'}
                        </p>
                        <p className="pt-14 text-4xl font-black text-text">
                            You: {gameState.youNewElo}
                        </p>
                        <p className="pb-14 text-4xl font-black text-text">
                            Opponent: {gameState.oppNewElo}
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="rounded border border-primary-500 px-3 py-2 text-3xl font-black text-text">
                            Home
                        </button>
                    </div>
                )}
                <div className='text-text'>
                    <p>Opponent: {gameData.opponentUsername}</p>
                    <p>Opponent Elo: {gameData.opponentElo}</p>
                    <p>Opponent Symbol: {gameData.opponentSymbol}</p>
                    <p>You: {user.username}</p>
                    <p>Your Elo: {user.elo}</p>
                    <p>Your Symbol: {gameData.ownSymbol}</p>
                    <p>Next Turn: {board.nextTurn ? board.nextTurn : gameData.startingPlayer}</p>
                </div>

                <div className="mx-auto grid aspect-square w-full grid-cols-3 gap-4 md:max-h-[70vw] md:max-w-[70vw] xl:max-h-[30vw] xl:max-w-[30vw]">
                    {board.board.map((data, x) =>
                        data.map((piece, y) => (
                            <div
                                key={`${x}${y}`}
                                onClick={() => setPiece(x, y)}
                                className="rounded-xl bg-secondary-400 p-6">
                                {renderPiece(piece)}
                            </div>
                        ))
                    )}
                </div>
            </>
        )
    );
};

export default Game;
