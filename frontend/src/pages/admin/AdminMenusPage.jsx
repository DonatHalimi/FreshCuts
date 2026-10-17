import { useEffect, useMemo, useState } from 'react';
import { GripVertical, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import Alert from '../../components/ui/Alert.jsx';
import Button from '../../components/ui/Button.jsx';
import DropdownSelect from '../../components/ui/DropdownSelect.jsx';
import Input from '../../components/ui/Input.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import { useToast } from '../../components/ui/ToastProvider.jsx';
import DeleteConfirmDialog from '../../components/ui/DeleteConfirmDialog.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { clearMenuCache } from '../../hooks/useMenu.js';
import {
  createAdminMenuItem,
  deleteAdminMenuItem,
  getAdminMenus,
  reorderAdminMenuItems,
  updateAdminMenuItem,
} from '../../services/menus.api.js';

const EMPTY_DRAFT = {
  key: '',
  label: '',
  href: '',
  iconKey: '',
  parentId: '',
  requiredPermissions: '',
  isActive: true,
  openInNewTab: false,
};

function toTree(items, parentId = null) {
  return items
    .filter((item) => item.parentId === parentId)
    .sort((a, b) => a.position - b.position)
    .map((item) => ({ ...item, children: toTree(items, item.id) }));
}

function flattenTree(items, parentId = null) {
  return items.flatMap((item, position) => [
    { id: item.id, parentId, position },
    ...flattenTree(item.children ?? [], item.id),
  ]);
}

function moveWithinSiblings(items, draggedId, targetId) {
  const dragged = items.find((item) => item.id === draggedId);
  const target = items.find((item) => item.id === targetId);
  if (!dragged || !target || dragged.parentId !== target.parentId) return null;

  const siblings = items
    .filter((item) => item.parentId === dragged.parentId)
    .sort((a, b) => a.position - b.position);
  const from = siblings.findIndex((item) => item.id === draggedId);
  const to = siblings.findIndex((item) => item.id === targetId);
  siblings.splice(to, 0, siblings.splice(from, 1)[0]);

  const positions = new Map(siblings.map((item, index) => [item.id, index]));
  return items.map((item) => positions.has(item.id)
    ? { ...item, position: positions.get(item.id) }
    : item);
}

export default function AdminMenusPage() {
  useDocumentTitle('Navigation menus');
  const toast = useToast();
  const [menus, setMenus] = useState([]);
  const [menuKey, setMenuKey] = useState('');
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [draggedId, setDraggedId] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    getAdminMenus()
      .then((rows) => {
        setMenus(rows);
        setMenuKey(rows[0]?.key ?? '');
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  const activeMenu = menus.find((menu) => menu.key === menuKey);
  const tree = useMemo(() => toTree(activeMenu?.items ?? []), [activeMenu]);
  const parentOptions = useMemo(() => [
    { value: '', label: 'Top level' },
    ...(activeMenu?.items ?? []).map((item) => ({
      value: item.id,
      label: `${item.parentId ? '↳ ' : ''}${item.label}`,
    })),
  ], [activeMenu]);

  const refreshMenuItems = (nextItems) => {
    setMenus((current) => current.map((menu) =>
      menu.key === menuKey ? { ...menu, items: nextItems, version: menu.version + 1 } : menu,
    ));
    clearMenuCache(menuKey);
    window.dispatchEvent(new Event('freshcuts:menus-updated'));
  };

  const resetDraft = () => {
    setDraft(EMPTY_DRAFT);
    setEditingId('');
  };

  const saveItem = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      ...draft,
      href: draft.href.trim() || null,
      iconKey: draft.iconKey.trim() || null,
      parentId: draft.parentId || null,
      requiredPermissions: draft.requiredPermissions.split(',').map((permission) => permission.trim()).filter(Boolean),
      position: editingId
        ? activeMenu.items.find((item) => item.id === editingId)?.position ?? activeMenu.items.length
        : activeMenu.items.length,
    };

    try {
      if (editingId) {
        const updated = await updateAdminMenuItem(menuKey, editingId, payload);
        refreshMenuItems(activeMenu.items.map((item) => item.id === editingId ? updated : item));
        toast('Menu item updated.');
      } else {
        const created = await createAdminMenuItem(menuKey, payload);
        refreshMenuItems([...activeMenu.items, created]);
        toast('Menu item added.');
      }
      resetDraft();
    } catch (requestError) {
      setError(requestError.message);
      toast(requestError.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const editItem = (item) => {
    setEditingId(item.id);
    setDraft({
      key: item.key,
      label: item.label,
      href: item.href ?? '',
      iconKey: item.iconKey ?? '',
      parentId: item.parentId ?? '',
      requiredPermissions: item.requiredPermissions.join(', '),
      isActive: item.isActive,
      openInNewTab: item.openInNewTab,
    });
  };

  const removeItem = (item) => setDeleteTarget(item);

  const confirmDelete = async () => {
    const item = deleteTarget;
    if (!item) return;
    setSaving(true);
    setError('');
    try {
      await deleteAdminMenuItem(menuKey, item.id);
      const deletedIds = new Set();
      const addDescendants = (id) => {
        deletedIds.add(id);
        activeMenu.items.filter((candidate) => candidate.parentId === id).forEach((child) => addDescendants(child.id));
      };
      addDescendants(item.id);
      refreshMenuItems(activeMenu.items.filter((candidate) => !deletedIds.has(candidate.id)));
      if (editingId && deletedIds.has(editingId)) resetDraft();
      toast('Menu item deleted.');
      setDeleteTarget(null);
    } catch (requestError) {
      setError(requestError.message);
      toast(requestError.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const reorder = async (dragged, target) => {
    const nextItems = moveWithinSiblings(activeMenu.items, dragged, target);
    setDraggedId('');
    if (!nextItems) return;
    setSaving(true);
    setError('');
    try {
      await reorderAdminMenuItems(menuKey, flattenTree(toTree(nextItems)));
      refreshMenuItems(nextItems);
    } catch (requestError) {
      setError(requestError.message);
      toast(requestError.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const renderItems = (items, depth = 0) => items.map((item) => (
    <div key={item.id} className="space-y-2">
      <div
        draggable={!saving}
        onDragStart={() => setDraggedId(item.id)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={() => reorder(draggedId, item.id)}
        className="flex items-center gap-3 rounded-xl border border-border bg-background p-3"
        style={{ marginLeft: `${depth * 18}px` }}
      >
        <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted" aria-label="Drag to reorder among siblings" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-text">{item.label}</div>
          <div className="truncate text-xs text-muted">{item.href || 'Group'} · {item.iconKey || 'no icon'}</div>
          {item.requiredPermissions.length ? (
            <div className="mt-1 truncate text-[11px] text-sage">{item.requiredPermissions.join(', ')}</div>
          ) : null}
        </div>
        <span className={`text-xs ${item.isActive ? 'text-sage' : 'text-muted'}`}>{item.isActive ? 'Active' : 'Hidden'}</span>
        <button type="button" onClick={() => editItem(item)} aria-label={`Edit ${item.label}`} className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-text">
          <Pencil className="h-4 w-4" />
        </button>
        <button type="button" disabled={saving} onClick={() => removeItem(item)} aria-label={`Delete ${item.label}`} className="rounded-lg p-2 text-muted hover:bg-red-400/10 hover:text-red-300 disabled:opacity-50">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {item.children.length ? <div className="space-y-2">{renderItems(item.children, depth + 1)}</div> : null}
    </div>
  ));

  if (loading) return <div className="grid min-h-60 place-items-center"><Spinner /></div>;

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">Administration</div>
      <h1 className="mt-2 text-3xl font-semibold">Navigation menus</h1>
      <p className="mt-2 text-sm text-muted">Manage the navigation used across the site. Drag items to reorder within their current level.</p>

      {error ? <div className="mt-5"><Alert>{error}</Alert></div> : null}
      {menus.length ? (
        <>
          <div className="mt-6 max-w-sm">
            <DropdownSelect
              id="menu-key"
              label="Menu"
              value={menuKey}
              onChange={(nextKey) => {
                setMenuKey(nextKey);
                resetDraft();
                setError('');
              }}
              options={menus.map((menu) => ({ value: menu.key, label: `${menu.label} (${menu.key})` }))}
            />
          </div>
          <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,.8fr)]">
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Menu items</h2>
              {tree.length ? renderItems(tree) : <div className="rounded-xl border border-border bg-surface p-5 text-sm text-muted">No items in this menu yet.</div>}
            </section>

            <form onSubmit={saveItem} className="space-y-4 rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{editingId ? 'Edit menu item' : 'Add menu item'}</h2>
                {editingId ? <button type="button" onClick={resetDraft} aria-label="Cancel editing" className="rounded-lg p-2 text-muted hover:bg-surface-2"><X className="h-4 w-4" /></button> : <Plus className="h-4 w-4 text-sage" />}
              </div>
              <Input id="menu-item-key" label="Unique key" required maxLength="100" pattern="[a-zA-Z0-9][a-zA-Z0-9_-]*" value={draft.key} onChange={(event) => setDraft((current) => ({ ...current, key: event.target.value }))} />
              <Input id="menu-item-label" label="Display label" required maxLength="120" value={draft.label} onChange={(event) => setDraft((current) => ({ ...current, label: event.target.value }))} />
              <Input id="menu-item-href" label="Route or HTTPS URL (blank for group)" maxLength="500" value={draft.href} onChange={(event) => setDraft((current) => ({ ...current, href: event.target.value }))} />
              <Input id="menu-item-icon" label="Icon key (e.g. calendar, users)" maxLength="60" value={draft.iconKey} onChange={(event) => setDraft((current) => ({ ...current, iconKey: event.target.value }))} />
              <DropdownSelect id="menu-item-parent" label="Parent item (max 3 levels)" value={draft.parentId} onChange={(parentId) => setDraft((current) => ({ ...current, parentId }))} options={parentOptions.filter((option) => option.value !== editingId)} />
              <Input id="menu-item-permissions" label="Required permissions (comma separated)" value={draft.requiredPermissions} onChange={(event) => setDraft((current) => ({ ...current, requiredPermissions: event.target.value }))} />
              <label className="flex items-center gap-2 text-sm text-text">
                <input type="checkbox" checked={draft.isActive} onChange={(event) => setDraft((current) => ({ ...current, isActive: event.target.checked }))} />
                Visible in navigation
              </label>
              <label className="flex items-center gap-2 text-sm text-text">
                <input type="checkbox" checked={draft.openInNewTab} onChange={(event) => setDraft((current) => ({ ...current, openInNewTab: event.target.checked }))} />
                Open external link in new tab
              </label>
              <Button type="submit" loading={saving} className="w-full">
                <Save className="mr-2 h-4 w-4" /> {editingId ? 'Save menu item' : 'Add menu item'}
              </Button>
            </form>
          </div>
          <DeleteConfirmDialog
            open={Boolean(deleteTarget)}
            title="Delete menu item?"
            description={`Delete "${deleteTarget?.label ?? ''}" and all nested child items?`}
            confirmLabel="Delete menu item"
            loading={saving}
            onClose={() => setDeleteTarget(null)}
            onConfirm={confirmDelete}
          />
        </>
      ) : (
        <div className="mt-6 rounded-xl border border-border bg-surface p-6 text-sm text-muted">No menus are configured.</div>
      )}
    </div>
  );
}
