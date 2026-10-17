import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createAdminService } from '../../services/admin.api.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import { useToast } from '../../components/ui/ToastProvider.jsx';

const initialValues = {
  name: '',
  description: '',
  durationMin: '30',
  priceCents: '',
  bufferBeforeMin: '0',
  bufferAfterMin: '0',
};

export default function AdminCreateServicePage() {
  useDocumentTitle('Add service');
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
      await createAdminService({
        ...values,
        durationMin: Number(values.durationMin),
        priceCents: Number(values.priceCents),
        bufferBeforeMin: Number(values.bufferBeforeMin),
        bufferAfterMin: Number(values.bufferAfterMin),
      });
      toast('Service added successfully.');
      navigate('/admin/services', { replace: true });
    } catch (requestError) {
      toast(requestError.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto">
      <Link to="/admin/services" className="inline-flex items-center gap-2 text-sm text-muted hover:text-text">
        <ArrowLeft className="h-4 w-4" /> Back to services
      </Link>
      <div className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-sage">Administration</div>
      <h1 className="mt-2 text-3xl font-semibold">Add a service</h1>
      <p className="mt-2 text-sm text-muted">Create a service to make it available in the booking catalogue.</p>

      <Card className="mt-6 p-6 sm:p-8">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
          <Input id="service-name" label="Service name" required minLength="2" maxLength="100" value={values.name} onChange={update('name')} />
          <Input id="service-duration" label="Duration (minutes)" type="number" required min="5" max="480" value={values.durationMin} onChange={update('durationMin')} />
          <Input id="service-price" label="Price (cents)" type="number" required min="0" max="100000" value={values.priceCents} onChange={update('priceCents')} />
          <Input id="service-buffer-before" label="Buffer before (minutes)" type="number" min="0" max="120" value={values.bufferBeforeMin} onChange={update('bufferBeforeMin')} />
          <Input id="service-buffer-after" label="Buffer after (minutes)" type="number" min="0" max="120" value={values.bufferAfterMin} onChange={update('bufferAfterMin')} />
          <label className="block space-y-2 sm:col-span-2" htmlFor="service-description">
            <span className="text-sm font-medium text-text">Description</span>
            <textarea id="service-description" maxLength={2000} rows={4} value={values.description} onChange={update('description')} className="w-full rounded-lg border border-border bg-background px-3.5 py-3 text-sm text-text outline-none focus:border-sage focus:ring-2 focus:ring-sage/15" />
          </label>
          <div className="flex gap-3 pt-2 sm:col-span-2">
            <Button type="submit" loading={saving}>Create service</Button>
            <Link to="/admin/services" className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-text hover:bg-surface-2">Cancel</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
