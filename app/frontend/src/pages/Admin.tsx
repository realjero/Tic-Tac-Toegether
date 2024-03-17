import { useEffect } from 'react';
import Profiles from '../components/admin/Profiles.tsx';
import GameData from '../components/admin/GameData';
import { useUser } from '../hooks/UserContext.ts';
import { Link, useLocation } from 'react-router-dom';

const Admin = () => {
    const { socket } = useUser();
    const location = useLocation();
    const tab = new URLSearchParams(location.search).get('tab');

    /**
     * Establishes a socket connection when the component is mounted
     * and disconnects it when the component is unmounted.
     */
    useEffect(() => {
        socket.connect();
        return () => {
            socket.disconnect();
        };
    }, [socket]);

    return (
        <div className="m-2 flex flex-col gap-3 text-text lg:m-10 ">
            <div className="rounded-lg bg-background p-4 lg:p-10">
                <h1 className="my-3 text-2xl font-bold">Admin Dashboard</h1>

                <div className="flex divide-x">
                    <Link
                        to="/admin?tab=queue-match"
                        className={`${tab === 'queue-match' ? 'bg-black/20' : ''} px-6 py-2`}>
                        Games
                    </Link>
                    <Link
                        to="/admin?tab=profiles"
                        className={`${tab === 'profiles' ? 'bg-black/20' : ''} px-6 py-2`}>
                        Profiles
                    </Link>
                </div>

                {tab === 'queue-match' && <GameData />}
                {tab === 'profiles' && <Profiles />}
            </div>
        </div>
    );
}

export default Admin;
