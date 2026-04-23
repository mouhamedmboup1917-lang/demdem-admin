/**
 * api.js — Couche d'accès backend centralisée.
 * 
 * Version FORCÉE pour GitHub Pages.
 */
'use client';

const API_BASE = '/api';
const TIMEOUT_MS = 12000;

// Detection ultra-robuste de l'environnement GitHub Pages
const isClient = typeof window !== 'undefined';
const isGitHubPages = isClient && window.location.hostname.includes('github.io');
const isLocalTest = isClient && (window.location.port === '5000' || window.location.port === '3000');

// On active le mode MOCK si on est sur GitHub ou si on veut simuler en local sans backend
const ENABLE_MOCKS = isGitHubPages || true; // TRUE pour être sûr que ça marche partout en démo

console.log('API Module loaded. Environment:', { isGitHubPages, isLocalTest, ENABLE_MOCKS });

class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// ─── SIMULATION DATA ─────────────────────────────────────────────────────────
const MOCK_STORE = {
  escrowTotal: 17000,
  commissionsTotal: 142500,
  escrows: [
    { id: 'esc-001', trip: 'Dakar → Thiès', driver: 'Moussa D.', passenger: 'Awa N.', price: 2500, date: '10/03/2026', hoursElapsed: 26, paymentMethod: 'Wave', reason: 'Conducteur en retard', pin: '7291' },
    { id: 'esc-002', trip: 'Saint-Louis → Dakar', driver: 'Fatou N.', passenger: 'Ibrahima Fall', price: 5500, date: '11/03/2026', hoursElapsed: 4, paymentMethod: 'OM', reason: null, pin: '4058' },
    { id: 'esc-003', trip: 'Dakar → Ziguinchor', driver: 'Ousmane S.', passenger: 'Coumba K.', price: 9000, date: '09/03/2026', hoursElapsed: 48, paymentMethod: 'Wave', reason: 'Ne s\'est pas présenté(e)', pin: '1563' },
  ],
  transactions: [
    { id: 'TX-9021', date: '11 Mars 2026, 14:30', type: 'Trajet Complété', route: 'Dakar → Saint-Louis', driver: 'Moussa Cissé', amount: 15000, commission: 1500, status: 'Succès' },
    { id: 'TX-9022', date: '11 Mars 2026, 10:15', type: 'Abonnement Premium (Driver)', route: '-', driver: 'Awa Diop', amount: 5000, commission: 5000, status: 'Succès' },
  ],
  withdrawals: [
    { id: 'WD-0041', driver: 'Ahmadou Bamba', phone: '+221 77 123 45 67', amount: 12500, method: 'Wave', date: '26/03/2026 14:22', status: 'pending' },
    { id: 'WD-0040', driver: 'Fatou Ndiaye', phone: '+221 70 987 65 43', amount: 8000, method: 'OM', date: '26/03/2026 11:05', status: 'validated' },
  ],
  kycQueue: [
    { id: 1, name: 'Moussa Diallo', phone: '+221 77 412 56 34', email: 'moussa.diallo@gmail.com', submittedAt: 'Il y a 2h', docType: 'Permis de Conduire', vehicle: 'Peugeot 308' },
    { id: 2, name: 'Fatou Ndiaye', phone: '+221 76 987 32 11', email: 'fatou.ndiaye@yahoo.fr', submittedAt: 'Il y a 5h', docType: "Carte d'Identité", vehicle: 'Dacia Duster' },
  ],
  users: [
    { id: 'u-01', name: 'Moussa Diallo', role: 'driver', status: 'active', joined: '01/01/2026' },
    { id: 'u-02', name: 'Fatou Ndiaye', role: 'passenger', status: 'active', joined: '15/01/2026' },
    { id: 'u-03', name: 'Ibrahima Fall', role: 'driver', status: 'pending', joined: '20/02/2026' },
  ],
  liveDrivers: [
    { id: 'DRV-001', name: 'Ahmadou Bamba', lat: 14.7167, lng: -17.4677, status: 'active', route: 'Dakar → Touba' },
    { id: 'DRV-002', name: 'Fatou Ndiaye', lat: 14.7916, lng: -16.9362, status: 'active', route: 'Thiès → Saint-Louis' },
  ],
  auditLog: [
    { id: 'LOG-1', action: 'LOGIN', details: 'Super Admin s\'est connecté', timestamp: new Date().toISOString() },
  ],
};

async function request(endpoint, options = {}) {
  // INTERCEPTION MOCK EXPLICITE
  if (ENABLE_MOCKS) {
    console.warn(`[MOCK API] Intercepting ${endpoint}`);
    await new Promise(r => setTimeout(r, 400));

    if (endpoint === '/dashboard') {
      return {
        kycPending: MOCK_STORE.kycQueue.length,
        activeTrips: MOCK_STORE.liveDrivers.filter(d => d.status === 'active').length,
        totalUsers: MOCK_STORE.users.length,
        escrowTotal: MOCK_STORE.escrowTotal,
        recentActivity: MOCK_STORE.auditLog,
      };
    }

    if (endpoint === '/finance') {
      return {
        escrowTotal: MOCK_STORE.escrowTotal,
        commissionsTotal: MOCK_STORE.commissionsTotal,
        escrows: MOCK_STORE.escrows,
        transactions: MOCK_STORE.transactions,
      };
    }

    if (endpoint === '/kyc') return MOCK_STORE.kycQueue;
    if (endpoint === '/users') return MOCK_STORE.users;
    if (endpoint === '/finance/withdrawals') return MOCK_STORE.withdrawals;
    if (endpoint === '/trips/live') return MOCK_STORE.liveDrivers;

    return { success: true };
  }

  // FALLBACK REAL FETCH (ne devrait pas être atteint en démo)
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      ...options,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new ApiError(data?.error || `Erreur serveur (${res.status})`, res.status, data);
    }

    return data;
  } catch (err) {
    if (err.name === 'AbortError') throw new ApiError('Timeout', 408);
    if (err instanceof ApiError) throw err;
    throw new ApiError('Network Error', 0);
  } finally {
    clearTimeout(timeout);
  }
}

export const financeApi = {
  getAll: () => request('/finance'),
  release: (escrowId, pin) => request('/finance/release', { method: 'POST', body: JSON.stringify({ escrowId, pin }) }),
  refund: (escrowId) => request('/finance/refund', { method: 'POST', body: JSON.stringify({ escrowId }) }),
  compensate: (escrowId) => request('/finance/compensate', { method: 'POST', body: JSON.stringify({ escrowId }) }),
  getWithdrawals: () => request('/finance/withdrawals'),
  processWithdrawal: (withdrawalId, action) => request('/finance/withdrawals', { method: 'POST', body: JSON.stringify({ withdrawalId, action }) }),
};

export const kycApi = {
  getQueue: () => request('/kyc'),
  approve: (driverId) => request('/kyc/approve', { method: 'POST', body: JSON.stringify({ driverId }) }),
  reject: (driverId, reason) => request('/kyc/reject', { method: 'POST', body: JSON.stringify({ driverId, reason }) }),
};

export const usersApi = {
  getAll: () => request('/users'),
  ban: (userId) => request(`/users/${userId}/ban`, { method: 'POST' }),
  unban: (userId) => request(`/users/${userId}/unban`, { method: 'POST' }),
  delete: (userId) => request(`/users/${userId}`, { method: 'DELETE' }),
};

export const tripsApi = {
  getLiveDrivers: () => request('/trips/live'),
};

export const dashboardApi = {
  getStats: () => request('/dashboard'),
};

export { ApiError };
