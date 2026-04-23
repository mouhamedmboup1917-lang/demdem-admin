'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, XCircle, Search, Calendar, Phone,
  ThumbsUp, ChevronRight, ZoomIn, X, FileText,
  Car, User, Clock, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import { useRole } from '@/context/RoleContext';
import ConfirmModal from '@/components/ConfirmModal';
import ErrorState from '@/components/ErrorState';
import { SkeletonTable } from '@/components/Skeleton';
import { kycApi } from '@/lib/api';

const REJECT_REASONS = [
  'Photo floue ou illisible', 'Document expiré', 'Identité incohérente',
  'Document rogné ou incomplet', 'Mauvaise pièce fournie', 'Photo du véhicule incorrecte',
];

export default function KYCPage() {
  const { role } = useRole();
  const [drivers, setDrivers]     = useState([]);
  const [selected, setSelected]   = useState(null);
  const [rejectMode, setRejectMode] = useState(false);
  const [search, setSearch]       = useState('');
  const [docTab, setDocTab]       = useState('doc');
  const [lightbox, setLightbox]   = useState(null);
  const [modal, setModal]         = useState({ isOpen: false, type: null, reason: null });
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const canAct = role !== 'SUPPORT';

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await kycApi.getQueue();
      setDrivers(data);
      setSelected(data[0] ?? null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = drivers.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.docType.toLowerCase().includes(search.toLowerCase())
  );

  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 4000); };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const queue = await kycApi.approve(selected.id);
      setDrivers(queue);
      setSelected(queue[0] ?? null);
      setRejectMode(false);
      setDocTab('doc');
      showSuccess(`${selected.name} a été approuvé et peut désormais publier des trajets.`);
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoading(false);
      setModal({ isOpen: false });
    }
  };

  const handleReject = async (reason) => {
    setActionLoading(true);
    try {
      const queue = await kycApi.reject(selected.id, reason);
      setDrivers(queue);
      setSelected(queue[0] ?? null);
      setRejectMode(false);
      setDocTab('doc');
      showSuccess(`Dossier de ${selected.name} rejeté. Motif : ${reason}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoading(false);
      setModal({ isOpen: false });
    }
  };

  return (
    <div className="pb-10 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#1a1917] tracking-tight mb-1">Validation KYC Conducteurs</h1>
        <p className="text-[#64748b] font-medium flex items-center gap-2">
          Vérifiez les documents d'identité et permis de conduire avant activation.
          {!canAct && <span className="text-xs font-bold uppercase bg-[#fffbeb] text-[#d97706] px-2 py-0.5 rounded-full border border-[#fde68a]">Lecture seule</span>}
        </p>
      </div>

      {successMsg && (
        <div className="mb-6 animate-fade-in flex items-center gap-3 px-5 py-3 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] text-[#16a34a] font-bold shadow-sm">
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      {loading ? (
        <SkeletonTable rows={3} cols={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : drivers.length === 0 ? (
        <div className="flex items-center justify-center h-72 border-2 border-dashed border-[#e4ddd1] rounded-2xl bg-white">
          <div className="text-center p-8">
            <ThumbsUp size={40} className="mx-auto text-[#d97706] mb-3" />
            <h2 className="text-xl font-bold text-[#1a1917] mb-1">File vide !</h2>
            <p className="text-[#64748b] text-sm">Tous les profils en attente ont été traités.</p>
          </div>
        </div>
      ) : (
        <div className="flex gap-6 items-start">
          {/* Queue List */}
          <div className="w-72 flex-shrink-0 bg-white rounded-2xl border border-[#e4ddd1] shadow-sm overflow-hidden sticky top-4">
            <div className="p-4 border-b border-[#e4ddd1] bg-[#fdfbf7]">
              <p className="text-xs uppercase tracking-wider font-bold text-[#94a3b8] mb-2">En attente ({filtered.length})</p>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#e4ddd1] text-sm outline-none focus:border-[#d97706] transition-colors bg-white" />
              </div>
            </div>
            <div className="overflow-y-auto max-h-[600px] divide-y divide-[#f1f5f9]">
              {filtered.map(d => (
                <button key={d.id} onClick={() => { setSelected(d); setRejectMode(false); setDocTab('doc'); }}
                  className={`w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-[#f8fafc] ${selected?.id === d.id ? 'bg-[#fffbeb] border-l-[3px] border-[#d97706]' : 'border-l-[3px] border-transparent'}`}>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d97706] to-[#b48c40] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {d.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#1a1917] text-sm truncate">{d.name}</p>
                    <p className="text-xs text-[#94a3b8] mt-0.5 truncate">{d.docType}</p>
                    <p className="text-[10px] text-[#b8b2ab] mt-0.5 flex items-center gap-1"><Clock size={10} /> {d.submittedAt}</p>
                  </div>
                  <ChevronRight size={16} className="text-[#cbd5e1] flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Detail Panel */}
          {selected && (
            <div className="flex-1 bg-white rounded-2xl border border-[#e4ddd1] shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[#f1f5f9] flex flex-wrap justify-between items-start gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#d97706] to-[#b48c40] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {selected.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#1a1917]">{selected.name}</h2>
                    <div className="flex flex-wrap gap-4 mt-1 text-sm font-medium text-[#64748b]">
                      <span className="flex items-center gap-1.5"><Phone size={14} className="text-[#d97706]" />{selected.phone}</span>
                      <span className="flex items-center gap-1.5"><User size={14} className="text-[#d97706]" />{selected.email}</span>
                      <span className="flex items-center gap-1.5"><Car size={14} className="text-[#d97706]" />{selected.vehicle}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="px-3 py-1 bg-[#fefce8] text-[#ca8a04] border border-[#fef08a] rounded-full text-xs font-bold uppercase tracking-widest">{selected.docType}</span>
                  <span className="flex items-center gap-1 text-xs text-[#94a3b8] font-medium"><Calendar size={12} /> Expire le {selected.expiry}</span>
                </div>
              </div>

              {/* Tabs doc / vehicle */}
              <div className="flex border-b border-[#f1f5f9] px-6">
                {[
                  { key: 'doc', label: "Pièce d'identité / Permis", icon: FileText },
                  { key: 'vehicle', label: 'Photo du véhicule', icon: Car },
                ].map(t => {
                  const Icon = t.icon;
                  return (
                    <button key={t.key} onClick={() => setDocTab(t.key)}
                      className={`flex items-center gap-2 px-4 py-3.5 text-sm font-bold border-b-2 transition-colors ${docTab === t.key ? 'border-[#d97706] text-[#d97706]' : 'border-transparent text-[#94a3b8] hover:text-[#44403c]'}`}>
                      <Icon size={15} /> {t.label}
                    </button>
                  );
                })}
              </div>

              {/* Document Image */}
              <div className="p-6">
                <div className="relative bg-[#f8fafc] rounded-xl border border-[#e2e8f0] overflow-hidden flex items-center justify-center cursor-zoom-in group"
                  style={{ height: 300 }}
                  onClick={() => setLightbox({ src: docTab === 'doc' ? selected.docImage : selected.vehicleImage, alt: docTab === 'doc' ? `Document de ${selected.name}` : `Véhicule de ${selected.name}` })}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={docTab === 'doc' ? selected.docImage : selected.vehicleImage}
                    alt={docTab === 'doc' ? `Document de ${selected.name}` : `Véhicule de ${selected.name}`}
                    className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white rounded-full p-3"><ZoomIn size={22} /></div>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                    {docTab === 'doc' ? selected.docType : 'Photo du véhicule'} · Cliquer pour agrandir
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[{ label: 'Émis le', value: selected.issueDate }, { label: 'Expire le', value: selected.expiry }, { label: 'Soumis', value: selected.submittedAt }].map(info => (
                    <div key={info.label} className="bg-[#f7f6f3] rounded-xl p-3 border border-[#e7e5e0]">
                      <p className="text-xs text-[#94a3b8] font-medium mb-1">{info.label}</p>
                      <p className="text-sm font-bold text-[#1a1917]">{info.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 border-t border-[#f1f5f9] bg-[#fdfbf7]">
                {!canAct ? (
                  <p className="text-center text-sm text-[#94a3b8] font-medium py-2">Vous êtes en mode lecture seule.</p>
                ) : rejectMode ? (
                  <div className="bg-[#fef2f2] border border-[#fecaca] rounded-xl p-5 relative">
                    <button onClick={() => setRejectMode(false)} className="absolute top-4 right-4 text-xs font-bold text-[#ef4444] hover:opacity-70">← Annuler</button>
                    <h3 className="text-[#991b1b] font-bold text-base mb-4 flex items-center gap-2"><AlertCircle size={17} /> Sélectionner un motif de refus</h3>
                    <div className="flex flex-wrap gap-2">
                      {REJECT_REASONS.map(reason => (
                        <button key={reason} onClick={() => setModal({ isOpen: true, type: 'reject', reason })}
                          className="px-4 py-2 border border-[#fca5a5] text-[#b91c1c] bg-white rounded-xl hover:bg-[#fee2e2] font-semibold text-sm transition-colors">{reason}</button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <button disabled={actionLoading} onClick={() => setModal({ isOpen: true, type: 'approve' })}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#d97706] to-[#b48c40] hover:brightness-105 active:scale-[0.98] transition-all shadow-md disabled:opacity-50">
                      {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />} APPROUVER LE CONDUCTEUR
                    </button>
                    <button disabled={actionLoading} onClick={() => setRejectMode(true)}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-[#ef4444] bg-[#fef2f2] border border-[#fecaca] hover:bg-[#fee2e2] active:scale-[0.98] transition-all disabled:opacity-50">
                      <XCircle size={18} /> REJETER LE DOSSIER
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10" onClick={() => setLightbox(null)}><X size={22} /></button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox.src} alt={lightbox.alt} className="max-w-[90vw] max-h-[88vh] object-contain rounded-xl shadow-2xl" onClick={e => e.stopPropagation()} />
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium bg-black/40 px-4 py-1.5 rounded-full">{lightbox.alt}</p>
        </div>
      )}

      {/* Modals */}
      <ConfirmModal isOpen={modal.isOpen && modal.type === 'approve'} onClose={() => !actionLoading && setModal({ isOpen: false })}
        onConfirm={handleApprove} isLoading={actionLoading}
        title="Approuver ce conducteur ?" description={`${selected?.name} sera activé et pourra publier des trajets sur DemDem.`} confirmText={actionLoading ? 'Traitement...' : 'Oui, Approuver'} />
      <ConfirmModal isOpen={modal.isOpen && modal.type === 'reject'} onClose={() => !actionLoading && setModal({ isOpen: false })}
        onConfirm={() => handleReject(modal.reason)} isLoading={actionLoading}
        title="Confirmer le refus ?" description={`Motif : "${modal.reason}". Un SMS sera envoyé à ${selected?.name}.`} confirmText={actionLoading ? 'Traitement...' : 'Rejeter et Notifier'} isDanger />
    </div>
  );
}
