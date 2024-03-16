import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { apiFetch } from '../../lib/api';
import UserProfileImage from '../UserProfileImage';
import { useUser } from '../../hooks/UserContext';
import { UserImages } from '../History';
import { Link } from 'react-router-dom';

interface User {
    id: string;
    username: string;
    elo: number;
}

function Profiles() {
    const { user } = useUser();
    const [users, setUsers] = useState<User[]>([]);
    const [images, setImages] = useState<UserImages>({});
    const headers = ['', 'Elo'];

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const result = await apiFetch('profiles', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${Cookies.get('sessionToken')}`
                    }
                });

                if (!result.ok) {
                    throw new Error('Failed to fetch users');
                }

                const data = await result.json();
                setUsers(data);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    toast.error(err.message);
                }
            }
        };

        fetchUsers();
    }, [user]);

    useEffect(() => {
        if (users.length === 0) {
            return;
        }

        const fetchImages = async () => {
            const uniqueNames = new Set(users.map((user) => user.username));
            const userImages: UserImages = {};

            await Promise.all(
                [...uniqueNames].map(async (name) => {
                    try {
                        const result = await apiFetch(`profiles/${name}/image`, {
                            method: 'GET',
                            headers: {
                                Authorization: `Bearer ${Cookies.get('sessionToken')}`
                            }
                        });

                        if (!result.ok) {
                            userImages[name] = undefined;
                            return;
                        }

                        const image = URL.createObjectURL(await result.blob());
                        userImages[name] = image;
                    } catch (err: unknown) {
                        if (err instanceof Error) {
                            toast.error(err.message);
                        }
                    }
                })
            );
            setImages(userImages);
        };

        fetchImages();
    }, [users, user]);

    return (
        <div className="overflow-x-auto">
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
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>
                                <Link to={`/${user.username}`} className="flex items-center">
                                    <UserProfileImage image={images[user.username]} size={10} />
                                    <div className="text-ellipsis whitespace-nowrap p-4">
                                        {user.username}
                                    </div>
                                </Link>
                            </td>
                            <td className="whitespace-nowrap p-4">{user.elo}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Profiles;
