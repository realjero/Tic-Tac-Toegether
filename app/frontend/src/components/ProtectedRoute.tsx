import React, { useEffect } from 'react';
import { useUser } from '../hooks/UserContext';
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactNode;
    adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly }) => {
    const { user } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (user === null || (adminOnly && !user?.isAdmin)) navigate('/');
    }, [user, adminOnly, navigate]);

    return children;
};

export default ProtectedRoute;
