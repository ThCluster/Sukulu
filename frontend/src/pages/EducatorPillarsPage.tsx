import React from 'react';
import { EducatorPillarsConsole, EducatorPillarId } from '../components/educator/EducatorPillarsConsole';
import { Sparkles } from 'lucide-react';

interface EducatorPillarsPageProps {
  initialPillar?: EducatorPillarId;
  onNavigate?: (tab: string) => void;
}

export const EducatorPillarsPage: React.FC<EducatorPillarsPageProps> = ({
  initialPillar = 'suivi',
  onNavigate,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded-full border border-blue-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Console Éducateur • Les 3 Piliers Fondamentaux</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Le Quotidien de l'Éducateur : Suivi • Transmission • Sécurité
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-3xl">
            Pilotez l'émargement et le suivi individuel de vos élèves, consignez le cahier de texte et les devoirs, et assurez la sécurité absolue (fiches médicales PAI, sorties encadrées et registre d'incidents).
          </p>
        </div>
      </div>

      <EducatorPillarsConsole initialPillar={initialPillar} onNavigateTab={onNavigate} />
    </div>
  );
};
