'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

/**
 * AuthContext — manages admin session state.
 * In production, replace the mock logic with a real API call (e.g. Supabase Auth).
 */
export const AuthContext = createContext(null);

/** Database Authentication Records */
const DB_USERS = [
    { email: 'admin@demdem.sn', password: 'admin123', role: 'SUPER_ADMIN', name: 'Super Admin' },
    { email: 'manager@demdem.sn', password: 'manager123', role: 'MANAGER', name: 'Manager DemDem' },
    { email: 'support@demdem.sn', password: 'support123', role: 'SUPPORT', name: 'Équipe Support' },
];

export function AuthProvider({ children }) {
    // 1. Initialize from localStorage on mount
    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    useEffect(() => {
        /** Simulate awaiting Supabase (database layer) session restoration before load */
        const checkSupabaseSession = async () => {
            await new Promise(r => setTimeout(r, 400)); // Delay to simulate Auth sync

            try {
                const storedUser = localStorage.getItem('demdem_admin_session');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (e) {
                console.error('Failed to parse session', e);
            } finally {
                setLoadingAuth(false);
            }
        };

        checkSupabaseSession();
    }, []);

    /**
     * Authenticate the admin user.
     * @returns {{ success: boolean, error?: string }}
     */
    const login = useCallback(async (email, password) => {
        // Security lock: Only allow .sn environment connections
        if (!email.trim().toLowerCase().endsWith('.sn')) {
            return { success: false, error: 'Accès restreint aux domaines sécurisés .sn' };
        }

        // Simulate async network delay for DB authentication
        await new Promise(r => setTimeout(r, 900));

        const found = DB_USERS.find(
            u => u.email === email.trim() && u.password === password
        );

        if (found) {
            const { password: _pw, ...safeUser } = found;
            setUser(safeUser);
            localStorage.setItem('demdem_admin_session', JSON.stringify(safeUser));
            return { success: true, role: safeUser.role };
        }
        return { success: false, error: 'Email ou mot de passe incorrect.' };
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem('demdem_admin_session');
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, loadingAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

/** Hook for consuming auth state in any client component */
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
