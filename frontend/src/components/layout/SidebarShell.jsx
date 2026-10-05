import { Outlet } from 'react-router-dom';
import Footer from './Footer.jsx';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';

export default function SidebarShell() {
    return (
        <div className="flex min-h-screen flex-col bg-background text-text">
            <Header />

            <div className="mx-auto flex w-full max-w-7xl flex-1 gap-4 px-5 py-20">
                <div className="sticky top-8 hidden h-[calc(100vh-8rem)] shrink-0 md:block">
                    <Sidebar />
                </div>

                <main className="min-w-0 flex-1">
                    <Outlet />
                </main>
            </div>

            <Footer />
        </div>
    );
}