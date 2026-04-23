'use client';
import { useEffect } from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';

/**
 * Reusable confirmation modal for critical actions.
 * @param {boolean}  isOpen       - Controls visibility
 * @param {function} onClose      - Called when cancelled or closed
 * @param {function} onConfirm    - Called when confirmed (modal closes automatically)
 * @param {string}   title        - Modal heading
 * @param {string}   description  - Descriptive message for the user
 * @param {string}   confirmText  - Label for the confirm button (default: "Confirmer")
 * @param {string}   cancelText   - Label for the cancel button (default: "Annuler")
 * @param {boolean}  isDanger     - If true, uses a red destructive style
 */
export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirmer',
    cancelText = 'Annuler',
    isDanger = false,
    isLoading = false
}) {
    // Lock body scroll while the modal is open
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        if (isLoading) return;
        await onConfirm();
        // Removed onClose() here so parent component can control visibility
        // preventing modal flashing unprofessionally during network operations 
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-[#e4ddd1] overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-[#f1f5f9]">
                    <div className="flex items-center gap-3">
                        {isDanger
                            ? <div className="p-2 rounded-lg bg-[#fef2f2]"><AlertTriangle size={18} className="text-[#ef4444]" /></div>
                            : <div className="p-2 rounded-lg bg-[#fffbeb]"><CheckCircle2 size={18} className="text-[#d97706]" /></div>
                        }
                        <h2 id="modal-title" className="text-lg font-bold text-[#1a1917]">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        aria-label="Fermer"
                        className="text-[#94a3b8] hover:text-[#1a1917] transition-colors rounded-full p-1 hover:bg-[#f1f5f9] disabled:opacity-50"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-[#64748b] text-sm leading-relaxed">{description}</p>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-[#f1f5f9] bg-[#f8fafc] flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-5 py-2.5 rounded-xl font-semibold text-sm text-[#475569] bg-white border border-[#e2e8f0] hover:bg-[#f1f5f9] transition-colors active:scale-95 disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all active:scale-95 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-75 ${isDanger
                            ? 'bg-[#ef4444] hover:bg-[#dc2626] focus:ring-red-500'
                            : 'bg-gradient-to-r from-[#d97706] to-[#b48c40] hover:brightness-105 focus:ring-orange-500'
                            }`}
                    >
                        {isLoading && (
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
