import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import logoIcon from '../../assets/icon.png';
import { logout } from '../../store/authSlice.js';
import { useMenu } from '../../hooks/useMenu.js';
import MenuLink from './MenuLink.jsx';
import { MenuIcon } from './menuIcons.jsx';
import UserMenu from './UserMenu.jsx';

const linkClass = ({ isActive }) =>
  `inline-flex items-center gap-2 transition ${isActive ? 'text-sage-bright' : 'text-muted hover:text-text'}`;

export default function Header() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const { menu } = useMenu('global_header');
  const { menu: userMenu } = useMenu('user_dropdown');

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-2.5 font-semibold tracking-tight text-text">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-sage">
            <img
              src={logoIcon}
              alt=""
              className="h-6 w-6 object-contain"
            />
          </span>
          <span className="text-lg">FreshCuts</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm md:flex">
          {(menu?.items ?? []).map((item) => (
            <HeaderMenuItem key={item.id} item={item} linkClass={linkClass} />
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? <UserMenu /> : null}
        </div>

        <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border bg-surface px-5 py-5 md:hidden">
          <nav className="grid gap-4 text-sm">
            {(menu?.items ?? []).map((item) => (
              <HeaderMenuItem key={item.id} item={item} linkClass={linkClass} mobile onNavigate={() => setOpen(false)} />
            ))}
            {user ? (
              <>
                {(userMenu?.items ?? [])
                  .filter((item) => !collectHrefs(menu?.items ?? []).has(item.href))
                  .map((item) => (
                  <HeaderMenuItem key={item.id} item={item} linkClass={linkClass} mobile onNavigate={() => setOpen(false)} />
                ))}
                <button type="button" className="text-left text-muted" onClick={() => { dispatch(logout()); setOpen(false); }}>Log out</button>
              </>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function HeaderMenuItem({ item, linkClass, mobile = false, onNavigate }) {
  const itemLinkClass = item.key === 'register'
    ? ({ isActive }) => `inline-flex items-center gap-2 rounded-lg bg-sage px-3 py-2 font-semibold text-background transition hover:bg-sage-bright ${isActive ? 'ring-2 ring-sage-bright' : ''}`
    : linkClass;
  const content = item.href ? (
    <MenuLink item={item} className={itemLinkClass} onClick={onNavigate} />
  ) : item.children?.length && !mobile ? (
    <button type="button" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
      {item.iconKey ? <MenuIcon iconKey={item.iconKey} className="h-4 w-4" /> : null}
      {item.label}
    </button>
  ) : (
    <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
      {item.iconKey ? <MenuIcon iconKey={item.iconKey} className="h-4 w-4" /> : null}
      {item.label}
    </span>
  );
  if (!item.children?.length) return content;

  return (
    <div className={`relative ${mobile ? 'space-y-3' : 'group'}`}>
      {content}
      <div className={mobile
        ? 'grid gap-3 border-l border-border pl-4'
        : 'absolute left-0 top-full z-50 hidden min-w-48 rounded-xl border border-border bg-surface p-2 shadow-panel group-hover:grid group-focus-within:grid'}>
        {item.children.map((child) => (
          <HeaderMenuItem key={child.id} item={child} linkClass={linkClass} mobile={mobile} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  );
}

function collectHrefs(items, hrefs = new Set()) {
  for (const item of items) {
    if (item.href) hrefs.add(item.href);
    collectHrefs(item.children ?? [], hrefs);
  }
  return hrefs;
}