import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { UserRole } from '../types';

export const ProtectedRoute = ({ role, children }: { role: UserRole; children: JSX.Element }) => {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== role) return <Navigate to="/" replace />;
  return children;
};
