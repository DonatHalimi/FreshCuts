import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRoster, setStaffAppointmentStatus } from '../../store/staffSlice.js';
import { localDateInputValue } from '../../utils/dates.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import Input from '../../components/ui/Input.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import RosterAppointment from '../../components/staff/RosterAppointment.jsx';

export default function StaffRosterPage() {
  useDocumentTitle('Staff roster');
  const dispatch = useDispatch();
  const { roster, status, error } = useSelector((s) => s.staff);
  const [date, setDate] = useState(localDateInputValue());

  useEffect(() => {
    dispatch(fetchRoster(date));
  }, [dispatch, date]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">Staff portal</div>
          <h1 className="mt-2 text-3xl font-semibold">Daily roster</h1>
          <p className="mt-2 text-sm text-muted">
            Review customer appointments and update their status as the day progresses.
          </p>
        </div>
        <div className="w-full sm:w-56">
          <Input id="roster-date" label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      {error ? <div className="mt-5 text-sm text-red-300">{error.message}</div> : null}

      {status === 'loading' ? (
        <div className="grid min-h-60 place-items-center">
          <Spinner />
        </div>
      ) : roster.length ? (
        <div className="mt-7 space-y-3">
          {roster.map((x) => (
            <RosterAppointment
              key={x.id}
              appointment={x}
              onStatus={(id, next) => dispatch(setStaffAppointmentStatus({ id, status: next }))}
            />
          ))}
        </div>
      ) : (
        <div className="mt-7">
          <EmptyState title="No appointments" message="There are no appointments for this date." />
        </div>
      )}
    </div>
  );
}