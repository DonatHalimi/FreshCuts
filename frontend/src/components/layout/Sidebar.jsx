import { AnimatePresence, motion } from 'framer-motion';
import {
    Bell,
    CalendarClock,
    ChevronDown,
    ChevronsLeft,
    Heart,
    Home,
    LockKeyhole,
    LogOut,
    MessagesSquare,
    Scissors,
    Settings,
    Shield,
    User,
} from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import logoBlackIcon from '../../assets/icon.png';
import { logout } from '../../store/authSlice.js';

const EXPANDED_WIDTH = 260;
const COLLAPSED_WIDTH = 64;

const SECTIONS = [
    {
        id: 'main',
        title: 'Discover',
        icon: Home,
        items: [
            { to: '/', label: 'Home', icon: Home },
            { to: '/providers', label: 'Providers', icon: Scissors },
            { to: '/services', label: 'Services', icon: CalendarClock },
        ],
    },
    {
        id: 'account',
        title: 'Account',
        icon: Settings,
        items: [
            { to: '/profile', label: 'Profile', icon: User },
            { to: '/appointments', label: 'Appointments', icon: CalendarClock },
            { to: '/favourites', label: 'Favourites', icon: Heart },
        ],
    },
    {
        id: 'communication',
        title: 'Communication',
        icon: MessagesSquare,
        items: [
            { to: '/notifications', label: 'Notifications', icon: Bell },
            { to: '/reviews', label: 'Reviews', icon: MessagesSquare },
        ],
    },
    {
        id: 'security',
        title: 'Security',
        icon: LockKeyhole,
        items: [
            { to: '/security', label: 'Security', icon: Shield },
        ],
    },
];

export default function Sidebar() {
    const [expanded, setExpanded] = useState(true);
    const [openSections, setOpenSections] = useState(() =>
        Object.fromEntries(SECTIONS.map((s) => [s.id, true]))
    );
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const toggleSection = (id) =>
        setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));

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
            className="relative z-30 flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface"
            style={{ boxShadow: '0 18px 50px rgba(0,0,0,0.24)' }}
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
                                    className="h-6 w-6 object-contaiN"
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
                {SECTIONS.map((section) => {
                    const SectionIcon = section.icon;
                    const isOpen = openSections[section.id];

                    return (
                        <div key={section.id} className="space-y-1">
                            <AnimatePresence initial={false}>
                                {expanded && (
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
                                            <SectionIcon className="h-3.5 w-3.5" />
                                            <span>{section.title}</span>
                                        </div>
                                        <motion.div
                                            animate={{ rotate: isOpen ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <ChevronDown className="h-3.5 w-3.5" />
                                        </motion.div>
                                    </motion.button>
                                )}
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
                                        {section.items.map((item) => (
                                            <SidebarItem
                                                key={item.to}
                                                {...item}
                                                expanded={expanded}
                                            />
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </nav>

            <div className="border-t border-border p-2">
                <SidebarItem
                    icon={LogOut}
                    label="Log out"
                    expanded={expanded}
                    onClick={handleLogout}
                />
            </div>
        </motion.aside>
    );
}

function SidebarItem({ to, icon: Icon, label, expanded, onClick }) {
    const content = (isActive) => (
        <motion.div
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
            className={`relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${isActive ? 'text-sage-bright' : 'text-muted hover:text-text'
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
                <Icon className="h-5 w-5" />
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
                        {label}
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.div>
    );

    if (onClick) {
        return (
            <button type="button" onClick={onClick} className="block w-full text-left">
                {content(false)}
            </button>
        );
    }

    return (
        <NavLink to={to} className="block">
            {({ isActive }) => content(isActive)}
        </NavLink>
    );
}