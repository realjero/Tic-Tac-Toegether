import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import { useEffect, useState } from 'react';
import { UserProvider } from './hooks/UserProvider';
import { ModalProvider } from './hooks/ModalProvider';
import { Toaster } from 'sonner';
import { GameProvider } from './hooks/GameProvider';

function Root() {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');

        if (mq.matches) {
            setDarkMode(true);
        }

        // This callback will fire if the perferred color scheme changes without a reload
        mq.addEventListener('change', (evt) => setDarkMode(evt.matches));
    }, []);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    return (
        <UserProvider>
            <ModalProvider>
                <GameProvider>
                    <Toaster />
                    <Navbar setDarkMode={setDarkMode} darkMode={darkMode} />
                    <Outlet />
                </GameProvider>
            </ModalProvider>
        </UserProvider>
    );
}

export default Root;
