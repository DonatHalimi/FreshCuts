import { Link } from 'react-router-dom';
import Card from '../components/ui/Card.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function NotFoundPage() {
  useDocumentTitle('Not found');

  return (
    <section className="mx-auto max-w-xl px-5 py-20">
      <Card className="p-8 text-center sm:p-10">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">404</div>
        <h1 className="mt-2 text-3xl font-semibold">Page not found.</h1>
        <p className="mt-4 text-sm leading-6 text-muted">The page you requested does not exist.</p>
        <Link to="/" className="mt-7 inline-flex min-h-11 items-center justify-center rounded-lg bg-sage px-5 text-sm font-semibold text-background hover:bg-sage-bright">Back home</Link>
      </Card>
    </section>
  );
}