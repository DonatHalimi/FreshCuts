import { ArrowRight, CalendarClock, ShieldCheck, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { getServices } from '../services/services.api.js';

function money(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

export default function HomePage() {
  useDocumentTitle('Book your next cut');
  const [services, setServices] = useState([]);
  const { status } = useSelector((state) => state.auth);
  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    getServices().then(setServices).catch(() => setServices([]));
  }, []);

  return (
    <div>
      <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-16 md:grid-cols-[1.1fr_0.9fr] md:items-center md:pt-24">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted">
            <Sparkles className="h-3.5 w-3.5 text-sage" /> Personal care, simplified.
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Look sharp. <span className="text-sage-bright">Book smarter.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            Find your barber or stylist, explore services, and manage your account in one clean place. Appointment scheduling is the next feature slice.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/providers" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-sage px-5 text-sm font-semibold text-background hover:bg-sage-bright">
              Browse providers <ArrowRight className="h-4 w-4" />
            </Link>
            {!isAuthenticated && (
              <Link to="/register" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-border px-5 text-sm font-semibold text-text hover:bg-surface-2">
                Create an account
              </Link>
            )}
          </div>
        </div>

        <Card className="p-6 md:p-7">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">FreshCuts today</div>
          <div className="mt-5 grid gap-4">
            {[
              ['Verified accounts', 'Secure email verification and session cookies'],
              ['Clear service details', 'Price and duration are always visible'],
              ['Ready for booking', 'The scheduling engine is the next phase'],
            ].map(([title, text]) => (
              <div
                key={title}
                className="flex gap-3 rounded-xl border border-border bg-background p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-sage/40 hover:shadow-sm"
              >
                <div className="mt-0.5 text-sage"><ShieldCheck className="h-5 w-5" /></div>
                <div><div className="text-sm font-semibold">{title}</div><div className="mt-1 text-xs leading-5 text-muted">{text}</div></div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">Services</div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Popular cuts and care</h2>
          </div>
          <Link to="/services" className="hidden text-sm text-muted hover:text-text sm:block">View providers</Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card
              key={service.id}
              className="p-5 transition-all duration-200 hover:-translate-y-1 hover:border-sage/50 hover:shadow-md cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{service.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{service.description}</p>
                </div>
                <CalendarClock className="h-5 w-5 shrink-0 text-sage" />
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm">
                <span className="text-muted">{service.durationMin} min</span>
                <span className="font-semibold text-sage-bright">{money(service.priceCents)}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}