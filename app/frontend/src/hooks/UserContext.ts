import { createContext, useContext } from 'react';
import { Socket } from 'socket.io-client';
import { User } from '../types/types';

/**
 * Interface representing the user context.
 */
interface UserContextType {
    /**
     * The user object or null if not authenticated.
     */
    user: User | null;
    /**
     * Function to log in a user with the provided token.
     * @param {string} token - The authentication token.
     * @param {boolean} remember - Indicates whether to remember the login session.
     */
    login: (token: string, remember: boolean) => void;
    /**
     * Function to log out the current user.
     */
    logout: () => void;
    /**
     * Function to fetch user data asynchronously.
     * @returns {Promise<void>} - A promise that resolves when user data is fetched.
     */
    fetchUser: () => Promise<void>;
    /**
     * The socket instance for communication.
     */
    socket: Socket;
}

/**
 * Context for managing user-related functionality.
 */
export const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 * Hook for accessing user-related functionality from the context.
 * @returns {UserContextType} - The user context.
 * @throws {Error} - If used outside of a UserContext.Provider.
 */
export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserContext.Provider');
    }
    return context;
};
