import { createContext, useContext } from 'react';
import { Socket } from 'socket.io-client';
import { User } from '../types/types';

interface UserContextType {
    user: User | null;
    login: (token: string, remember: boolean) => void;
    logout: () => void;
    fetchUser: () => Promise<void>;
    socket: Socket;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserContext.Provider');
    }
    return context;
};
