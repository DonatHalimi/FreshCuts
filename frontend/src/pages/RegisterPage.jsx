import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { register as registerAccount, clearAuthError } from '../store/authSlice.js';
import { getFieldError } from '../utils/errors.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import Alert from '../components/ui/Alert.jsx';
import Card from '../components/ui/Card.jsx';
import * as authApi from '../services/auth.api.js';

export default function RegisterPage() {
  useDocumentTitle('Create account');
  const dispatch = useDispatch();
  const { error } = useSelector((state) => state.auth);
  const { register, handleSubmit, formState: { errors }, setError } = useForm();
  const [created, setCreated] = useState(null);
  const [resendState, setResendState] = useState('idle');

  const onSubmit = async (values) => {
    dispatch(clearAuthError());
    const action = await dispatch(registerAccount(values));
    if (registerAccount.fulfilled.match(action)) {
      setCreated(values.email);
      return;
    }
    for (const fieldError of action.payload?.errors ?? []) {
      setError(fieldError.field, { message: fieldError.message });
    }
  };

  const resend = async () => {
    if (!created) return;
    setResendState('loading');
    try {
      await authApi.resendVerification(created);
      setResendState('sent');
    } catch {
      setResendState('error');
    }
  };

  if (created) {
    return (
      <section className="mx-auto max-w-lg px-5 py-16">
        <Card className="p-7 sm:p-9">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">Almost there</div>
          <h1 className="mt-2 text-3xl font-semibold">Verify your email.</h1>
          <p className="mt-4 text-sm leading-6 text-muted">We sent a verification link to <span className="text-text">{created}</span>. Open it to activate your account.</p>
          {resendState === 'sent' ? <div className="mt-5"><Alert tone="success">A new verification email has been sent.</Alert></div> : null}
          {resendState === 'error' ? <div className="mt-5"><Alert>We could not resend the email. Try again later.</Alert></div> : null}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button onClick={resend} loading={resendState === 'loading'}>Resend email</Button>
            <Link to="/login" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-4 text-sm font-semibold text-text hover:bg-surface-2">Back to login</Link>
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-lg px-5 py-28">
      <Card className="p-8">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">FreshCuts account</div>
        <h1 className="mt-2 text-3xl font-semibold">Create your account.</h1>
        {error ? <div className="mt-5"><Alert>{error.message}</Alert></div> : null}

        <form className="mt-7 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              id="firstName"
              label="First name"
              error={errors.firstName?.message || getFieldError(error, 'firstName')}
              {...register('firstName', { required: 'First name is required', maxLength: { value: 60, message: 'Maximum 60 characters' } })}
            />
            <Input
              id="lastName"
              label="Last name"
              error={errors.lastName?.message || getFieldError(error, 'lastName')}
              {...register('lastName', { required: 'Last name is required', maxLength: { value: 60, message: 'Maximum 60 characters' } })}
            />
          </div>
          <Input
            id="email"
            type="email"
            label="Email"
            error={errors.email?.message || getFieldError(error, 'email')}
            autoComplete="email"
            {...register('email', { required: 'Email is required' })}
          />
          <Input
            id="phone"
            type="tel"
            label="Phone (optional)"
            error={errors.phone?.message || getFieldError(error, 'phone')}
            autoComplete="tel"
            {...register('phone')}
          />
          <Input
            id="password"
            type="password"
            label="Password"
            error={errors.password?.message || getFieldError(error, 'password')}
            autoComplete="new-password"
            className="mb-2"
            {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Use at least 8 characters' }, maxLength: { value: 72, message: 'Maximum 72 characters' } })}
          />

          <Button type="submit" className="w-full">Create account</Button>
        </form>

        <p className="mt-6 text-left text-sm text-muted">
          Already have an account? <Link to="/login" className="text-sage-bright hover:text-text">Log in</Link>
        </p>
      </Card>
    </section>
  );
}