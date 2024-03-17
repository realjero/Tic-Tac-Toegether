import { useEffect, useState } from 'react';
import { useModal } from '../hooks/ModalContext';
import { useUser } from '../hooks/UserContext';
import { HistoryItem, User } from '../types/types';
import {
    getHistory,
    getOwnHistory,
    getProfile,
    getProfileImage,
    setProfileImage
} from '../lib/api';
import { toast } from 'sonner';
import { PencilIcon } from '@heroicons/react/24/solid';
import UserProfileImage from '../components/UserProfileImage';
import PieChart from '../components/charts/PieChart';
import LineChart from '../components/charts/LineChart';
import StatisticsChart from '../components/charts/StatisticsChart';
import History from '../components/History';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { eloOverTime, statisticsOverTime } from '../lib/utils';

const Profile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const tab = new URLSearchParams(location.search).get('tab');
    const [loading, setLoading] = useState(true);

    const { username } = useParams();
    const [queryUser, setQueryUser] = useState<User | undefined>(undefined);

    const { fetchUser, user } = useUser();
    const { openModal } = useModal();
    const [image, setImage] = useState<File | null>(null);

    const [history, setHistory] = useState<HistoryItem[]>([]);

    /**
     * Fetch user profile and history on component mount or username change.
     */
    useEffect(() => {
        if (!username) return;

        const fetchUser = async () => {
            const result = await getProfile(username);

            if (!result?.ok) {
                navigate('/');
                return;
            }

            const data = await result.json();

            const imageResult = await getProfileImage(username);
            if (!imageResult?.ok) {
                setQueryUser({ ...data, image: undefined });
                return;
            }

            const image = URL.createObjectURL(await imageResult.blob());
            setQueryUser({ ...data, image: image });
        };

        const fetchHistory = async () => {
            let result: Response | undefined;

            if (username === user?.username) {
                result = await getOwnHistory();
            } else {
                result = await getHistory(username);
            }

            if (!result?.ok) return;
            const data = await result.json();
            setHistory(
                data.map((item: HistoryItem) => ({
                    ...item,
                    timestamp: new Date(item.timestamp)
                }))
            );
            setLoading(false);
        };

        if (user && !queryUser && username !== user?.username) {
            fetchUser();
            fetchHistory();
            return;
        }

        if (user && username === user.username) {
            setQueryUser(undefined);
            fetchHistory();
            return;
        }
    }, [navigate, queryUser, user, username]);

    /**
     * Handle profile image upload.
     */
    useEffect(() => {
        const handleProfileUpload = async () => {
            if (!image) return;
            const result = await setProfileImage(image as Blob);
            if (!result?.ok) toast.error('An error occurred. Please try again later.');
            setImage(null);
            fetchUser();
        };

        handleProfileUpload();
    }, [image, fetchUser]);

    return (
        !loading &&
        user && (
            <div className="m-2 text-text lg:m-10">
                <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                        {/* Profile */}
                        <div className="flex flex-col justify-around rounded-lg bg-background p-4 lg:p-10">
                            <div className="flex items-center justify-around">
                                {queryUser ? (
                                    <UserProfileImage
                                        image={queryUser.image}
                                        size={40}
                                        className={'border border-text shadow-md'}
                                    />
                                ) : (
                                    <div className="relative">
                                        <label htmlFor="image-upload" className="cursor-pointer">
                                            <button
                                                className="absolute bottom-0 right-0 rounded-full bg-secondary-400"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    document
                                                        .getElementById('image-upload')
                                                        ?.click();
                                                }}>
                                                <PencilIcon className="size-8 p-1.5 text-secondary-800" />
                                            </button>

                                            <UserProfileImage
                                                image={user?.image}
                                                size={40}
                                                className={'border border-text shadow-md'}
                                            />

                                            <input
                                                id="image-upload"
                                                type="file"
                                                accept="image/jpeg, image/png"
                                                className="hidden"
                                                onChange={(e) =>
                                                    setImage(e.target.files?.[0] || null)
                                                }
                                            />
                                        </label>
                                    </div>
                                )}

                                <div className="flex flex-col gap-4 text-3xl font-bold">
                                    <h2>{queryUser ? queryUser.username : user.username}</h2>
                                    <h2>Elo: {queryUser ? queryUser.elo : user.elo}</h2>
                                </div>
                            </div>

                            {/* Buttons */}
                            {!queryUser && (
                                <div className="flex justify-around p-4">
                                    <button
                                        onClick={() => openModal('change_username')}
                                        className="rounded border border-primary-500 px-3 py-2">
                                        Change Username
                                    </button>

                                    <button
                                        onClick={() => openModal('change_password')}
                                        className="rounded border border-primary-500 px-3 py-2">
                                        Change Password
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Statistics */}
                        <div className="rounded-lg bg-background p-4 lg:p-10">
                            <h2 className="text-2xl font-bold lg:text-center">Statistic</h2>
                            <PieChart
                                wins={
                                    queryUser
                                        ? queryUser.gameStats.wonGames
                                        : user.gameStats.wonGames
                                }
                                losses={
                                    queryUser
                                        ? queryUser.gameStats.lostGames
                                        : user.gameStats.lostGames
                                }
                                draws={
                                    queryUser
                                        ? queryUser.gameStats.drawGames
                                        : user.gameStats.drawGames
                                }
                            />
                        </div>
                    </div>

                    {/* Analytics */}
                    <div className="rounded-lg bg-background p-4 lg:p-10">
                        <h1 className="my-3 text-2xl font-bold">Game Analytics</h1>

                        {/* Tabs */}
                        <div className="flex divide-x">
                            <Link
                                to={`/${queryUser ? queryUser.username : user.username}?tab=history`}
                                className={`${tab === 'history' ? 'bg-black/20' : ''} px-6 py-2`}>
                                History
                            </Link>
                            <Link
                                to={`/${queryUser ? queryUser.username : user.username}?tab=elo`}
                                className={`${tab === 'elo' ? 'bg-black/20' : ''} px-6 py-2`}>
                                Elo
                            </Link>
                            <Link
                                to={`/${queryUser ? queryUser.username : user.username}?tab=statistics`}
                                className={`${tab === 'statistics' ? 'bg-black/20' : ''} px-6 py-2`}>
                                Statistics
                            </Link>
                        </div>

                        <div className="lg:mx-20 xl:mx-32">
                            {/* Content */}
                            {tab === 'history' && (
                                <History
                                    history={history}
                                    username={queryUser ? queryUser.username : user.username}
                                />
                            )}
                            {tab === 'elo' && (
                                <LineChart
                                    data={[
                                        eloOverTime(
                                            history,
                                            queryUser ? queryUser.createdAt : user.createdAt
                                        )
                                    ]}
                                />
                            )}
                            {tab === 'statistics' && (
                                <StatisticsChart
                                    data={statisticsOverTime(
                                        history,
                                        queryUser ? queryUser.username : user.username,
                                        queryUser ? queryUser.createdAt : user.createdAt
                                    )}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    );
};

export default Profile;
