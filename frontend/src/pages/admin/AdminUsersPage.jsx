import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Trash2 } from 'lucide-react';
import {
  bulkDeleteAdminUsers,
  deleteAdminUser,
  getAdminUsers,
  updateAdminUser,
} from '../../services/admin.api.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import Alert from '../../components/ui/Alert.jsx';
import DropdownSelect from '../../components/ui/DropdownSelect.jsx';
import { useToast } from '../../components/ui/ToastProvider.jsx';
import DeleteConfirmDialog from '../../components/ui/DeleteConfirmDialog.jsx';
import AdminResourceCard from '../../components/admin/AdminResourceCard.jsx';

export default function AdminUsersPage() {
  useDocumentTitle('Admin users');
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    getAdminUsers()
      .then((x) => {
        setUsers(x);
        setState('ready');
      })
      .catch((e) => {
        setError(e.message);
        setState('error');
      });
  }, []);

  const change = (id, field, value) => {
    setUsers((current) => current.map((user) =>
      user.id === id ? { ...user, [field]: value } : user,
    ));
  };

  const saveUser = async (user) => {
    setSaving(true);
    setError('');
    try {
      const updated = await updateAdminUser(user.id, {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone ?? '',
        role: user.role,
        isActive: user.isActive,
      });
      setUsers((current) => current.map((item) => item.id === updated.id ? updated : item));
      toast(user.email !== updated.email
        ? 'User updated. The new email address must be verified before sign-in.'
        : 'User updated successfully.');
    } catch (requestError) {
      toast(requestError.message, 'error');
    } finally {
      setSaving(false);
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

  const toggleVisible = () => {
    setSelectedIds((current) => {
      const next = new Set(current);
      const allVisibleSelected = visibleUsers.length > 0
        && visibleUsers.every((user) => next.has(user.id));
      visibleUsers.forEach(({ id }) => {
        if (allVisibleSelected) next.delete(id);
        else next.add(id);
      });
      return next;
    });
  };

  const deleteSelected = () => {
    const ids = [...selectedIds];
    if (ids.length) setDeleteTarget({ ids, bulk: true, label: `${ids.length} selected user account${ids.length === 1 ? '' : 's'}` });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { ids, label } = deleteTarget;
    setSaving(true);
    try {
      if (deleteTarget.bulk) await bulkDeleteAdminUsers(ids);
      else await deleteAdminUser(ids[0]);
      const deletedIds = new Set(ids);
      setUsers((current) => current.filter((user) => !deletedIds.has(user.id)));
      setSelectedIds(new Set());
      toast(`${label} deleted.`);
      setDeleteTarget(null);
    } catch (requestError) {
      toast(requestError.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const removeUser = (user) => {
    setDeleteTarget({ ids: [user.id], bulk: false, label: `${user.firstName} ${user.lastName} (${user.email})` });
  };

  const visibleUsers = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return users.filter((user) => {
      const matchesQuery = !term || [user.firstName, user.lastName, user.email, user.role]
        .some((value) => value.toLocaleLowerCase().includes(term));
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.isActive === (statusFilter === 'active');
      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [users, query, roleFilter, statusFilter]);

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">Administration</div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mt-2 text-3xl font-semibold">Users</h1>
          <p className="mt-2 text-sm text-muted">Manage account roles and activation status.</p>
        </div>
        <Link to="/admin/users/new" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-sage px-4 py-2.5 text-sm font-semibold text-background transition hover:bg-sage-bright">
          <Plus className="h-4 w-4" /> Add user
        </Link>
      </div>

      <div className="mt-6 grid items-end gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-muted" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or email" aria-label="Search users" className="h-11 w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-text outline-none focus:border-sage" />
        </label>
        <DropdownSelect
          id="user-role-filter"
          label="Filter users by role"
          value={roleFilter}
          onChange={setRoleFilter}
          options={[
            { value: 'all', label: 'All roles' },
            { value: 'CLIENT', label: 'Client' },
            { value: 'PROVIDER', label: 'Provider' },
            { value: 'ADMIN', label: 'Admin' },
          ]}
        />
        <DropdownSelect
          id="user-status-filter"
          label="Filter users by status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: 'All statuses' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
        />
      </div>

      {visibleUsers.length ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" onClick={toggleVisible}>
            {visibleUsers.every(({ id }) => selectedIds.has(id)) ? 'Clear visible selection' : 'Select visible users'}
          </Button>
          {selectedIds.size ? <Button variant="secondary" loading={saving} onClick={deleteSelected}><Trash2 className="mr-2 h-4 w-4" /> Bulk delete ({selectedIds.size})</Button> : null}
        </div>
      ) : null}

      {error ? (
        <div className="mt-5">
          <Alert>{error}</Alert>
        </div>
      ) : null}

      {state === 'loading' ? (
        <div className="grid min-h-60 place-items-center">
          <Spinner />
        </div>
      ) : (
        <div className="mt-7 grid items-start gap-4 xl:grid-cols-2">
          {visibleUsers.map((user) => (
            <AdminResourceCard
              key={user.id}
              id={`user-${user.id}`}
              name={`${user.firstName} ${user.lastName}`}
              isActive={user.isActive}
              selected={selectedIds.has(user.id)}
              onSelect={() => toggleSelected(user.id)}
              onToggleActive={() => change(user.id, 'isActive', !user.isActive)}
              activeLabel="Active"
              inactiveLabel="Disabled"
              disabled={saving}
              summary={(
                <>
                  <p className="text-sm text-muted">{user.email}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-sage">{user.role}</p>
                </>
              )}
            >
              <div className="grid gap-3 pt-4 sm:grid-cols-2">
                <Input
                  id={`user-first-name-${user.id}`}
                  label="First name"
                  required
                  maxLength="60"
                  value={user.firstName}
                  onChange={(event) => change(user.id, 'firstName', event.target.value)}
                />
                <Input
                  id={`user-last-name-${user.id}`}
                  label="Last name"
                  required
                  maxLength="60"
                  value={user.lastName}
                  onChange={(event) => change(user.id, 'lastName', event.target.value)}
                />
                <Input
                  id={`user-email-${user.id}`}
                  label="Email address"
                  type="email"
                  required
                  maxLength="254"
                  value={user.email}
                  onChange={(event) => change(user.id, 'email', event.target.value)}
                />
                <Input
                  id={`user-phone-${user.id}`}
                  label="Phone"
                  type="tel"
                  maxLength="30"
                  value={user.phone ?? ''}
                  onChange={(event) => change(user.id, 'phone', event.target.value)}
                />
                <DropdownSelect
                  id={`role-${user.id}`}
                  label={`Role for ${user.firstName} ${user.lastName}`}
                  value={user.role}
                  onChange={(role) => change(user.id, 'role', role)}
                  options={[
                    { value: 'CLIENT', label: 'Client' },
                    { value: 'PROVIDER', label: 'Provider' },
                    { value: 'ADMIN', label: 'Admin' },
                  ]}
                />
                <DropdownSelect
                  id={`status-${user.id}`}
                  label={`Account status for ${user.firstName} ${user.lastName}`}
                  value={user.isActive ? 'active' : 'inactive'}
                  onChange={(status) => change(user.id, 'isActive', status === 'active')}
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                  ]}
                />
                <div className="text-sm text-muted">
                  <span className="block text-xs font-semibold uppercase tracking-wide">Email verification</span>
                  <span className="mt-1 block text-text">{user.emailVerifiedAt ? 'Verified' : 'Not verified'}</span>
                </div>
                <div className="text-sm text-muted">
                  <span className="block text-xs font-semibold uppercase tracking-wide">Account created</span>
                  <span className="mt-1 block text-text">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => removeUser(user)}
                  aria-label={`Delete ${user.firstName} ${user.lastName}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-red-400/40 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" /> Delete user
                </button>
                <Button loading={saving} onClick={() => saveUser(user)}>
                  Save changes
                </Button>
              </div>
            </AdminResourceCard>
          ))}
          {!visibleUsers.length ? (
            <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-muted xl:col-span-2">
              No users matched your search.
            </div>
          ) : null}
        </div>
      )}
      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete user account?"
        description={`Delete ${deleteTarget?.label ?? ''}? Accounts with appointment history or linked barber profiles cannot be deleted.`}
        confirmLabel={deleteTarget?.ids.length > 1 ? `Delete ${deleteTarget.ids.length} accounts` : 'Delete account'}
        loading={saving}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}