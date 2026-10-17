import { useEffect, useState } from 'react';
import { getAvailability } from '../../services/availability.api.js';
import { rescheduleAppointment } from '../../services/appointments.api.js';
import { formatDate, formatTime, localDateInputValue } from '../../utils/dates.js';
import Alert from '../ui/Alert.jsx';
import Button from '../ui/Button.jsx';
import Modal from '../ui/Modal.jsx';
import Spinner from '../ui/Spinner.jsx';

export default function RescheduleDialog({ open, onClose, appointment, onUpdated }) {
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selected, setSelected] = useState(null);
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    if (!open || !appointment) return;
    setDate(localDateInputValue(new Date(appointment.scheduledStartAt)));
    setSelected(null);
    setError('');
  }, [open, appointment?.id, appointment?.scheduledStartAt]);

  useEffect(() => {
    let current = true;
    if (!open || !date || !appointment?.provider?.id || !appointment?.serviceId) {
      setSlots([]);
      setState('idle');
      return undefined;
    }

    setSlots([]);
    setSelected(null);
    setState('loading');
    getAvailability({
      serviceId: appointment.serviceId,
      providerId: appointment.provider.id,
      date,
    })
      .then((result) => {
        if (!current) return;
        setSlots(result.slots || []);
        setState('ready');
      })
      .catch((requestError) => {
        if (!current) return;
        setError(requestError.message);
        setState('error');
      });

    return () => {
      current = false;
    };
  }, [open, date, appointment?.id, appointment?.provider?.id, appointment?.serviceId, refreshVersion]);

  const submit = async () => {
    if (!selected || saving) return;
    setSaving(true);
    setError('');
    try {
      const updated = await rescheduleAppointment(appointment.id, selected.startAt);
      onUpdated(updated);
      onClose();
    } catch (requestError) {
      setError(requestError.message);
      if (requestError.code === 'SLOT_UNAVAILABLE') {
        setSelected(null);
        setRefreshVersion((version) => version + 1);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Reschedule appointment">
      <p className="text-sm text-muted">
        Choose another available time for {appointment?.serviceNameSnapshot}.
      </p>

      <label className="mt-5 block space-y-2" htmlFor="reschedule-date">
        <span className="text-sm font-medium text-text">Date</span>
        <input
          id="reschedule-date"
          type="date"
          min={localDateInputValue()}
          value={date}
          onChange={(event) => {
            setDate(event.target.value);
            setError('');
          }}
          className="w-full rounded-lg border border-border bg-background px-3.5 py-3 text-sm text-text outline-none focus:border-sage focus:ring-2 focus:ring-sage/15"
        />
      </label>

      <div className="mt-5" aria-live="polite">
        {state === 'loading' ? (
          <div className="grid min-h-32 place-items-center"><Spinner /></div>
        ) : state === 'error' ? (
          <Alert>{error}</Alert>
        ) : state === 'ready' && slots.length ? (
          <div>
            <p className="mb-3 text-sm font-medium text-text">{formatDate(`${date}T12:00:00`)}</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {slots.map((slot) => (
                <button
                  key={slot.startAt}
                  type="button"
                  aria-pressed={selected?.startAt === slot.startAt}
                  onClick={() => {
                    setSelected(slot);
                    setError('');
                  }}
                  className={`rounded-lg border px-3 py-3 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-bright ${
                    selected?.startAt === slot.startAt
                      ? 'border-sage bg-sage text-background'
                      : 'border-border bg-background text-text hover:bg-surface-2'
                  }`}
                >
                  {formatTime(slot.startAt)}
                </button>
              ))}
            </div>
          </div>
        ) : state === 'ready' ? (
          <Alert tone="info">No available times for this barber on this date. Try another day.</Alert>
        ) : null}
      </div>

      {error && state !== 'error' ? <div className="mt-4"><Alert>{error}</Alert></div> : null}

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Keep current time</Button>
        <Button disabled={!selected} loading={saving} onClick={submit}>Confirm new time</Button>
      </div>
    </Modal>
  );
}
