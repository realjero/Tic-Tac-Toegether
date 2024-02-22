import { useState } from 'react';
import { apiFetch } from '../lib/api';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useUser } from '../hooks/UserContext';

interface FormData {
    username: string;
    password: string;
    password_confirmation: string;
    error: {
        username?: string;
        password?: string;
        password_confirmation?: string;
    };
}

const initalFormData: FormData = {
    username: '',
    password: '',
    password_confirmation: '',
    error: {
        username: '',
        password: '',
        password_confirmation: ''
    }
};

interface Props {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const RegisterModal: React.FC<Props> = ({ open, setOpen }) => {
    const { login } = useUser();
    const [formData, setFormData] = useState(initalFormData);

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formTarget = e.target as HTMLFormElement;

        if (formData.password !== formData.password_confirmation) {
            setFormData({
                ...formData,
                error: { ...formData.error, password_confirmation: 'Passwords do not match' }
            });
            formTarget.confirm_password.focus();
            return;
        }

        try {
            const result = await apiFetch('register', {
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
                setFormData({ ...formData, error: data.error });
                if (data.error.username) {
                    formTarget.username.focus();
                }
                if (data.error.password) {
                    formTarget.password.focus();
                }
                return;
            }

            login(data?.access_token, false);
            setOpen(false);
            setFormData(initalFormData);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setFormData({
                    ...formData,
                    error: { ...formData.error, password_confirmation: err.message }
                });
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
                        <h2 className="text-2xl font-bold">Create an account</h2>
                        <button
                            className="transition-transform hover:scale-105"
                            onClick={() => setOpen(false)}>
                            <XMarkIcon width={32} />
                        </button>
                    </div>
                    <form className="space-y-6" onSubmit={handleRegister}>
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
                                <p className="my-2 text-sm font-bold text-primary-500">
                                    {formData.error.username}
                                </p>
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
                                <p className="my-2 text-sm font-bold text-primary-500">
                                    {formData.error.password}
                                </p>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium leading-6">
                                    Confirm Password
                                </label>
                            </div>
                            <div className="mt-2">
                                <input
                                    id="confirm_password"
                                    name="confirm_password"
                                    type="password"
                                    required
                                    className="block w-full rounded-md border-0 p-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            password_confirmation: e.target.value
                                        })
                                    }
                                />
                                <p className="my-2 text-sm font-bold text-primary-500">
                                    {formData.error.password_confirmation}
                                </p>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-primary-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-400">
                                Sign up
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    );
};

export default RegisterModal;
