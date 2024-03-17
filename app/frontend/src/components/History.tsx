import { XMarkIcon, TrophyIcon, ScaleIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { getProfileImage } from '../lib/api';
import UserProfileImage from './UserProfileImage';
import { HistoryItem, UserImages } from '../types/types';

interface HistoryProps {
    history: HistoryItem[];
    username: string;
}

const History = ({ history, username }: HistoryProps) => {
    const headers = ['Date', 'Enemy', 'Winner', 'Result'];
    const [opponentImages, setOpponentImages] = useState<UserImages>({});
    const sortedHistory = history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    /**
     * Checks if two dates are on the same day.
     * @param date1 - The first date to compare.
     * @param date2 - The second date to compare.
     * @returns True if the dates are on the same day, false otherwise.
     */
    const areDatesOnSameDay = (date1: Date, date2: Date) => {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    };

    /**
     * Fetches profile images of opponents from the server and sets the state with the retrieved images.
     */
    useEffect(() => {
        const fetchImages = async () => {
            const uniqueNames = new Set(history.map((game) => game.opponentName));
            const userImages: UserImages = {};
            await Promise.all(
                [...uniqueNames].map(async (username) => {
                    const result = await getProfileImage(username);
                    if (!result?.ok) return;
                    const image = URL.createObjectURL(await result.blob());
                    userImages[username] = image;
                })
            );
            setOpponentImages(userImages);
        };

        fetchImages();
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
