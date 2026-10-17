import { CalendarDays, Clock3, Scissors } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRoster, fetchStaffMe, setStaffAppointmentStatus } from '../../store/staffSlice.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { localDateInputValue, formatTime } from '../../utils/dates.js';
import Card from '../../components/ui/Card.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import RosterAppointment from '../../components/staff/RosterAppointment.jsx';

export default function StaffDashboardPage() {
  useDocumentTitle('Staff dashboard');
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { provider, roster, status } = useSelector((s) => s.staff);
  const today = localDateInputValue();

  useEffect(() => {
    dispatch(fetchStaffMe());
    dispatch(fetchRoster(today));
  }, [dispatch, today]);

  const confirmed = roster.filter((x) => x.status === 'CONFIRMED');
  const completed = roster.filter((x) => x.status === 'COMPLETED').length;

  return (
    <div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">Staff dashboard</div>
        <h1 className="mt-2 text-3xl font-semibold">Good morning, {user?.firstName}.</h1>
        <p className="mt-2 text-sm text-muted">
          {provider?.title || 'Provider'} · {provider?.name || 'Your provider profile'}
        </p>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="text-xs text-muted">Today's bookings</div>
          <div className="mt-2 text-2xl font-semibold text-text">
            {status === 'loading' ? '—' : roster.length}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-xs text-muted">Confirmed</div>
          <div className="mt-2 text-2xl font-semibold text-sage-bright">
            {status === 'loading' ? '—' : confirmed.length}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-xs text-muted">Completed</div>
          <div className="mt-2 text-2xl font-semibold text-text">
            {status === 'loading' ? '—' : completed}
          </div>
        </Card>
      </div>

      <div className="mt-7 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Today's roster</h2>
        <Link to="/staff/roster" className="text-sm text-sage-bright hover:text-text">
          Full roster
        </Link>
      </div>

      {status === 'loading' ? (
        <div className="grid min-h-48 place-items-center">
          <Spinner />
        </div>
      ) : roster.length ? (
        <div className="mt-4 space-y-3">
          {roster.slice(0, 5).map((x) => (
            <RosterAppointment
              key={x.id}
              appointment={x}
              onStatus={(id, status) => dispatch(setStaffAppointmentStatus({ id, status }))}
            />
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <EmptyState title="No appointments today" message="Your roster is clear for today." />
        </div>
      )}

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <Link to="/staff/schedule">
          <Card className="p-5 transition hover:bg-surface-2">
            <Clock3 className="h-5 w-5 text-sage" />
            <h3 className="mt-3 font-semibold">Manage schedule</h3>
            <p className="mt-1 text-sm text-muted">Edit working hours, breaks and one-off time off.</p>
          </Card>
        </Link>
        <Link to="/book">
          <Card className="p-5 transition hover:bg-surface-2">
            <CalendarDays className="h-5 w-5 text-sage" />
            <h3 className="mt-3 font-semibold">Customer booking view</h3>
            <p className="mt-1 text-sm text-muted">See the same live booking flow customers use.</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}