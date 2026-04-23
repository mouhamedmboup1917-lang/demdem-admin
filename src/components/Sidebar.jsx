'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext';
import {
    ShieldCheck, FileCheck2, HandCoins, Users,
    Settings, LogOut, LayoutDashboard, X, BarChart3,
    Map, History
} from 'lucide-react';

const NAV_ITEMS = [
    { label: 'Tableau de bord', icon: LayoutDashboard, href: '/', roles: ['SUPER_ADMIN', 'MANAGER', 'SUPPORT'] },
    { label: 'Cartographie Live', icon: Map, href: '/trajets-actifs', roles: ['SUPER_ADMIN', 'MANAGER', 'SUPPORT'] },
    { label: 'Historique', icon: History, href: '/historique', roles: ['SUPER_ADMIN', 'MANAGER', 'SUPPORT'] },
    { label: 'Vérification KYC', icon: FileCheck2, href: '/kyc', roles: ['SUPER_ADMIN', 'MANAGER'] },
    { label: 'Finance & Séquestres', icon: HandCoins, href: '/finance', roles: ['SUPER_ADMIN'] },
    { label: 'Utilisateurs', icon: Users, href: '/users', roles: ['SUPER_ADMIN', 'MANAGER', 'SUPPORT'] },
    { label: 'Rapports', icon: BarChart3, href: '/reports', roles: ['SUPER_ADMIN', 'MANAGER', 'SUPPORT'] },
    { label: 'Paramètres', icon: Settings, href: '/parametres', roles: ['SUPER_ADMIN'] },
];

const ROLE_BADGE = {
    SUPER_ADMIN: { label: 'Super Admin', color: 'text-[#d97706] bg-[#fffbeb] border-[#fde68a]' },
    MANAGER: { label: 'Manager', color: 'text-[#3b82f6] bg-[#eff6ff] border-[#bfdbfe]' },
    SUPPORT: { label: 'Support', color: 'text-[#7c3aed] bg-[#f5f3ff] border-[#ddd6fe]' },
};

export default function Sidebar({ isOpen, onClose }) {
    const { user, logout } = useAuth();
    const { role } = useRole();
    const pathname = usePathname();
    const router = useRouter();

    const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(role));

    const handleLogout = () => {
        logout();
        router.replace('/login');
    };

    const badge = ROLE_BADGE[role] ?? ROLE_BADGE.SUPPORT;
    const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? '?';

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 lg:hidden"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white z-30
        border-r border-[#e7e5e0] flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>

                {/* Brand header */}
                <div className="flex items-center justify-between px-6 py-6 border-b border-[#f3f2ef]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#d97706] flex items-center justify-center flex-shrink-0">
                            <ShieldCheck size={17} className="text-white" />
                        </div>
                        <span className="font-black text-xl tracking-tight text-[#1a1917]">DemDem.</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-1.5 rounded-lg text-[#a8a29e] hover:text-[#44403c] hover:bg-[#f7f6f3] transition-colors"
                        aria-label="Fermer le menu"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-5 overflow-y-auto">
                    <p className="px-3 mb-3 text-xs font-bold uppercase tracking-widest text-[#a8a29e]">
                        Navigation
                    </p>
                    <div className="space-y-1">
                        {visibleItems.map(item => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onClose}
                                    className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                    transition-all duration-100 group
                    ${isActive
                                            ? 'bg-[#fffbeb] text-[#d97706] font-semibold'
                                            : 'text-[#78716c] hover:bg-[#f7f6f3] hover:text-[#1a1917]'
                                        }
                  `}
                                >
                                    <Icon size={18} className={`flex-shrink-0 ${isActive ? 'text-[#d97706]' : 'text-[#a8a29e] group-hover:text-[#78716c]'}`} />
                                    {item.label}
                                    {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#d97706]" />}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* User info + logout */}
                <div className="px-3 py-4 border-t border-[#f3f2ef]">
                    {/* User card */}
                    <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-[#f7f6f3]">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d97706] to-[#b48c40] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {initials}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#1a1917] truncate leading-tight">{user?.name ?? 'Administrateur'}</p>
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full border ${badge.color}`}>
                                {badge.label}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-[#ef4444] hover:bg-[#fef2f2] transition-colors"
                    >
                        <LogOut size={17} />
                        Se déconnecter
                    </button>
                </div>
            </aside>
        </>
    );
}
