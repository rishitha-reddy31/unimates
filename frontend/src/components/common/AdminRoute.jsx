import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

const AdminRoute = () => {
    const { user, loading, isAuthenticated, isAdmin } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminRoute;