'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import { Menu } from 'lucide-react';

const PUBLIC_ROUTES = ['/login'];

/**
 * AdminShell — root layout wrapper for all authenticated pages.
 * • Redirects to /login when user is not authenticated.
 * • Provides fixed Sidebar + responsive top bar.
 */
export default function AdminShell({ children }) {
    const { user, loadingAuth } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    // Auth guard — runs after mount to avoid SSR mismatch
    useEffect(() => {
        if (!mounted || loadingAuth) return;
        const isPublic = PUBLIC_ROUTES.includes(pathname);
        if (!user && !isPublic) {
            router.replace('/login');
        } else if (user && pathname === '/login') {
            router.replace('/');
        }
    }, [user, pathname, mounted, loadingAuth, router]);

    // Don't flash guarded content before redirect
    if (!mounted || loadingAuth) {
        return (
            <div className="flex min-h-screen bg-[#f7f6f3] items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-[#d97706]">
                    <span className="font-black text-3xl tracking-tight text-[#1a1917] mb-2 animate-pulse">DemDem.</span>
                    <div className="w-8 h-8 border-4 border-[#e7e5e0] border-t-[#d97706] rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    // Render the login page without the shell
    if (!user) return <>{children}</>;

    return (
        <div className="flex min-h-screen bg-[#f7f6f3]">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
                {/* Mobile top bar */}
                <header className="lg:hidden sticky top-0 z-10 flex items-center gap-4 px-5 py-4 bg-white border-b border-[#ececea] shadow-sm">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-xl text-[#6b7280] hover:bg-[#f3f4f6] transition-colors"
                        aria-label="Ouvrir le menu"
                    >
                        <Menu size={22} />
                    </button>
                    <span className="font-bold text-xl tracking-tight text-[#d97706]">DemDem.</span>
                </header>

                {/* Page content */}
                <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
