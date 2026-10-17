import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { forgotPassword } from '../../services/auth.api.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

export default function ForgotPasswordPage() {
  useDocumentTitle('Forgot password');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [state, setState] = useState('idle');

  const onSubmit = async ({ email }) => {
    setState('loading');
    try {
      await forgotPassword(email);
      setState('sent');
    } catch {
      setState('error');
    }
  };

  return (
    <section className="mx-auto max-w-lg px-5 py-16">
      <Card className="p-7 sm:p-9">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">Account recovery</div>
        <h1 className="mt-2 text-3xl font-semibold">Reset your password.</h1>

        {state === 'sent' ? (
          <div className="mt-6 space-y-5">
            <Alert tone="success">
              If an account exists for that email, a reset link has been sent. Check your inbox.
            </Alert>
            <Link to="/login" className="block text-sm text-sage-bright">
              Back to login
            </Link>
          </div>
        ) : (
          <form className="mt-7 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <p className="text-sm leading-6 text-muted">
              Enter your account email. We will send a time-limited reset link when appropriate.
            </p>
            {state === 'error' ? (
              <Alert>We could not process that request. Please try again.</Alert>
            ) : null}
            <Input
              id="email"
              type="email"
              label="Email"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email', { required: 'Email is required' })}
            />
            <Button type="submit" className="w-full" loading={state === 'loading'}>
              Send reset link
            </Button>
            <Link
              to="/login"
              className="block text-center text-sm text-muted hover:text-text"
            >
              Back to login
            </Link>
          </form>
        )}
      </Card>
    </section>
  );
}