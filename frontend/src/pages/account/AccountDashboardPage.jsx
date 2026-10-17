import { ArrowRight, CalendarClock, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAppointments } from '../../store/appointmentSlice.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import AppointmentStatus from '../../components/appointments/AppointmentStatus.jsx';
import { formatDate, formatTime } from '../../utils/dates.js';
import { money } from '../../utils/money.js';

export default function AccountDashboardPage() {
  useDocumentTitle('Account');
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { items, status } = useSelector((s) => s.appointments);

  useEffect(() => {
    dispatch(fetchAppointments());
  }, [dispatch]);

  const upcoming = useMemo(
    () =>
      items
        .filter((x) => x.status === 'CONFIRMED' && new Date(x.scheduledStartAt) > new Date())
        .sort((a, b) => new Date(a.scheduledStartAt) - new Date(b.scheduledStartAt))[0],
    [items]
  );

  return (
    <section className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">Account</div>
          <h1 className="mt-2 text-3xl font-semibold">Welcome back, {user?.firstName}.</h1>
          <p className="mt-3 text-sm text-muted">Manage your next appointment and see your service history.</p>
        </div>
        <Link to="/book">
          <Button>Book appointment</Button>
        </Link>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">
                Next appointment
              </div>
              <h2 className="mt-2 text-xl font-semibold">
                {upcoming?.serviceNameSnapshot || 'Nothing booked yet'}
              </h2>
            </div>
            {upcoming ? <AppointmentStatus status={upcoming.status} /> : null}
          </div>

          {upcoming ? (
            <>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-surface-2 p-4">
                  <div className="text-xs text-muted">Date</div>
                  <div className="mt-1 text-sm text-text">{formatDate(upcoming.scheduledStartAt)}</div>
                  <div className="mt-1 inline-flex items-center gap-2 text-xs text-muted">
                    <Clock3 className="h-3.5 w-3.5" />
                    {formatTime(upcoming.scheduledStartAt)}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-surface-2 p-4">
                  <div className="text-xs text-muted">Provider</div>
                  <div className="mt-1 text-sm text-text">{upcoming.provider?.name}</div>
                  <div className="mt-1 text-xs text-sage-bright">
                    {money(upcoming.priceCentsSnapshot)}
                  </div>
                </div>
              </div>

              <Link
                to={`/account/appointments/${upcoming.id}`}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sage-bright hover:text-text"
              >
                View appointment <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          ) : (
            <p className="mt-5 text-sm text-muted">
              Choose a service and provider to see real available times.
            </p>
          )}
        </Card>

        <div className="grid gap-5">
          <Card className="p-6">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-sage/10 text-sage">
              <CalendarClock className="h-5 w-5" />
            </div>
            <h2 className="mt-4 font-semibold">Browse services</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Compare duration and price before you book.
            </p>
            <Link to="/services" className="mt-4 inline-block text-sm font-semibold text-sage-bright">
              View services
            </Link>
          </Card>

          <Card className="p-6">
            <div className="text-xs uppercase tracking-[0.14em] text-sage">History</div>
            <div className="mt-3 text-2xl font-semibold">
              {status === 'loading' ? '—' : items.filter((x) => x.status !== 'CONFIRMED').length}
            </div>
            <p className="mt-1 text-sm text-muted">Past or closed appointments</p>
            <Link to="/account/history" className="mt-4 inline-block text-sm font-semibold text-sage-bright">
              View history
            </Link>
          </Card>
        </div>
      </div>
    </section>
  );
}