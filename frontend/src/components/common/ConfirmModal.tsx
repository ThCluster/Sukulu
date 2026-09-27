import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDanger?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = 'Supprimer cet élément définitivement ?',
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  onConfirm,
  onCancel,
  isDanger = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center border border-slate-100 transform transition-all scale-100">
        {/* Circle Icon matching reference mockup */}
        <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7 text-rose-600" />
        </div>

        <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>

        {message && <p className="text-sm text-slate-500 mb-6">{message}</p>}

        {!message && (
          <p className="text-sm text-slate-500 mb-6">
            Cette action supprimera définitivement les données du système.
          </p>
        )}

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700 focus:ring-2 focus:ring-rose-500/20'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
