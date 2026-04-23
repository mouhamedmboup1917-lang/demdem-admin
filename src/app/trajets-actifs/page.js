'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Users, Phone, Clock, Navigation, Wifi, WifiOff, Car, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import ErrorState from '@/components/ErrorState';
import { tripsApi } from '@/lib/api';

const STATUS_CONFIG = {
  active:  { label: 'En course',  color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  idle:    { label: 'Disponible', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  offline: { label: 'Hors ligne', color: '#94a3b8', bg: '#f8fafc', border: '#e2e8f0' },
};

const LiveMap = dynamic(() => import('./LiveMap'), { ssr: false, loading: () => (
  <div className="w-full h-full flex items-center justify-center bg-[#f0f4f8]">
    <div className="text-center">
      <div className="w-8 h-8 border-2 border-[#d97706] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      <p className="text-sm font-semibold text-[#64748b]">Chargement de la carte…</p>
    </div>
  </div>
)});

export default function ActiveTripsPage() {
  const [drivers, setDrivers]       = useState([]);
  const [selected, setSelected]     = useState(null);
  const [search, setSearch]         = useState('');
  const [isLive, setIsLive]         = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [error, setError]           = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const intervalRef = useRef(null);

  const fetchDrivers = useCallback(async () => {
    try {
      const data = await tripsApi.getLiveDrivers();
      setDrivers(data);
      setLastUpdate(new Date());
      setError(null);
      setInitialLoad(false);
    } catch (e) {
      setError(e.message);
      setInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  useEffect(() => {
    if (isLive) {
      intervalRef.current = setInterval(fetchDrivers, 4000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isLive, fetchDrivers]);

  const filtered = drivers.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.route.toLowerCase().includes(search.toLowerCase()) ||
    d.status.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount  = drivers.filter(d => d.status === 'active').length;
  const idleCount    = drivers.filter(d => d.status === 'idle').length;
  const offlineCount = drivers.filter(d => d.status === 'offline').length;

  if (initialLoad) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center -m-8">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#d97706] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-bold text-[#1a1917]">Chargement de la cartographie…</p>
        </div>
      </div>
    );
  }

  if (error && drivers.length === 0) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center -m-8">
        <ErrorState message={error} onRetry={fetchDrivers} />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col gap-0 -m-8 animate-fade-in">
      {/* Topbar */}
      <div className="flex-shrink-0 px-8 py-4 bg-white border-b border-[#e7e5e0] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1a1917] tracking-tight">Cartographie Live</h1>
          <div className="flex items-center gap-4 mt-1 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-[#16a34a]">
              <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse inline-block" />{activeCount} En course
            </span>
            <span className="flex items-center gap-1.5 text-[#d97706]">
              <span className="w-2 h-2 rounded-full bg-[#d97706] inline-block" />{idleCount} Disponible
            </span>
            <span className="flex items-center gap-1.5 text-[#94a3b8]">
              <span className="w-2 h-2 rounded-full bg-[#94a3b8] inline-block" />{offlineCount} Hors ligne
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsLive(v => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${isLive ? 'bg-[#f0fdf4] border-[#bbf7d0] text-[#16a34a]' : 'bg-[#f8fafc] border-[#e2e8f0] text-[#94a3b8]'}`}>
            {isLive ? <Wifi size={15} /> : <WifiOff size={15} />} {isLive ? 'Live' : 'Pause'}
          </button>
          <span className="text-xs text-[#a8a29e] font-medium hidden sm:block">
            Màj : {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a29e]" />
            <input type="text" placeholder="Conducteur, trajet…" value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl border border-[#e7e5e0] text-sm outline-none focus:border-[#d97706] w-52 bg-white transition-colors" />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <aside className="w-72 flex-shrink-0 bg-white border-r border-[#e7e5e0] flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto divide-y divide-[#f3f2ef]">
            {filtered.map(driver => {
              const cfg = STATUS_CONFIG[driver.status];
              const isSelected = selected?.id === driver.id;
              return (
                <button key={driver.id} onClick={() => setSelected(isSelected ? null : driver)}
                  className={`w-full flex items-start gap-3 p-4 text-left transition-all hover:bg-[#fdfbf7] ${isSelected ? 'bg-[#fffbeb] border-l-[3px] border-[#d97706]' : 'border-l-[3px] border-transparent'}`}>
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-[#e7e5e0] flex items-center justify-center font-bold text-[#44403c] text-sm">
                      {driver.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white" style={{ background: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#1a1917] text-sm truncate">{driver.name}</p>
                    <p className="text-xs text-[#78716c] font-medium truncate mt-0.5">{driver.route}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border" style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}>{cfg.label}</span>
                      {driver.status === 'active' && <span className="text-[10px] font-semibold text-[#94a3b8]">{Math.round(driver.speed)} km/h</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="flex-1 relative">
          <LiveMap drivers={filtered} selected={selected} onSelectDriver={setSelected} />
          {selected && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-[340px]">
              <DriverCard driver={selected} onClose={() => setSelected(null)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DriverCard({ driver, onClose }) {
  const cfg = STATUS_CONFIG[driver.status];
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-[#e7e5e0] overflow-hidden animate-fade-in">
      <div className="flex items-start justify-between p-4 border-b border-[#f3f2ef]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#d97706] to-[#b48c40] flex items-center justify-center text-white font-bold text-sm">
            {driver.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="font-bold text-[#1a1917]">{driver.name}</p>
            <p className="text-xs text-[#78716c] font-medium flex items-center gap-1"><Phone size={11} /> {driver.phone}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#f3f2ef] text-[#a8a29e]"><X size={16} /></button>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm"><Navigation size={15} className="text-[#d97706] flex-shrink-0" /><span className="font-semibold text-[#1a1917]">{driver.route || 'Aucun trajet'}</span></div>
        {driver.status === 'active' && (
          <>
            <div className="grid grid-cols-3 gap-2">
              {[{ label: 'Passagers', value: `${driver.pxCount}/${driver.maxPx}`, icon: Users }, { label: 'Depuis', value: driver.since, icon: Clock }, { label: 'Vitesse', value: `${Math.round(driver.speed)} km/h`, icon: Car }].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-[#f7f6f3] rounded-xl p-2.5 text-center border border-[#e7e5e0]">
                  <Icon size={14} className="text-[#a8a29e] mx-auto mb-1" /><p className="font-bold text-sm text-[#1a1917]">{value}</p><p className="text-[10px] text-[#a8a29e] font-medium">{label}</p>
                </div>
              ))}
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5"><span className="text-[#44403c]">Progression</span><span className="text-[#d97706]">{Math.round(driver.progress)}%</span></div>
              <div className="h-2 bg-[#e7e5e0] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#d97706] to-[#b48c40] rounded-full transition-all duration-700" style={{ width: `${driver.progress}%` }} />
              </div>
            </div>
          </>
        )}
        <div className="flex items-center gap-2 text-xs text-[#78716c] font-medium"><Car size={13} className="text-[#a8a29e]" /> {driver.car}</div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-bold" style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}>
          <span className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />{cfg.label}
          {driver.status === 'active' && <span className="ml-auto text-xs font-medium opacity-70">ID: {driver.tripId}</span>}
        </div>
      </div>
    </div>
  );
}
