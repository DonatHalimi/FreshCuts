import { useEffect, useState } from 'react';
import { BarChart3, Scissors, Users } from 'lucide-react';
import AdminSidebar from '../../components/layout/AdminSidebar.jsx';
import { getAdminDashboard } from '../../services/admin.api.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { money } from '../../utils/money.js';
import { StatCard } from '../../components/admin/StatCard.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import Alert from '../../components/ui/Alert.jsx';
import Card from '../../components/ui/Card.jsx';

export default function AdminDashboardPage() {
  useDocumentTitle('Admin dashboard');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminDashboard()
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (!data && !error) {
    return (
      <div className="grid min-h-72 place-items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full items-start">
      <section className="flex-1 space-y-6">
        <header className="rounded-2xl border border-border bg-surface px-6 py-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">Administration</div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">System overview</h1>
          <p className="mt-1.5 text-sm text-muted">A concise view of today's activity and current system counts.</p>
        </header>

      {error ? (
        <div className="mt-5">
          <Alert>{error}</Alert>
        </div>
      ) : (
        <>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Appointments today" value={data.appointmentsToday} />
            <StatCard label="Revenue today" value={money(data.revenueTodayCents)} />
            <StatCard label="Active providers" value={data.providers} />
            <StatCard label="Users" value={data.users} />
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Card className="p-6">
              <Users className="h-5 w-5 text-sage" />
              <h2 className="mt-4 font-semibold">User management</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Review account status and roles, and deactivate accounts when necessary.
              </p>
              <div className="mt-4 text-sm text-sage-bright">{data.users} total accounts</div>
            </Card>

            <Card className="p-6">
              <Scissors className="h-5 w-5 text-sage" />
              <h2 className="mt-4 font-semibold">Service catalogue</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Keep duration, price and booking buffers aligned with your real shop operations.
              </p>
              <div className="mt-4 text-sm text-sage-bright">{data.services} active services</div>
            </Card>
          </div>

          <Card className="mt-5 p-6">
            <BarChart3 className="h-5 w-5 text-sage" />
            <h2 className="mt-4 font-semibold">Reporting foundation</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              The v2 dashboard keeps reporting intentionally small: daily appointments, completed
              revenue, current user counts, active providers and services. More analytics can be
              added without changing the core modules.
            </p>
          </Card>
        </>
      )}
      </section>
    </div>
  );
}