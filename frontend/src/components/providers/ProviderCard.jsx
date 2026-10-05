import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../ui/Card.jsx';

function initials(name) {
  return name.split(' ').map((part) => part[0]).slice(0, 2).join('');
}

export default function ProviderCard({ provider }) {
  return (
    <Card className="overflow-hidden transition hover:-translate-y-0.5 hover:border-sage/40">
      <div className="grid aspect-[5/3] place-items-center bg-surface-2">
        {provider.imageUrl ? (
          <img src={provider.imageUrl} alt={provider.name} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-20 w-20 place-items-center rounded-full border border-border bg-background text-lg font-semibold text-sage-bright">
            {initials(provider.name)}
          </div>
        )}
      </div>
      <div className="space-y-4 p-5">
        <div>
          <div className="text-lg font-semibold">{provider.name}</div>
          <div className="mt-1 text-sm text-sage">{provider.title}</div>
        </div>
        <p className="line-clamp-2 text-sm leading-6 text-muted">{provider.bio}</p>
        <div className="flex flex-wrap gap-2">
          {provider.services.slice(0, 3).map((service) => (
            <span key={service.id} className="rounded-full border border-border px-2.5 py-1 text-xs text-muted">
              {service.name}
            </span>
          ))}
        </div>
        <Link to={`/providers/${provider.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-sage-bright hover:text-text">
          View provider <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </Card>
  );
}