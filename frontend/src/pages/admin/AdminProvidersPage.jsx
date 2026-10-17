import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Trash2 } from 'lucide-react';
import {
  bulkDeleteAdminProviders,
  deleteAdminProvider,
  getAdminProviders,
  updateAdminProvider,
} from '../../services/admin.api.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import Alert from '../../components/ui/Alert.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import { useToast } from '../../components/ui/ToastProvider.jsx';
import DropdownSelect from '../../components/ui/DropdownSelect.jsx';
import DeleteConfirmDialog from '../../components/ui/DeleteConfirmDialog.jsx';
import AdminResourceCard from '../../components/admin/AdminResourceCard.jsx';

export default function AdminProvidersPage() {
  useDocumentTitle('Admin barbers');
  const toast = useToast();
  const [providers, setProviders] = useState([]);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState('');
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    getAdminProviders()
      .then((providerRows) => {
        setProviders(providerRows);
        setState('ready');
      })
      .catch((requestError) => {
        setError(requestError.message);
        setState('error');
      });
  }, []);

  const visibleProviders = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return providers.filter((provider) => {
      const matchesQuery = !term || [provider.name, provider.title, provider.user?.email]
        .some((value) => value?.toLocaleLowerCase().includes(term));
      const matchesStatus = activeFilter === 'all' || provider.isActive === (activeFilter === 'active');
      return matchesQuery && matchesStatus;
    });
  }, [providers, query, activeFilter]);

  const change = (id, field, value) => {
    setProviders((current) => current.map((provider) =>
      provider.id === id ? { ...provider, [field]: value } : provider,
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
      const allVisibleSelected = visibleProviders.length > 0
        && visibleProviders.every((provider) => next.has(provider.id));
      visibleProviders.forEach(({ id }) => {
        if (allVisibleSelected) next.delete(id);
        else next.add(id);
      });
      return next;
    });
  };

  const deleteSelected = () => {
    const ids = [...selectedIds];
    if (ids.length) setDeleteTarget({ ids, bulk: true, label: `${ids.length} selected barber profile${ids.length === 1 ? '' : 's'}` });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { ids, label } = deleteTarget;
    setSavingId('bulk');
    try {
      if (deleteTarget.bulk) await bulkDeleteAdminProviders(ids);
      else await deleteAdminProvider(ids[0]);
      const deletedIds = new Set(ids);
      setProviders((current) => current.filter((provider) => !deletedIds.has(provider.id)));
      setSelectedIds(new Set());
      toast(`${label} deleted.`);
      setDeleteTarget(null);
    } catch (requestError) {
      toast(requestError.message, 'error');
    } finally {
      setSavingId('');
    }
  };

  const removeProvider = (provider) => {
    setDeleteTarget({ ids: [provider.id], bulk: false, label: provider.name });
  };

  const save = async (provider) => {
    setSavingId(provider.id);
    setError('');
    try {
      const updated = await updateAdminProvider(provider.id, {
        name: provider.name,
        title: provider.title || '',
        bio: provider.bio || '',
      });
      setProviders((current) => current.map((item) => item.id === updated.id ? updated : item));
      toast('Barber profile updated successfully.');
    } catch (requestError) {
      toast(requestError.message, 'error');
    } finally {
      setSavingId('');
    }
  };

  const toggleActive = async (provider) => {
    setSavingId(provider.id);
    setError('');
    try {
      const updated = await updateAdminProvider(provider.id, { isActive: !provider.isActive });
      setProviders((current) => current.map((item) => item.id === updated.id ? updated : item));
      toast(`Barber ${updated.isActive ? 'activated' : 'deactivated'} successfully.`);
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
          <h1 className="mt-2 text-3xl font-semibold">Barbers</h1>
          <p className="mt-2 text-sm text-muted">Edit public barber profiles and manage their booking availability.</p>
        </div>
        <Link to="/admin/providers/new" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-sage px-4 py-2.5 text-sm font-semibold text-background transition hover:bg-sage-bright">
          <Plus className="h-4 w-4" /> Add barber
        </Link>
      </div>

      <div className="mt-6 grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-muted" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search barbers" aria-label="Search barbers" className="h-11 w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-text outline-none focus:border-sage" />
        </label>
        <DropdownSelect
          id="provider-status-filter"
          label="Filter barbers by status"
          value={activeFilter}
          onChange={setActiveFilter}
          options={[
            { value: 'all', label: 'All barbers' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
        />
      </div>

      {visibleProviders.length ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" onClick={toggleVisible}>
            {visibleProviders.every(({ id }) => selectedIds.has(id)) ? 'Clear visible selection' : 'Select visible barbers'}
          </Button>
          {selectedIds.size ? <Button variant="secondary" loading={savingId === 'bulk'} onClick={deleteSelected}><Trash2 className="mr-2 h-4 w-4" /> Bulk delete ({selectedIds.size})</Button> : null}
        </div>
      ) : null}

      {error ? <div className="mt-5"><Alert>{error}</Alert></div> : null}
      {state === 'loading' ? (
        <div className="grid min-h-60 place-items-center"><Spinner /></div>
      ) : state === 'error' ? null : visibleProviders.length ? (
        <div className="mt-6 grid items-start gap-4 xl:grid-cols-2">
          {visibleProviders.map((provider) => (
            <AdminResourceCard
              key={provider.id}
              id={`provider-${provider.id}`}
              name={provider.name}
              isActive={provider.isActive}
              selected={selectedIds.has(provider.id)}
              onSelect={() => toggleSelected(provider.id)}
              onToggleActive={() => toggleActive(provider)}
              disabled={savingId === provider.id}
              summary={(
                <>
                  <p className="text-sm text-muted">{provider.title || 'Barber'} · {provider.services?.length ?? 0} services</p>
                  {provider.services?.length ? (
                    <p className="mt-1 truncate text-xs text-muted">{provider.services.map((item) => item.service.name).join(', ')}</p>
                  ) : null}
                  <p className="mt-1 text-xs text-muted">{provider._count.appointments} appointment records</p>
                </>
              )}
            >
              <div className="space-y-3 pt-4">
                <Input
                  id={`provider-email-${provider.id}`}
                  label="Staff email"
                  type="email"
                  value={provider.user?.email || 'No linked staff account'}
                  readOnly
                />
                <Input
                  id={`provider-name-${provider.id}`}
                  label="Display name"
                  value={provider.name}
                  onChange={(event) => change(provider.id, 'name', event.target.value)}
                />
                <Input
                  id={`provider-title-${provider.id}`}
                  label="Title"
                  value={provider.title || ''}
                  onChange={(event) => change(provider.id, 'title', event.target.value)}
                />
                <Textarea
                  id={`provider-bio-${provider.id}`}
                  label="Bio"
                  value={provider.bio || ''}
                  onChange={(event) => change(provider.id, 'bio', event.target.value)}
                  rows={3}
                />
              </div>
              <div className="mt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={savingId === provider.id}
                  onClick={() => removeProvider(provider)}
                  aria-label={`Delete ${provider.name}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-red-400/40 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" /> Delete barber
                </button>
                <Button loading={savingId === provider.id} onClick={() => save(provider)}>
                  Save profile
                </Button>
              </div>
            </AdminResourceCard>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-border bg-surface p-8 text-center text-sm text-muted">
          No barbers matched your search.
        </div>
      )}
      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete barber profile?"
        description={`Delete ${deleteTarget?.label ?? ''}? Profiles with appointment history cannot be deleted.`}
        confirmLabel={deleteTarget?.ids.length > 1 ? `Delete ${deleteTarget.ids.length} profiles` : 'Delete profile'}
        loading={savingId === 'bulk'}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
