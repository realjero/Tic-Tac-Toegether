import { useEffect, useState } from 'react';
import UserProfileImage from '../UserProfileImage';
import { getMatches, getProfileImage, getQueue } from '../../lib/api';
import { useUser } from '../../hooks/UserContext';
import { Link } from 'react-router-dom';
import { MatchItem, QueueItem, UserImages } from '../../types/types';

const GameData = () => {
    const { user, socket } = useUser();
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [matches, setMatches] = useState<MatchItem[]>([]);
    const [images, setImages] = useState<UserImages>({});
    const headers = ['Username', 'Elo'];
    const headers2 = ['User1', 'Elo', '', 'User2', 'Elo', 'Started'];

    /**
     * Fetches queue and game data from the server and sets the corresponding state.
     * Listens for socket events to update data dynamically.
     */
    useEffect(() => {
        const fetchQueue = async () => {
            const result = await getQueue();
            if (!result?.ok) return;
            const data = await result.json();
            setQueue(data);
        };

        const fetchGames = async () => {
            const result = await getMatches();
            if (!result?.ok) return;
            const data = await result.json();
            setMatches(data);
        };

        fetchQueue();
        fetchGames();
        socket.on('admin.queue', fetchQueue);
        socket.on('admin.games', fetchGames);

        return () => {
            socket.off('admin.queue', fetchQueue);
            socket.off('admin.games', fetchGames);
        };
    }, [user, socket]);

    /**
     * Fetches profile images of users and sets the state with the retrieved images.
     */
    useEffect(() => {
        if (queue.length === 0 && matches.length === 0) {
            return;
        }

        const fetchImages = async () => {
            const uniqueQueueNames = new Set(queue.map((user) => user.user.username));
            const uniqueMatchUser1Names = new Set(matches.map((user) => user.user1.username));
            const uniqueMatchUser2Names = new Set(matches.map((user) => user.user2.username));
            const uniqueNames = new Set([
                ...uniqueQueueNames,
                ...uniqueMatchUser1Names,
                ...uniqueMatchUser2Names
            ]);
            const userImages: UserImages = {};

            await Promise.all(
                [...uniqueNames].map(async (username) => {
                    const result = await getProfileImage(username);
                    if (!result?.ok) return;

                    const image = URL.createObjectURL(await result.blob());
                    userImages[username] = image;
                })
            );
            setImages(userImages);
        };

        fetchImages();
    }, [queue, matches, user]);

    return (
        <>
            <div className="overflow-x-auto">
                <h1 className="my-3 text-center text-2xl font-bold text-text"> Queue </h1>
                {queue.length !== 0 ? (
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="text-left">
                                {headers.map((header, index) => (
                                    <th key={index} className="p-4">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="w-full divide-y divide-gray-500">
                            {queue.map((queue) => (
                                <tr key={queue.gameId}>
                                    <td>
                                        <Link
                                            to={`/${queue.user.username}?tab=history`}
                                            className="flex items-center">
                                            <UserProfileImage
                                                image={images[queue.user.username]}
                                                size={10}
                                            />
                                            <div className="text-ellipsis whitespace-nowrap p-4">
                                                {queue.user.username}
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="whitespace-nowrap p-4">{queue.user.elo}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="my-3 text-center text-xl font-bold text-text">Queue empty</div>
                )}
            </div>

            <div className="overflow-x-auto">
                <h1 className="my-3 text-center text-2xl font-bold text-text"> Current Matches </h1>
                {matches.length !== 0 ? (
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="text-left">
                                {headers2.map((header, index) => (
                                    <th key={index} className="p-4">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="w-device items-stretch divide-y divide-gray-500">
                            {matches.map((match) => (
                                <tr key={match.matchId}>
                                    <td>
                                        <Link
                                            to={`/${match.user1.username}?tab=history`}
                                            className="flex items-center">
                                            <UserProfileImage
                                                image={images[match.user1.username]}
                                                size={10}
                                            />
                                            <div className="text-ellipsis whitespace-nowrap p-4">
                                                {match.user1.username}
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="whitespace-nowrap p-4">{match.user1.elo}</td>

                                    <td>vs</td>

                                    <td>
                                        <Link
                                            to={`/${match.user2.username}?tab=history`}
                                            className="flex items-center">
                                            <UserProfileImage
                                                image={images[match.user2.username]}
                                                size={10}
                                            />
                                            <div className="text-ellipsis whitespace-nowrap p-4">
                                                {match.user2.username}
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="whitespace-nowrap p-4">{match.user2.elo}</td>
                                    <td className="text-ellipsis whitespace-nowrap p-4">
                                        {match.playerThatStarted.username}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="my-3 text-center text-xl font-bold text-text">
                        No active matches
                    </div>
                )}
            </div>
        </>
    );
}

export default GameData;
