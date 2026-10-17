import { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import Alert from '../ui/Alert.jsx';

export default function CancelAppointmentDialog({ open, onClose, onConfirm, loading, error }) {
  const [reason, setReason] = useState('');

  return (
    <Modal open={open} onClose={onClose} title="Cancel appointment">
      <p className="text-sm text-muted">
        Cancel this appointment? This will notify you by email and release the time.
      </p>

      <div className="mt-5">
        <Input
          id="reason"
          label="Reason (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={255}
        />
      </div>

      {error ? <div className="mt-4"><Alert>{error}</Alert></div> : null}

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="danger" loading={loading} onClick={() => onConfirm(reason)}>
          Cancel appointment
        </Button>
        <Button variant="ghost" disabled={loading} onClick={onClose}>
          Keep appointment
        </Button>
      </div>
    </Modal>
  );
}