import { useEffect, useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { getNotifications, markNotificationRead } from '../../services/notifications.api.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { formatDateTime } from '../../utils/dates.js';
import Card from '../../components/ui/Card.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Sidebar from '../../components/layout/Sidebar.jsx';

export default function NotificationsPage() {
  useDocumentTitle('Notifications');
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    getNotifications()
      .then((x) => {
        setItems(x);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  const read = async (item) => {
    if (item.readAt) return;
    try {
      await markNotificationRead(item.id);
      setItems((xs) =>
        xs.map((x) => (x.id === item.id ? { ...x, readAt: new Date().toISOString() } : x))
      );
    } catch { }
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl items-start gap-6 px-24 py-8 md:gap-8">
      <aside className="sticky top-24 hidden shrink-0 self-start md:block">
        <Sidebar />
      </aside>

      <section className="min-w-0 flex-1 space-y-6">
        <header className="rounded-2xl border border-border bg-surface px-6 py-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">Account</div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="mt-1.5 text-sm text-muted">Booking confirmations and account activity appear here.</p>
        </header>

        {status === 'loading' ? (
          <div className="grid min-h-60 place-items-center">
            <Spinner />
          </div>
        ) : status === 'error' ? (
          <div className="mt-7">
            <EmptyState title="Notifications unavailable" message="Please try again later." />
          </div>
        ) : items.length ? (
          <div className="mt-7 space-y-3">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => read(item)}
                className={`w-full text-left ${item.readAt ? '' : 'ring-1 ring-sage/20'}`}
              >
                <Card className={`p-5 transition hover:bg-surface-2 ${item.readAt ? '' : 'bg-sage/[0.03]'}`}>
                  <div className="flex gap-4">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-background text-sage">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-sm font-semibold text-text">{item.title}</h2>
                        <span className="text-xs text-muted">{formatDateTime(item.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-muted">{item.message}</p>
                      {!item.readAt ? (
                        <div className="mt-3 inline-flex items-center gap-1 text-xs text-sage-bright">
                          <Check className="h-3.5 w-3.5" />
                          Mark as read
                        </div>
                      ) : null}
                    </div>
                  </div>
                </Card>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-7">
            <EmptyState
              title="You're all caught up"
              message="New FreshCuts activity will appear here."
            />
          </div>
        )}
      </section>
    </div>
  );
}