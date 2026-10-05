import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink } from 'react-router-dom';
import logoIcon from '../../assets/icon.png';
import { logout } from '../../store/authSlice.js';
import UserMenu from './UserMenu.jsx';

const linkClass = ({ isActive }) =>
  `transition ${isActive ? 'text-sage-bright' : 'text-muted hover:text-text'}`;

export default function Header() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);

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
          <NavLink to="/" className={linkClass}>Home</NavLink>
          <NavLink to="/providers" className={linkClass}>Providers</NavLink>
          <NavLink to="/services" className={linkClass}>Services</NavLink>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <UserMenu />
          ) : (
            <>
              <Link to="/login" className="text-sm text-muted hover:text-text">Log in</Link>
              <Link to="/register" className="rounded-lg bg-sage px-4 py-2.5 text-sm font-semibold text-background hover:bg-sage-bright">Create account</Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border bg-surface px-5 py-5 md:hidden">
          <nav className="grid gap-4 text-sm">
            <NavLink to="/" className={linkClass} onClick={() => setOpen(false)}>Home</NavLink>
            <NavLink to="/providers" className={linkClass} onClick={() => setOpen(false)}>Providers</NavLink>
            <NavLink to="/services" className={linkClass} onClick={() => setOpen(false)}>Services</NavLink>
            {user ? (
              <>
                <NavLink to="/profile" className={linkClass} onClick={() => setOpen(false)}>Profile</NavLink>
                <button className="text-left text-muted" onClick={() => { dispatch(logout()); setOpen(false); }}>Log out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-muted" onClick={() => setOpen(false)}>Log in</Link>
                <Link to="/register" className="text-sage-bright" onClick={() => setOpen(false)}>Create account</Link>
              </>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}