import { useCallback, useEffect, useState } from 'react';
import { getOwnProfile, getProfileImage } from '../lib/api';
import Cookies from 'js-cookie';
import { UserContext } from './UserContext';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { User } from '../types/types';

/**
 * Socket instance for communication.
 */
const socket = io('http://localhost:3000', { autoConnect: false });

export const UserProvider = ({ children }: React.PropsWithChildren) => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    /**
     * Function to log in a user with the provided token.
     * @param {string} token - The authentication token.
     * @param {boolean} remember - Indicates whether to remember the login session.
     */
    const login = async (token: string, remember: boolean) => {
        Cookies.set('sessionToken', token, {
            expires: remember ? 7 : undefined,
            sameSite: 'none',
            secure: true
        });
        socket.auth = { token: `Bearer ${token}` };
        await fetchUser();
    };

    /**
     * Function to log out the current user.
     */
    const logout = () => {
        Cookies.remove('sessionToken');
        setUser(null);
        navigate('/');
    };

    /**
     * Callback function used to fetch user data asynchronously.
     * It retrieves the user profile information from the server and updates the component state accordingly.
     * If the user profile retrieval fails, it sets the user state to null and updates the loading state to false.
     * @returns {Promise<void>} - A promise representing the completion of the user data fetching process.
     */
    const fetchUser = useCallback(async () => {
        const result = await getOwnProfile();

        if (!result?.ok) {
            setUser(null);
            setLoading(false);
            return;
        }

        const data = await result.json();
        setUser({ ...data, createdAt: new Date(data.createdAt) });
        setLoading(false);

        const resultImage = await getProfileImage(data.username);

        if (!resultImage?.ok) {
            setUser({ ...data, image: undefined });
            return;
        }

        const image = URL.createObjectURL(await resultImage.blob());
        setUser({ ...data, image: image });
    }, []);

    /**
     * Effect to fetch user data when the component mounts.
     * It checks if there is a session token stored in cookies, and if so, fetches the user data using the fetchUser callback.
     * If there is no session token, it sets the loading state to false and the user state to null.
     */
    useEffect(() => {
        const sessionToken = Cookies.get('sessionToken');

        if (sessionToken) {
            fetchUser();
            socket.auth = { token: `Bearer ${sessionToken}` };
        } else {
            setLoading(false);
            setUser(null);
        }
    }, [fetchUser]);

    if (loading) {
        return <div></div>;
    }

    return (
        <UserContext.Provider value={{ user, login, logout, fetchUser, socket }}>
            {children}
        </UserContext.Provider>
    );
};
