import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Spinner from '../ui/Spinner.jsx';

export default function ProtectedRoute() {
  const location = useLocation();
  const { status } = useSelector((state) => state.auth);

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="mx-auto grid min-h-[60vh] place-items-center">
        <Spinner />
      </div>
    );
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  return <Outlet />;
}