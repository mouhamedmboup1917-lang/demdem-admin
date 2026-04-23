'use client';
import { useState, useEffect, useCallback } from 'react';
import { Search, Trash2, Ban, CheckCircle, UserCheck, Loader2 } from 'lucide-react';
import { useRole } from '@/context/RoleContext';
import ConfirmModal from '@/components/ConfirmModal';
import ErrorState from '@/components/ErrorState';
import { SkeletonTable } from '@/components/Skeleton';
import { usersApi } from '@/lib/api';

const STATUS_BADGE = {
  active:  { label: 'Actif',      className: 'bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]' },
  banned:  { label: 'Banni',      className: 'bg-[#fef2f2] text-[#ef4444] border-[#fecaca]' },
  pending: { label: 'En attente', className: 'bg-[#fffbeb] text-[#d97706] border-[#fde68a]' },
};

export default function UsersPage() {
  const { role } = useRole();
  const [users, setUsers]       = useState([]);
  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState({ isOpen: false, type: null, userId: null });
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const canDelete = role === 'SUPER_ADMIN';
  const canBan = ['SUPER_ADMIN', 'MANAGER'].includes(role);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) || u.phone.includes(search)
  );

  const targetUser = users.find(u => u.id === modal.userId);

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (modal.type === 'delete') {
        const result = await usersApi.delete(modal.userId);
        setUsers(result);
      } else if (modal.type === 'ban') {
        const result = await usersApi.ban(modal.userId);
        setUsers(result);
      } else if (modal.type === 'unban') {
        const result = await usersApi.unban(modal.userId);
        setUsers(result);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoading(false);
      setModal({ isOpen: false, type: null, userId: null });
    }
  };

  return (
    <div className="pb-10 animate-fade-in">
      <div className="mb-8 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#1a1917] tracking-tight mb-1">Gestion des Utilisateurs</h1>
          <p className="text-[#64748b] font-medium">{users.length} comptes enregistrés sur la plateforme.</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
          <input type="text" placeholder="Nom ou téléphone…" value={search} onChange={e => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2.5 rounded-xl border border-[#e4ddd1] text-sm font-medium outline-none focus:border-[#d97706] transition-colors bg-white w-64" />
        </div>
      </div>

      {loading ? (
        <SkeletonTable rows={5} cols={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : (
        <div className="bg-white border border-[#e4ddd1] rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#64748b] text-xs font-bold uppercase tracking-wider">
                  <th className="px-5 py-4">Utilisateur</th>
                  <th className="px-5 py-4">Rôle</th>
                  <th className="px-5 py-4">Vérifié KYC</th>
                  <th className="px-5 py-4">Statut</th>
                  <th className="px-5 py-4">Inscription</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-[#1a1917] font-medium divide-y divide-[#f1f5f9]">
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-[#94a3b8]">Aucun utilisateur trouvé.</td></tr>
                )}
                {filtered.map(user => {
                  const badge = STATUS_BADGE[user.status];
                  const isBanned = user.status === 'banned';
                  return (
                    <tr key={user.id} className="hover:bg-[#fdfbf7] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#d97706] to-[#b48c40] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div><p className="font-bold text-[#1a1917]">{user.name}</p><p className="text-xs text-[#94a3b8]">{user.phone}</p></div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${user.role === 'driver' ? 'bg-[#eff6ff] text-[#3b82f6] border-[#bfdbfe]' : 'bg-[#f5f3ff] text-[#7c3aed] border-[#ddd6fe]'}`}>
                          {user.role === 'driver' ? '🚗 Conducteur' : '👤 Passager'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {user.verified ? <span className="flex items-center gap-1 text-[#16a34a] font-semibold text-xs"><CheckCircle size={14} /> Vérifié</span>
                          : <span className="flex items-center gap-1 text-[#94a3b8] font-semibold text-xs"><UserCheck size={14} /> En attente</span>}
                      </td>
                      <td className="px-5 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${badge.className}`}>{badge.label}</span></td>
                      <td className="px-5 py-4 text-[#64748b] text-xs font-semibold">{user.joined}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {canBan && (
                            <button onClick={() => setModal({ isOpen: true, type: isBanned ? 'unban' : 'ban', userId: user.id })}
                              title={isBanned ? 'Réactiver' : 'Bannir'}
                              className={`p-2 rounded-xl border transition-colors active:scale-95 ${isBanned ? 'text-[#16a34a] bg-[#f0fdf4] border-[#bbf7d0] hover:bg-[#dcfce7]' : 'text-[#f59e0b] bg-[#fffbeb] border-[#fde68a] hover:bg-[#fef3c7]'}`}>
                              <Ban size={15} />
                            </button>
                          )}
                          {canDelete && (
                            <button onClick={() => setModal({ isOpen: true, type: 'delete', userId: user.id })}
                              title="Supprimer le compte" className="p-2 rounded-xl border text-[#ef4444] bg-[#fef2f2] border-[#fecaca] hover:bg-[#fee2e2] transition-colors active:scale-95">
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={modal.isOpen && modal.type === 'ban'} onClose={() => !actionLoading && setModal({ isOpen: false })}
        onConfirm={handleAction} isLoading={actionLoading}
        title="Bannir cet utilisateur ?" description={`${targetUser?.name} sera suspendu immédiatement.`} confirmText={actionLoading ? 'Traitement...' : "Bannir l'utilisateur"} isDanger />
      <ConfirmModal isOpen={modal.isOpen && modal.type === 'unban'} onClose={() => !actionLoading && setModal({ isOpen: false })}
        onConfirm={handleAction} isLoading={actionLoading}
        title="Réactiver ce compte ?" description={`${targetUser?.name} aura accès à toutes les fonctionnalités.`} confirmText={actionLoading ? 'Traitement...' : 'Réactiver'} />
      <ConfirmModal isOpen={modal.isOpen && modal.type === 'delete'} onClose={() => !actionLoading && setModal({ isOpen: false })}
        onConfirm={handleAction} isLoading={actionLoading}
        title="Supprimer définitivement ?" description={`Le compte de ${targetUser?.name} sera supprimé. Action irréversible.`} confirmText={actionLoading ? 'Suppression...' : 'Supprimer le compte'} cancelText="Ne pas supprimer" isDanger />
    </div>
  );
}
