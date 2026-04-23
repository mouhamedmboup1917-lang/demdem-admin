'use client';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';

/**
 * ErrorState — composant d'affichage d'erreur standardisé.
 * Remplace les catch silencieux par un feedback visible.
 */
export default function ErrorState({ message, onRetry, className = '' }) {
  const isNetwork = message?.includes('serveur') || message?.includes('connexion') || message?.includes('expiré');

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 ${className}`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${isNetwork ? 'bg-[#fef2f2]' : 'bg-[#fffbeb]'}`}>
        {isNetwork ? (
          <WifiOff size={24} className="text-[#ef4444]" />
        ) : (
          <AlertTriangle size={24} className="text-[#d97706]" />
        )}
      </div>
      <h3 className="text-lg font-bold text-[#1a1917] mb-1">
        {isNetwork ? 'Erreur de connexion' : 'Une erreur est survenue'}
      </h3>
      <p className="text-sm text-[#78716c] text-center max-w-md mb-5">
        {message || 'Impossible de charger les données. Veuillez réessayer.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#d97706] to-[#b48c40] hover:brightness-105 active:scale-95 transition-all"
        >
          <RefreshCw size={15} /> Réessayer
        </button>
      )}
    </div>
  );
}
