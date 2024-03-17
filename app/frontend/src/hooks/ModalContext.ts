import { createContext, useContext } from 'react';

/**
 * Props for the ModalContext component.
 */
interface ModalContextProps {
    /**
     * Function to open a modal with the specified identifier.
     * @param {string} identifier - The identifier of the modal.
     * @param {() => void} [onClose] - Optional callback function to be called when the modal is closed.
     */
    openModal: (identifier: string, onClose?: () => void) => void;
    
    /**
     * Function to close the currently open modal.
     */
    closeModal: () => void;
}

/**
 * Context for managing modal-related functionality.
 */
export const ModalContext = createContext<ModalContextProps | undefined>(undefined);

/**
 * Hook for accessing modal-related functionality from the context.
 * @returns {ModalContextProps} - The modal context.
 * @throws {Error} - If used outside of a ModalContext.Provider.
 */
export const useModal = (): ModalContextProps => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalContext.Provider');
    }
    return context;
};
