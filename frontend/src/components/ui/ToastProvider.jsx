import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, CircleX, X } from 'lucide-react';

const ToastContext = createContext(null);

export function useToast() {
  const toast = useContext(ToastContext);
  if (!toast) throw new Error('useToast must be used within ToastProvider.');
  return toast;
}

const MAX_VISIBLE = 3;
const STACK_OFFSET = 14;
const STACK_SCALE = 0.05;
const STACK_OPACITY = 0.15;
const TOAST_GAP = 12;

export default function ToastProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [hovering, setHovering] = useState(false);
  const nextId = useRef(0);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setMessages((current) => current.filter((message) => message.id !== id));
  }, []);

  const toast = useCallback((message, type = 'success') => {
    const id = nextId.current++;
    setMessages((current) => [...current, { id, message, type }]);
    timers.current.set(id, setTimeout(() => dismiss(id), 4500));
  }, [dismiss]);

  useEffect(() => () => {
    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current.clear();
  }, []);

  useEffect(() => {
    if (!hovering) return;
    const paused = timers.current;
    paused.forEach((timer) => clearTimeout(timer));
    return () => {
      setMessages((current) => {
        current.forEach(({ id }) => {
          if (!paused.has(id)) return;
          paused.set(id, setTimeout(() => dismiss(id), 4500));
        });
        return current;
      });
    };
  }, [hovering, dismiss]);

  const count = messages.length;
  const layoutFor = (index) => {
    const depth = count - 1 - index;
    if (hovering) {
      const rowHeight = 64;
      return {
        y: -depth * rowHeight,
        scale: 1,
        opacity: 1,
        zIndex: count - depth,
        pointerEvents: 'auto',
      };
    }
    const cappedDepth = Math.min(depth, MAX_VISIBLE);
    const isStacked = depth < MAX_VISIBLE;
    return {
      y: -cappedDepth * STACK_OFFSET,
      scale: 1 - cappedDepth * STACK_SCALE,
      opacity: isStacked ? 1 - depth * STACK_OPACITY : 0,
      zIndex: count - depth,
      pointerEvents: isStacked ? 'auto' : 'none',
    };
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      <div
        className="fixed bottom-6 left-1/2 z-[100] w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2"
        aria-live="polite"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <div className="relative h-0">
          <AnimatePresence initial={false}>
            {messages.map(({ id, message, type }, index) => {
              const isSuccess = type === 'success';
              const Icon = isSuccess ? CheckCircle2 : CircleX;
              const layout = layoutFor(index);

              return (
                <motion.div
                  key={id}
                  layout
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  animate={{
                    opacity: layout.opacity,
                    y: layout.y,
                    scale: layout.scale,
                    zIndex: layout.zIndex,
                  }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  role={isSuccess ? 'status' : 'alert'}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    pointerEvents: layout.pointerEvents,
                  }}
                  className={`flex items-start gap-3 rounded-xl border bg-surface p-4 text-sm shadow-xl ${
                    isSuccess ? 'border-sage/50' : 'border-red-400/50'
                  }`}
                >
                  <Icon
                    className={`mt-0.5 h-5 w-5 shrink-0 ${
                      isSuccess ? 'text-sage' : 'text-red-400'
                    }`}
                  />
                  <p className="flex-1 text-text">{message}</p>
                  <button
                    type="button"
                    onClick={() => dismiss(id)}
                    aria-label="Dismiss notification"
                    className="rounded p-0.5 text-muted hover:text-text"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </ToastContext.Provider>
  );
} 