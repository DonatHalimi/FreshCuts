import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Trash2 } from 'lucide-react';
import {
  bulkDeleteAdminServices,
  deleteAdminService,
  getAdminServices,
  updateAdminService,
} from '../../services/admin.api.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { money } from '../../utils/money.js';
import Alert from '../../components/ui/Alert.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import { useToast } from '../../components/ui/ToastProvider.jsx';
import DropdownSelect from '../../components/ui/DropdownSelect.jsx';
import DeleteConfirmDialog from '../../components/ui/DeleteConfirmDialog.jsx';
import AdminResourceCard from '../../components/admin/AdminResourceCard.jsx';

export default function AdminServicesPage() {
  useDocumentTitle('Admin services');
  const toast = useToast();
  const [services, setServices] = useState([]);
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [savingId, setSavingId] = useState('');
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    getAdminServices()
      .then((rows) => {
        setServices(rows);
        setState('ready');
      })
      .catch((requestError) => {
        setError(requestError.message);
        setState('error');
      });
  }, []);

  const visibleServices = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return services.filter((service) => {
      const matchesQuery = !term || service.name.toLocaleLowerCase().includes(term);
      const matchesStatus = activeFilter === 'all' || service.isActive === (activeFilter === 'active');
      return matchesQuery && matchesStatus;
    });
  }, [services, query, activeFilter]);

  const change = (id, field, value) => {
    setServices((current) => current.map((service) =>
      service.id === id ? { ...service, [field]: value } : service,
    ));
  };

  const toggleSelected = (id) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleVisible = () => {
    setSelectedIds((current) => {
      const next = new Set(current);
      const allVisibleSelected = visibleServices.length > 0
        && visibleServices.every((service) => next.has(service.id));
      visibleServices.forEach(({ id }) => {
        if (allVisibleSelected) next.delete(id);
        else next.add(id);
      });
      return next;
    });
  };

  const deleteSelected = () => {
    const ids = [...selectedIds];
    if (ids.length) setDeleteTarget({ ids, bulk: true, label: `${ids.length} selected service${ids.length === 1 ? '' : 's'}` });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { ids, label } = deleteTarget;
    setSavingId('bulk');
    try {
      if (deleteTarget.bulk) await bulkDeleteAdminServices(ids);
      else await deleteAdminService(ids[0]);
      const deletedIds = new Set(ids);
      setServices((current) => current.filter((service) => !deletedIds.has(service.id)));
      setSelectedIds(new Set());
      toast(`${label} deleted.`);
      setDeleteTarget(null);
    } catch (requestError) {
      toast(requestError.message, 'error');
    } finally {
      setSavingId('');
    }
  };

  const removeService = (service) => {
    setDeleteTarget({ ids: [service.id], bulk: false, label: service.name });
  };

  const update = async (service) => {
    setSavingId(service.id);
    setError('');
    try {
      const updated = await updateAdminService(service.id, {
        name: service.name,
        description: service.description || '',
        priceCents: Number(service.priceCents),
        durationMin: Number(service.durationMin),
        bufferBeforeMin: Number(service.bufferBeforeMin),
        bufferAfterMin: Number(service.bufferAfterMin),
        isActive: service.isActive,
      });
      setServices((current) => current.map((item) => item.id === updated.id ? updated : item));
      toast('Service updated successfully.');
    } catch (requestError) {
      toast(requestError.message, 'error');
    } finally {
      setSavingId('');
    }
  };

  const toggleActive = async (service) => {
    setSavingId(service.id);
    setError('');
    try {
      const updated = await updateAdminService(service.id, { isActive: !service.isActive });
      setServices((current) => current.map((item) => item.id === updated.id ? updated : item));
      toast(`Service ${updated.isActive ? 'activated' : 'deactivated'} successfully.`);
    } catch (requestError) {
      toast(requestError.message, 'error');
    } finally {
      setSavingId('');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">Administration</div>
          <h1 className="mt-2 text-3xl font-semibold">Services</h1>
          <p className="mt-2 text-sm text-muted">Configure service pricing, duration, booking buffers and availability.</p>
        </div>
        <Link to="/admin/services/new" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-sage px-4 py-2.5 text-sm font-semibold text-background transition hover:bg-sage-bright">
          <Plus className="h-4 w-4" /> Add service
        </Link>
      </div>

      <div className="mt-6 grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-muted" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search services" aria-label="Search services" className="h-11 w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-text outline-none focus:border-sage" />
        </label>
        <DropdownSelect
          id="service-status-filter"
          label="Filter services by status"
          value={activeFilter}
          onChange={setActiveFilter}
          options={[
            { value: 'all', label: 'All services' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
        />
      </div>

      {visibleServices.length ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" onClick={toggleVisible}>
            {visibleServices.every(({ id }) => selectedIds.has(id)) ? 'Clear visible selection' : 'Select visible services'}
          </Button>
          {selectedIds.size ? <Button variant="secondary" loading={savingId === 'bulk'} onClick={deleteSelected}><Trash2 className="mr-2 h-4 w-4" /> Bulk delete ({selectedIds.size})</Button> : null}
        </div>
      ) : null}

      {error ? <div className="mt-5"><Alert>{error}</Alert></div> : null}
      {state === 'loading' ? (
        <div className="grid min-h-60 place-items-center"><Spinner /></div>
      ) : state === 'error' ? null : visibleServices.length ? (
        <div className="mt-6 grid items-start gap-4 md:grid-cols-2">
          {visibleServices.map((service) => (
            <AdminResourceCard
              key={service.id}
              id={`service-${service.id}`}
              name={service.name}
              isActive={service.isActive}
              selected={selectedIds.has(service.id)}
              onSelect={() => toggleSelected(service.id)}
              onToggleActive={() => toggleActive(service)}
              disabled={savingId === service.id}
              summary={<p className="text-sm text-muted">{money(service.priceCents)} · {service.durationMin} minutes</p>}
            >
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Input
                  id={`name-${service.id}`}
                  label="Service name"
                  required
                  minLength="2"
                  maxLength="100"
                  value={service.name}
                  onChange={(event) => change(service.id, 'name', event.target.value)}
                />
                <Input id={`price-${service.id}`} label="Price (cents)" type="number" min="0" value={service.priceCents} onChange={(event) => change(service.id, 'priceCents', event.target.value)} />
                <Input id={`duration-${service.id}`} label="Duration (minutes)" type="number" min="5" value={service.durationMin} onChange={(event) => change(service.id, 'durationMin', event.target.value)} />
                <Input id={`before-${service.id}`} label="Buffer before" type="number" min="0" value={service.bufferBeforeMin} onChange={(event) => change(service.id, 'bufferBeforeMin', event.target.value)} />
                <Input id={`after-${service.id}`} label="Buffer after" type="number" min="0" value={service.bufferAfterMin} onChange={(event) => change(service.id, 'bufferAfterMin', event.target.value)} />
                <Textarea
                  id={`description-${service.id}`}
                  label="Description"
                  maxLength={2000}
                  rows={4}
                  value={service.description ?? ''}
                  onChange={(event) => change(service.id, 'description', event.target.value)}
                  className="sm:col-span-2"
                />
              </div>
              <div className="mt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={savingId === service.id}
                  onClick={() => removeService(service)}
                  aria-label={`Delete ${service.name}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-red-400/40 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" /> Delete service
                </button>
                <Button loading={savingId === service.id} onClick={() => update(service)}>
                  Save changes
                </Button>
              </div>
            </AdminResourceCard>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-border bg-surface p-8 text-center text-sm text-muted">
          No services matched your search.
        </div>
      )}
      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete service?"
        description={`Delete ${deleteTarget?.label ?? ''}? Services with appointment history cannot be deleted.`}
        confirmLabel={deleteTarget?.ids.length > 1 ? `Delete ${deleteTarget.ids.length} services` : 'Delete service'}
        loading={savingId === 'bulk'}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
