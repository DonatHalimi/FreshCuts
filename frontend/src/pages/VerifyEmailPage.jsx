import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import Input from '../components/ui/Input.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { resendVerification, verifyEmail } from '../services/auth.api.js';

export default function VerifyEmailPage() {
  useDocumentTitle('Verify email');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [status, setStatus] = useState(token ? 'loading' : 'idle');
  const [message, setMessage] = useState('');
  const [resendStatus, setResendStatus] = useState('idle');
  const attempted = useRef(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    if (!token || attempted.current) return;
    attempted.current = true;

    verifyEmail(token)
      .then((result) => {
        // Backend now returns { verified: true, alreadyVerified: true|false }
        const already = Boolean(result?.alreadyVerified);
        setStatus('success');
        setMessage(already ? 'Your email is already verified.' : 'Your email has been verified.');
        setTimeout(() => navigate('/login', { state: { verified: true } }), 1500);
      })
      .catch((error) => {
        const code = error?.response?.data?.code;
        const httpStatus = error?.response?.status;
        const msg = error?.response?.data?.message;

        // Token consumed but the account is verified — treat as success
        if (code === 'TOKEN_ALREADY_USED' || httpStatus === 410) {
          setStatus('success');
          setMessage('Your email is already verified.');
          setTimeout(() => navigate('/login', { state: { verified: true } }), 1500);
          return;
        }

        setStatus('error');
        setMessage(
          code === 'TOKEN_EXPIRED'
            ? 'This verification link has expired. Request a new one below.'
            : msg || 'We could not verify that link.'
        );
      });
  }, [token, navigate]);

  const onResend = async ({ email }) => {
    setResendStatus('loading');
    try {
      await resendVerification(email);
      setResendStatus('sent');
    } catch {
      setResendStatus('error');
    }
  };

  return (
    <section className="mx-auto max-w-lg px-5 py-16">
      <Card className="p-7 sm:p-9">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">Email verification</div>
        <h1 className="mt-2 text-3xl font-semibold">Verify your account.</h1>

        {status === 'loading' ? (
          <div className="grid place-items-center py-10"><Spinner /></div>
        ) : status === 'success' ? (
          <div className="mt-6 space-y-5">
            <Alert tone="success">{message} Redirecting you to login…</Alert>
            <Link to="/login" state={{ verified: true }} className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-sage text-sm font-semibold text-background hover:bg-sage-bright">Continue to login</Link>
          </div>
        ) : status === 'error' ? (
          <div className="mt-6 space-y-5">
            <Alert>{message}</Alert>
            <Link to="/verify-email" className="text-sm text-sage-bright">Request a new verification link</Link>
          </div>
        ) : (
          <>
            <p className="mt-3 text-sm leading-6 text-muted">Enter your email and we will send a fresh verification link if your account needs one.</p>
            {resendStatus === 'sent' ? <div className="mt-5"><Alert tone="success">If the account needs verification, a new email has been sent.</Alert></div> : null}
            {resendStatus === 'error' ? <div className="mt-5"><Alert>We could not process that request.</Alert></div> : null}
            <form className="mt-6 space-y-4" onSubmit={handleSubmit(onResend)}>
              <Input id="email" type="email" label="Email" error={errors.email?.message} {...register('email', { required: 'Email is required' })} />
              <Button type="submit" className="w-full" loading={resendStatus === 'loading'}>Send verification email</Button>
            </form>
          </>
        )}
      </Card>
    </section>
  );
}