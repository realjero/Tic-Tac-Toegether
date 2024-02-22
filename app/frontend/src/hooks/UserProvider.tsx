import { ReactNode, useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import Cookies from 'js-cookie';
import { User, UserContext } from './UserContext';

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    const login = async (token: string, remember: boolean) => {
        Cookies.set('sessionToken', token, {
            expires: remember ? 7 : undefined,
            sameSite: 'none',
            secure: true
        });
        await fetchUser();
    };

    const logout = () => {
        Cookies.remove('sessionToken');
        setUser(null);
    };

    const fetchUser = async () => {
        try {
            const result = await apiFetch('profiles/own', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${Cookies.get('sessionToken')}`
                }
            });
            const data = await result.json();

            if (!result.ok) {
                Cookies.remove('sessionToken');
                return;
            }

            setUser(data);
        } catch (err: unknown) {
            Cookies.remove('sessionToken');
        }
    };

    useEffect(() => {
        const sessionToken = Cookies.get('sessionToken');

        if (sessionToken) {
            fetchUser();
        } else {
            Cookies.remove('sessionToken');
        }
    }, []); // Fetch user data only once when the component mounts

    return (
        <UserContext.Provider value={{ user, login, logout, fetchUser }}>
            {children}
        </UserContext.Provider>
    );
};