import { Check, Phone, X } from 'lucide-react';
import { formatTime } from '../../utils/dates.js';
import AppointmentStatus from '../appointments/AppointmentStatus.jsx';
import Button from '../ui/Button.jsx';

export default function RosterAppointment({ appointment, onStatus }) {
  const active = appointment.status === 'CONFIRMED';

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted">
            {formatTime(appointment.scheduledStartAt)} – {formatTime(appointment.scheduledEndAt)}
            <AppointmentStatus status={appointment.status} />
          </div>
          <div className="mt-2 text-sm font-semibold text-text">
            {appointment.customer?.firstName} {appointment.customer?.lastName}
          </div>
          <div className="mt-1 text-xs text-muted">{appointment.serviceNameSnapshot}</div>
          {appointment.customer?.phone ? (
            <a
              href={`tel:${appointment.customer.phone}`}
              className="mt-2 inline-flex items-center gap-1 text-xs text-sage-bright"
            >
              <Phone className="h-3 w-3" />
              {appointment.customer.phone}
            </a>
          ) : null}
        </div>

        {active ? (
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onStatus(appointment.id, 'CANCELLED')}>
              <X className="mr-1 h-3.5 w-3.5" />
              Cancel
            </Button>
            <Button onClick={() => onStatus(appointment.id, 'COMPLETED')}>
              <Check className="mr-1 h-3.5 w-3.5" />
              Complete
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}