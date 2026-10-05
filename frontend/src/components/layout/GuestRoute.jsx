import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Spinner from '../ui/Spinner.jsx';

export default function GuestRoute() {
    const { status } = useSelector((state) => state.auth);
    const location = useLocation();

    if (status === 'idle' || status === 'loading') {
        return (
            <div className="mx-auto grid min-h-[60vh] place-items-center">
                <Spinner />
            </div>
        );
    }

    if (status === 'authenticated') {
        const to = location.state?.from ?? '/profile';
        return <Navigate to={to} replace />;
    }

    return <Outlet />;
}