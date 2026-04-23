'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  RotateCw, Scale, Wallet, AlertTriangle, Zap, Undo2, CheckCircle2,
  ArrowDownToLine, Clock, XCircle, DollarSign, TrendingUp, Shield, KeyRound, Send
} from 'lucide-react';
import { useRole } from '@/context/RoleContext';
import ConfirmModal from '@/components/ConfirmModal';
import ErrorState from '@/components/ErrorState';
import { SkeletonKpi, SkeletonTable } from '@/components/Skeleton';
import { financeApi } from '@/lib/api';

const W_STATUS = {
  pending:   { label: 'En attente', color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: Clock        },
  validated: { label: 'Validé',     color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: CheckCircle2 },
  refused:   { label: 'Refusé',     color: '#ef4444', bg: '#fef2f2', border: '#fecaca', icon: XCircle      },
};
const METHOD_STYLE = { Wave: 'bg-[#e0f2fe] text-[#0284c7]', OM: 'bg-[#ffedd5] text-[#c2410c]' };

export default function FinancePage() {
  const { role } = useRole();
  const [tab, setTab] = useState('escrow');

  // ── Data states ──
  const [finance, setFinance]       = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // ── Action guards ──
  const [actionLoading, setActionLoading] = useState(false);
  const actionLockRef = useRef(false); // Mutex pour empêcher double-clic

  // ── Modals ──
  const [modal, setModal] = useState({ isOpen: false, type: null, escrowId: null });
  const [pinModal, setPinModal] = useState({ isOpen: false, escrowId: null });
  const [pinDigits, setPinDigits] = useState(['', '', '', '']);
  const [pinError, setPinError]   = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);

  // ── Data loading ──
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [finData, wdData] = await Promise.all([
        financeApi.getAll(),
        financeApi.getWithdrawals(),
      ]);
      setFinance(finData);
      setWithdrawals(wdData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Access guard ──
  if (role !== 'SUPER_ADMIN') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#94a3b8] font-semibold">Accès restreint au rôle SUPER_ADMIN.</p>
      </div>
    );
  }

  // ── Toast helper ──
  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // ── Escrow action (with mutex) ──
  const handleAction = async () => {
    if (actionLockRef.current) return;
    actionLockRef.current = true;
    setActionLoading(true);
    try {
      let result;
      if (modal.type === 'compensate') {
        result = await financeApi.compensate(modal.escrowId);
        showSuccess('Dédommagement envoyé au conducteur (30% retenus).');
      } else if (modal.type === 'release') {
        result = await financeApi.release(modal.escrowId, pinDigits.join(''));
        showSuccess('Paiement libéré avec succès.');
      } else if (modal.type === 'refund') {
        result = await financeApi.refund(modal.escrowId);
        showSuccess('Remboursement passager effectué.');
      }
      if (result) setFinance(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoading(false);
      actionLockRef.current = false;
      setModal({ isOpen: false, type: null, escrowId: null });
    }
  };

  // ── PIN validation (via API) ──
  const handlePinSubmit = async () => {
    if (pinLoading) return;
    setPinLoading(true);
    setPinError('');
    try {
      const result = await financeApi.release(pinModal.escrowId, pinDigits.join(''));
      setPinSuccess(true);
      setFinance(result);
      showSuccess('PIN validé — Paiement libéré.');
      setTimeout(() => {
        setPinModal({ isOpen: false, escrowId: null });
        setPinDigits(['', '', '', '']);
        setPinSuccess(false);
      }, 1200);
    } catch (e) {
      setPinError(e.message || 'Code incorrect. Réessayez.');
      setPinDigits(['', '', '', '']);
      // Focus first input
      setTimeout(() => document.getElementById('pin-admin-0')?.focus(), 100);
    } finally {
      setPinLoading(false);
    }
  };

  // ── Withdrawal action ──
  const handleWithdrawalAction = async (id, action) => {
    if (actionLockRef.current) return;
    actionLockRef.current = true;
    try {
      await financeApi.processWithdrawal(id, action);
      setWithdrawals(prev => prev.map(w =>
        w.id === id ? { ...w, status: action === 'validate' ? 'validated' : 'refused' } : w
      ));
      showSuccess(action === 'validate' ? 'Retrait validé et envoyé.' : 'Retrait refusé.');
    } catch (e) {
      setError(e.message);
    } finally {
      actionLockRef.current = false;
    }
  };

  const targetEscrow = finance?.escrows?.find(e => e.id === modal.escrowId);

  const TABS = [
    { key: 'escrow',   label: 'Séquestres',  icon: Scale           },
    { key: 'withdraw', label: 'Retraits',     icon: ArrowDownToLine },
    { key: 'history',  label: 'Historique',   icon: TrendingUp      },
  ];

  return (
    <div className="pb-10 animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#1a1917] tracking-tight mb-1">Finance & Séquestres</h1>
          <p className="text-[#64748b] font-medium">Flux financiers, retraits et libération sécurisée des fonds via PIN.</p>
        </div>
        <button
          onClick={loadData} disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#e4ddd1] bg-white text-sm font-semibold text-[#64748b] hover:bg-[#f8fafc] disabled:opacity-50 transition-colors active:scale-95"
        >
          <RotateCw size={15} className={loading ? 'animate-spin' : ''} /> Actualiser
        </button>
      </div>

      {/* Toast succès */}
      {successMsg && (
        <div className="mb-6 animate-fade-in flex items-center gap-3 px-5 py-3 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] text-[#16a34a] font-bold shadow-sm">
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      {/* ── ERROR STATE ── */}
      {error && !loading && (
        <div className="mb-6 animate-fade-in flex items-center gap-3 px-5 py-3 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-[#ef4444] font-bold shadow-sm">
          <AlertTriangle size={18} /> {error}
          <button onClick={() => setError(null)} className="ml-auto text-xs font-medium hover:underline">Fermer</button>
        </div>
      )}

      {/* ── LOADING (Skeleton) ── */}
      {loading ? (
        <div className="space-y-8">
          <SkeletonKpi count={4} />
          <SkeletonTable rows={3} cols={6} />
        </div>
      ) : !finance ? (
        <ErrorState message={error || 'Données indisponibles'} onRetry={loadData} />
      ) : (
        <>
          {/* ── Stats KPI ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'En Séquestre', value: finance.escrowTotal?.toLocaleString('fr-FR') + ' CFA', color: '#d97706', bg: 'from-[#fffbeb] to-[#fef3c7]', border: '#fde68a', icon: Scale },
              { label: 'Commissions', value: finance.commissionsTotal?.toLocaleString('fr-FR') + ' CFA', color: '#1a1917', bg: 'from-white to-[#f7f6f3]', border: '#e7e5e0', icon: Wallet },
              { label: 'Retraits', value: withdrawals.filter(w => w.status === 'pending').length + ' en attente', color: '#7c3aed', bg: 'from-[#f5f3ff] to-[#ede9fe]', border: '#ddd6fe', icon: ArrowDownToLine },
              { label: 'Transactions', value: finance.transactions?.length + ' ce mois', color: '#3b82f6', bg: 'from-[#eff6ff] to-[#dbeafe]', border: '#bfdbfe', icon: DollarSign },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className={`bg-gradient-to-br ${s.bg} border rounded-2xl p-5`} style={{ borderColor: s.border }}>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-3 opacity-60" style={{ color: s.color }}>
                    <Icon size={14} /> {s.label}
                  </div>
                  <div className="font-black text-xl tracking-tight" style={{ color: s.color }}>{s.value}</div>
                </div>
              );
            })}
          </div>

          {/* ── Tabs ── */}
          <div className="flex gap-1 mb-6 bg-[#f7f6f3] p-1 rounded-xl w-fit border border-[#e7e5e0]">
            {TABS.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === t.key ? 'bg-white text-[#1a1917] shadow-sm' : 'text-[#78716c] hover:text-[#1a1917]'}`}
                >
                  <Icon size={15} /> {t.label}
                </button>
              );
            })}
          </div>

          {/* ═══ ONGLET SÉQUESTRES ═══ */}
          {tab === 'escrow' && (
            <div className="bg-white border border-[#e4ddd1] rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse min-w-[950px]">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#64748b] text-xs font-bold uppercase tracking-wider">
                      <th className="px-5 py-4">ID</th>
                      <th className="px-5 py-4">Trajet</th>
                      <th className="px-5 py-4">Conducteur / Voyageur</th>
                      <th className="px-5 py-4">Montant</th>
                      <th className="px-5 py-4">Statut</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {finance.escrows?.length === 0 ? (
                      <tr><td colSpan={6} className="px-5 py-12 text-center text-[#94a3b8] font-medium">Aucun séquestre actif. 🎉</td></tr>
                    ) : finance.escrows?.map(escrow => {
                      const isExpired = escrow.hoursElapsed >= 24;
                      return (
                        <tr key={escrow.id} className="hover:bg-[#fdfbf7] transition-colors">
                          <td className="px-5 py-4 font-mono text-xs text-[#94a3b8] font-bold">{escrow.id}</td>
                          <td className="px-5 py-4 font-semibold text-[#1a1917]">{escrow.trip}</td>
                          <td className="px-5 py-4">
                            <div className="text-sm font-semibold text-[#1a1917]">🚗 {escrow.driver}</div>
                            <div className="text-xs text-[#78716c] font-medium">👤 {escrow.passenger}</div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-black text-[#d97706]">{escrow.price.toLocaleString('fr-FR')} CFA</span>
                            {escrow.paymentMethod && (
                              <span className={`ml-2 text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded ${METHOD_STYLE[escrow.paymentMethod] || ''}`}>
                                {escrow.paymentMethod}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            {isExpired ? (
                              <span className="flex items-center gap-1 text-xs font-bold text-[#ef4444] bg-[#fef2f2] border border-[#fecaca] px-2.5 py-1 rounded-full w-fit">
                                <AlertTriangle size={11} /> Litige · {escrow.hoursElapsed}h
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-[#10b981] bg-[#f0fdf4] border border-[#bbf7d0] px-2.5 py-1 rounded-full text-xs font-bold w-fit">
                                <CheckCircle2 size={11} /> {escrow.hoursElapsed}h
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button disabled={actionLoading}
                                onClick={() => setModal({ isOpen: true, type: 'refund', escrowId: escrow.id })}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-[#e4ddd1] text-[#64748b] hover:text-[#ef4444] hover:bg-[#fef2f2] hover:border-[#fca5a5] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <Undo2 size={13} /> Rembourser
                              </button>
                              <button disabled={actionLoading}
                                onClick={() => { setPinModal({ isOpen: true, escrowId: escrow.id }); setPinDigits(['','','','']); setPinError(''); setPinSuccess(false); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#eff6ff] border border-[#bfdbfe] text-[#3b82f6] hover:bg-[#dbeafe] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <KeyRound size={13} /> PIN
                              </button>
                              <button disabled={!isExpired || actionLoading}
                                onClick={() => setModal({ isOpen: true, type: 'compensate', escrowId: escrow.id })}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${isExpired ? 'text-white bg-gradient-to-r from-[#d97706] to-[#b48c40] shadow-sm hover:brightness-105' : 'text-[#94a3b8] bg-[#f1f5f9]'}`}
                              >
                                <Zap size={13} /> {isExpired ? 'Dédommager' : 'En attente'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 bg-[#f7f6f3] rounded-b-2xl border-t border-[#e7e5e0] text-xs text-[#78716c]">
                <Shield size={12} className="inline mr-1 text-[#d97706]" />
                PIN = validation mobile. Dédommagement = 30% DemDem. Remboursement = 100% passager.
              </div>
            </div>
          )}

          {/* ═══ ONGLET RETRAITS ═══ */}
          {tab === 'withdraw' && (
            <div className="bg-white border border-[#e4ddd1] rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#f1f5f9] flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-[#1a1917]">Demandes de retrait</h2>
                  <p className="text-xs text-[#94a3b8] font-medium mt-0.5">Wave · Orange Money · Validation requise</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#fffbeb] border border-[#fde68a] text-[#d97706] text-xs font-bold">
                  {withdrawals.filter(w => w.status === 'pending').length} en attente
                </span>
              </div>
              <div className="divide-y divide-[#f1f5f9]">
                {withdrawals.length === 0 ? (
                  <div className="py-12 text-center text-[#94a3b8] font-medium">Aucune demande de retrait.</div>
                ) : withdrawals.map(w => {
                  const cfg = W_STATUS[w.status];
                  const StatusIcon = cfg.icon;
                  return (
                    <div key={w.id} className="flex flex-wrap items-center gap-4 px-6 py-4 hover:bg-[#fdfbf7] transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-[180px]">
                        <div className="w-9 h-9 rounded-full bg-[#e7e5e0] flex items-center justify-center font-bold text-[#44403c] text-sm flex-shrink-0">
                          {w.driver.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-[#1a1917] text-sm">{w.driver}</p>
                          <p className="text-xs text-[#78716c]">{w.phone}</p>
                        </div>
                      </div>
                      <div className="min-w-[120px]">
                        <p className="font-black text-[#1a1917] text-base">{w.amount.toLocaleString('fr-FR')} CFA</p>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${METHOD_STYLE[w.method] || ''}`}>{w.method}</span>
                      </div>
                      <div className="text-xs text-[#94a3b8] font-medium min-w-[140px]">
                        <Clock size={11} className="inline mr-1" />{w.date}
                      </div>
                      <div>
                        <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border"
                          style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}>
                          <StatusIcon size={12} /> {cfg.label}
                        </span>
                      </div>
                      {w.status === 'pending' && (
                        <div className="flex gap-2 ml-auto">
                          <button disabled={actionLockRef.current}
                            onClick={() => handleWithdrawalAction(w.id, 'validate')}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#d97706] to-[#b48c40] hover:brightness-105 active:scale-95 transition-all disabled:opacity-40"
                          >
                            <Send size={12} /> Valider & Envoyer
                          </button>
                          <button disabled={actionLockRef.current}
                            onClick={() => handleWithdrawalAction(w.id, 'refuse')}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#ef4444] bg-[#fef2f2] border border-[#fecaca] hover:bg-[#fee2e2] active:scale-95 transition-all disabled:opacity-40"
                          >
                            <XCircle size={12} /> Refuser
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══ ONGLET HISTORIQUE ═══ */}
          {tab === 'history' && (
            <div className="bg-white border border-[#e4ddd1] rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#64748b] text-xs font-bold uppercase tracking-wider">
                      <th className="px-5 py-4">ID Tx</th>
                      <th className="px-5 py-4">Date</th>
                      <th className="px-5 py-4">Type</th>
                      <th className="px-5 py-4">Trajet / Conducteur</th>
                      <th className="px-5 py-4">Montant</th>
                      <th className="px-5 py-4">Commission</th>
                      <th className="px-5 py-4">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {finance.transactions?.length === 0 ? (
                      <tr><td colSpan={7} className="px-5 py-12 text-center text-[#94a3b8]">Aucune transaction.</td></tr>
                    ) : finance.transactions?.map(tx => (
                      <tr key={tx.id} className="hover:bg-[#fdfbf7] transition-colors">
                        <td className="px-5 py-4 font-mono text-xs text-[#94a3b8] font-bold">{tx.id}</td>
                        <td className="px-5 py-4 text-xs text-[#78716c] font-medium">{tx.date}</td>
                        <td className="px-5 py-4 text-sm font-semibold text-[#44403c]">{tx.type}</td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-[#1a1917]">{tx.route}</p>
                          <p className="text-xs text-[#78716c]">{tx.driver}</p>
                        </td>
                        <td className="px-5 py-4 font-black text-[#d97706]">{tx.amount?.toLocaleString('fr-FR')} CFA</td>
                        <td className="px-5 py-4 font-semibold text-[#7c3aed]">+{tx.commission?.toLocaleString('fr-FR')} CFA</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                            tx.status === 'Succès' ? 'text-[#16a34a] bg-[#f0fdf4] border-[#bbf7d0]' :
                            tx.status === 'Remboursé' ? 'text-[#ef4444] bg-[#fef2f2] border-[#fecaca]' :
                            'text-[#94a3b8] bg-[#f8fafc] border-[#e2e8f0]'
                          }`}>{tx.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── MODAL PIN ── */}
      {pinModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 border border-[#e7e5e0]">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-[#eff6ff] flex items-center justify-center mx-auto mb-4">
                <KeyRound size={28} className="text-[#3b82f6]" />
              </div>
              <h3 className="text-xl font-black text-[#1a1917] mb-1">Code PIN de validation</h3>
              <p className="text-sm text-[#64748b] font-medium">
                Entrez le PIN communiqué par le passager pour libérer <strong>{pinModal.escrowId}</strong>
              </p>
            </div>
            <div className="flex justify-center gap-3 mb-5">
              {pinDigits.map((d, i) => (
                <input key={i} id={`pin-admin-${i}`} type="tel" inputMode="numeric" maxLength={1} value={d}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/, '');
                    if (!val && !d) return;
                    setPinError('');
                    const next = [...pinDigits]; next[i] = val; setPinDigits(next);
                    if (val && i < 3) document.getElementById(`pin-admin-${i + 1}`)?.focus();
                  }}
                  onKeyDown={e => { if (e.key === 'Backspace' && !pinDigits[i] && i > 0) document.getElementById(`pin-admin-${i - 1}`)?.focus(); }}
                  className={`w-14 h-16 text-center text-2xl font-black rounded-xl border-2 outline-none transition-all ${
                    pinSuccess ? 'border-[#16a34a] bg-[#f0fdf4] text-[#16a34a]' :
                    pinError ? 'border-[#ef4444] bg-[#fef2f2] text-[#ef4444]' :
                    d ? 'border-[#d97706] bg-[#fffbeb] text-[#d97706]' : 'border-[#e7e5e0] text-[#1a1917]'
                  }`}
                />
              ))}
            </div>
            {pinError && <p className="text-center text-sm font-bold text-[#ef4444] mb-4">{pinError}</p>}
            {pinSuccess && <p className="text-center text-sm font-bold text-[#16a34a] mb-4 flex items-center justify-center gap-2"><CheckCircle2 size={16} /> PIN validé ! Libération en cours…</p>}
            <div className="flex gap-3">
              <button onClick={() => setPinModal({ isOpen: false, escrowId: null })} disabled={pinLoading}
                className="flex-1 py-3 rounded-xl border border-[#e7e5e0] text-sm font-bold text-[#64748b] hover:bg-[#f7f6f3] transition-colors disabled:opacity-40"
              >Annuler</button>
              <button disabled={pinDigits.join('').length < 4 || pinSuccess || pinLoading} onClick={handlePinSubmit}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-105 active:scale-95 transition-all"
              >{pinLoading ? 'Vérification...' : 'Valider le PIN'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODALS SÉQUESTRES ── */}
      <ConfirmModal
        isOpen={modal.isOpen} onClose={() => !actionLoading && setModal({ isOpen: false, type: null, escrowId: null })}
        onConfirm={handleAction} isLoading={actionLoading}
        title={modal.type === 'refund' ? 'Rembourser 100% au voyageur ?' : modal.type === 'release' ? 'Libérer le paiement ?' : 'Dédommager le conducteur ?'}
        description={
          modal.type === 'refund' ? `Remboursement intégral de ${targetEscrow?.price?.toLocaleString('fr-FR')} CFA à ${targetEscrow?.passenger}. Action irréversible.`
          : modal.type === 'compensate' ? `Dédommagement conducteur ${targetEscrow?.driver} — 70% du séquestre. DemDem retient 30%. Action irréversible.`
          : 'Libération des fonds.'
        }
        confirmText={actionLoading ? 'Traitement...' : modal.type === 'refund' ? 'Confirmer Remboursement' : modal.type === 'compensate' ? 'Confirmer Dédommagement' : 'Libérer'}
        isDanger={modal.type === 'refund' || modal.type === 'compensate'}
      />
    </div>
  );
}
