import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

export default function AppShell({ sidebar }) {
  if (sidebar) {
    return (
      <div className="flex min-h-screen bg-background text-text">
        {sidebar}
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}