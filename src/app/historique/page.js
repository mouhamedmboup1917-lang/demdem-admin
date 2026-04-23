'use client';
import { useState, useEffect, useCallback } from 'react';
import { Search, DollarSign, Loader2 } from 'lucide-react';
import ErrorState from '@/components/ErrorState';
import { SkeletonTable } from '@/components/Skeleton';
import { financeApi } from '@/lib/api';

export default function HistoryPage() {
  const [search, setSearch]           = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await financeApi.getAll();
      setTransactions(data.transactions || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = transactions.filter(t =>
    t.driver.toLowerCase().includes(search.toLowerCase()) ||
    t.id.toLowerCase().includes(search.toLowerCase()) ||
    t.route.toLowerCase().includes(search.toLowerCase())
  );

  const totalCommissions = filtered.reduce((acc, curr) => acc + (curr.commission || 0), 0);

  return (
    <div className="pb-10 animate-fade-in">
      <div className="mb-8 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#1a1917] tracking-tight mb-1">Historique des Transactions</h1>
          <p className="text-[#78716c] font-medium">Traçabilité financière complète et détail des commissions DemDem.</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a29e]" />
          <input type="text" placeholder="Rechercher TX, conducteur, route..." value={search} onChange={e => setSearch(e.target.value)}
            className="input pl-9 py-2 w-72 h-11" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-3 bg-[#f3f2ef] rounded-xl"><div className="w-32 h-5 bg-[#e7e5e0] rounded animate-pulse" /><div className="w-20 h-8 bg-[#e7e5e0] rounded animate-pulse" /></div>
          <SkeletonTable rows={5} cols={5} />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : (
        <>
          <div className="mb-6 inline-flex items-center gap-3 px-4 py-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl text-[#065f46]">
            <div className="p-1.5 bg-[#dcfce7] rounded-lg"><DollarSign size={18} className="text-[#16a34a]" /></div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest block mb-0.5 opacity-80">Commissions totales filtrées</span>
              <span className="text-xl font-black tracking-tight">{totalCommissions.toLocaleString('fr-FR')} CFA</span>
            </div>
          </div>

          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[#f7f6f3] border-b border-[#e7e5e0] text-[#78716c] text-xs font-bold uppercase tracking-wider">
                    <th className="px-5 py-4">Transaction</th>
                    <th className="px-5 py-4">Type / Itinéraire</th>
                    <th className="px-5 py-4">Utilisateur</th>
                    <th className="px-5 py-4 text-right">Volume</th>
                    <th className="px-5 py-4 text-right">Commission Nette</th>
                  </tr>
                </thead>
                <tbody className="text-[#1a1917] font-medium divide-y divide-[#f3f2ef]">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-10 text-center text-[#a8a29e]">Aucune transaction trouvée.</td></tr>
                  ) : filtered.map(tx => (
                    <tr key={tx.id} className="hover:bg-[#f7f6f3]/50 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-semibold text-[#44403c]">{tx.id}</span>
                        <span className="text-xs text-[#a8a29e] mt-0.5 block">{tx.date}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-[#1a1917] block">{tx.type}</span>
                        <span className="text-xs text-[#78716c] mt-0.5">{tx.route}</span>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold">{tx.driver}</td>
                      <td className="px-5 py-4 text-right">
                        <span className="font-bold text-[#44403c] block">{tx.amount?.toLocaleString('fr-FR')} CFA</span>
                        <span className={`text-[10px] uppercase font-bold tracking-widest mt-1 px-1.5 py-0.5 rounded inline-block ${tx.status === 'Succès' ? 'bg-[#f0fdf4] text-[#16a34a]' : tx.status === 'Remboursé' ? 'bg-[#fef2f2] text-[#ef4444]' : 'bg-[#fffbeb] text-[#d97706]'}`}>{tx.status}</span>
                      </td>
                      <td className="px-5 py-4 text-right text-[#16a34a] font-black text-base tracking-tight">+{tx.commission?.toLocaleString('fr-FR')} CFA</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
