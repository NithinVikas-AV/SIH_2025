import React from 'react';
import { Navigate } from 'react-router-dom';

// ProtectedRoute expects either a `requiredRole` prop or none.
// If `requiredRole` is provided, it also verifies the logged-in user's role matches.
const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('authToken');
  const role = (localStorage.getItem('userRole') || '').toLowerCase();

  if (!token) {
    // Not authenticated
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const required = (requiredRole || '').toLowerCase();
    // allow variants like 'college_admin' to match 'admin'
    if (!role.includes(required)) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
