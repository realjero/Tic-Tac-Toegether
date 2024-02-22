import { useState } from 'react';
import { apiFetch } from '../lib/api';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useUser } from '../hooks/UserContext';

interface Props {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const LoginModal: React.FC<Props> = ({ open, setOpen }) => {
    const { login } = useUser();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        remember: false,
        error: ''
    });

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const result = await apiFetch('login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password
                })
            });
            const data = await result.json();

            if (!result.ok) {
                setFormData({ ...formData, error: 'Invalid username or password.' });
                return;
            }

            login(data?.access_token, formData.remember);
            setOpen(false);
            setFormData({ username: '', password: '', remember: false, error: '' });
        } catch (err: unknown) {
            if (err instanceof Error) {
                setFormData({ ...formData, error: err.message });
            }
        }
    };

    const handleClose = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (e.target === e.currentTarget) {
            setOpen(false);
        }
    };

    return (
        open && (
            <div
                className="fixed left-0 right-0 z-50 flex h-screen w-full items-center justify-center backdrop-blur-lg"
                onClick={handleClose}>
                <div className="mx-auto w-full max-w-md rounded-lg bg-background p-8 text-text">
                    <div className="mb-6 flex justify-between">
                        <h2 className="text-2xl font-bold">Sign in to your account</h2>
                        <button
                            className="transition-transform hover:scale-105"
                            onClick={() => setOpen(false)}>
                            <XMarkIcon width={32} />
                        </button>
                    </div>
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium leading-6">
                                Username
                            </label>
                            <div className="mt-2">
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    autoFocus
                                    className="block w-full rounded-md border-0 p-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                                    onChange={(e) =>
                                        setFormData({ ...formData, username: e.target.value })
                                    }
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium leading-6">
                                    Password
                                </label>
                            </div>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="block w-full rounded-md border-0 p-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                                    onChange={(e) =>
                                        setFormData({ ...formData, password: e.target.value })
                                    }
                                />
                                <p className="my-2 text-center text-sm font-bold text-primary-500">
                                    {formData.error}
                                </p>
                            </div>
                        </div>
                        <div>
                            <label className="block" htmlFor="remember">
                                <input
                                    className="mr-2 h-4 w-4 rounded-lg accent-accent-500"
                                    type="checkbox"
                                    id="remember"
                                    name="remember"
                                    onChange={(e) =>
                                        setFormData({ ...formData, remember: e.target.checked })
                                    }
                                />
                                <span className="text-sm">Remember me</span>
                            </label>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-primary-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-400">
                                Sign in
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    );
};

export default LoginModal;
