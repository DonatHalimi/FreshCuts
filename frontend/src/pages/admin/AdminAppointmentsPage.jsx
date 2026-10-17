import { useEffect, useMemo, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import {
  bulkDeleteAdminAppointments,
  deleteAdminAppointment,
  getAdminAppointments,
  updateAdminAppointmentStatus,
} from '../../services/admin.api.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { formatDateTime } from '../../utils/dates.js';
import { money } from '../../utils/money.js';
import Alert from '../../components/ui/Alert.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import DropdownSelect from '../../components/ui/DropdownSelect.jsx';
import DeleteConfirmDialog from '../../components/ui/DeleteConfirmDialog.jsx';
import { useToast } from '../../components/ui/ToastProvider.jsx';

const statusOptions = ['CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];

export default function AdminAppointmentsPage() {
  useDocumentTitle('Admin appointments');
  const toast = useToast();
  const [appointments, setAppointments] = useState([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState('');
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let current = true;
    setState('loading');
    getAdminAppointments(filter ? { status: filter } : {})
      .then((rows) => {
        if (!current) return;
        setAppointments(rows);
        setState('ready');
      })
      .catch((requestError) => {
        if (!current) return;
        setError(requestError.message);
        setState('error');
      });
    return () => {
      current = false;
    };
  }, [filter]);

  const visibleAppointments = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    if (!term) return appointments;
    return appointments.filter((appointment) => [
      appointment.customer.firstName,
      appointment.customer.lastName,
      appointment.customer.email,
      appointment.provider.name,
      appointment.serviceNameSnapshot,
    ].some((value) => value.toLocaleLowerCase().includes(term)));
  }, [appointments, query]);

  const updateStatus = async (appointment, status) => {
    setSavingId(appointment.id);
    setError('');
    try {
      const updated = await updateAdminAppointmentStatus(appointment.id, status);
      setAppointments((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingId('');
    }
  };

  const toggleSelected = (id) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectRowOnClick = (event, id) => {
    if (event.target.closest('button, a, input, select, [role="listbox"]')) return;
    toggleSelected(id);
  };

  const selectRowOnKeyDown = (event, id) => {
    if (event.target !== event.currentTarget || !['Enter', ' '].includes(event.key)) return;
    event.preventDefault();
    toggleSelected(id);
  };

  const toggleVisible = () => {
    setSelectedIds((current) => {
      const next = new Set(current);
      const allVisibleSelected = visibleAppointments.length > 0
        && visibleAppointments.every((appointment) => next.has(appointment.id));
      visibleAppointments.forEach(({ id }) => {
        if (allVisibleSelected) next.delete(id);
        else next.add(id);
      });
      return next;
    });
  };

  const requestSingleDelete = (appointment) => {
    setDeleteTarget({
      ids: [appointment.id],
      bulk: false,
      label: `${appointment.serviceNameSnapshot} for ${appointment.customer.firstName} ${appointment.customer.lastName}`,
    });
  };

  const requestBulkDelete = () => {
    if (!selectedIds.size) return;
    setDeleteTarget({
      ids: [...selectedIds],
      bulk: true,
      label: `${selectedIds.size} selected appointment${selectedIds.size === 1 ? '' : 's'}`,
    });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.bulk) await bulkDeleteAdminAppointments(deleteTarget.ids);
      else await deleteAdminAppointment(deleteTarget.ids[0]);
      const deleted = new Set(deleteTarget.ids);
      setAppointments((current) => current.filter((item) => !deleted.has(item.id)));
      setSelectedIds((current) => new Set([...current].filter((id) => !deleted.has(id))));
      toast(`${deleteTarget.label} deleted.`);
      setDeleteTarget(null);
    } catch (requestError) {
      toast(requestError.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">Administration</div>
      <h1 className="mt-2 text-3xl font-semibold">Appointments</h1>
      <p className="mt-2 text-sm text-muted">Search appointments and manage their operational status.</p>

      <div className="mt-6 grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search client, barber, service"
            aria-label="Search appointments"
            className="h-11 w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-text outline-none focus:border-sage"
          />
        </label>
        <DropdownSelect
          id="appointment-status"
          label="Filter appointments by status"
          value={filter}
          onChange={setFilter}
          options={[
            { value: '', label: 'All statuses' },
            ...statusOptions.map((status) => ({ value: status, label: status.replace('_', ' ') })),
          ]}
        />
      </div>

      {error ? <div className="mt-5"><Alert>{error}</Alert></div> : null}
      {state === 'ready' && visibleAppointments.length ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" onClick={toggleVisible}>
            {visibleAppointments.every(({ id }) => selectedIds.has(id)) ? 'Clear visible selection' : 'Select visible appointments'}
          </Button>
          {selectedIds.size ? (
            <Button variant="secondary" loading={deleting} onClick={requestBulkDelete}>
              <Trash2 className="mr-2 h-4 w-4" /> Bulk delete ({selectedIds.size})
            </Button>
          ) : null}
        </div>
      ) : null}
      {state === 'loading' ? (
        <div className="grid min-h-60 place-items-center"><Spinner /></div>
      ) : state === 'error' ? null : visibleAppointments.length ? (
        <Card className="mt-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-2 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-4">Appointment</th>
                  <th className="px-5 py-4">Client</th>
                  <th className="px-5 py-4">Barber</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Update status</th>
                  <th className="px-5 py-4"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {visibleAppointments.map((appointment) => (
                  <tr
                    key={appointment.id}
                    aria-selected={selectedIds.has(appointment.id)}
                    tabIndex={0}
                    onClick={(event) => selectRowOnClick(event, appointment.id)}
                    onKeyDown={(event) => selectRowOnKeyDown(event, appointment.id)}
                    className={`cursor-pointer border-b border-border last:border-0 transition-colors hover:bg-sage/5 ${selectedIds.has(appointment.id) ? 'bg-sage/10' : ''}`}
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium text-text">{appointment.serviceNameSnapshot}</div>
                      <div className="mt-1 text-xs text-muted">{formatDateTime(appointment.scheduledStartAt)}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-text">{appointment.customer.firstName} {appointment.customer.lastName}</div>
                      {/* <div className="mt-1 text-xs text-muted">{appointment.customer.email}</div> */}
                    </td>
                    <td className="px-5 py-4 text-text">{appointment.provider.name}</td>
                    <td className="px-5 py-4 text-text">{money(appointment.priceCentsSnapshot)}</td>
                    <td className="px-5 py-4"><Badge>{appointment.status.replace('_', ' ')}</Badge></td>
                    <td className="px-5 py-4">
                      <DropdownSelect
                        id={`status-${appointment.id}`}
                        label={`Status for appointment with ${appointment.customer.firstName} ${appointment.customer.lastName}`}
                        value={appointment.status}
                        disabled={savingId === appointment.id}
                        onChange={(status) => updateStatus(appointment, status)}
                        options={statusOptions.map((status) => ({ value: status, label: status.replace('_', ' ') }))}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => requestSingleDelete(appointment)}
                        disabled={deleting}
                        aria-label={`Delete appointment for ${appointment.customer.firstName} ${appointment.customer.lastName}`}
                        className="rounded-lg p-2 text-muted transition hover:bg-red-400/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="mt-6 rounded-xl border border-border bg-surface p-8 text-center text-sm text-muted">
          No appointments matched your search.
        </div>
      )}
      {appointments.length >= 200 ? (
        <p className="mt-3 text-xs text-muted">Showing the latest 200 appointments. Narrow the list by status to find older records.</p>
      ) : null}
      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        title={deleteTarget?.bulk ? 'Delete selected appointments?' : 'Delete appointment?'}
        description={`Delete ${deleteTarget?.label ?? ''}? This permanently removes the appointment record.`}
        confirmLabel={deleteTarget?.ids.length > 1 ? `Delete ${deleteTarget.ids.length} appointments` : 'Delete appointment'}
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
