'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext';
import { Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react';



export default function LoginPage() {
    const { login } = useAuth();
    const { setRole } = useRole();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (!result.success) {
            setError(result.error);
            setLoading(false);
            return;
        }

        // Initialize role authorization context based on authentic DB payload
        setRole(result.role);
        // AdminShell will catch the new authentication state and redirect to '/' automatically
    };

    return (
        <div className="min-h-screen flex bg-[#f7f6f3]">

            {/* ── Left branding panel (hidden on mobile) ── */}
            <div className="hidden lg:flex lg:flex-1 flex-col items-start justify-between p-16 bg-[#1a1917] relative overflow-hidden">
                {/* Subtle geometric accent */}
                <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#d97706] opacity-[0.06] translate-x-32 -translate-y-32 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-[#b48c40] opacity-[0.08] -translate-x-24 translate-y-24 pointer-events-none" />

                {/* Logo */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-[#d97706] flex items-center justify-center shadow-lg">
                            <ShieldCheck size={22} className="text-white" />
                        </div>
                        <span className="text-white font-bold text-2xl tracking-tight">DemDem.</span>
                    </div>
                    <p className="text-[#78716c] text-sm font-medium">Administration & Back-Office</p>
                </div>

                {/* Tagline */}
                <div className="relative z-10">
                    <h1 className="text-white text-5xl font-black leading-tight tracking-tight mb-6">
                        Gérez<br />
                        <span className="text-[#d97706]">l'écosystème</span><br />
                        en toute sécurité.
                    </h1>
                    <p className="text-[#78716c] text-lg leading-relaxed max-w-md">
                        Modération KYC, finances, séquestres et gestion des utilisateurs — tout au même endroit.
                    </p>
                </div>

                {/* Version badge */}
                <div className="relative z-10">
                    <span className="text-xs text-[#44403c] font-medium bg-[#2a2825] px-3 py-1.5 rounded-full">
                        DemDem Admin · V1.0 · Production
                    </span>
                </div>
            </div>

            {/* ── Right login panel ── */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 py-16">

                {/* Mobile logo */}
                <div className="lg:hidden flex items-center gap-2 mb-12">
                    <div className="w-9 h-9 rounded-xl bg-[#d97706] flex items-center justify-center">
                        <ShieldCheck size={20} className="text-white" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-[#1a1917]">DemDem Admin</span>
                </div>

                <div className="w-full max-w-md">
                    <div className="mb-10">
                        <h2 className="text-3xl font-black text-[#1a1917] mb-2 tracking-tight">Connexion</h2>
                        <p className="text-[#78716c] font-medium">Accès réservé aux membres de l'équipe DemDem.</p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] text-sm font-medium">
                            <span className="text-lg leading-none mt-0.5">⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-[#44403c] mb-2">
                                Adresse e-mail
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                required
                                placeholder="prenom.nom@demdem.sn"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="input"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-[#44403c] mb-2">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPw ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="input pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(v => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a8a29e] hover:text-[#78716c] transition-colors"
                                    aria-label={showPw ? 'Masquer' : 'Afficher'}
                                >
                                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !email || !password}
                            className="btn btn-primary w-full h-14 text-base mt-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Connexion en cours…
                                </>
                            ) : (
                                'Se connecter'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
