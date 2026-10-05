import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import Input from '../components/ui/Input.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { clearAuthError, updateProfile } from '../store/authSlice.js';
import { getFieldError } from '../utils/errors.js';

export default function ProfilePage() {
  useDocumentTitle('Profile');
  const dispatch = useDispatch();
  const { user, error } = useSelector((state) => state.auth);
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm();

  useEffect(() => {
    if (user) reset({ firstName: user.firstName, lastName: user.lastName, phone: user.phone ?? '' });
  }, [user, reset]);

  const onSubmit = async (values) => {
    dispatch(clearAuthError());
    await dispatch(updateProfile(values));
  };

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <header className="rounded-2xl border border-border bg-surface px-6 py-5">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">Account</div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Your profile</h1>
        <p className="mt-1.5 text-sm text-muted">Keep your personal details up to date.</p>
      </header>

      <Card className="p-7 sm:p-9">
        {error ? <div className="mb-5"><Alert>{error.message}</Alert></div> : null}

        <div className="rounded-xl border border-border bg-background p-4">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.14em] text-muted">Email</span>
            {user.emailVerified && (
              <span className="rounded-full border border-sage/30 bg-sage/10 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-sage">
                Verified
              </span>
            )}
          </div>
          <div className="mt-2 text-sm font-medium">{user.email}</div>
        </div>

        <form className="mt-7 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input id="firstName" label="First name" error={errors.firstName?.message || getFieldError(error, 'firstName')} {...register('firstName', { required: 'First name is required' })} />
            <Input id="lastName" label="Last name" error={errors.lastName?.message || getFieldError(error, 'lastName')} {...register('lastName', { required: 'Last name is required' })} />
          </div>
          <Input id="phone" label="Phone" error={errors.phone?.message || getFieldError(error, 'phone')} {...register('phone')} />
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={!isDirty}>Save changes</Button>
          </div>
        </form>
      </Card>
    </section>
  );
}