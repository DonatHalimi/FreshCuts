import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import Card from '../ui/Card.jsx';

export default function AdminResourceCard({
  id,
  name,
  isActive,
  selected,
  onSelect,
  onToggleActive,
  activeLabel = 'Active',
  inactiveLabel = 'Disabled',
  activeActionLabel = 'Deactivate',
  inactiveActionLabel = 'Activate',
  disabled = false,
  summary,
  children,
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      className={`overflow-hidden transition-colors ${selected ? 'border-sage bg-sage/5 ring-1 ring-sage/40' : 'hover:border-sage/50'} cursor-pointer`}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect();
        }
      }}
      role="group"
      aria-label={`${name} card. ${selected ? 'Selected' : 'Not selected'}. Press Enter or Space to toggle selection.`}
      tabIndex={0}
      data-selected={selected}
    >
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <h2 className="font-semibold text-text">{name}</h2>
          <div className="mt-1">{summary}</div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={(event) => {
              event.stopPropagation();
              onToggleActive();
            }}
            aria-label={`${isActive ? activeActionLabel : inactiveActionLabel} ${name}`}
          >
            <Badge tone={isActive ? 'success' : 'danger'}>
              {isActive ? activeLabel : inactiveLabel}
            </Badge>
          </button>
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={`${id}-details`}
            aria-label={`${expanded ? 'Collapse' : 'Expand'} ${name} details`}
            onClick={(event) => {
              event.stopPropagation();
              setExpanded((current) => !current);
            }}
            className="rounded-lg p-2 text-muted transition hover:bg-surface-2 hover:text-text"
          >
            <ChevronDown className={`h-5 w-5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            id={`${id}-details`}
            key={`${id}-details`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-border"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-5 pb-5">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Card>
  );
}
