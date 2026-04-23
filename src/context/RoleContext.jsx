'use client';
import { createContext, useContext, useState, useEffect } from 'react';

export const RoleContext = createContext();

export function RoleProvider({ children }) {
    const [role, setRole] = useState('');

    useEffect(() => {
        try {
            const storedSession = localStorage.getItem('demdem_admin_session');
            if (storedSession) {
                const pu = JSON.parse(storedSession);
                if (pu && pu.role) {
                    setRole(pu.role);
                }
            }
        } catch (e) {
            console.error('Failed to parse role', e);
        }
    }, []);

    return (
        <RoleContext.Provider value={{ role, setRole }}>
            {children}
        </RoleContext.Provider>
    );
}

export function useRole() {
    return useContext(RoleContext);
}
