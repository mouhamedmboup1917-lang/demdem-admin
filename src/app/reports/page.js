'use client';
import { useState } from 'react';
import { useRole } from '@/context/RoleContext';
import {
    BarChart3, TrendingUp, TrendingDown, Users, Car,
    ArrowUpRight, Download, CalendarDays, MapPin
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Mock KPI data — replace with Supabase queries
───────────────────────────────────────────── */
const KPI = [
    { label: 'Trajets ce mois', value: '1 247', delta: '+18%', up: true, icon: Car },
    { label: 'Nouveaux inscrits', value: '312', delta: '+9%', up: true, icon: Users },
    { label: 'Taux d\'annulation', value: '4.2%', delta: '-1.1%', up: false, icon: TrendingDown },
    { label: 'Revenu plateforme', value: '487 500', delta: '+22%', up: true, icon: TrendingUp, suffix: 'CFA' },
];

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
const CHART_DATA = [42, 58, 71, 63, 85, 92, 78, 105, 118, 134, 127, 148]; // trips per month (simplified)
const MAX_CHART = Math.max(...CHART_DATA);

const TOP_ROUTES = [
    { from: 'Dakar', to: 'Thiès', trips: 342, revenue: '684 000' },
    { from: 'Dakar', to: 'Saint-Louis', trips: 189, revenue: '1 039 500' },
    { from: 'Dakar', to: 'Ziguinchor', trips: 156, revenue: '1 404 000' },
    { from: 'Thiès', to: 'Kaolack', trips: 127, revenue: '381 000' },
    { from: 'Saint-Louis', to: 'Dakar', trips: 98, revenue: '539 000' },
];

const RECENT_ACTIVITY = [
    { time: '14:32', event: 'Inscription conducteur', detail: 'Souleymane Fall (+221 77 765 43 21)', type: 'user' },
    { time: '14:18', event: 'Trajet terminé', detail: 'Dakar → Thiès · 2 000 CFA', type: 'trip' },
    { time: '13:55', event: 'KYC approuvé', detail: 'Ousmane Sène – Permis validé', type: 'kyc' },
    { time: '13:41', event: 'Escrow libéré', detail: 'esc-007 · 5 500 CFA → Fatou N.', type: 'pay' },
    { time: '13:22', event: 'Signalement reçu', detail: 'Passager #u-02 signale retard', type: 'alert' },
    { time: '12:58', event: 'Trajet publié', detail: 'Kaolack → Dakar · 3 places', type: 'trip' },
];

const ACTIVITY_COLORS = {
    user: { bg: '#eff6ff', text: '#3b82f6', border: '#bfdbfe' },
    trip: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
    kyc: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
    pay: { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe' },
    alert: { bg: '#fef2f2', text: '#ef4444', border: '#fecaca' },
};

const PERIODS = ['7 jours', '30 jours', '90 jours', '12 mois'];

export default function ReportsPage() {
    const { role } = useRole();
    const [period, setPeriod] = useState('30 jours');

    return (
        <div className="pb-12">

            {/* ── Header ── */}
            <div className="flex flex-wrap justify-between items-end gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-[#1a1917] tracking-tight mb-1">Rapports & Analytique</h1>
                    <p className="text-[#78716c] font-medium">
                        Vue consolidée de l'activité DemDem au Sénégal.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Period selector */}
                    <div className="flex bg-white border border-[#e7e5e0] rounded-xl overflow-hidden">
                        {PERIODS.map(p => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-4 py-2.5 text-xs font-bold transition-colors ${period === p
                                        ? 'bg-[#1a1917] text-white'
                                        : 'text-[#78716c] hover:bg-[#f7f6f3] hover:text-[#1a1917]'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#e7e5e0] bg-white text-sm font-semibold text-[#44403c] hover:bg-[#f7f6f3] transition-colors active:scale-95">
                        <Download size={15} /> Exporter
                    </button>
                </div>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
                {KPI.map(kpi => {
                    const Icon = kpi.icon;
                    return (
                        <div key={kpi.label} className="card p-6 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-5">
                                <p className="text-xs font-bold uppercase tracking-widest text-[#a8a29e]">{kpi.label}</p>
                                <span className={`p-2 rounded-xl ${kpi.up ? 'bg-[#f0fdf4] text-[#16a34a]' : 'bg-[#fef2f2] text-[#ef4444]'}`}>
                                    <Icon size={16} />
                                </span>
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-black text-[#1a1917] tracking-tight leading-none">
                                    {kpi.value}
                                </span>
                                {kpi.suffix && <span className="text-sm font-semibold text-[#78716c] mb-0.5">{kpi.suffix}</span>}
                            </div>
                            <p className={`text-xs font-bold mt-2 ${kpi.up ? 'text-[#16a34a]' : 'text-[#ef4444]'}`}>
                                {kpi.delta} <span className="text-[#a8a29e] font-medium">vs mois précédent</span>
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* ── Main grid: Chart + Activity ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

                {/* Bar chart placeholder (pure CSS) */}
                <div className="lg:col-span-2 card p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-lg font-bold text-[#1a1917] mb-0.5">Trajets par mois</h2>
                            <p className="text-xs text-[#a8a29e] font-medium">Évolution sur 12 mois</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-[#16a34a] bg-[#f0fdf4] border border-[#bbf7d0] px-3 py-1.5 rounded-full">
                            <TrendingUp size={13} /> +22% global
                        </div>
                    </div>

                    {/* CSS bar chart */}
                    <div className="flex items-end gap-2 h-48">
                        {CHART_DATA.map((val, i) => {
                            const height = (val / MAX_CHART) * 100;
                            const isHighest = val === MAX_CHART;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                    <span className="text-xs font-bold text-[#a8a29e] opacity-0 group-hover:opacity-100 transition-opacity">
                                        {val}
                                    </span>
                                    <div
                                        className="w-full rounded-lg transition-all duration-300 group-hover:opacity-90"
                                        style={{
                                            height: `${height}%`,
                                            minHeight: 8,
                                            background: isHighest
                                                ? 'linear-gradient(180deg, #d97706, #b48c40)'
                                                : 'linear-gradient(180deg, #e7e5e0, #d4d0c8)',
                                        }}
                                    />
                                    <span className="text-xs font-semibold text-[#a8a29e]">{MONTHS[i]}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent activity */}
                <div className="card p-0 flex flex-col">
                    <div className="px-6 py-5 border-b border-[#f3f2ef]">
                        <h2 className="text-lg font-bold text-[#1a1917]">Activité récente</h2>
                        <p className="text-xs text-[#a8a29e] font-medium mt-0.5">Flux en temps réel</p>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-[#f3f2ef]">
                        {RECENT_ACTIVITY.map((a, i) => {
                            const c = ACTIVITY_COLORS[a.type];
                            return (
                                <div key={i} className="px-6 py-4 hover:bg-[#f7f6f3] transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div
                                            className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                                            style={{ backgroundColor: c.text }}
                                        />
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-[#1a1917] leading-tight">{a.event}</p>
                                            <p className="text-xs text-[#78716c] mt-0.5 truncate">{a.detail}</p>
                                        </div>
                                        <span className="text-xs font-semibold text-[#a8a29e] ml-auto flex-shrink-0">{a.time}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="px-6 py-3 border-t border-[#f3f2ef] bg-[#f7f6f3]">
                        <button className="text-xs font-bold text-[#d97706] hover:underline flex items-center gap-1">
                            Voir tout l'historique <ArrowUpRight size={12} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Top Routes ── */}
            <div className="card p-0 overflow-hidden">
                <div className="px-6 py-5 border-b border-[#f3f2ef] flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-[#1a1917]">Routes les plus populaires</h2>
                        <p className="text-xs text-[#a8a29e] font-medium mt-0.5">Classement par volume de trajets</p>
                    </div>
                    <MapPin size={18} className="text-[#a8a29e]" />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-[#f7f6f3] border-b border-[#e7e5e0] text-[#78716c] text-xs font-bold uppercase tracking-wider">
                                <th className="px-6 py-3.5">#</th>
                                <th className="px-6 py-3.5">Itinéraire</th>
                                <th className="px-6 py-3.5 text-right">Trajets</th>
                                <th className="px-6 py-3.5 text-right">Revenus (CFA)</th>
                                <th className="px-6 py-3.5 text-right">Part</th>
                            </tr>
                        </thead>
                        <tbody className="text-[#1a1917] font-medium divide-y divide-[#f3f2ef]">
                            {TOP_ROUTES.map((route, i) => {
                                const totalTrips = TOP_ROUTES.reduce((s, r) => s + r.trips, 0);
                                const pct = ((route.trips / totalTrips) * 100).toFixed(1);
                                return (
                                    <tr key={i} className="hover:bg-[#f7f6f3] transition-colors">
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black ${i === 0 ? 'bg-[#fffbeb] text-[#d97706] border border-[#fde68a]'
                                                    : 'bg-[#f7f6f3] text-[#78716c]'
                                                }`}>
                                                {i + 1}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold">{route.from}</span>
                                                <span className="text-[#a8a29e]">→</span>
                                                <span className="font-bold">{route.to}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold">{route.trips}</td>
                                        <td className="px-6 py-4 text-right font-bold text-[#d97706]">{route.revenue}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="w-16 h-1.5 bg-[#f3f2ef] rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-[#d97706] to-[#b48c40]"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-semibold text-[#78716c] tabular-nums w-10 text-right">{pct}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
