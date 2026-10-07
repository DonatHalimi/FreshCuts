import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeClosed, EyeOff } from 'lucide-react';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import Input from '../components/ui/Input.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import * as authApi from '../services/auth.api.js';
import { clearAuthError, login } from '../store/authSlice.js';
import { getFieldError } from '../utils/errors.js';

export default function LoginPage() {
  useDocumentTitle('Log in');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { error, status } = useSelector((state) => state.auth);
  const { register, handleSubmit, formState: { errors }, setError } = useForm();
  const [resend, setResend] = useState('idle');
  const [emailForResend, setEmailForResend] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (values) => {
    dispatch(clearAuthError());
    const action = await dispatch(login(values));
    if (login.fulfilled.match(action)) {
      navigate(location.state?.from ?? '/profile', { replace: true });
      return;
    }
    setEmailForResend(values.email);
    for (const fieldError of action.payload?.errors ?? []) {
      setError(fieldError.field, { message: fieldError.message });
    }
  };

  const resendVerification = async () => {
    setResend('loading');
    try {
      await authApi.resendVerification(emailForResend);
      setResend('sent');
    } catch {
      setResend('error');
    }
  };

  return (
    <section className="mx-auto max-w-lg px-5 py-28">
      <Card className="p-8">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">FreshCuts account</div>
        <h1 className="mt-2 text-3xl font-semibold">Welcome back.</h1>
        {/* <p className="mt-3 text-sm text-muted">Sign in to manage your account.</p> */}

        {error ? <div className="mt-5"><Alert>{error.message}</Alert></div> : null}
        {error?.code === 'EMAIL_NOT_VERIFIED' ? (
          <div className="mt-3 space-y-2 text-sm text-muted">
            <button
              type="button"
              className="text-sage-bright hover:text-text disabled:opacity-50"
              onClick={resendVerification}
              disabled={!emailForResend || resend === 'loading'}
            >
              {resend === 'loading' ? 'Sending…' : 'Resend verification email'}
            </button>
            {resend === 'sent' ? <Alert tone="success">A new verification email has been sent.</Alert> : null}
          </div>
        ) : null}

      <form className="mt-7 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input
            id="email"
            type="email"
            label="Email"
            error={errors.email?.message || getFieldError(error, 'email')}
            autoComplete="email"
            {...register('email', { required: 'Email is required' })}
          />

          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            label="Password"
            error={errors.password?.message || getFieldError(error, 'password')}
            autoComplete="current-password"
            {...register('password', { required: 'Password is required' })}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="grid h-7 w-7 place-items-center rounded-md text-muted transition-colors hover:text-text"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeClosed className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            className='!mb-2'
          />

          <Button type="submit" className="w-full" loading={status === 'loading'}>Log in</Button>
        </form>

        <p className="mt-6 text-left text-sm text-muted">
          Need an account? <Link to="/register" className="text-sage-bright hover:text-text">Create one</Link>
        </p>
      </Card>
    </section>
  );
}