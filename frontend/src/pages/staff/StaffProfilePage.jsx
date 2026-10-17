import { useSelector } from 'react-redux';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import Card from '../../components/ui/Card.jsx';

export default function StaffProfilePage() {
  useDocumentTitle('Staff profile');
  const { user } = useSelector((s) => s.auth);
  const { provider } = useSelector((s) => s.staff);

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">Staff portal</div>
      <h1 className="mt-2 text-3xl font-semibold">Profile</h1>

      <div className="mt-7 grid gap-5 md:grid-cols-2">
        <Card className="p-6">
          <div className="text-sm font-semibold">Account</div>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-xs text-muted">Name</dt>
              <dd className="mt-1 text-text">
                {user?.firstName} {user?.lastName}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Email</dt>
              <dd className="mt-1 text-text">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Role</dt>
              <dd className="mt-1 text-text">{user?.role}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6">
          <div className="text-sm font-semibold">Provider profile</div>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-xs text-muted">Display name</dt>
              <dd className="mt-1 text-text">{provider?.name || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Title</dt>
              <dd className="mt-1 text-text">{provider?.title || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Bio</dt>
              <dd className="mt-1 leading-6 text-muted">{provider?.bio || '—'}</dd>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  );
}