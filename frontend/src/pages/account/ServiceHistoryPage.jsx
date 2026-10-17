import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAppointments } from '../../store/appointmentSlice.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { formatDate, formatTime } from '../../utils/dates.js';
import { money } from '../../utils/money.js';
import Card from '../../components/ui/Card.jsx';
import AppointmentStatus from '../../components/appointments/AppointmentStatus.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import Sidebar from '../../components/layout/Sidebar.jsx';

export default function ServiceHistoryPage() {
  useDocumentTitle('Service history');
  const dispatch = useDispatch();
  const { items, status } = useSelector((s) => s.appointments);

  useEffect(() => {
    dispatch(fetchAppointments());
  }, [dispatch]);

  const history = useMemo(
    () =>
      items
        .filter((x) => x.status !== 'CONFIRMED')
        .sort((a, b) => new Date(b.scheduledStartAt) - new Date(a.scheduledStartAt)),
    [items]
  );

  return (
      <div className="mx-auto flex w-full max-w-7xl items-start gap-6 px-24 py-8 md:gap-8">
        <aside className="sticky top-24 hidden shrink-0 self-start md:block">
          <Sidebar />
        </aside>

        <section className="min-w-0 flex-1 space-y-6">
          <header className="rounded-2xl border border-border bg-surface px-6 py-5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">Account</div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">Service history</h1>
            <p className="mt-1.5 text-sm text-muted">A record of your previous visits and their final status.</p>
          </header>

          {status === 'loading' ? (
            <div className="grid min-h-60 place-items-center">
              <Spinner />
            </div>
          ) : history.length ? (
            <div className="mt-7 space-y-3">
              {history.map((x) => (
                <Card key={x.id} className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-text">{x.serviceNameSnapshot}</div>
                      <div className="mt-1 text-xs text-muted">
                        {x.provider?.name} · {formatDate(x.scheduledStartAt)} · {formatTime(x.scheduledStartAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-sage-bright">
                        {money(x.priceCentsSnapshot)}
                      </span>
                      <AppointmentStatus status={x.status} />
                      <Link to={`/account/appointments/${x.id}`} className="text-sm text-muted hover:text-text">
                        Details
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="mt-7">
              <EmptyState
                title="No history yet"
                message="Your completed or cancelled appointments will appear here."
              />
            </div>
          )}
        </section>
      </div>
      );
}