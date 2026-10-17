import { CalendarClock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { BookingWizard } from '../../components/booking/BookingWizard.jsx';

export default function BookAppointmentPage() {
  useDocumentTitle('Book appointment');
  const navigate = useNavigate();

  return (
    <section className="mx-auto max-w-6xl px-5 py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">Book</div>
          <h1 className="mt-2 text-3xl font-semibold">Choose a time that works.</h1>
          <p className="mt-3 text-sm text-muted">
            Availability is calculated from the provider's live schedule.
          </p>
        </div>
        <Link
          to="/account/appointments"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-text"
        >
          <CalendarClock className="h-4 w-4" />
          My appointments
        </Link>
      </div>

      <BookingWizard
        onBooked={(appointment) => navigate(`/account/appointments/${appointment.id}`)}
      />
    </section>
  );
}