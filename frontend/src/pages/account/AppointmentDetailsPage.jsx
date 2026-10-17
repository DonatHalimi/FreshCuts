import { useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, Clock3, Mail, UserRound } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getAppointment, cancelAppointment } from '../../services/appointments.api.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { formatDate, formatDateTime, formatTime } from '../../utils/dates.js';
import { money } from '../../utils/money.js';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import AppointmentStatus from '../../components/appointments/AppointmentStatus.jsx';
import CancelAppointmentDialog from '../../components/appointments/CancelAppointmentDialog.jsx';
import RescheduleDialog from '../../components/appointments/RescheduleDialog.jsx';

export default function AppointmentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [dialog, setDialog] = useState(null);
  const [loading, setLoading] = useState(false);

  useDocumentTitle('Appointment details');

  useEffect(() => {
    let current = true;
    setAppointment(null);
    setError('');
    getAppointment(id)
      .then((result) => {
        if (current) setAppointment(result);
      })
      .catch((requestError) => {
        if (current) setError(requestError.message);
      });
    return () => {
      current = false;
    };
  }, [id]);

  const cancel = async (reason) => {
    setLoading(true);
    setActionError('');
    try {
      const x = await cancelAppointment(id, reason);
      setAppointment(x);
      setDialog(null);
    } catch (e) {
      setActionError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (error && !appointment) {
    return (
      <section className="mx-auto max-w-5xl px-5 py-16">
        <Alert>{error}</Alert>
      </section>
    );
  }

  if (!appointment) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Spinner />
      </div>
    );
  }

  const canModify = appointment.status === 'CONFIRMED' && new Date(appointment.scheduledStartAt) > new Date();

  return (
    <section className="mx-auto max-w-4xl px-5 py-10">
      <Link
        to="/account/appointments"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-text"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to appointments
      </Link>

      <div className="mt-7 grid gap-5 md:grid-cols-[1.2fr_.8fr]">
        <Card className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">
                Appointment
              </div>
              <h1 className="mt-2 text-2xl font-semibold">{appointment.serviceNameSnapshot}</h1>
              <p className="mt-2 text-sm text-muted">with {appointment.provider?.name}</p>
            </div>
            <AppointmentStatus status={appointment.status} />
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface-2 p-4">
              <div className="text-xs text-muted">Date</div>
              <div className="mt-1 inline-flex items-center gap-2 text-sm text-text">
                <CalendarDays className="h-4 w-4 text-sage" />
                {formatDate(appointment.scheduledStartAt)}
              </div>
              <div className="mt-1 inline-flex items-center gap-2 text-xs text-muted">
                <Clock3 className="h-3.5 w-3.5" />
                {formatTime(appointment.scheduledStartAt)} – {formatTime(appointment.scheduledEndAt)}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-surface-2 p-4">
              <div className="text-xs text-muted">Price</div>
              <div className="mt-1 text-lg font-semibold text-sage-bright">
                {money(appointment.priceCentsSnapshot)}
              </div>
              <div className="mt-1 text-xs text-muted">
                Duration {appointment.durationMinSnapshot} min
              </div>
            </div>
          </div>

          {error ? (
            <div className="mt-5">
              <Alert>{error}</Alert>
            </div>
          ) : null}

          {canModify ? (
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button
                variant="danger"
                onClick={() => {
                  setActionError('');
                  setDialog('cancel');
                }}
                className="sm:flex-1"can y
              >
                Cancel appointment
              </Button>
              <Button onClick={() => setDialog('reschedule')} className="sm:flex-1">
                Reschedule
              </Button>
            </div>
          ) : null}

          <div className="mt-8 border-t border-border pt-5 text-xs text-muted">
            Booked {formatDateTime(appointment.createdAt)}
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">Provider</div>
          <div className="mt-4 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full border border-border bg-surface-2 text-sage-bright">
              <UserRound className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-text">{appointment.provider?.name}</div>
              <div className="text-xs text-muted">Your selected provider</div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-border bg-surface-2 p-4">
            <div className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-sage" />
              <p className="text-xs leading-5 text-muted">
                Confirmation and appointment changes are sent by email.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <CancelAppointmentDialog
        open={dialog === 'cancel'}
        onClose={() => setDialog(null)}
        onConfirm={cancel}
        loading={loading}
        error={actionError}
      />
      <RescheduleDialog
        open={dialog === 'reschedule'}
        onClose={() => setDialog(null)}
        appointment={appointment}
        onUpdated={(x) => {
          setAppointment({ ...appointment, ...x });
          navigate('.', { replace: true });
        }}
      />
    </section>
  );
}