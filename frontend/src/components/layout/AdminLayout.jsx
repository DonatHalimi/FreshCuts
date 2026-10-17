import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout() {
  return (
    <div className="mx-auto mt-10 grid min-h-[calc(100vh-4rem)] gap-6 !px-24  py-6 lg:grid-cols-[auto_minmax(0,1fr)] lg:px-12 lg:max-w-7xl">
      <aside className="relative hidden h-fit lg:block">
        <AdminSidebar />
      </aside>
      
      <section className="min-w-0">
        <Outlet />
      </section>
    </div>
  );
}