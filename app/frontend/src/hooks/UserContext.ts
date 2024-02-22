import { createContext, useContext } from "react";

export interface User {
    username: string;
    elo: number;
    isAdmin: boolean;
    gameStats: {
        totalGames: number;
        wonGames: number;
        lostGames: number;
        DrawGames: number;
    };
}

interface UserContextType {
    user: User | null;
    login: (token: string, remember: boolean) => void;
    logout: () => void;
    fetchUser: () => Promise<void>;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserContext.Provider');
    }
    return context;
};


