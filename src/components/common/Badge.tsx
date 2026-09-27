import React from 'react';

interface BadgeProps {
  status: string;
  variant?: 'emerald' | 'rose' | 'amber' | 'blue' | 'purple' | 'slate';
  text?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, variant, text }) => {
  let computedVariant = variant;
  let label = text || status;

  if (!computedVariant) {
    const s = status.toUpperCase();
    if (['VALIDE', 'PAYE', 'JUSTIFIE', 'ACTIF', 'PRESENTS'].includes(s)) {
      computedVariant = 'emerald';
      if (s === 'VALIDE') label = 'Validé';
      if (s === 'PAYE') label = 'Payé (Soldé)';
      if (s === 'JUSTIFIE') label = 'Absence Justifiée';
      if (s === 'ACTIF') label = 'Actif';
    } else if (['EN_ATTENTE', 'PARTIEL', 'RETARD', 'EN_COURS'].includes(s)) {
      computedVariant = 'amber';
      if (s === 'EN_ATTENTE') label = 'En attente';
      if (s === 'PARTIEL') label = 'Paiement Partiel';
      if (s === 'RETARD') label = 'Retard';
      if (s === 'EN_COURS') label = 'En cours';
    } else if (['REJETE', 'EN_RETARD', 'NON_JUSTIFIE', 'ECHOUÉ', 'INACTIF', 'ABSENT'].includes(s)) {
      computedVariant = 'rose';
      if (s === 'REJETE') label = 'Rejeté';
      if (s === 'EN_RETARD') label = 'En retard de paiement';
      if (s === 'NON_JUSTIFIE') label = 'Non justifiée';
      if (s === 'ECHOUÉ') label = 'Échoué';
      if (s === 'INACTIF') label = 'Inactif';
    } else {
      computedVariant = 'blue';
    }
  }

  const styles = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/60',
    amber: 'bg-amber-50 text-amber-700 border-amber-200/60',
    blue: 'bg-blue-50 text-blue-700 border-blue-200/60',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/60',
    slate: 'bg-slate-100 text-slate-700 border-slate-200/60',
  }[computedVariant || 'slate'];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          computedVariant === 'emerald'
            ? 'bg-emerald-500'
            : computedVariant === 'rose'
            ? 'bg-rose-500'
            : computedVariant === 'amber'
            ? 'bg-amber-500'
            : computedVariant === 'purple'
            ? 'bg-purple-500'
            : 'bg-blue-500'
        }`}
      />
      {label}
    </span>
  );
};
