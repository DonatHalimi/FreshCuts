import { Clock3, Scissors } from 'lucide-react';
import { useEffect, useState } from 'react';
import Card from '../components/ui/Card.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { getServices } from '../services/services.api.js';

function money(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

export default function ServicesPage() {
  useDocumentTitle('Services');
  const [services, setServices] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    getServices()
      .then((items) => { setServices(items); setStatus('ready'); })
      .catch(() => setStatus('error'));
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
      <div className="max-w-2xl">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">Services</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Simple services, clear pricing.</h1>
        <p className="mt-4 text-sm leading-6 text-muted">Every service shows its duration and starting price so customers know what to expect.</p>
      </div>

      {status === 'loading' ? (
        <div className="grid min-h-72 place-items-center"><Spinner /></div>
      ) : status === 'error' ? (
        <div className="mt-8 rounded-2xl border border-border bg-surface p-8 text-sm text-muted">Services are temporarily unavailable. Try again later.</div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card
              key={service.id}
              className="p-6 transition-all duration-200 hover:-translate-y-1 hover:border-sage/50 hover:shadow-md cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-surface-2 text-sage"><Scissors className="h-4 w-4" /></div>
                <span className="text-sm font-semibold text-sage-bright">{money(service.priceCents)}</span>
              </div>
              <h2 className="mt-5 text-lg font-semibold">{service.name}</h2>
              <p className="mt-2 min-h-12 text-sm leading-6 text-muted">{service.description}</p>
              <div className="mt-5 flex items-center gap-2 text-xs text-muted"><Clock3 className="h-3.5 w-3.5" /> {service.durationMin} minutes</div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}