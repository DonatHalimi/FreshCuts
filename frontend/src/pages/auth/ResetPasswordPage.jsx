import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../../services/auth.api.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import Card from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';

export default function ResetPasswordPage() {
  useDocumentTitle('Set new password');
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const password = watch('password', '');
  const hasToken = useMemo(() => Boolean(token), [token]);

  const onSubmit = async ({ password: nextPassword }) => {
    setState('loading');
    setError('');
    try {
      await resetPassword({ token, password: nextPassword });
      setState('success');
    } catch (e) {
      setState('error');
      setError(e.message);
    }
  };

  return (
    <section className="mx-auto max-w-lg px-5 py-16">
      <Card className="p-7 sm:p-9">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">Account recovery</div>
        <h1 className="mt-2 text-3xl font-semibold">Choose a new password.</h1>

        {!hasToken ? (
          <div className="mt-6 space-y-5">
            <Alert>That reset link is missing its token.</Alert>
            <Link to="/forgot-password" className="block text-sm text-sage-bright">
              Request another link
            </Link>
          </div>
        ) : state === 'success' ? (
          <div className="mt-6 space-y-5">
            <Alert tone="success">
              Your password has been changed. You can now log in with the new password.
            </Alert>
            <Button
              className="w-full"
              onClick={() => navigate('/login', { replace: true })}
            >
              Continue to login
            </Button>
          </div>
        ) : (
          <form className="mt-7 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            {error ? <Alert>{error}</Alert> : null}
            <Input
              id="password"
              type="password"
              label="New password"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Use at least 8 characters' },
                maxLength: { value: 72, message: 'Maximum 72 characters' },
              })}
            />
            <Input
              id="confirmPassword"
              type="password"
              label="Confirm password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
            />
            <Button type="submit" className="w-full" loading={state === 'loading'}>
              Set new password
            </Button>
          </form>
        )}
      </Card>
    </section>
  );
}