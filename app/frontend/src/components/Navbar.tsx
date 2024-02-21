import {
    ArrowLeftStartOnRectangleIcon,
    ChevronDownIcon,
    ChevronUpIcon
} from '@heroicons/react/16/solid';
import { BookOpenIcon, BuildingLibraryIcon, UserIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

const Navbar = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const login = true;
    const elo = 1912;
    const username = 'John Doe';

    return (
        <nav className="fixed z-10 flex w-screen items-center justify-between text-white">
            <h1 className="m-5 text-3xl font-bold">TicTacToegether</h1>
            {login ? (
                <div className="relative">
                    <div className="mx-3 flex items-center gap-3">
                        <p className="hidden cursor-pointer sm:block">{username}</p>
                        <div className="relative">
                            <span className="absolute -right-10 -top-3 me-2 rounded bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                                {elo}
                            </span>
                            <div className="h-10 w-10 cursor-pointer rounded-full bg-white"></div>
                        </div>
                        <div
                            className="cursor-pointer"
                            onClick={() => setDropdownOpen(!dropdownOpen)}>
                            {dropdownOpen ? (
                                <ChevronUpIcon
                                    width={24}
                                    className="transition-transform hover:scale-125"
                                />
                            ) : (
                                <ChevronDownIcon
                                    width={24}
                                    className="transition-transform hover:scale-125"
                                />
                            )}
                        </div>
                    </div>

                    {/* Dropdown */}
                    <div
                        className={`absolute right-0 m-3 overflow-hidden rounded-md bg-[#1e2124] text-lg transition-all duration-300 ease-in-out ${
                            dropdownOpen ? 'max-h-[400px]' : 'max-h-0'
                        }`}>
                        <p className="flex cursor-pointer items-center border-b-[1px] border-b-gray-600 p-2">
                            <UserIcon width={24} className="mx-1" />
                            Profile
                        </p>
                        <p className="flex cursor-pointer items-center border-b-[1px] border-b-gray-600 p-2">
                            <BookOpenIcon width={24} className="mx-1" />
                            History
                        </p>
                        <p className="flex cursor-pointer items-center border-b-[1px] border-b-gray-600 p-2">
                            <BuildingLibraryIcon width={24} className="mx-1" />
                            Administration
                        </p>
                        <p className="flex cursor-pointer items-center p-2">
                            <ArrowLeftStartOnRectangleIcon width={24} className="mx-1" />
                            Log out
                        </p>
                    </div>
                </div>
            ) : (
                <div>
                    <button className="m-3">Sign in</button>
                    <button className="m-3 rounded-md border px-2 py-1">Sign up</button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
