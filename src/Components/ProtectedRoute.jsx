import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children, requiredRole = null }) {
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
    if (!isAuthenticated) {
        return <Navigate to="/auth/login" replace />;
    }

    // Si un rôle spécifique est requis et que l'utilisateur ne l'a pas
    if (requiredRole) {
        const userRoles = user?.roles || [];
        const hasRole = Array.isArray(userRoles) 
            ? userRoles.some(role => role.slug === requiredRole || role === requiredRole)
            : false;
        
        if (!hasRole) {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return children;
}

