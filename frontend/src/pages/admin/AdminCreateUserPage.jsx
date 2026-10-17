import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createAdminUser } from '../../services/admin.api.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import DropdownSelect from '../../components/ui/DropdownSelect.jsx';
import { useToast } from '../../components/ui/ToastProvider.jsx';

const initialValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  role: 'CLIENT',
};

export default function AdminCreateUserPage() {
  useDocumentTitle('Add user');
  const navigate = useNavigate();
  const toast = useToast();
  const [values, setValues] = useState(initialValues);
  const [saving, setSaving] = useState(false);

  const update = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await createAdminUser(values);
      toast('User created. Email verification is required before sign-in.');
      navigate('/admin/users', { replace: true });
    } catch (requestError) {
      toast(requestError.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto">
      <Link to="/admin/users" className="inline-flex items-center gap-2 text-sm text-muted hover:text-text">
        <ArrowLeft className="h-4 w-4" /> Back to users
      </Link>
      <div className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-sage">Administration</div>
      <h1 className="mt-2 text-3xl font-semibold">Add a user</h1>
      <p className="mt-2 text-sm text-muted">The user will need to verify their email before signing in.</p>

      <Card className="mt-6 p-6 sm:p-8">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
          <Input id="user-first-name" label="First name" required maxLength="60" value={values.firstName} onChange={update('firstName')} />
          <Input id="user-last-name" label="Last name" required maxLength="60" value={values.lastName} onChange={update('lastName')} />
          <Input id="user-email" label="Email address" type="email" required maxLength="254" value={values.email} onChange={update('email')} />
          <Input id="user-phone" label="Phone (optional)" type="tel" maxLength="30" value={values.phone} onChange={update('phone')} />
          <Input id="user-password" label="Temporary password" type="password" required minLength="8" maxLength="72" autoComplete="new-password" value={values.password} onChange={update('password')} />
          <div>
            <DropdownSelect
              id="user-role"
              label="Account role"
              value={values.role}
              onChange={(role) => setValues((current) => ({ ...current, role }))}
              options={[
                { value: 'CLIENT', label: 'Client' },
                { value: 'ADMIN', label: 'Admin' },
              ]}
            />
          </div>
          <p className="text-xs text-muted sm:col-span-2">Provider staff accounts are set up separately when linking a login to a barber profile.</p>
          <div className="flex gap-3 pt-2 sm:col-span-2">
            <Button type="submit" loading={saving}>Create user</Button>
            <Link to="/admin/users" className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-text hover:bg-surface-2">Cancel</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
