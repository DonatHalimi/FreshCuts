import { AnimatePresence, motion } from 'framer-motion';
import {
    ChevronDown,
    ChevronsLeft,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import logoBlackIcon from '../../assets/icon.png';
import { logout } from '../../store/authSlice.js';
import { useMenu } from '../../hooks/useMenu.js';
import { MenuIcon } from './menuIcons.jsx';

const EXPANDED_WIDTH = 260;
const COLLAPSED_WIDTH = 64;
const STORAGE_KEY = 'mainSidebar:expanded';

export default function Sidebar() {
    const [expanded, setExpanded] = useState(() => {
        if (typeof window === 'undefined') return true;
        const stored = window.localStorage.getItem(STORAGE_KEY);
        return stored === null ? true : stored === 'true';
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, String(expanded));
        } catch {
        }
    }, [expanded]);

    const { menu, error: menuError } = useMenu('user_profile_sidebar');
    const [openSections, setOpenSections] = useState({});
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const toggleSection = (id) =>
        setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));

    const renderMenuItems = (items, depth = 0) => items.map((item) => {
        if (item.href) {
            return (
                <div key={item.id} className="space-y-1">
                    <SidebarItem item={item} expanded={expanded} depth={depth} />
                    {item.children?.length ? (
                        <div className="space-y-1">{renderMenuItems(item.children, depth + 1)}</div>
                    ) : null}
                </div>
            );
        }

        const isOpen = openSections[item.id] ?? true;
        return (
            <div key={item.id} className="space-y-1">
                <button
                    type="button"
                    onClick={() => toggleSection(item.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted hover:bg-surface-2 hover:text-text ${depth ? 'ml-2' : ''}`}
                >
                    {item.iconKey ? <MenuIcon iconKey={item.iconKey} className="h-4 w-4" /> : null}
                    {expanded ? item.label : null}
                    <ChevronDown className={`ml-auto h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen ? <div className="space-y-1">{renderMenuItems(item.children ?? [], depth + 1)}</div> : null}
            </div>
        );
    });

    const handleLogout = async () => {
        await dispatch(logout());
        navigate('/login');
    };

    const greeting = user?.firstName ? `Hi, ${user.firstName}` : 'Hi there';

    return (
        <motion.aside
            initial={false}
            animate={{ width: expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="relative z-30 flex h-fit flex-col overflow-hidden rounded-2xl border border-border bg-surface"
        >
            <div className={`flex h-16 items-center border-b border-border ${expanded ? 'gap-2 px-3' : 'justify-center px-0'}`}>
                <AnimatePresence initial={false}>
                    {expanded && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.15 }}
                            className="grid h-8 w-8 shrink-0 mr-4 place-items-center rounded-lg bg-gradient-to-br from-sage to-sage-dark text-background"
                        >
                            <span className="grid h-9 w-9 place-items-center rounded-lg bg-sage">
                                <img
                                    src={logoBlackIcon}
                                    alt=""
                                    className="h-6 w-6 object-contain"
                                />
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence initial={false}>
                    {expanded && (
                        <motion.div
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            transition={{ duration: 0.15 }}
                            className="min-w-0 flex-1"
                        >
                            <div className="truncate text-sm font-semibold leading-tight tracking-tight">
                                {greeting}
                            </div>
                            <div className="truncate text-[10px] uppercase tracking-[0.14em] text-muted">
                                FreshCuts
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    whileTap={{ scale: 0.92 }}
                    whileHover={{ backgroundColor: 'rgba(163,177,138,0.12)' }}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:text-text"
                    aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                    <motion.span
                        initial={false}
                        animate={{ rotate: expanded ? 0 : 180 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                        className="inline-flex"
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </motion.span>
                </motion.button>
            </div>

            <nav className="flex-1 space-y-2 overflow-y-auto px-2 py-4">
                {menuError ? <div className="px-3 py-2 text-xs text-red-300">{menuError}</div> : null}
                {(menu?.items ?? []).map((section) => {
                    const isOpen = openSections[section.id] ?? true;

                    return (
                        <div key={section.id} className="space-y-1">
                            <AnimatePresence initial={false}>
                                {expanded && section.children?.length ? (
                                    <motion.button
                                        type="button"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.15 }}
                                        onClick={() => toggleSection(section.id)}
                                        className="flex w-full items-center justify-between px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted transition-colors hover:text-text"
                                    >
                                        <div className="flex items-center gap-2 whitespace-nowrap">
                                            <MenuIcon iconKey={section.iconKey} className="h-3.5 w-3.5" />
                                            <span>{section.label}</span>
                                        </div>
                                        <motion.div
                                            animate={{ rotate: isOpen ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <ChevronDown className="h-3.5 w-3.5" />
                                        </motion.div>
                                    </motion.button>
                                ) : null}
                            </AnimatePresence>

                            <AnimatePresence initial={false}>
                                {(!expanded || isOpen) && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                                        className="space-y-1 overflow-hidden"
                                    >
                                        {section.href ? <SidebarItem item={section} expanded={expanded} /> : null}
                                        {renderMenuItems(section.children ?? [], 0)}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </nav>

            <div className="border-t border-border p-2">
                <SidebarItem
                    item={{ label: 'Log out', iconKey: 'logout' }}
                    expanded={expanded}
                    onClick={handleLogout}
                />
            </div>
        </motion.aside>
    );
}

function SidebarItem({ item, expanded, onClick, depth = 0 }) {
    const content = (isActive) => (
        <motion.div
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
            className={`relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${depth ? 'ml-2' : ''} ${isActive ? 'text-sage-bright' : 'text-muted hover:text-text'
                }`}
        >
            {isActive && (
                <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-lg border border-sage/20 bg-sage/10"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
            )}

            <span className="relative z-10 shrink-0">
                <MenuIcon iconKey={item.iconKey} className="h-5 w-5" />
            </span>

            <AnimatePresence initial={false}>
                {expanded && (
                    <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.12 }}
                        className="relative z-10 whitespace-nowrap"
                    >
                        {item.label}
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.div>
    );

    if (onClick) return <button type="button" onClick={onClick} className="block w-full text-left">{content(false)}</button>;
    if (/^https:\/\//i.test(item.href ?? '')) {
        return <a href={item.href} target={item.openInNewTab ? '_blank' : undefined} rel={item.openInNewTab ? 'noopener noreferrer' : undefined} className="block">{content(false)}</a>;
    }
    return <NavLink end={item.href === '/'} to={item.href || '/'} className="block">{({ isActive }) => content(isActive)}</NavLink>;
}