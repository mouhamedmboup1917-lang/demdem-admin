/**
 * api.js — Couche d'accès backend centralisée.
 * 
 * Version FINAL-DEBUG pour GitHub Pages.
 */
'use client';

const isClient = typeof window !== 'undefined';
const isGitHubPages = isClient && window.location.hostname.includes('github.io');

// FORCE MOCK MODE ALWAYS FOR DEMO
const ENABLE_MOCKS = true; 

console.log('[DEMDEM-API] Initializing...', { isGitHubPages, ENABLE_MOCKS });

class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const MOCK_STORE = {
  escrowTotal: 17500,
  commissionsTotal: 142500,
  escrows: [
    { id: 'esc-001', trip: 'Dakar → Thiès', driver: 'Moussa D.', passenger: 'Awa N.', price: 2500, date: '10/03/2026', hoursElapsed: 26, paymentMethod: 'Wave', pin: '7291' },
    { id: 'esc-002', trip: 'Saint-Louis → Dakar', driver: 'Fatou N.', passenger: 'Ibrahima F.', price: 5500, date: '11/03/2026', hoursElapsed: 4, paymentMethod: 'OM', pin: '4058' },
    { id: 'esc-003', trip: 'Dakar → Somone', driver: 'Ousmane S.', passenger: 'Coumba K.', price: 9500, date: '12/03/2026', hoursElapsed: 1, paymentMethod: 'Wave', pin: '1563' },
  ],
  transactions: [
    { id: 'TX-9021', date: '11 Mars 2026', type: 'Trajet Complété', route: 'Dakar → Saint-Louis', driver: 'Moussa Cissé', amount: 15000, commission: 1500, status: 'Succès' },
  ],
  withdrawals: [
    { id: 'WD-0041', driver: 'Ahmadou Bamba', phone: '+221 77 123 45 67', amount: 12500, method: 'Wave', date: '26/03/2026', status: 'pending' },
  ],
  kycQueue: [
    { id: 1, name: 'Moussa Diallo', phone: '+221 77 412 56 34', submittedAt: 'Il y a 2h', docType: 'Permis', vehicle: 'Peugeot 308' },
    { id: 2, name: 'Fatou Ndiaye', phone: '+221 76 987 32 11', submittedAt: 'Il y a 5h', docType: 'CNI', vehicle: 'Dacia Duster' },
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
    { id: 'LOG-1', action: 'LOGIN', details: 'Super Admin connecté', timestamp: new Date().toISOString() },
  ],
};

async function request(endpoint, options = {}) {
  // Use lower case and strip possible base paths for comparison
  const normalizedPath = endpoint.toLowerCase();

  if (ENABLE_MOCKS) {
    console.warn(`[MOCK API] Handing request to: ${endpoint}`);
    await new Promise(r => setTimeout(r, 300)); // Latence réaliste

    if (normalizedPath.includes('dashboard')) {
      return {
        kycPending: MOCK_STORE.kycQueue.length,
        activeTrips: MOCK_STORE.liveDrivers.length,
        totalUsers: MOCK_STORE.users.length,
        escrowTotal: MOCK_STORE.escrowTotal,
        recentActivity: MOCK_STORE.auditLog,
      };
    }

    if (normalizedPath.includes('finance/withdrawals')) return MOCK_STORE.withdrawals;
    if (normalizedPath.includes('finance')) {
      return {
        escrowTotal: MOCK_STORE.escrowTotal,
        commissionsTotal: MOCK_STORE.commissionsTotal,
        escrows: MOCK_STORE.escrows,
        transactions: MOCK_STORE.transactions,
      };
    }

    if (normalizedPath.includes('kyc')) return MOCK_STORE.kycQueue;
    if (normalizedPath.includes('users')) return MOCK_STORE.users;
    if (normalizedPath.includes('trips/live')) return MOCK_STORE.liveDrivers;

    return { success: true };
  }

  // Real fetch (should be disabled for now)
  const res = await fetch(`/api${endpoint}`, { ...options });
  if (!res.ok) throw new ApiError(`Error ${res.status}`, res.status);
  return res.json();
}

export const financeApi = {
  getAll: () => request('/finance'),
  release: (id, pin) => request('/finance/release', { method: 'POST', body: JSON.stringify({ id, pin }) }),
  refund: (id) => request('/finance/refund', { method: 'POST', body: JSON.stringify({ id }) }),
  compensate: (id) => request('/finance/compensate', { method: 'POST', body: JSON.stringify({ id }) }),
  getWithdrawals: () => request('/finance/withdrawals'),
  processWithdrawal: (id, action) => request('/finance/withdrawals', { method: 'POST', body: JSON.stringify({ id, action }) }),
};

export const kycApi = {
  getQueue: () => request('/kyc'),
  approve: (id) => request('/kyc/approve', { method: 'POST', body: JSON.stringify({ id }) }),
  reject: (id, reason) => request('/kyc/reject', { method: 'POST', body: JSON.stringify({ id, reason }) }),
};

export const usersApi = {
  getAll: () => request('/users'),
  ban: (id) => request(`/users/${id}/ban`, { method: 'POST' }),
  unban: (id) => request(`/users/${id}/unban`, { method: 'POST' }),
  delete: (id) => request(`/users/${id}`, { method: 'DELETE' }),
};

export const tripsApi = {
  getLiveDrivers: () => request('/trips/live'),
};

export const dashboardApi = {
  getStats: () => request('/dashboard'),
};

export { ApiError };
