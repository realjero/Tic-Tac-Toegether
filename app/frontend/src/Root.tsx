import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import { useEffect, useState } from 'react';
import { UserProvider } from './hooks/UserProvider';

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

    return (
        <UserProvider>
            <div className={`${darkMode ? 'dark' : ''}`}>
                <Navbar setDarkMode={setDarkMode} darkMode={darkMode} />
                <Outlet />
            </div>
        </UserProvider>
    );
}

export default Root;
