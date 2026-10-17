import { ChevronDown, LogOut } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice.js';
import { useMenu } from '../../hooks/useMenu.js';
import { MenuIcon } from './menuIcons.jsx';

const navClass = ({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${isActive ? 'bg-sage/10 text-sage-bright' : 'text-muted hover:bg-surface-2 hover:text-text'}`;

function StaffMenuItem({ item, depth = 0 }) {
  const children = item.children?.length ? (
    <div className="ml-5 mt-1 grid gap-1 border-l border-border pl-2">
      {item.children.map((child) => <StaffMenuItem key={child.id} item={child} depth={depth + 1} />)}
    </div>
  ) : null;

  if (!item.href) {
    return (
      <details open className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-text hover:bg-surface-2 [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-3">
            {item.iconKey ? <MenuIcon iconKey={item.iconKey} className="h-4 w-4 text-sage" /> : null}
            {item.label}
          </span>
          <ChevronDown className="h-4 w-4 text-muted transition-transform group-open:rotate-180" />
        </summary>
        {children}
      </details>
    );
  }

  return (
    <div>
      <NavLink end={item.href === '/staff'} to={item.href} className={`${navClass} ${depth ? 'ml-3' : ''}`}>
        {item.iconKey ? <MenuIcon iconKey={item.iconKey} /> : null}
        {item.label}
      </NavLink>
      {children}
    </div>
  );
}

export default function StaffLayout() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { menu, error } = useMenu('staff_panel');

  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-6 px-24 py-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="hidden h-fit rounded-2xl border border-border bg-surface p-3 lg:block">
        <div className="px-3 py-3">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">Staff portal</div>
          <div className="mt-2 truncate text-sm font-semibold text-text">{user?.firstName} {user?.lastName}</div>
        </div>
        <nav className="mt-3 grid gap-1">
          {error ? <div className="px-3 py-2 text-xs text-red-300">{error}</div> : null}
          {(menu?.items ?? []).map((item) => <StaffMenuItem key={item.id} item={item} />)}
        </nav>
        <button onClick={() => dispatch(logout())} className="mt-4 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-surface-2 hover:text-text"><LogOut className="h-4 w-4" /> Log out</button>
      </aside>
      <section className="min-w-0"><Outlet /></section>
    </div>
  );
}
