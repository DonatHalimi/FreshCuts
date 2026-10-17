import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { staffLogin, clearAuthError } from '../../store/authSlice.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import Card from '../../components/ui/Card.jsx';
import Alert from '../../components/ui/Alert.jsx';
import LoginPage from '../LoginPage.jsx';

export default function StaffLoginPage() {
  useDocumentTitle('Staff login');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { error, status } = useSelector((s) => s.auth);

  const submit = async (values) => {
    dispatch(clearAuthError());
    const action = await dispatch(staffLogin(values));
    if (staffLogin.fulfilled.match(action)) {
      navigate(location.state?.from || '/staff', { replace: true });
      return null;
    }
    return action.payload;
  };

  return (
    <section className="mx-auto max-w-lg px-5 py-16">
      <Card className="p-7 sm:p-9">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">Staff portal</div>
        <h1 className="mt-2 text-3xl font-semibold">Sign in for your day.</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Use your FreshCuts staff account to see your roster, appointments and schedule.
        </p>

        <div className="mt-7">
          <LoginPage onSubmit={submit} error={error} loading={status === 'loading'} staff />
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          <Link to="/login" className="text-sage-bright hover:text-text">
            Customer login
          </Link>
        </p>

        {error?.code === 'FORBIDDEN' ? (
          <div className="mt-5">
            <Alert>Only staff and administrator accounts can use this portal.</Alert>
          </div>
        ) : null}
      </Card>
    </section>
  );
}