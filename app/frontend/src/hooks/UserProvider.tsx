import { ReactNode, useCallback, useEffect, useState } from 'react';
import { getOwnProfile, getProfileImage } from '../lib/api';
import Cookies from 'js-cookie';
import { UserContext } from './UserContext';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { User } from '../types/types';

const socket = io('http://localhost:3000', { autoConnect: false });

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const login = async (token: string, remember: boolean) => {
        Cookies.set('sessionToken', token, {
            expires: remember ? 7 : undefined,
            sameSite: 'none',
            secure: true
        });
        socket.auth = { token: `Bearer ${token}` };
        await fetchUser();
    };

    const logout = () => {
        Cookies.remove('sessionToken');
        setUser(null);
        navigate('/');
    };

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
