import { CalendarDays, Clock3, Scissors } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../ui/Card.jsx';
import AppointmentStatus from './AppointmentStatus.jsx';
import { formatDate, formatTime } from '../../utils/dates.js';
import { money } from '../../utils/money.js';

export function AppointmentCard({ appointment }) {
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(appointment.scheduledStartAt)}
            <Clock3 className="ml-2 h-3.5 w-3.5" />
            {formatTime(appointment.scheduledStartAt)}
          </div>
          <h3 className="mt-2 text-base font-semibold text-text">
            {appointment.serviceNameSnapshot}
          </h3>
          <p className="mt-1 text-sm text-muted">with {appointment.provider?.name}</p>
        </div>
        <AppointmentStatus status={appointment.status} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <span className="inline-flex items-center gap-2 text-xs text-muted">
          <Scissors className="h-3.5 w-3.5" />
          {money(appointment.priceCentsSnapshot)}
        </span>
        <Link
          to={`/account/appointments/${appointment.id}`}
          className="text-sm font-semibold text-sage-bright hover:text-text"
        >
          View details
        </Link>
      </div>
    </Card>
  );
}