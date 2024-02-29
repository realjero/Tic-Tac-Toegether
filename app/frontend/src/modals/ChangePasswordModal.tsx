import { useState } from 'react';
import { ModalProps } from '../hooks/ModalProvider';
import { apiFetch } from '../lib/api';
import { useUser } from '../hooks/UserContext';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

const ChangePasswordModal: React.FC<ModalProps> = ({ close }) => {
    const [formData, setFormData] = useState({
        password: '',
        password_confirmation: '',
        error: {
            password: '',
            password_confirmation: ''
        }
    });
    const { fetchUser } = useUser();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formTarget = e.target as HTMLFormElement;
        
        if (formData.password !== formData.password_confirmation) {
            setFormData({
                ...formData,
                error: { password: '', password_confirmation: 'Passwords do not match' }
            });
            formTarget.confirm_password.focus();
            return;
        }

        try {
            const result = await apiFetch('profiles/own/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${Cookies.get('sessionToken')}`
                },
                body: JSON.stringify({ newPassword: formData.password })
            });

            if (!result.ok) {
                const data = await result.json();
                setFormData({ ...formData, error: {password: data.error.password, password_confirmation: '',} });
                formTarget['new-password'].focus();
                return;
            }

            fetchUser();
            close();
            toast.success('Password changed successfully');
        } catch (err: unknown) {
            if (err instanceof Error) {
                toast.error(err.message);
            } else {
                toast.error('An error occurred. Please try again later.');
            }
        }
    };

    return (
        <form className="space-y-6" autoComplete="off" onSubmit={handleSubmit}>
            <div>
                <label htmlFor="new-password" className="block text-sm font-medium leading-6">
                    Password
                </label>
                <div className="mt-2">
                    <input
                        id="new-password"
                        name="new-password"
                        type="password"
                        required
                        autoComplete="new-password"
                        autoFocus
                        className="block w-full rounded-md border-0 p-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <p className="my-2 text-sm font-bold text-primary-500">{formData.error.password}</p>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium leading-6">
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
                    <p className="my-2 text-sm font-bold text-primary-500">{formData.error.password_confirmation}</p>
                </div>
            </div>

            <div>
                <button
                    type="submit"
                    className="flex w-full justify-center rounded-md bg-primary-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-400">
                    Change Password
                </button>
            </div>
        </form>
    );
};

export default ChangePasswordModal;
