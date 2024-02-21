import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import { useState } from 'react';

function Root() {
    const [darkMode, setDarkMode] = useState(false);

    return (
        <div className={`${darkMode ? 'dark' : ''}`}>
            <Navbar setDarkMode={setDarkMode} darkMode={darkMode} />
            <Outlet />
        </div>
    );
}

export default Root;
