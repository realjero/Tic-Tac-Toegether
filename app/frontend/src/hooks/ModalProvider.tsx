import { useState } from 'react';
import { ModalContext } from './ModalContext';
import { XMarkIcon } from '@heroicons/react/24/outline';
import LoginModal from '../modals/LoginModal';
import RegisterModal from '../modals/RegisterModal';
import ChangeUsernameModal from '../modals/ChangeUsernameModal';
import ChangePasswordModal from '../modals/ChangePasswordModal';
import MatchmakingQueueModal from '../modals/MachmakingQueueModal';

/**
 * Props for the modal component.
 */
export interface ModalProps {
    /**
     * Function to close the modal.
     */
    close: () => void;
}

/**
 * Type representing a close handler function or undefined.
 */
type CloseHandler = (() => void) | undefined;

/**
 * Interface representing the content of a modal.
 */
interface ModalContent {
    /**
     * The component to render inside the modal.
     */
    component: React.ReactNode;
    /**
     * The title of the modal.
     */
    title: string;
}

/**
 * Function to retrieve the content of a modal based on its identifier.
 * @param {string} identifier - The identifier of the modal.
 * @param {() => void} close - Function to close the modal.
 * @returns {React.ReactElement} - The component representing the modal content.
 */
const modals = (identifier: string, close: () => void) => {
    const modalComponents: { [key: string]: ModalContent } = {
        register: {
            component: <RegisterModal close={close} />,
            title: 'Create a new account'
        },
        login: {
            component: <LoginModal close={close} />,
            title: 'Sign in to your account'
        },
        change_username: {
            component: <ChangeUsernameModal close={close} />,
            title: 'Change your username'
        },
        change_password: {
            component: <ChangePasswordModal close={close} />,
            title: 'Change your password'
        },
        queue: {
            component: <MatchmakingQueueModal />,
            title: 'Searching for a match'
        }
    };

    return modalComponents[identifier] || <p>modal not found</p>;
};

export const ModalProvider = ({ children }: React.PropsWithChildren) => {
    const [open, setOpen] = useState(false);
    const [content, setContent] = useState<ModalContent | null>(null);
    const [closeHandler, setCloseHandler] = useState<CloseHandler>(undefined);

    /**
     * Opens a modal with the specified identifier and optional onClose handler.
     * @param {string} identifier - The identifier of the modal.
     * @param {() => void} [onClose] - Optional handler to be called when the modal is closed.
     */
    const openModal = (identifier: string, onClose?: () => void) => {
        const content = modals(identifier, handleClose);
        setContent(content);
        setOpen(true);
        setCloseHandler(() => onClose);
    };

    /**
     * Closes the currently open modal.
     */
    const closeModal = () => {
        setOpen(false);
        setContent(null);
        setCloseHandler(undefined);
    };

    /**
     * Handles the closing of the modal.
     */
    const handleClose = () => {
        setOpen(false);
        setContent(null);
        if (closeHandler) closeHandler();
        setCloseHandler(undefined);
    };

    /**
     * Handles modal dismissal when clicking outside the modal content.
     * @param {React.MouseEvent<HTMLDivElement, MouseEvent>} e - The mouse event.
     */
    const handleDismiss = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (e.target === e.currentTarget) {
            setOpen(false);
            if (closeHandler) closeHandler();
            setCloseHandler(undefined);
        }
    };

    return (
        <ModalContext.Provider value={{ openModal, closeModal }}>
            {open && (
                <div
                    onClick={handleDismiss}
                    className="fixed bottom-0 left-0 right-0 top-0 z-20 flex items-center justify-center backdrop-blur-lg">
                    <div className="mx-auto w-full max-w-md rounded-lg bg-background p-8 text-text shadow-md">
                        <div className="mb-6 flex justify-between">
                            <h2 className="text-2xl font-bold">{content?.title}</h2>
                            <button
                                className="transition-transform hover:scale-105"
                                onClick={handleClose}>
                                <XMarkIcon width={32} />
                            </button>
                        </div>
                        {content?.component}
                    </div>
                </div>
            )}
            {children}
        </ModalContext.Provider>
    );
};
