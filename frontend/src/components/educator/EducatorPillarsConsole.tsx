import React, { useState } from 'react';
import { SuiviPillar } from './SuiviPillar';
import { TransmissionPillar } from './TransmissionPillar';
import { SecuritePillar } from './SecuritePillar';
import {
  Activity,
  BookOpen,
  ShieldCheck,
  Sparkles,
  Users,
  CheckCircle2,
  AlertTriangle,
  Send,
  HeartPulse,
  LogOut,
  CalendarDays,
} from 'lucide-react';

export type EducatorPillarId = 'suivi' | 'transmission' | 'securite';

interface EducatorPillarsConsoleProps {
  initialPillar?: EducatorPillarId;
  defaultClass?: string;
  onNavigateTab?: (tab: string) => void;
}

export const EducatorPillarsConsole: React.FC<EducatorPillarsConsoleProps> = ({
  initialPillar = 'suivi',
  defaultClass = '3ème B',
  onNavigateTab,
}) => {
  const [activePillar, setActivePillar] = useState<EducatorPillarId>(initialPillar);
  const [selectedClass, setSelectedClass] = useState<string>(defaultClass);

  const availableClasses = ['3ème B', 'Terminale S1'];

  return (
    <div className="space-y-6">
      {/* 3 Pillars Master Switcher Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* PILIER 1 BUTTON */}
        <button
          onClick={() => setActivePillar('suivi')}
          className={`p-4 rounded-xl text-left transition-all relative overflow-hidden group ${
            activePillar === 'suivi'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'hover:bg-slate-50 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                activePillar === 'suivi'
                  ? 'bg-white/20 text-white'
                  : 'bg-blue-50 text-blue-700'
              }`}
            >
              Pilier 1
            </span>
            <Activity className={`w-5 h-5 ${activePillar === 'suivi' ? 'text-blue-200' : 'text-blue-600'}`} />
          </div>
          <h3 className="text-base font-black mt-2">Le Suivi</h3>
          <p
            className={`text-xs mt-0.5 line-clamp-1 ${
              activePillar === 'suivi' ? 'text-blue-100' : 'text-slate-500'
            }`}
          >
            Appel en direct, assiduité & carnet de vigilance
          </p>
        </button>

        {/* PILIER 2 BUTTON */}
        <button
          onClick={() => setActivePillar('transmission')}
          className={`p-4 rounded-xl text-left transition-all relative overflow-hidden group ${
            activePillar === 'transmission'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
              : 'hover:bg-slate-50 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                activePillar === 'transmission'
                  ? 'bg-white/20 text-white'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              Pilier 2
            </span>
            <BookOpen className={`w-5 h-5 ${activePillar === 'transmission' ? 'text-emerald-200' : 'text-emerald-600'}`} />
          </div>
          <h3 className="text-base font-black mt-2">La Transmission</h3>
          <p
            className={`text-xs mt-0.5 line-clamp-1 ${
              activePillar === 'transmission' ? 'text-emerald-100' : 'text-slate-500'
            }`}
          >
            Cahier de texte, devoirs & liaison familles
          </p>
        </button>

        {/* PILIER 3 BUTTON */}
        <button
          onClick={() => setActivePillar('securite')}
          className={`p-4 rounded-xl text-left transition-all relative overflow-hidden group ${
            activePillar === 'securite'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
              : 'hover:bg-slate-50 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                activePillar === 'securite'
                  ? 'bg-white/20 text-white'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              Pilier 3
            </span>
            <ShieldCheck className={`w-5 h-5 ${activePillar === 'securite' ? 'text-rose-200' : 'text-rose-600'}`} />
          </div>
          <h3 className="text-base font-black mt-2">La Sécurité</h3>
          <p
            className={`text-xs mt-0.5 line-clamp-1 ${
              activePillar === 'securite' ? 'text-rose-100' : 'text-slate-500'
            }`}
          >
            Fiches PAI, autorisations de sortie & incidents
          </p>
        </button>
      </div>

      {/* Active Pillar Display */}
      {activePillar === 'suivi' && (
        <SuiviPillar
          selectedClass={selectedClass}
          onClassChange={setSelectedClass}
          availableClasses={availableClasses}
        />
      )}

      {activePillar === 'transmission' && (
        <TransmissionPillar
          selectedClass={selectedClass}
          onClassChange={setSelectedClass}
          availableClasses={availableClasses}
        />
      )}

      {activePillar === 'securite' && (
        <SecuritePillar
          selectedClass={selectedClass}
          onClassChange={setSelectedClass}
          availableClasses={availableClasses}
        />
      )}
    </div>
  );
};
