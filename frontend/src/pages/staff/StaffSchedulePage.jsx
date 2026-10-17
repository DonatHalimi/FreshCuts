import { useEffect, useState } from 'react';
import { CalendarOff, Save } from 'lucide-react';
import {
  getStaffSchedule,
  saveWorkingHours,
  saveBreaks,
  createTimeOff,
  deleteTimeOff,
} from '../../services/staffSchedule.api.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { formatDateTime } from '../../utils/dates.js';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Alert from '../../components/ui/Alert.jsx';
import ScheduleRangeEditor from '../../components/staff/ScheduleRangeEditor.jsx';
import Spinner from '../../components/ui/Spinner.jsx';

const defaultHours = [1, 2, 3, 4, 5].map((dayOfWeek) => ({
  dayOfWeek,
  startMin: 540,
  endMin: 1080,
  isActive: true,
}));
const defaultBreaks = [1, 2, 3, 4, 5].map((dayOfWeek) => ({
  dayOfWeek,
  startMin: 780,
  endMin: 840,
  isActive: true,
  label: 'Lunch',
}));

export default function StaffSchedulePage() {
  useDocumentTitle('Schedule');
  const [schedule, setSchedule] = useState({ workingHours: [], breaks: [], timeOff: [] });
  const [hours, setHours] = useState(defaultHours);
  const [breaks, setBreaks] = useState(defaultBreaks);
  const [timeOffStart, setTimeOffStart] = useState('');
  const [timeOffEnd, setTimeOffEnd] = useState('');
  const [reason, setReason] = useState('');
  const [state, setState] = useState('loading');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getStaffSchedule()
      .then((x) => {
        setSchedule(x);
        setHours(x.workingHours || []);
        setBreaks(x.breaks || []);
        setState('ready');
      })
      .catch((e) => {
        setError(e.message);
        setState('error');
      });
  }, []);

  const save = async (kind) => {
    setState('saving');
    setError('');
    setMessage('');
    try {
      const x = kind === 'hours' ? await saveWorkingHours(hours) : await saveBreaks(breaks);
      setSchedule(x);
      setState('ready');
      setMessage(kind === 'hours' ? 'Working hours saved.' : 'Breaks saved.');
    } catch (e) {
      setState('ready');
      setError(e.message);
    }
  };

  const addTimeOff = async () => {
    if (!timeOffStart || !timeOffEnd) return;
    setState('saving');
    try {
      const x = await createTimeOff({
        startAt: new Date(timeOffStart).toISOString(),
        endAt: new Date(timeOffEnd).toISOString(),
        reason,
      });
      setSchedule((s) => ({ ...s, timeOff: [...s.timeOff, x] }));
      setTimeOffStart('');
      setTimeOffEnd('');
      setReason('');
      setMessage('Time off added.');
    } catch (e) {
      setError(e.message);
    } finally {
      setState('ready');
    }
  };

  const removeTimeOff = async (id) => {
    try {
      await deleteTimeOff(id);
      setSchedule((s) => ({ ...s, timeOff: s.timeOff.filter((x) => x.id !== id) }));
    } catch (e) {
      setError(e.message);
    }
  };

  if (state === 'loading')
    return (
      <div className="grid min-h-72 place-items-center">
        <Spinner />
      </div>
    );

  return (
    <div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">Staff portal</div>
        <h1 className="mt-2 text-3xl font-semibold">Schedule</h1>
        <p className="mt-2 text-sm text-muted">
          Control recurring availability and one-off exceptions for your provider profile.
        </p>
      </div>

      {message ? (
        <div className="mt-5">
          <Alert tone="success">{message}</Alert>
        </div>
      ) : null}
      {error ? (
        <div className="mt-5">
          <Alert>{error}</Alert>
        </div>
      ) : null}

      <div className="mt-7 grid gap-5">
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Working hours</h2>
              <p className="mt-1 text-sm text-muted">These ranges define when customers can request appointments.</p>
            </div>
            <Button loading={state === 'saving'} onClick={() => save('hours')}>
              <Save className="mr-2 h-4 w-4" />
              Save hours
            </Button>
          </div>
          <div className="mt-6">
            <ScheduleRangeEditor rows={hours} onChange={setHours} label="Weekly hours" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Schedule breaks</h2>
              <p className="mt-1 text-sm text-muted">Breaks are removed from your bookable intervals.</p>
            </div>
            <Button variant="ghost" loading={state === 'saving'} onClick={() => save('breaks')}>
              Save breaks
            </Button>
          </div>
          <div className="mt-6">
            <ScheduleRangeEditor rows={breaks} onChange={setBreaks} label="Weekly breaks" includeLabel />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-sage/10 text-sage">
              <CalendarOff className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Time off</h2>
              <p className="mt-1 text-sm text-muted">
                Create one-off exceptions such as holidays, appointments or personal time.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
            <Input
              id="timeOffStart"
              label="Starts"
              type="datetime-local"
              value={timeOffStart}
              onChange={(e) => setTimeOffStart(e.target.value)}
            />
            <Input
              id="timeOffEnd"
              label="Ends"
              type="datetime-local"
              value={timeOffEnd}
              onChange={(e) => setTimeOffEnd(e.target.value)}
            />
            <Input
              id="reason"
              label="Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={255}
              placeholder="Personal time"
            />
            <Button
              className="md:self-end"
              disabled={!timeOffStart || !timeOffEnd}
              loading={state === 'saving'}
              onClick={addTimeOff}
            >
              Add time off
            </Button>
          </div>

          <div className="mt-6 space-y-2">
            {schedule.timeOff?.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="text-sm font-medium text-text">
                    {formatDateTime(item.startAt)} → {formatDateTime(item.endAt)}
                  </div>
                  <div className="mt-1 text-xs text-muted">{item.reason || 'Time off'}</div>
                </div>
                <Button variant="danger" onClick={() => removeTimeOff(item.id)}>
                  Remove
                </Button>
              </div>
            ))}
            {!schedule.timeOff?.length ? <p className="text-sm text-muted">No upcoming time off configured.</p> : null}
          </div>
        </Card>
      </div>
    </div>
  );
}