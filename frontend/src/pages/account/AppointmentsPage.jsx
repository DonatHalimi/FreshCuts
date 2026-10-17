import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAppointments } from '../../store/appointmentSlice.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { AppointmentCard } from '../../components/appointments/AppointmentCard.jsx';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import Alert from '../../components/ui/Alert.jsx';
import Sidebar from '../../components/layout/Sidebar.jsx';

export default function AppointmentsPage() {
  useDocumentTitle('Appointments');
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((s) => s.appointments);
  const [view, setView] = useState('upcoming');

  useEffect(() => {
    dispatch(fetchAppointments());
  }, [dispatch]);

  const list = useMemo(() => {
    const upcoming = items
      .filter((x) => x.status === 'CONFIRMED' && new Date(x.scheduledStartAt) > new Date())
      .sort((a, b) => new Date(a.scheduledStartAt) - new Date(b.scheduledStartAt));
    const past = items
      .filter((x) => !(x.status === 'CONFIRMED' && new Date(x.scheduledStartAt) > new Date()))
      .sort((a, b) => new Date(b.scheduledStartAt) - new Date(a.scheduledStartAt));
    return view === 'upcoming' ? upcoming : past;
  }, [items, view]);

  return (
    <div className="mx-auto flex w-full max-w-7xl items-start gap-6 px-24 py-8 md:gap-8">
      <aside className="sticky top-24 hidden shrink-0 self-start md:block">
        <Sidebar />
      </aside>

      <section className="min-w-0 flex-1 py-2">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">Account</div>
          <h1 className="mt-2 text-3xl font-semibold">Appointments</h1>
        </div>
        <Link to="/book">
          <Button>Book another</Button>
        </Link>
      </div>

      <div className="mt-7 flex gap-2">
        <button
          onClick={() => setView('upcoming')}
          className={`rounded-lg px-3 py-2 text-sm ${
            view === 'upcoming'
              ? 'bg-sage text-background'
              : 'border border-border text-muted hover:bg-surface-2'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setView('past')}
          className={`rounded-lg px-3 py-2 text-sm ${
            view === 'past'
              ? 'bg-sage text-background'
              : 'border border-border text-muted hover:bg-surface-2'
          }`}
        >
          Past
        </button>
      </div>

      {status === 'loading' ? (
        <div className="grid min-h-60 place-items-center">
          <Spinner />
        </div>
      ) : status === 'failed' ? (
        <div className="mt-5">
          <Alert>{error?.message || 'Appointments could not be loaded. Please try again.'}</Alert>
        </div>
      ) : list.length ? (
        <div className="mt-5 space-y-4">
          {list.map((x) => (
            <AppointmentCard key={x.id} appointment={x} />
          ))}
        </div>
      ) : (
        <div className="mt-5">
          <EmptyState
            title={
              view === 'upcoming'
                ? 'No upcoming appointments'
                : 'No appointment history'
            }
            message={
              view === 'upcoming'
                ? 'Book your next visit in a few steps.'
                : 'Completed and cancelled visits will appear here.'
            }
            action={
              view === 'upcoming' ? (
                <Link to="/book">
                  <Button>Book appointment</Button>
                </Link>
              ) : null
            }
          />
        </div>
      )}
      </section>
    </div>
  );
}