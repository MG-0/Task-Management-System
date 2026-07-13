import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-sans">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                    <span className="text-slate-400 text-sm">Loading session...</span>
                </div>
            </div>
        );
    }
    
    return user ? <>{children}</> : <Navigate to="/login" replace />;
};

export const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-sans">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                    <span className="text-slate-400 text-sm">Loading session...</span>
                </div>
            </div>
        );
    }
    
    return !user ? <>{children}</> : <Navigate to="/" replace />;
};
