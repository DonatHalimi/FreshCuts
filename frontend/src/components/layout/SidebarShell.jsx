import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Footer from './Footer.jsx';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';

const STORAGE_KEY = 'mainSidebar:expanded';

export default function SidebarShell() {
    const [expanded, setExpanded] = useState(() => {
        if (typeof window === 'undefined') return true;
        const stored = window.localStorage.getItem(STORAGE_KEY);
        return stored === null ? true : stored === 'true';
    });

    return (
        <div className="flex min-h-screen flex-col bg-background text-text">
            <Header />

            <div className={`mx-auto flex w-full max-w-6xl flex-1 items-start py-20 ${expanded ? 'gap-10 px-7' : 'gap-6 px-6'}`}>
                <div className="sticky top-24 hidden self-start md:block">
                    <Sidebar expanded={expanded} setExpanded={setExpanded} />
                </div>

                <main className="min-w-0 flex-1">
                    <Outlet />
                </main>
            </div>

            <Footer />
        </div>
    );
}