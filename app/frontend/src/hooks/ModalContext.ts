import { createContext, useContext } from 'react';

interface ModalContextProps {
    openModal: (identifier: string) => void;
}

export const ModalContext = createContext<ModalContextProps | undefined>(undefined);

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalContext.Provider');
    }
    return context;
};
