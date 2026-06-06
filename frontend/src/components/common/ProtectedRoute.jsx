import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function ProtectedRoute({ children }) {
  const isOperator = useAuthStore(s => s.isOperator);
  const location = useLocation();

  if (!isOperator) {
    return <Navigate to="/operator/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
