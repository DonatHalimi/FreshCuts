import { ArrowLeft, CalendarPlus, Clock3, Scissors } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { getProvider } from '../services/providers.api.js';

function money(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

export default function ProviderDetailPage() {
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [error, setError] = useState(null);
  useDocumentTitle(provider?.name ?? 'Provider');

  useEffect(() => {
    getProvider(id).then(setProvider).catch(setError);
  }, [id]);

  if (error) {
    return <section className="mx-auto max-w-6xl px-5 py-16"><Alert>{error.message}</Alert></section>;
  }
  if (!provider) {
    return <div className="grid min-h-[60vh] place-items-center"><Spinner /></div>;
  }

  return (
    <section className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
      <Link to="/providers" className="inline-flex items-center gap-2 text-sm text-muted hover:text-text"><ArrowLeft className="h-4 w-4" /> Back to providers</Link>

      <div className="mt-7 grid gap-6 md:grid-cols-[280px_1fr]">
        <Card className="grid aspect-square place-items-center bg-surface-2 p-8">
          {provider.imageUrl ? <img src={provider.imageUrl} alt={provider.name} className="h-full w-full rounded-xl object-cover" /> : <div className="grid h-28 w-28 place-items-center rounded-full border border-border bg-background text-2xl font-semibold text-sage-bright">{provider.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div>}
        </Card>

        <Card className="p-6 sm:p-8">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">Provider</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{provider.name}</h1>
          <div className="mt-2 text-sm text-sage">{provider.title}</div>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-muted">{provider.bio}</p>

          <div className="mt-8">
            <div className="text-sm font-semibold">Services</div>
            <div className="mt-4 grid gap-3">
              {provider.services.map((service) => (
                <div key={service.id} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background p-4">
                  <div className="flex items-center gap-3"><Scissors className="h-4 w-4 text-sage" /><span className="text-sm font-medium">{service.name}</span></div>
                  <div className="flex items-center gap-4 text-xs text-muted"><span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {service.durationMin} min</span><span className="font-semibold text-sage-bright">{money(service.priceCents)}</span></div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <Link to={{ pathname: '/book', search: `?providerId=${encodeURIComponent(provider.id)}` }}>
              <Button>
                <CalendarPlus className="mr-2 h-4 w-4" />
                Book appointment
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </section>
  );
}