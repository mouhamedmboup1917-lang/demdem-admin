'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRole } from '@/context/RoleContext';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  ArrowUpRight, AlertTriangle, CheckCircle2, Users, MapPin,
  DollarSign, FileText, Shield, Clock
} from 'lucide-react';
import { SkeletonKpi } from '@/components/Skeleton';
import ErrorState from '@/components/ErrorState';
import { dashboardApi } from '@/lib/api';

export default function DashboardPage() {
  const { role } = useRole();
  const { user } = useAuth();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const shortRole = {
    SUPER_ADMIN: 'Super Administrateur 👑',
    MANAGER: 'Manager',
    SUPPORT: 'Support',
  }[role] || role;

  return (
    <div className="pb-10 animate-fade-in">
      <div className="mb-8 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#1a1917] tracking-tight mb-1">Tableau de bord</h1>
          <p className="text-[#64748b] font-medium">Vue globale — {shortRole}</p>
        </div>
        <Link href="/reports"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#e7e5e0] bg-white text-sm font-semibold text-[#44403c] hover:bg-[#f7f6f3] transition-colors active:scale-95">
          <ArrowUpRight size={15} /> Rapports
        </Link>
      </div>

      {loading ? (
        <SkeletonKpi count={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : stats && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {[
              { label: 'KYC en attente', value: stats.kycPending, detail: `Dossier${stats.kycPending > 1 ? 's' : ''} à traiter`, color: '#d97706', bg: 'from-[#fffbeb] to-[#fef3c7]', border: '#fde68a', icon: AlertTriangle, href: '/kyc' },
              { label: 'Trajets actifs', value: stats.activeTrips, detail: 'Sur le réseau', color: '#16a34a', bg: 'from-[#f0fdf4] to-[#dcfce7]', border: '#bbf7d0', icon: CheckCircle2, href: '/trajets-actifs' },
              { label: 'Utilisateurs', value: stats.totalUsers, detail: 'Comptes enregistrés', color: '#3b82f6', bg: 'from-[#eff6ff] to-[#dbeafe]', border: '#bfdbfe', icon: Users, href: '/users' },
              { label: 'En Séquestre', value: stats.escrowTotal?.toLocaleString('fr-FR') + ' CFA', detail: 'Fonds bloqués', color: '#7c3aed', bg: 'from-[#f5f3ff] to-[#ede9fe]', border: '#ddd6fe', icon: DollarSign, href: '/finance' },
            ].map(kpi => {
              const Icon = kpi.icon;
              return (
                <Link key={kpi.label} href={kpi.href}
                  className={`bg-gradient-to-br ${kpi.bg} border rounded-2xl p-5 hover:shadow-md transition-all group`}
                  style={{ borderColor: kpi.border }}>
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: kpi.color, opacity: 0.7 }}>{kpi.label}</p>
                    <span className="p-2 rounded-xl" style={{ background: `${kpi.color}15` }}>
                      <Icon size={16} style={{ color: kpi.color }} />
                    </span>
                  </div>
                  <p className="text-2xl font-black tracking-tight mb-1" style={{ color: kpi.color }}>{kpi.value}</p>
                  <p className="text-xs text-[#78716c] font-medium">{kpi.detail}</p>
                  <div className="flex justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight size={14} style={{ color: kpi.color }} />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Quick access */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-[#1a1917] mb-4">Raccourcis rapides</h2>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Vérifier les documents KYC', href: '/kyc', primary: true, icon: FileText },
                { label: 'Séquestres expirés', href: '/finance', icon: AlertTriangle },
                { label: 'Gestion des comptes', href: '/users', icon: Users },
                { label: 'Rapports & Analytique', href: '/reports', icon: MapPin },
              ].map(link => {
                const Icon = link.icon;
                return (
                  <Link key={link.label} href={link.href}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${link.primary
                      ? 'text-white bg-gradient-to-r from-[#d97706] to-[#b48c40] shadow-sm hover:brightness-105'
                      : 'bg-white border border-[#e7e5e0] text-[#44403c] hover:bg-[#f7f6f3]'}`}>
                    <Icon size={15} /> {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Audit Log */}
          {stats.recentActivity?.length > 0 && (
            <div className="card p-0 mt-8">
              <div className="px-6 py-4 border-b border-[#f3f2ef] flex items-center gap-2">
                <Shield size={16} className="text-[#d97706]" />
                <h2 className="font-bold text-[#1a1917]">Journal d'audit récent</h2>
              </div>
              <div className="divide-y divide-[#f3f2ef]">
                {stats.recentActivity.map((log, i) => (
                  <div key={log.id || i} className="px-6 py-3 flex items-center gap-4 text-sm hover:bg-[#fdfbf7] transition-colors">
                    <Clock size={13} className="text-[#a8a29e] flex-shrink-0" />
                    <span className="font-mono text-xs text-[#a8a29e] w-36 flex-shrink-0">{new Date(log.timestamp).toLocaleString('fr-FR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit', second:'2-digit' })}</span>
                    <span className="font-bold text-[#44403c] min-w-[140px]">{log.action}</span>
                    <span className="text-[#78716c] truncate">{log.details}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
