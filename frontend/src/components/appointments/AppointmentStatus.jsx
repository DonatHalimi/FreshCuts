import Badge from '../ui/Badge.jsx';

const tones = {
  CONFIRMED: 'success',
  COMPLETED: 'success',
  CANCELLED: 'danger',
  NO_SHOW: 'warning',
};

export default function AppointmentStatus({ status }) {
  return (
    <Badge tone={tones[status] || 'neutral'}>
      {status.replace('_', ' ')}
    </Badge>
  );
}