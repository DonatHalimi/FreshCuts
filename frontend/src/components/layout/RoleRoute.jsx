import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Spinner from '../ui/Spinner.jsx';

export default function RoleRoute({ roles }) {
    const { user, status } = useSelector((state) => state.auth);
    const location = useLocation();
    if (status === 'idle' || status === 'loading') return <div className="flex min-h-[50vh] items-center justify-center"><Spinner /></div>;
    if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
    if (!roles.includes(user.role)) return <Navigate to="/" replace />;
    return <Outlet />;
}