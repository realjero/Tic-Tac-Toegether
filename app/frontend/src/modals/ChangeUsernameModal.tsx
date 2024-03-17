import { useState } from 'react';
import { ModalProps } from '../hooks/ModalProvider';
import { updateUsername } from '../lib/api';
import { useUser } from '../hooks/UserContext';
import { toast } from 'sonner';

const ChangeUsernameModal: React.FC<ModalProps> = ({ close }) => {
    const [username, setUsername] = useState({ username: '', error: '' });
    const { fetchUser } = useUser();

    /**
     * Handles form submission for updating username asynchronously.
     * @param {React.FormEvent<HTMLFormElement>} e The form event
     */
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formTarget = e.target as HTMLFormElement;
        const result = await updateUsername(username.username);

        if (!result) return;
        if (!result.ok) {
            const data = await result.json();
            setUsername({ ...username, error: data.error.username });
            formTarget['new-password'].focus();
            return;
        }

        fetchUser();
        close();
        toast.success('Username changed successfully');
    };

    return (
        <form className="space-y-6" autoComplete="off" onSubmit={handleSubmit}>
            <div>
                <label htmlFor="new-password" className="block text-sm font-medium leading-6">
                    Username
                </label>
                <div className="mt-2">
                    <input
                        id="new-password"
                        name="new-password"
                        type="text"
                        required
                        autoComplete="new-password"
                        autoFocus
                        className="block w-full rounded-md border-0 p-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                        onChange={(e) => setUsername({ ...username, username: e.target.value })}
                    />
                </div>
                <p className="my-2 text-center text-sm font-bold text-primary-500">
                    {username.error}
                </p>
            </div>
            <div>
                <button
                    type="submit"
                    className="flex w-full justify-center rounded-md bg-primary-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-400">
                    Change Username
                </button>
            </div>
        </form>
    );
};

export default ChangeUsernameModal;
