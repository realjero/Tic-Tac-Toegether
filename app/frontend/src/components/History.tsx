import { XMarkIcon } from '@heroicons/react/24/outline';
import { TrophyIcon } from '@heroicons/react/24/outline';
import { ScaleIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import Cookies from 'js-cookie';
import UserProfileImage from './UserProfileImage';
import { toast } from 'sonner';

interface History {
    opponentEloAtTimestamp: number;
    opponentName: string;
    ownEloAtTimestamp: number;
    timestamp: Date;
    winner: string;
}

interface HistoryProps {
    history: History[];
    username: string;
}

interface OpponentImages {
    [key: string]: string | undefined;
}

const History: React.FC<HistoryProps> = ({ history, username }) => {
    const headers = ['Date', 'Enemy', 'Winner', 'Result'];
    const [opponentImages, setOpponentImages] = useState<OpponentImages>({});
    const sortedHistory = history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const areDatesOnSameDay = (date1: Date, date2: Date) => {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    };

    useEffect(() => {
        const uniqueOpponentNames = new Set(history.map((game) => game.opponentName));
        const opponentImages: OpponentImages = {};
        uniqueOpponentNames.forEach(async (name) => {
            try {
                const result = await apiFetch(`profiles/${name}/image`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${Cookies.get('sessionToken')}`
                    }
                });

                if (!result.ok) {
                    opponentImages[name] = undefined;
                    return;
                }

                const image = URL.createObjectURL(await result.blob());

                opponentImages[name] = image;
            } catch (err: unknown) {
                if (err instanceof Error) {
                    toast.error(err.message);
                }
            }

            setOpponentImages(opponentImages);
        });
    }, [history]);

    return (
        <div className="overflow-x-auto">
            <table className="w-full table-auto">
                <thead className="text-left">
                    <tr>
                        {headers.map((header, index) => (
                            <th key={index} className="p-4">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="w-full divide-y divide-gray-500">
                    {sortedHistory.map((game, index) => (
                        <>
                            {index > 0 &&
                            areDatesOnSameDay(
                                history[index - 1].timestamp,
                                history[index].timestamp
                            ) ? null : (
                                <p className="border-none text-text opacity-70">
                                    {game.timestamp.toLocaleString('en', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                    })}
                                </p>
                            )}
                            <tr key={index}>
                                <td className="p-4">
                                    {game.timestamp.toLocaleString('en', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: false
                                    })}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center">
                                        <UserProfileImage
                                            size={8}
                                            image={opponentImages[game.opponentName]}
                                            className="mr-2"
                                        />
                                        {game.opponentName}
                                    </div>
                                </td>
                                <td className="p-4">
                                    {game.winner ? (
                                        game.winner === username ? (
                                            <TrophyIcon width={24} height={24} />
                                        ) : (
                                            <XMarkIcon width={24} height={24} />
                                        )
                                    ) : (
                                        <ScaleIcon width={24} height={24} />
                                    )}
                                </td>
                                <td className="p-4">{game.ownEloAtTimestamp}</td>
                            </tr>
                        </>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default History;
