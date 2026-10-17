import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';

export default function DropdownSelect({
  id,
  label,
  options,
  value,
  onChange,
  disabled = false,
  className = '',
}) {
  const generatedId = useId();
  const menuId = `${id || generatedId}-options`;
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const optionRefs = useRef([]);
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const selectedOption = options[selectedIndex];

  useEffect(() => {
    if (open && menuPosition) optionRefs.current[selectedIndex]?.focus();
  }, [open, menuPosition, selectedIndex]);

  useEffect(() => {
    if (!open) return undefined;
    const updateMenuPosition = () => {
      const trigger = triggerRef.current?.getBoundingClientRect();
      if (!trigger) return;
      const menuHeight = Math.min(options.length * 44 + 12, 268);
      const spaceBelow = window.innerHeight - trigger.bottom;
      const top = spaceBelow >= menuHeight + 8 || trigger.top < menuHeight + 8
        ? trigger.bottom + 6
        : trigger.top - menuHeight - 6;
      setMenuPosition({ left: trigger.left, top, width: trigger.width });
    };
    const closeOnOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    updateMenuPosition();
    document.addEventListener('pointerdown', closeOnOutsideClick);
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [open, options.length]);

  const selectOption = (option) => {
    onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }

    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (!open) {
      setOpen(true);
      return;
    }

    const focusedIndex = optionRefs.current.indexOf(document.activeElement);
    let nextIndex = focusedIndex < 0 ? selectedIndex : focusedIndex;
    if (event.key === 'ArrowDown') nextIndex = (nextIndex + 1) % options.length;
    if (event.key === 'ArrowUp') nextIndex = (nextIndex - 1 + options.length) % options.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = options.length - 1;
    optionRefs.current[nextIndex]?.focus();
  };

  return (
    <div ref={rootRef} className={`relative min-w-0 ${className}`}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleKeyDown}
        className="admin-select flex h-11 w-full items-center justify-between gap-3 text-left hover:border-sage/70 hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-sage/30 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="truncate">{selectedOption?.label ?? ''}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-sage transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && menuPosition ? createPortal(
        <div
          ref={menuRef}
          id={menuId}
          role="listbox"
          aria-label={label}
          className="fixed z-[110] max-h-64 overflow-y-auto rounded-xl border border-border bg-surface p-1.5 shadow-panel"
          style={menuPosition}
          onKeyDown={handleKeyDown}
        >
          <div className="mb-1 border-b border-border px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            {label}
          </div>
          {options.map((option, index) => {
            const selected = option.value === value;
            return (
              <button
                key={option.value}
                ref={(element) => { optionRefs.current[index] = element; }}
                type="button"
                role="option"
                aria-selected={selected}
                tabIndex={-1}
                onClick={() => selectOption(option)}
                className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sage/60 ${selected ? 'bg-sage/15 font-semibold text-sage-bright' : 'text-text hover:bg-surface-2 hover:text-sage-bright'}`}
              >
                <span>{option.label}</span>
                {selected ? (
                  <Check className="h-4 w-4 shrink-0 text-sage" />
                ) : null}
              </button>
            );
          })}
        </div>,
        document.body,
      ) : null}
    </div>
  );
}
