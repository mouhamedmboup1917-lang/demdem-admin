/**
 * store.js — Store en mémoire serveur pour le mode démonstration.
 * Remplace localStorage pour les données mockées.
 * En production, remplacer par des requêtes Supabase/PostgreSQL.
 */

const store = {
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
    { id: 'WD-0038', driver: 'Mariama Diallo', phone: '+221 76 321 09 87', amount: 6500, method: 'OM', date: '24/03/2026 16:45', status: 'pending' },
  ],
  kycQueue: [
    {
      id: 1, name: 'Moussa Diallo', phone: '+221 77 412 56 34', email: 'moussa.diallo@gmail.com',
      submittedAt: 'Il y a 2h', docType: 'Permis de Conduire', issueDate: '14/03/2018', expiry: '14/03/2028',
      vehicle: 'Peugeot 308 · DK-3921-A', tripsCompleted: 0,
      docImage: '/docs/permis-placeholder.svg', vehicleImage: '/docs/vehicle-placeholder.svg',
    },
    {
      id: 2, name: 'Fatou Ndiaye', phone: '+221 76 987 32 11', email: 'fatou.ndiaye@yahoo.fr',
      submittedAt: 'Il y a 5h', docType: "Carte Nationale d'Identité", issueDate: '20/07/2022', expiry: '20/07/2032',
      vehicle: 'Dacia Duster · TH-1204-B', tripsCompleted: 0,
      docImage: '/docs/cni-placeholder.svg', vehicleImage: '/docs/vehicle-placeholder.svg',
    },
    {
      id: 3, name: 'Ousmane Sène', phone: '+221 70 234 89 56', email: 'ousmane_sene@outlook.com',
      submittedAt: 'Il y a 1 jour', docType: 'Permis de Conduire', issueDate: '11/09/2017', expiry: '11/09/2027',
      vehicle: 'Toyota Corolla · ZG-0087-C', tripsCompleted: 0,
      docImage: '/docs/permis-placeholder.svg', vehicleImage: '/docs/vehicle-placeholder.svg',
    },
  ],
  users: [
    { id: 'u-01', name: 'Moussa Diallo', phone: '+221 77 412 56 34', role: 'driver', verified: true, status: 'active', joined: '01/01/2026' },
    { id: 'u-02', name: 'Fatou Ndiaye', phone: '+221 76 987 32 11', role: 'passenger', verified: true, status: 'active', joined: '15/01/2026' },
    { id: 'u-03', name: 'Ousmane Sène', phone: '+221 70 234 89 56', role: 'driver', verified: false, status: 'pending', joined: '20/02/2026' },
    { id: 'u-04', name: 'Aïssatou Faye', phone: '+221 78 543 21 09', role: 'passenger', verified: true, status: 'banned', joined: '05/02/2026' },
    { id: 'u-05', name: 'Souleymane Fall', phone: '+221 77 765 43 21', role: 'driver', verified: true, status: 'active', joined: '10/03/2026' },
  ],
  liveDrivers: [
    { id: 'DRV-001', name: 'Ahmadou Bamba', phone: '+221 77 123 45 67', route: 'Dakar → Touba', status: 'active', lat: 14.7167, lng: -17.4677, progress: 45, pxCount: 3, maxPx: 4, car: 'Peugeot 308 · DK-3921-A', since: '1h 20m', tripId: 'TRJ-801', speed: 87 },
    { id: 'DRV-002', name: 'Fatou Ndiaye', phone: '+221 70 987 65 43', route: 'Thiès → Saint-Louis', status: 'active', lat: 14.7916, lng: -16.9362, progress: 12, pxCount: 2, maxPx: 4, car: 'Dacia Duster · TH-1204-B', since: '25m', tripId: 'TRJ-802', speed: 92 },
    { id: 'DRV-003', name: 'Ousmane Sène', phone: '+221 78 456 78 90', route: 'Ziguinchor → Dakar', status: 'active', lat: 12.5881, lng: -16.2723, progress: 68, pxCount: 4, maxPx: 4, car: 'Toyota Corolla · ZG-0087-C', since: '3h 05m', tripId: 'TRJ-803', speed: 105 },
    { id: 'DRV-004', name: 'Mariama Diallo', phone: '+221 76 321 09 87', route: 'Kaolack → Dakar', status: 'idle', lat: 14.1511, lng: -16.0726, progress: 0, pxCount: 0, maxPx: 5, car: 'Renault Logan · KL-2233-D', since: '-', tripId: null, speed: 0 },
    { id: 'DRV-005', name: 'Ibrahim Fall', phone: '+221 77 654 32 10', route: '-', status: 'offline', lat: 15.5592, lng: -14.2667, progress: 0, pxCount: 0, maxPx: 4, car: 'Hyundai i20 · SL-0554-E', since: '-', tripId: null, speed: 0 },
  ],
  auditLog: [],
};

/** Thread-safe simulated delay */
const delay = (ms) => new Promise(r => setTimeout(r, ms));

/** Unique ID generator */
const uid = () => `TX-${Math.floor(Math.random() * 90000) + 10000}`;
const dateNow = () => new Date().toLocaleString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

/** Audit log */
function logAction(action, details, admin = 'SUPER_ADMIN') {
  store.auditLog.unshift({
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString(),
    admin,
    action,
    details,
  });
}

// ═══ EXPORTS ═══

export function getFinanceState() {
  return {
    escrowTotal: store.escrowTotal,
    commissionsTotal: store.commissionsTotal,
    escrows: [...store.escrows],
    transactions: [...store.transactions],
  };
}

export function getWithdrawals() {
  return [...store.withdrawals];
}

export function processWithdrawal(id, action) {
  const w = store.withdrawals.find(w => w.id === id);
  if (!w) throw new Error('Retrait introuvable');
  if (w.status !== 'pending') throw new Error('Ce retrait a déjà été traité');
  w.status = action === 'validate' ? 'validated' : 'refused';
  logAction(action === 'validate' ? 'WITHDRAWAL_VALIDATED' : 'WITHDRAWAL_REFUSED', `${w.id} — ${w.amount} CFA → ${w.driver}`);
  return { ...w };
}

export function processRefund(escrowId) {
  const target = store.escrows.find(e => e.id === escrowId);
  if (!target) throw new Error('Escrow introuvable');
  store.escrowTotal -= target.price;
  store.escrows = store.escrows.filter(e => e.id !== escrowId);
  const tx = { id: uid(), date: dateNow(), type: 'Remboursement Voyageur', route: target.trip, driver: target.driver, amount: target.price, commission: 0, status: 'Remboursé' };
  store.transactions.unshift(tx);
  logAction('REFUND', `${escrowId} — ${target.price} CFA → ${target.passenger}`);
  return getFinanceState();
}

export function processRelease(escrowId, pin) {
  const target = store.escrows.find(e => e.id === escrowId);
  if (!target) throw new Error('Escrow introuvable');
  if (target.pin !== pin) throw new Error('Code PIN incorrect');
  const comm = target.price * 0.10;
  store.escrowTotal -= target.price;
  store.commissionsTotal += comm;
  store.escrows = store.escrows.filter(e => e.id !== escrowId);
  const tx = { id: uid(), date: dateNow(), type: 'Paiement Validé (PIN)', route: target.trip, driver: target.driver, amount: target.price, commission: comm, status: 'Succès' };
  store.transactions.unshift(tx);
  logAction('RELEASE_PIN', `${escrowId} — PIN validé — ${target.price} CFA`);
  return getFinanceState();
}

export function processCompensation(escrowId) {
  const target = store.escrows.find(e => e.id === escrowId);
  if (!target) throw new Error('Escrow introuvable');
  const comm = target.price * 0.30;
  store.escrowTotal -= target.price;
  store.commissionsTotal += comm;
  store.escrows = store.escrows.filter(e => e.id !== escrowId);
  const tx = { id: uid(), date: dateNow(), type: 'Dédommagement Conducteur', route: target.trip, driver: target.driver, amount: target.price, commission: comm, status: 'Succès' };
  store.transactions.unshift(tx);
  logAction('COMPENSATE', `${escrowId} — 30% DemDem — ${target.price} CFA`);
  return getFinanceState();
}

export function getKycQueue() { return [...store.kycQueue]; }
export function approveDriver(id) {
  const d = store.kycQueue.find(d => d.id === id);
  if (!d) throw new Error('Conducteur introuvable');
  store.kycQueue = store.kycQueue.filter(d => d.id !== id);
  logAction('KYC_APPROVED', `${d.name} — ${d.phone}`);
  return getKycQueue();
}
export function rejectDriver(id, reason) {
  const d = store.kycQueue.find(d => d.id === id);
  if (!d) throw new Error('Conducteur introuvable');
  store.kycQueue = store.kycQueue.filter(d => d.id !== id);
  logAction('KYC_REJECTED', `${d.name} — Motif: ${reason}`);
  return getKycQueue();
}

export function getUsers() { return [...store.users]; }
export function banUser(id) {
  const u = store.users.find(u => u.id === id);
  if (!u) throw new Error('Utilisateur introuvable');
  u.status = 'banned';
  logAction('USER_BANNED', `${u.name}`);
  return [...store.users];
}
export function unbanUser(id) {
  const u = store.users.find(u => u.id === id);
  if (!u) throw new Error('Utilisateur introuvable');
  u.status = 'active';
  logAction('USER_UNBANNED', `${u.name}`);
  return [...store.users];
}
export function deleteUser(id) {
  const u = store.users.find(u => u.id === id);
  if (!u) throw new Error('Utilisateur introuvable');
  store.users = store.users.filter(u => u.id !== id);
  logAction('USER_DELETED', `${u.name}`);
  return [...store.users];
}

export function getLiveDrivers() {
  // Simulate realistic position updates along routes
  store.liveDrivers.forEach(d => {
    if (d.status !== 'active') return;
    d.progress = Math.min(d.progress + 0.15, 99.9);
    // Small realistic movement along latitude
    d.lat += 0.0003;
    d.speed = Math.max(70, Math.min(110, d.speed + (Math.random() - 0.5) * 4));
  });
  return store.liveDrivers.map(d => ({ ...d }));
}

export function getDashboardStats() {
  return {
    kycPending: store.kycQueue.length,
    activeTrips: store.liveDrivers.filter(d => d.status === 'active').length,
    totalUsers: store.users.length,
    escrowTotal: store.escrowTotal,
    recentActivity: store.auditLog.slice(0, 8),
  };
}
