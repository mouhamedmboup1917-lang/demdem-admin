'use client';
import { useState } from 'react';
import { useRole } from '@/context/RoleContext';
import { useAuth } from '@/context/AuthContext';
import ConfirmModal from '@/components/ConfirmModal';
import {
    Save, RotateCw, Percent, Bell, Globe, Shield,
    CreditCard, Smartphone, AlertTriangle, Check, Loader2
} from 'lucide-react';
import { useEffect } from 'react';

/* ─────────────────────────────────────────────
   Configuration constants — defaults
───────────────────────────────────────────── */
const DEFAULT_CONFIG = {
    commissionRate: 10,
    escrowTimeout: 24,
    minTripPrice: 500,
    maxSeats: 4,
    currency: 'CFA (XOF)',
    locale: 'fr-SN',
    smsProvider: 'Orange SMS API',
    paymentGateways: ['Wave', 'Orange Money', 'Free Money'],
    pushNotifications: true,
    emailNotifications: false,
    maintenanceMode: false,
};

export default function SettingsPage() {
    const { role } = useRole();
    const { user } = useAuth();
    const [config, setConfig] = useState(DEFAULT_CONFIG);
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);
    const [modal, setModal] = useState({ isOpen: false, type: null });

    useEffect(() => {
        const fetchDB = async () => {
            await new Promise(r => setTimeout(r, 600)); // Simulate DB fetch
            setConfig(DEFAULT_CONFIG); // Load DB config
            setLoading(false);
        };
        fetchDB();
    }, []);

    // Guard: only SUPER_ADMIN
    if (role !== 'SUPER_ADMIN') {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-[#a8a29e] font-semibold text-sm">Accès restreint au rôle SUPER_ADMIN.</p>
            </div>
        );
    }

    const update = (key, value) => {
        setConfig(prev => ({ ...prev, [key]: value }));
        setSaved(false);
    };

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        // TODO: PATCH /api/settings { config }
    };

    const handleReset = () => {
        setConfig(DEFAULT_CONFIG);
        setSaved(false);
    };

    const handleToggleMaintenance = () => {
        update('maintenanceMode', !config.maintenanceMode);
    };

    return (
        <div className="pb-12 animate-fade-in">
            {loading ? (
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-[#d97706]">
                    <Loader2 size={36} className="animate-spin mb-4" />
                    <p className="text-[#1a1917] font-bold text-lg">Synchronisation avec la base de données...</p>
                    <p className="text-[#78716c] text-sm mt-1">Chargement des paramètres globaux DemDem</p>
                </div>
            ) : (
                <>
                    {/* ── Header ── */}
                    <div className="flex flex-wrap justify-between items-end gap-4 mb-10">
                        <div>
                            <h1 className="text-3xl font-black text-[#1a1917] tracking-tight mb-1">Paramètres</h1>
                            <p className="text-[#78716c] font-medium">
                                Configuration globale de la plateforme DemDem — Sénégal.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setModal({ isOpen: true, type: 'reset' })}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#e7e5e0] bg-white text-sm font-semibold text-[#78716c] hover:bg-[#f7f6f3] transition-colors active:scale-95"
                            >
                                <RotateCw size={15} /> Réinitialiser
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#d97706] to-[#b48c40] shadow-sm hover:brightness-105 active:scale-95 transition-all"
                            >
                                {saved ? <><Check size={16} /> Sauvegardé !</> : <><Save size={16} /> Enregistrer</>}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* ═══════════════════════════════
            SECTION 1: Commission & Finances
        ═══════════════════════════════ */}
                        <div className="card p-0">
                            <div className="px-6 py-5 border-b border-[#f3f2ef] flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-[#fffbeb]"><Percent size={16} className="text-[#d97706]" /></div>
                                <div>
                                    <h2 className="text-base font-bold text-[#1a1917]">Commission & Finances</h2>
                                    <p className="text-xs text-[#a8a29e]">Taux de commission, limites de prix, timeout escrow</p>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Commission rate */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#44403c] mb-2">
                                        Taux de commission DemDem
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="range"
                                            min={1} max={25} step={0.5}
                                            value={config.commissionRate}
                                            onChange={e => update('commissionRate', parseFloat(e.target.value))}
                                            className="flex-1 h-2 rounded-full appearance-none bg-[#e7e5e0] accent-[#d97706]"
                                        />
                                        <span className="text-lg font-black text-[#d97706] tabular-nums w-14 text-right">
                                            {config.commissionRate}%
                                        </span>
                                    </div>
                                    <p className="text-xs text-[#a8a29e] mt-1">
                                        Prélevé sur chaque trajet complété. Actuellement : {config.commissionRate}%.
                                    </p>
                                </div>

                                {/* Escrow timeout */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#44403c] mb-2">
                                        Timeout escrow (heures)
                                    </label>
                                    <input
                                        type="number"
                                        min={1} max={72}
                                        value={config.escrowTimeout}
                                        onChange={e => update('escrowTimeout', parseInt(e.target.value) || 24)}
                                        className="input w-28"
                                    />
                                    <p className="text-xs text-[#a8a29e] mt-1">
                                        Délai après lequel un escrow peut être libéré manuellement.
                                    </p>
                                </div>

                                {/* Min trip price */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#44403c] mb-2">
                                        Prix minimum par trajet (CFA)
                                    </label>
                                    <input
                                        type="number"
                                        min={100} step={100}
                                        value={config.minTripPrice}
                                        onChange={e => update('minTripPrice', parseInt(e.target.value) || 500)}
                                        className="input w-36"
                                    />
                                </div>

                                {/* Max seats */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#44403c] mb-2">
                                        Places max par véhicule
                                    </label>
                                    <select
                                        value={config.maxSeats}
                                        onChange={e => update('maxSeats', parseInt(e.target.value))}
                                        className="input w-28"
                                    >
                                        {[2, 3, 4, 5, 6, 7, 8].map(n => (
                                            <option key={n} value={n}>{n} places</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* ═══════════════════════════════
            SECTION 2: Notifications
        ═══════════════════════════════ */}
                        <div className="card p-0">
                            <div className="px-6 py-5 border-b border-[#f3f2ef] flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-[#eff6ff]"><Bell size={16} className="text-[#3b82f6]" /></div>
                                <div>
                                    <h2 className="text-base font-bold text-[#1a1917]">Notifications</h2>
                                    <p className="text-xs text-[#a8a29e]">Canaux de notification et fournisseur SMS</p>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Push */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-[#1a1917]">Notifications Push</p>
                                        <p className="text-xs text-[#a8a29e] mt-0.5">KYC, confirmation de paiement, alertes</p>
                                    </div>
                                    <button
                                        onClick={() => update('pushNotifications', !config.pushNotifications)}
                                        className={`w-12 h-7 rounded-full transition-colors relative ${config.pushNotifications ? 'bg-[#d97706]' : 'bg-[#d4d0c8]'}`}
                                    >
                                        <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${config.pushNotifications ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>

                                {/* Email */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-[#1a1917]">Notifications Email</p>
                                        <p className="text-xs text-[#a8a29e] mt-0.5">Rapports hebdomadaires, alertes sécurité</p>
                                    </div>
                                    <button
                                        onClick={() => update('emailNotifications', !config.emailNotifications)}
                                        className={`w-12 h-7 rounded-full transition-colors relative ${config.emailNotifications ? 'bg-[#d97706]' : 'bg-[#d4d0c8]'}`}
                                    >
                                        <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${config.emailNotifications ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>

                                {/* SMS Provider */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#44403c] mb-2">
                                        Fournisseur SMS
                                    </label>
                                    <select
                                        value={config.smsProvider}
                                        onChange={e => update('smsProvider', e.target.value)}
                                        className="input"
                                    >
                                        <option>Orange SMS API</option>
                                        <option>Twilio</option>
                                        <option>Infobip</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* ═══════════════════════════════
            SECTION 3: Paiement
        ═══════════════════════════════ */}
                        <div className="card p-0">
                            <div className="px-6 py-5 border-b border-[#f3f2ef] flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-[#f0fdf4]"><CreditCard size={16} className="text-[#16a34a]" /></div>
                                <div>
                                    <h2 className="text-base font-bold text-[#1a1917]">Moyens de paiement</h2>
                                    <p className="text-xs text-[#a8a29e]">Passerelles de paiement mobile actives</p>
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                {['Wave', 'Orange Money', 'Free Money'].map(gw => {
                                    const isActive = config.paymentGateways.includes(gw);
                                    return (
                                        <div key={gw} className="flex items-center justify-between py-2">
                                            <div className="flex items-center gap-3">
                                                <Smartphone size={16} className={isActive ? 'text-[#16a34a]' : 'text-[#d4d0c8]'} />
                                                <span className={`text-sm font-semibold ${isActive ? 'text-[#1a1917]' : 'text-[#a8a29e]'}`}>
                                                    {gw}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const next = isActive
                                                        ? config.paymentGateways.filter(g => g !== gw)
                                                        : [...config.paymentGateways, gw];
                                                    update('paymentGateways', next);
                                                }}
                                                className={`w-12 h-7 rounded-full transition-colors relative ${isActive ? 'bg-[#16a34a]' : 'bg-[#d4d0c8]'}`}
                                            >
                                                <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${isActive ? 'left-6' : 'left-1'}`} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ═══════════════════════════════
            SECTION 4: Localisation & Sécurité
        ═══════════════════════════════ */}
                        <div className="card p-0">
                            <div className="px-6 py-5 border-b border-[#f3f2ef] flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-[#f5f3ff]"><Globe size={16} className="text-[#7c3aed]" /></div>
                                <div>
                                    <h2 className="text-base font-bold text-[#1a1917]">Localisation & Sécurité</h2>
                                    <p className="text-xs text-[#a8a29e]">Devise, locale, mode maintenance</p>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Currency */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#44403c] mb-2">Devise</label>
                                    <input type="text" value={config.currency} disabled className="input bg-[#f7f6f3] text-[#78716c] cursor-not-allowed" />
                                    <p className="text-xs text-[#a8a29e] mt-1">Monnaie officielle du Sénégal — verrouillé.</p>
                                </div>

                                {/* Locale */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#44403c] mb-2">Locale</label>
                                    <select value={config.locale} onChange={e => update('locale', e.target.value)} className="input">
                                        <option value="fr-SN">Français — Sénégal (fr-SN)</option>
                                        <option value="en-SN">English — Senegal (en-SN)</option>
                                    </select>
                                </div>

                                {/* Maintenance mode */}
                                <div className={`flex items-center justify-between p-4 rounded-xl border ${config.maintenanceMode ? 'bg-[#fef2f2] border-[#fecaca]' : 'bg-[#f7f6f3] border-[#e7e5e0]'}`}>
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle size={18} className={config.maintenanceMode ? 'text-[#ef4444]' : 'text-[#a8a29e]'} />
                                        <div>
                                            <p className="text-sm font-bold text-[#1a1917]">Mode maintenance</p>
                                            <p className="text-xs text-[#78716c]">Bloque l'accès à l'app mobile, utile lors des déploiements.</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (!config.maintenanceMode) {
                                                setModal({ isOpen: true, type: 'maintenance' });
                                            } else {
                                                handleToggleMaintenance();
                                            }
                                        }}
                                        className={`w-12 h-7 rounded-full transition-colors relative ${config.maintenanceMode ? 'bg-[#ef4444]' : 'bg-[#d4d0c8]'}`}
                                    >
                                        <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${config.maintenanceMode ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* ── Version info footer ── */}
                    <div className="mt-10 px-6 py-4 bg-white border border-[#e7e5e0] rounded-2xl flex flex-wrap justify-between items-center gap-4 text-xs text-[#a8a29e]">
                        <div className="flex items-center gap-2">
                            <Shield size={14} />
                            <span>DemDem Admin V1.0 · Production · Sénégal</span>
                        </div>
                        <div>
                            Connecté en tant que <span className="font-bold text-[#44403c]">{user?.name}</span> ({user?.role})
                        </div>
                    </div>

                    {/* ── Confirmation Modals ── */}
                    <ConfirmModal
                        isOpen={modal.isOpen && modal.type === 'reset'}
                        onClose={() => setModal({ isOpen: false })}
                        onConfirm={handleReset}
                        title="Réinitialiser les paramètres ?"
                        description="Tous les réglages seront remis aux valeurs par défaut. Vos modifications non enregistrées seront perdues."
                        confirmText="Réinitialiser"
                        isDanger
                    />

                    <ConfirmModal
                        isOpen={modal.isOpen && modal.type === 'maintenance'}
                        onClose={() => setModal({ isOpen: false })}
                        onConfirm={handleToggleMaintenance}
                        title="Activer le mode maintenance ?"
                        description="L'application mobile sera inaccessible pour tous les utilisateurs au Sénégal pendant la durée de la maintenance. Seul le back-office restera fonctionnel."
                        confirmText="Activer la maintenance"
                        isDanger
                    />
                </>
            )}
        </div>
    );
}
