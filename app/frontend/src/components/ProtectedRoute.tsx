import React, { useEffect } from 'react';
import { useUser } from '../hooks/UserContext';
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps extends React.PropsWithChildren {
    adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly }: ProtectedRouteProps) => {
    const { user } = useUser();
    const navigate = useNavigate();

    /**
     * Effect to check user authentication and admin privileges.
     * If user is not authenticated or does not have admin privileges (if required), redirect to the home page.
     */
    useEffect(() => {
        if (user === null || (adminOnly && !user?.isAdmin)) navigate('/');
    }, [user, adminOnly, navigate]);

    return children;
};

export default ProtectedRoute;
