'use client';

const PRODUCTION_DB_STATE = {
    escrowTotal: 17000,
    commissionsTotal: 142500,
    escrows: [
        { id: 'esc-001', trip: 'Dakar → Thiès', driver: 'Moussa D.', passenger: 'Awa N.', price: 2500, date: '10/03/2026', hoursElapsed: 26, paymentMethod: 'Wave', reason: 'Conducteur en retard' },
        { id: 'esc-002', trip: 'Saint-Louis → Dakar', driver: 'Fatou N.', passenger: 'Ibrahima Fall', price: 5500, date: '11/03/2026', hoursElapsed: 4, paymentMethod: 'OM', reason: null },
        { id: 'esc-003', trip: 'Dakar → Ziguinchor', driver: 'Ousmane S.', passenger: 'Coumba K.', price: 9000, date: '09/03/2026', hoursElapsed: 48, paymentMethod: 'Wave', reason: 'Ne s\'est pas présenté(e)' },
    ],
    transactions: [
        { id: 'TX-9021', date: '11 Mars 2026, 14:30', type: 'Trajet Complété', route: 'Dakar → Saint-Louis', driver: 'Moussa Cissé', amount: 15000, commission: 1500, status: 'Succès' },
        { id: 'TX-9022', date: '11 Mars 2026, 10:15', type: 'Abonnement Premium (Driver)', route: '-', driver: 'Awa Diop', amount: 5000, commission: 5000, status: 'Succès' }
    ],
    activeTrips: [
        { id: 'TRJ-801', driver: 'Ahmadou Bamba', phone: '+221 77 123 45 67', route: 'Dakar → Touba', progress: 45, pxCount: 3, maxPx: 4, car: 'Peugeot 308', since: '1h 20m' },
        { id: 'TRJ-802', driver: 'Fatou Ndiaye', phone: '+221 70 987 65 43', route: 'Thiès → Saint-Louis', progress: 12, pxCount: 2, maxPx: 4, car: 'Dacia Duster', since: '25m' }
    ]
};

/** Simulate network delay */
const delay = (ms) => new Promise(r => setTimeout(r, ms));

/**
 * Initializes and fetches the simulated database from localStorage.
 */
export async function fetchDatabase() {
    await delay(600);
    if (typeof window === 'undefined') return PRODUCTION_DB_STATE;

    const raw = localStorage.getItem('demdem_prod_db_v3');
    if (!raw) {
        localStorage.setItem('demdem_prod_db_v3', JSON.stringify(PRODUCTION_DB_STATE));
        return PRODUCTION_DB_STATE;
    }
    return JSON.parse(raw);
}

/**
 * Persists the database object to localStorage.
 */
function saveDatabase(db) {
    if (typeof window !== 'undefined') {
        localStorage.setItem('demdem_prod_db_v3', JSON.stringify(db));
    }
}

/**
 * Processes a refund for an escrow transaction.
 * Decreases Escrow Total, adds a "Remboursement" to Transactions, removes from escrows.
 */
export async function processRefund(escrowId) {
    await delay(800);
    const db = await fetchDatabase();

    const target = db.escrows.find(e => e.id === escrowId);
    if (!target) throw new Error('Escrow introuvable');

    // 1. Differentiate action on totals
    db.escrowTotal -= target.price;
    // Commision is 0 on full refund

    // 2. Remove escrow
    db.escrows = db.escrows.filter(e => e.id !== escrowId);

    // 3. Add to transactions history
    const newTx = {
        id: `TX-${Math.floor(Math.random() * 90000) + 10000}`,
        date: new Date().toLocaleString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        type: 'Remboursement Voyageur',
        route: target.trip,
        driver: target.driver,
        amount: target.price,
        commission: 0,
        status: 'Remboursé'
    };
    db.transactions = [newTx, ...db.transactions];

    saveDatabase(db);
    return db;
}

/**
 * Processes compensation for the driver.
 * Driver receives 70%, DemDem takes 30%.
 */
export async function processDriverCompensation(escrowId) {
    await delay(800);
    const db = await fetchDatabase();

    const target = db.escrows.find(e => e.id === escrowId);
    if (!target) throw new Error('Escrow introuvable');

    const demdemComm = target.price * 0.30; // 30% retention penalty

    // 1. Update totals
    db.escrowTotal -= target.price;
    db.commissionsTotal += demdemComm;

    // 2. Remove escrow
    db.escrows = db.escrows.filter(e => e.id !== escrowId);

    // 3. Add to transactions history
    const newTx = {
        id: `TX-${Math.floor(Math.random() * 90000) + 10000}`,
        date: new Date().toLocaleString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        type: 'Dédommagement Conducteur',
        route: target.trip,
        driver: target.driver,
        amount: target.price,
        commission: demdemComm,
        status: 'Succès'
    };
    db.transactions = [newTx, ...db.transactions];

    saveDatabase(db);
    return db;
}

/**
 * Processes a forced payment (success) release for an escrow transaction.
 * Decreases Escrow Total, adds DemDem Commission (10%), adds a "Paiement Forcé" to Transactions.
 * Driver receives 90%.
 */
export async function processRelease(escrowId) {
    await delay(800);
    const db = await fetchDatabase();

    const target = db.escrows.find(e => e.id === escrowId);
    if (!target) throw new Error('Escrow introuvable');

    const demdemComm = target.price * 0.10;

    // 1. Update totals
    db.escrowTotal -= target.price;
    db.commissionsTotal += demdemComm;

    // 2. Remove escrow
    db.escrows = db.escrows.filter(e => e.id !== escrowId);

    // 3. Add to transactions history
    const newTx = {
        id: `TX-${Math.floor(Math.random() * 90000) + 10000}`,
        date: new Date().toLocaleString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        type: 'Paiement Forcé (Admin)',
        route: target.trip,
        driver: target.driver,
        amount: target.price,
        commission: demdemComm,
        status: 'Succès'
    };
    db.transactions = [newTx, ...db.transactions];

    saveDatabase(db);
    return db;
}

