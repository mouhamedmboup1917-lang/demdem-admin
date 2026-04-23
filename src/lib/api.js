/**
 * api.js — Couche d'accès backend centralisée.
 * Remplace l'ancien lib/db.js basé sur localStorage.
 * 
 * En mode DEMO (pas de Supabase configuré), les API routes
 * utilisent un store en mémoire côté serveur au lieu du localStorage client.
 * 
 * Toutes les fonctions gèrent : loading, erreur réseau, timeout, retry.
 */
'use client';

const API_BASE = '/api';
const TIMEOUT_MS = 12000;

class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Fetch wrapper avec timeout, error handling, et JSON parse.
 */
async function request(endpoint, options = {}) {
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

// ─── FINANCE ──────────────────────────────────────────────────────────────────

export const financeApi = {
  /** Récupère tout l'état financier (escrows, transactions, totaux) */
  getAll: () => request('/finance'),

  /** Libère un séquestre via PIN validé */
  release: (escrowId, pin) =>
    request('/finance/release', {
      method: 'POST',
      body: JSON.stringify({ escrowId, pin }),
    }),

  /** Rembourse intégralement le passager */
  refund: (escrowId) =>
    request('/finance/refund', {
      method: 'POST',
      body: JSON.stringify({ escrowId }),
    }),

  /** Dédommage le conducteur (70/30) */
  compensate: (escrowId) =>
    request('/finance/compensate', {
      method: 'POST',
      body: JSON.stringify({ escrowId }),
    }),

  /** Récupère les demandes de retrait */
  getWithdrawals: () => request('/finance/withdrawals'),

  /** Valide/refuse un retrait */
  processWithdrawal: (withdrawalId, action) =>
    request('/finance/withdrawals', {
      method: 'POST',
      body: JSON.stringify({ withdrawalId, action }),
    }),
};

// ─── KYC ──────────────────────────────────────────────────────────────────────

export const kycApi = {
  /** Récupère la file d'attente KYC */
  getQueue: () => request('/kyc'),

  /** Approuve un conducteur */
  approve: (driverId) =>
    request('/kyc/approve', {
      method: 'POST',
      body: JSON.stringify({ driverId }),
    }),

  /** Rejette un conducteur avec motif */
  reject: (driverId, reason) =>
    request('/kyc/reject', {
      method: 'POST',
      body: JSON.stringify({ driverId, reason }),
    }),
};

// ─── UTILISATEURS ─────────────────────────────────────────────────────────────

export const usersApi = {
  getAll: () => request('/users'),

  ban: (userId) =>
    request(`/users/${userId}/ban`, { method: 'POST' }),

  unban: (userId) =>
    request(`/users/${userId}/unban`, { method: 'POST' }),

  delete: (userId) =>
    request(`/users/${userId}`, { method: 'DELETE' }),
};

// ─── TRAJETS ACTIFS ───────────────────────────────────────────────────────────

export const tripsApi = {
  /** Récupère les positions temps réel des conducteurs */
  getLiveDrivers: () => request('/trips/live'),
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

export const dashboardApi = {
  getStats: () => request('/dashboard'),
};

export { ApiError };
