import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { ReactNode } from 'react';
export function ProtectedRoute({ children }: { children: ReactNode }) { const { session } = useAuth(); const location = useLocation(); return session ? <>{children}</> : <Navigate to="/login" replace state={{ from: location.pathname }} />; }
