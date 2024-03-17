import { useEffect, useState } from 'react';
import { getProfileImage, getProfiles } from '../../lib/api';
import UserProfileImage from '../UserProfileImage';
import { useUser } from '../../hooks/UserContext';
import { Link } from 'react-router-dom';
import { UserImages, UserProfileItem } from '../../types/types';

function Profiles() {
    const { user } = useUser();
    const [users, setUsers] = useState<UserProfileItem[]>([]);
    const [images, setImages] = useState<UserImages>({});
    const headers = ['', 'Elo'];

    useEffect(() => {
        const fetchUsers = async () => {
            const result = await getProfiles();

            if (!result?.ok) return;

            const data = await result.json();
            setUsers(data);
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
                    {users.map((user, index) => (
                        <tr key={index}>
                            <td>
                                <Link to={`/${user.username}?tab=history`} className="flex items-center">
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
