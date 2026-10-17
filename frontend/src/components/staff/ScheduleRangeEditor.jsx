import { Plus, Trash2 } from 'lucide-react';
import Button from '../ui/Button.jsx';

export const minsToTime = (mins) =>
  `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

export const timeToMins = (value) => {
  const [h, m] = value.split(':').map(Number);
  return h * 60 + m;
};

export default function ScheduleRangeEditor({
  rows,
  onChange,
  label,
  showLabel = true,
  includeLabel = false,
}) {
  const add = () =>
    onChange([
      ...rows,
      {
        dayOfWeek: 1,
        startMin: 540,
        endMin: 1080,
        isActive: true,
        ...(includeLabel ? { label: '' } : {}),
      },
    ]);

  const update = (index, key, value) =>
    onChange(rows.map((r, i) => (i === index ? { ...r, [key]: value } : r)));

  const remove = (index) => onChange(rows.filter((_, i) => i !== index));

  return (
    <div>
      {showLabel ? (
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-text">{label}</div>
          </div>
          <Button variant="ghost" onClick={add}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add
          </Button>
        </div>
      ) : null}

      <div className="mt-3 space-y-2">
        {rows.map((row, index) => (
          <div
            key={`${row.dayOfWeek}-${index}`}
            className="grid items-end gap-2 rounded-xl border border-border bg-background p-3 sm:grid-cols-[140px_1fr_1fr_auto]"
          >
            <label className="block space-y-1">
              <span className="text-[11px] text-muted">Day</span>
              <select
                value={row.dayOfWeek}
                onChange={(e) => update(index, 'dayOfWeek', Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-surface-2 px-2.5 py-2 text-sm text-text"
              >
                <option value="1">Monday</option>
                <option value="2">Tuesday</option>
                <option value="3">Wednesday</option>
                <option value="4">Thursday</option>
                <option value="5">Friday</option>
                <option value="6">Saturday</option>
                <option value="7">Sunday</option>
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-[11px] text-muted">Start</span>
              <input
                type="time"
                value={minsToTime(row.startMin)}
                onChange={(e) => update(index, 'startMin', timeToMins(e.target.value))}
                className="w-full rounded-lg border border-border bg-surface-2 px-2.5 py-2 text-sm text-text"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-[11px] text-muted">End</span>
              <input
                type="time"
                value={minsToTime(row.endMin)}
                onChange={(e) => update(index, 'endMin', timeToMins(e.target.value))}
                className="w-full rounded-lg border border-border bg-surface-2 px-2.5 py-2 text-sm text-text"
              />
            </label>

            <button
              type="button"
              onClick={() => remove(index)}
              className="grid h-10 place-items-center rounded-lg border border-border text-muted hover:border-red-400/30 hover:text-red-200"
              aria-label="Remove schedule row"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            {includeLabel ? (
              <label className="sm:col-span-4 block space-y-1">
                <span className="text-[11px] text-muted">Label (optional)</span>
                <input
                  value={row.label || ''}
                  onChange={(e) => update(index, 'label', e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-2 px-2.5 py-2 text-sm text-text"
                  placeholder="Lunch"
                />
              </label>
            ) : null}
          </div>
        ))}

        {!rows.length ? (
          <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted">
            No entries configured.
          </p>
        ) : null}
      </div>
    </div>
  );
}