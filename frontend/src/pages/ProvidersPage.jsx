import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import ProviderCard from '../components/providers/ProviderCard.jsx';
import Alert from '../components/ui/Alert.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { getProviders } from '../services/providers.api.js';
import { getServices } from '../services/services.api.js';

export default function ProvidersPage() {
  useDocumentTitle('Providers');
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);
  const [query, setQuery] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    getServices().then(setServices).catch(() => { });
  }, []);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    setError(null);
    getProviders({ q: query, serviceId: serviceId || undefined })
      .then((response) => {
        if (!active) return;
        setProviders(response.data);
        setStatus('ready');
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError);
        setStatus('error');
      });
    return () => { active = false; };
  }, [query, serviceId]);

  return (
    <section className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
      <div className="max-w-2xl">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">Providers</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Find your next barber or stylist.</h1>
        <p className="mt-4 text-sm leading-6 text-muted">Explore the team and the services they currently offer.</p>
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-[1fr_240px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-muted" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search providers" className="w-full rounded-lg border border-border bg-surface py-3 pl-10 pr-4 text-sm outline-none focus:border-sage" />
        </label>
        <select value={serviceId} onChange={(event) => setServiceId(event.target.value)} className="rounded-lg border border-border bg-surface px-3.5 py-3 text-sm text-text outline-none focus:border-sage">
          <option value="">All services</option>
          {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
        </select>
      </div>

      {status === 'loading' ? (
        <div className="grid min-h-72 place-items-center"><Spinner /></div>
      ) : error ? (
        <div className="mt-8"><Alert>{error.message}</Alert></div>
      ) : providers.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted">No providers matched your search.</div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => <ProviderCard key={provider.id} provider={provider} />)}
        </div>
      )}
    </section>
  );
}