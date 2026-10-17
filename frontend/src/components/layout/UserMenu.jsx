import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, LogOut, UserRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/authSlice.js';
import { useMenu } from '../../hooks/useMenu.js';
import MenuLink from './MenuLink.jsx';
import { MenuIcon } from './menuIcons.jsx';

export default function UserMenu() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { menu } = useMenu('user_dropdown');
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        const handle = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const handle = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('keydown', handle);
        return () => document.removeEventListener('keydown', handle);
    }, [open]);

    const handleLogout = async () => {
        setOpen(false);
        await dispatch(logout());
        navigate('/login');
    };

    const initials = [user?.firstName?.[0], user?.lastName?.[0]]
        .filter(Boolean)
        .join('')
        .toUpperCase() || 'U';

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-2.5 pr-2 text-sm text-text transition-colors hover:bg-surface-2"
                aria-haspopup="menu"
                aria-expanded={open}
            >
                <span className="grid h-6 w-6 place-items-center rounded-md bg-sage text-[11px] font-bold text-background">
                    {initials}
                </span>
                <span className="hidden sm:inline">{user?.firstName ?? 'Account'}</span>
                <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-muted"
                >
                    <ChevronDown className="h-3.5 w-3.5" />
                </motion.span>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.14, ease: 'easeOut' }}
                        role="menu"
                        className="absolute right-0 top-full z-50 mt-2 w-60 origin-top-right overflow-hidden rounded-xl border border-border bg-surface shadow-panel"
                    >
                        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sage/15 text-sage">
                                <UserRound className="h-4 w-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-semibold">
                                    {user?.firstName} {user?.lastName}
                                </div>
                                <div className="truncate text-xs text-muted">{user?.email}</div>
                            </div>
                        </div>

                        <div className="p-1.5">
                            <UserMenuItems items={menu?.items ?? []} onSelect={() => setOpen(false)} />
                        </div>

                        <div className="border-t border-border p-1.5">
                            <button
                                type="button"
                                onClick={handleLogout}
                                role="menuitem"
                                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-danger/15 hover:text-danger"
                            >
                                <LogOut className="h-4 w-4" />
                                Log out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function UserMenuItems({ items, onSelect, depth = 0 }) {
    return items.map((item) => (
        <div key={item.id} className={depth ? 'ml-3 border-l border-border pl-2' : ''}>
            {item.href ? (
                <MenuLink
                    item={item}
                    role="menuitem"
                    onClick={onSelect}
                    className={() => 'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted transition-colors hover:bg-sage/10 hover:text-sage-bright'}
                    iconClassName="h-4 w-4"
                />
            ) : (
                <div className="flex items-center gap-2 px-2.5 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
                    {item.iconKey ? <MenuIcon iconKey={item.iconKey} className="h-4 w-4" /> : null}
                    {item.label}
                </div>
            )}
            {item.children?.length ? <UserMenuItems items={item.children} onSelect={onSelect} depth={depth + 1} /> : null}
        </div>
    ));
}