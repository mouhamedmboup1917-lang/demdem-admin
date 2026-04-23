/**
 * api.js — Couche d'accès backend centralisée.
 * 
 * Ce fichier a été modifié pour supporter le mode "Static Export" (GitHub Pages).
 * Puisque les API routes Next.js (/api/*) ne fonctionnent pas en export statique,
 * nous utilisons des simulations côté client (MOCKS) lorsque nous détectons
 * un environnement d'hébergement statique.
 */
'use client';

const API_BASE = '/api';
const TIMEOUT_MS = 12000;

// Detection de l'environnement GitHub Pages (ou autre export statique)
const IS_STATIC_EXPORT = typeof window !== 'undefined' && 
  (window.location.hostname.includes('github.io') || window.location.port === '5000');

class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// ─── SIMULATION DATA (STORE LOCAL) ───────────────────────────────────────────
// Utilisé uniquement en mode IS_STATIC_EXPORT
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
    { id: 'WD-0039', driver: 'Ousmane Sène', phone: '+221 78 456 78 90', amount: 23000, method: 'Wave', date: '25/03/2026 09:14', status: 'refused' },
  ],
  kycQueue: [
    {
      id: 1, name: 'Moussa Diallo', phone: '+221 77 412 56 34', email: 'moussa.diallo@gmail.com',
      submittedAt: 'Il y a 2h', docType: 'Permis de Conduire', issueDate: '14/03/2018', expiry: '14/03/2018',
      vehicle: 'Peugeot 308 · DK-3921-A', docImage: '/docs/permis-placeholder.svg',
    },
    {
      id: 2, name: 'Fatou Ndiaye', phone: '+221 76 987 32 11', email: 'fatou.ndiaye@yahoo.fr',
      submittedAt: 'Il y a 5h', docType: "Carte Nationale d'Identité", vehicle: 'Dacia Duster · TH-1204-B',
    }
  ],
  users: [
    { id: 'u-01', name: 'Moussa Diallo', phone: '+221 77 412 56 34', role: 'driver', verified: true, status: 'active', joined: '01/01/2026' },
    { id: 'u-02', name: 'Fatou Ndiaye', phone: '+221 76 987 32 11', role: 'passenger', verified: true, status: 'active', joined: '15/01/2026' },
  ],
  liveDrivers: [
    { id: 'DRV-001', name: 'Ahmadou Bamba', lat: 14.7167, lng: -17.4677, status: 'active' },
    { id: 'DRV-002', name: 'Fatou Ndiaye', lat: 14.7916, lng: -16.9362, status: 'active' },
  ],
  auditLog: [],
};

/**
 * Fetch wrapper avec timeout, error handling, et JSON parse.
 */
async function request(endpoint, options = {}) {
  // S'il s'agit d'un export statique, on intercepte et on renvoie le mock
  if (IS_STATIC_EXPORT) {
    console.warn(`[MOCK API] Intercepting request to ${endpoint}`);
    await new Promise(r => setTimeout(r, 600)); // Simuler latence

    if (endpoint === '/dashboard') {
      return {
        kycPending: MOCK_STORE.kycQueue.length,
        activeTrips: MOCK_STORE.liveDrivers.filter(d => d.status === 'active').length,
        totalUsers: MOCK_STORE.users.length,
        escrowTotal: MOCK_STORE.escrowTotal,
        recentActivity: MOCK_STORE.auditLog.slice(0, 8),
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

    // Fallback pour les POST/actions
    return { success: true };
  }

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
      throw new ApiError(
        data?.error || `Erreur serveur (${res.status})`,
        res.status,
        data
      );
    }

    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new ApiError('La requête a expiré. Vérifiez votre connexion.', 408);
    }
    if (err instanceof ApiError) throw err;
    throw new ApiError('Impossible de joindre le serveur.', 0);
  } finally {
    clearTimeout(timeout);
  }
}

// ─── API EXPORTS (inchangés pour ne pas casser les composants) ────────────────

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
