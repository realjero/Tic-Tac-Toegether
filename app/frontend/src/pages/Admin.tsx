import { useState } from 'react';
import Profiles from '../components/admin/Profiles.tsx';
import GameData from '../components/admin/GameData';

function Admin() {
    const [tab, setTab] = useState<'matchData' | 'userProfiles'>('matchData');

    const handleHistory = () => setTab('matchData');
    const handleElo = () => setTab('userProfiles');

    return (
        <div className="m-2 flex flex-col gap-3 text-text lg:m-10 ">
            <div className="rounded-lg bg-background p-4 lg:p-10">
                <h1 className="my-3 text-2xl font-bold">Admin Dashboard</h1>

                <div className="flex divide-x">
                    <button
                        onClick={handleHistory}
                        className={`${tab === 'matchData' ? 'bg-black/20' : ''} px-6 py-2`}>
                        Match Data
                    </button>
                    <button
                        onClick={handleElo}
                        className={`${tab === 'userProfiles' ? 'bg-black/20' : ''} px-6 py-2`}>
                        User Profiles
                    </button>
                </div>

                {tab === 'matchData' && <GameData />}
                {tab === 'userProfiles' && <Profiles />}
            </div>
        </div>
    );
}

export default Admin;
