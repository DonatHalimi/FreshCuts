import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createAdminProvider, getAdminServices } from '../../services/admin.api.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import Alert from '../../components/ui/Alert.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import { useToast } from '../../components/ui/ToastProvider.jsx';

const weekdays = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];
const allDays = weekdays.map(({ value }) => value);

export default function AdminCreateProviderPage() {
  useDocumentTitle('Add barber');
  const navigate = useNavigate();
  const toast = useToast();
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [values, setValues] = useState({
    name: '',
    title: '',
    bio: '',
    serviceIds: [],
    workingDays: allDays,
    startTime: '09:00',
    endTime: '18:00',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let current = true;
    getAdminServices()
      .then((rows) => {
        if (current) setServices(rows.filter((service) => service.isActive));
      })
      .catch((requestError) => {
        if (current) setError(requestError.message);
      })
      .finally(() => {
        if (current) setLoadingServices(false);
      });
    return () => {
      current = false;
    };
  }, []);

  const update = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
  };

  const toggleListValue = (field, value) => {
    setValues((current) => ({
      ...current,
      [field]: current[field].includes(value)
        ? current[field].filter((item) => item !== value)
        : field === 'workingDays'
          ? [...current[field], value].sort((a, b) => a - b)
          : [...current[field], value],
    }));
  };

  const toMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    const startMin = toMinutes(values.startTime);
    const endMin = toMinutes(values.endTime);
    if (endMin <= startMin) {
      toast('Closing time must be later than opening time.', 'error');
      return;
    }
    setSaving(true);
    try {
      await createAdminProvider({
        name: values.name,
        title: values.title,
        bio: values.bio,
        serviceIds: values.serviceIds,
        workingDays: values.workingDays,
        startMin,
        endMin,
      });
      toast('Barber added successfully.');
      navigate('/admin/providers', { replace: true });
    } catch (requestError) {
      toast(requestError.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto">
      <Link to="/admin/providers" className="inline-flex items-center gap-2 text-sm text-muted hover:text-text">
        <ArrowLeft className="h-4 w-4" /> Back to barbers
      </Link>
      <div className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-sage">Administration</div>
      <h1 className="mt-2 text-3xl font-semibold">Add a barber</h1>
      <p className="mt-2 text-sm text-muted">Creates a public booking profile without a staff login account.</p>

      <Card className="mt-6 p-6 sm:p-8">
        {error ? <div className="mb-5"><Alert>{error}</Alert></div> : null}
        {loadingServices ? (
          <div className="grid min-h-32 place-items-center"><Spinner /></div>
        ) : (
          <form className="space-y-5" onSubmit={submit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input id="provider-name" label="Display name" required minLength="2" maxLength="100" value={values.name} onChange={update('name')} />
              <Input id="provider-title" label="Title (optional)" maxLength="100" value={values.title} onChange={update('title')} />
            </div>
            <Textarea id="provider-bio" label="Bio (optional)" maxLength={2000} rows={3} value={values.bio} onChange={update('bio')} />
            <fieldset>
              <legend className="text-sm font-medium text-text">Services offered</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {services.map((service) => (
                  <label key={service.id} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted">
                    <input type="checkbox" checked={values.serviceIds.includes(service.id)} onChange={() => toggleListValue('serviceIds', service.id)} />
                    {service.name}
                  </label>
                ))}
                {!services.length ? <span className="text-xs text-muted">Create an active service before adding a barber.</span> : null}
              </div>
            </fieldset>
            <fieldset>
              <legend className="text-sm font-medium text-text">Working days</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {weekdays.map((day) => (
                  <label key={day.value} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted">
                    <input type="checkbox" checked={values.workingDays.includes(day.value)} onChange={() => toggleListValue('workingDays', day.value)} />
                    {day.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input id="provider-opens" label="Opens at" type="time" required value={values.startTime} onChange={update('startTime')} />
              <Input id="provider-closes" label="Closes at" type="time" required value={values.endTime} onChange={update('endTime')} />
            </div>
            <p className="text-xs text-muted">A 13:00–14:00 lunch break is added for each selected working day.</p>
            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={saving} disabled={!services.length || !values.serviceIds.length || !values.workingDays.length}>Create barber</Button>
              <Link to="/admin/providers" className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-text hover:bg-surface-2">Cancel</Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
