import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function SidebarItem({ to, icon: Icon, label, expanded, active, onClick }) {
    const content = (
        <motion.div
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
            className={`relative flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${active ? 'text-sage-bright' : 'text-muted hover:text-text'
                }`}
        >
            {active && (
                <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-lg bg-sage/10"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
            )}

            <span className="relative z-10 shrink-0">
                <Icon className="h-5 w-5" />
            </span>

            <motion.span
                initial={false}
                animate={{
                    opacity: expanded ? 1 : 0,
                    x: expanded ? 0 : -6,
                }}
                transition={{ duration: 0.15, delay: expanded ? 0.05 : 0 }}
                className="relative z-10 whitespace-nowrap"
            >
                {label}
            </motion.span>
        </motion.div>
    );

    if (onClick) {
        return (
            <button type="button" onClick={onClick} className="block w-full text-left">
                {content}
            </button>
        );
    }

    return (
        <Link to={to} className="block">
            {content}
        </Link>
    );
}