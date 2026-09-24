import React, { useState, useMemo } from 'react';
import { SeanceEmploiDuTemps, JourSemaine } from '../../types';
import {
  Clock,
  MapPin,
  User,
  BookOpen,
  Calendar,
  Printer,
  Download,
  Info,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  FileText,
  X,
  Filter,
} from 'lucide-react';

interface TimetableGridProps {
  seances: SeanceEmploiDuTemps[];
  classNameTitle?: string;
  subtitle?: string;
  studentName?: string;
  isParentView?: boolean;
  canEdit?: boolean;
  onEditSeance?: (seance: SeanceEmploiDuTemps) => void;
  onDeleteSeance?: (id: number) => void;
  onAddSeance?: () => void;
}

const JOURS: { key: JourSemaine; label: string; short: string }[] = [
  { key: 'LUNDI', label: 'Lundi', short: 'Lun' },
  { key: 'MARDI', label: 'Mardi', short: 'Mar' },
  { key: 'MERCREDI', label: 'Mercredi', short: 'Mer' },
  { key: 'JEUDI', label: 'Jeudi', short: 'Jeu' },
  { key: 'VENDREDI', label: 'Vendredi', short: 'Ven' },
  { key: 'SAMEDI', label: 'Samedi', short: 'Sam' },
];

const TIME_SLOTS = [
  { start: '08:00', end: '10:00', label: '08h00 - 10h00', period: 'Matin 1' },
  { start: '10:15', end: '12:15', label: '10h15 - 12h15', period: 'Matin 2' },
  { start: '12:15', end: '14:00', label: '12h15 - 14h00', period: 'Pause Déjeuner', isBreak: true },
  { start: '14:00', end: '16:00', label: '14h00 - 16h00', period: 'Après-midi 1' },
  { start: '16:15', end: '18:00', label: '16h15 - 18h00', period: 'Après-midi 2' },
];

// Color styling mappings
const getSubjectColorStyles = (couleur?: string, matiere?: string) => {
  const m = (matiere || '').toLowerCase();
  let c = couleur;
  if (!c) {
    if (m.includes('math')) c = 'blue';
    else if (m.includes('physiq') || m.includes('chimie')) c = 'cyan';
    else if (m.includes('svt') || m.includes('bio')) c = 'emerald';
    else if (m.includes('franç') || m.includes('litt')) c = 'rose';
    else if (m.includes('hist') || m.includes('géo')) c = 'amber';
    else if (m.includes('angl') || m.includes('esp')) c = 'indigo';
    else if (m.includes('philo')) c = 'purple';
    else if (m.includes('eps') || m.includes('sport')) c = 'teal';
    else c = 'slate';
  }

  switch (c) {
    case 'blue':
      return {
        bg: 'bg-blue-50 hover:bg-blue-100/90 border-blue-200 text-blue-900',
        badge: 'bg-blue-600 text-white',
        borderLeft: 'border-l-4 border-l-blue-600',
        dot: 'bg-blue-500',
        headerText: 'text-blue-700',
      };
    case 'cyan':
      return {
        bg: 'bg-cyan-50 hover:bg-cyan-100/90 border-cyan-200 text-cyan-950',
        badge: 'bg-cyan-700 text-white',
        borderLeft: 'border-l-4 border-l-cyan-600',
        dot: 'bg-cyan-500',
        headerText: 'text-cyan-800',
      };
    case 'emerald':
      return {
        bg: 'bg-emerald-50 hover:bg-emerald-100/90 border-emerald-200 text-emerald-950',
        badge: 'bg-emerald-600 text-white',
        borderLeft: 'border-l-4 border-l-emerald-600',
        dot: 'bg-emerald-500',
        headerText: 'text-emerald-700',
      };
    case 'rose':
      return {
        bg: 'bg-rose-50 hover:bg-rose-100/90 border-rose-200 text-rose-950',
        badge: 'bg-rose-600 text-white',
        borderLeft: 'border-l-4 border-l-rose-600',
        dot: 'bg-rose-500',
        headerText: 'text-rose-700',
      };
    case 'amber':
      return {
        bg: 'bg-amber-50 hover:bg-amber-100/90 border-amber-200 text-amber-950',
        badge: 'bg-amber-600 text-white',
        borderLeft: 'border-l-4 border-l-amber-600',
        dot: 'bg-amber-500',
        headerText: 'text-amber-800',
      };
    case 'purple':
      return {
        bg: 'bg-purple-50 hover:bg-purple-100/90 border-purple-200 text-purple-950',
        badge: 'bg-purple-600 text-white',
        borderLeft: 'border-l-4 border-l-purple-600',
        dot: 'bg-purple-500',
        headerText: 'text-purple-700',
      };
    case 'indigo':
      return {
        bg: 'bg-indigo-50 hover:bg-indigo-100/90 border-indigo-200 text-indigo-950',
        badge: 'bg-indigo-600 text-white',
        borderLeft: 'border-l-4 border-l-indigo-600',
        dot: 'bg-indigo-500',
        headerText: 'text-indigo-700',
      };
    case 'teal':
      return {
        bg: 'bg-teal-50 hover:bg-teal-100/90 border-teal-200 text-teal-950',
        badge: 'bg-teal-600 text-white',
        borderLeft: 'border-l-4 border-l-teal-600',
        dot: 'bg-teal-500',
        headerText: 'text-teal-800',
      };
    default:
      return {
        bg: 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800',
        badge: 'bg-slate-700 text-white',
        borderLeft: 'border-l-4 border-l-slate-600',
        dot: 'bg-slate-500',
        headerText: 'text-slate-700',
      };
  }
};

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  seances,
  classNameTitle = 'Terminale S1',
  subtitle = 'Année scolaire 2025-2026 • Emploi du temps officiel',
  studentName,
  isParentView = false,
  canEdit = false,
  onEditSeance,
  onDeleteSeance,
  onAddSeance,
}) => {
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [selectedDay, setSelectedDay] = useState<JourSemaine>('LUNDI');
  const [selectedSeance, setSelectedSeance] = useState<SeanceEmploiDuTemps | null>(null);
  const [searchSubject, setSearchSubject] = useState('');

  // Determine current day for visual accent
  const currentDayName = useMemo(() => {
    const dayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday...
    switch (dayIndex) {
      case 1:
        return 'LUNDI';
      case 2:
        return 'MARDI';
      case 3:
        return 'MERCREDI';
      case 4:
        return 'JEUDI';
      case 5:
        return 'VENDREDI';
      case 6:
        return 'SAMEDI';
      default:
        return 'LUNDI';
    }
  }, []);

  // Filtered sessions
  const filteredSeances = useMemo(() => {
    return seances.filter((s) => {
      if (searchSubject.trim()) {
        const q = searchSubject.toLowerCase();
        const matchMat = s.matiere_nom.toLowerCase().includes(q);
        const matchProf = s.enseignant_nom.toLowerCase().includes(q);
        const matchSalle = s.salle.toLowerCase().includes(q);
        if (!matchMat && !matchProf && !matchSalle) return false;
      }
      return true;
    });
  }, [seances, searchSubject]);

  // Today's sessions for summary widget
  const todaySeances = useMemo(() => {
    return seances
      .filter((s) => s.jour === currentDayName)
      .sort((a, b) => a.heure_debut.localeCompare(b.heure_debut));
  }, [seances, currentDayName]);

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              {classNameTitle}
            </span>
            {studentName && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
                <User className="w-3.5 h-3.5 text-amber-600" />
                {isParentView ? `Élève suivi : ${studentName}` : studentName}
              </span>
            )}
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Emploi du temps validé
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Planning & Emploi du Temps Hebdomadaire
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        {/* View Switch & Print Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'week'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Grille Semaine
            </button>
            <button
              onClick={() => {
                setViewMode('day');
                setSelectedDay(currentDayName);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'day'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vue par Jour
            </button>
          </div>

          {/* Print / Export Button */}
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            title="Imprimer l'emploi du temps"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer</span>
          </button>

          {canEdit && onAddSeance && (
            <button
              onClick={onAddSeance}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ajouter un cours</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Summary of Today's Classes */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/40 border border-blue-400/30 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full border border-blue-400/20">
                  {currentDayName === 'SAMEDI' || currentDayName === 'LUNDI' ? 'Journée de cours' : 'Aujourd\'hui'}
                </span>
                <span className="text-xs text-blue-200">
                  {JOURS.find((j) => j.key === currentDayName)?.label}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {todaySeances.length > 0
                  ? `${todaySeances.length} séance${todaySeances.length > 1 ? 's' : ''} au programme`
                  : 'Pas de cours prévus aujourd\'hui'}
              </h3>
              <p className="text-xs text-slate-300">
                {todaySeances.length > 0
                  ? `De ${todaySeances[0]?.heure_debut} à ${todaySeances[todaySeances.length - 1]?.heure_fin} • Salle principale : ${todaySeances[0]?.salle}`
                  : 'Profitez de cette journée pour réviser et préparer vos devoirs.'}
              </p>
            </div>
          </div>

          {/* Quick pills of today's classes */}
          {todaySeances.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {todaySeances.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedSeance(s)}
                  className="cursor-pointer px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl border border-white/10 text-xs transition-all flex items-center gap-2"
                >
                  <span className="font-mono text-[11px] text-blue-200 font-bold">{s.heure_debut}</span>
                  <span className="font-semibold text-white truncate max-w-[120px]">{s.matiere_nom}</span>
                  <span className="text-[10px] text-slate-300 bg-white/15 px-1.5 py-0.5 rounded">{s.salle}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Day Selector Tabs (Always visible in day mode, or quick filters) */}
      {viewMode === 'day' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {JOURS.map((j) => {
            const isSelected = selectedDay === j.key;
            const isToday = j.key === currentDayName;
            const countForDay = seances.filter((s) => s.jour === j.key).length;

            return (
              <button
                key={j.key}
                onClick={() => setSelectedDay(j.key)}
                className={`px-4 py-3 rounded-2xl font-bold text-xs shrink-0 transition-all flex items-center gap-2.5 border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/25'
                    : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <span>{j.label}</span>
                {isToday && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    Aujourd'hui
                  </span>
                )}
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {countForDay} cours
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* VUE 1 : GRILLE SEMAINE COMPLÈTE (HEBDOMADAIRE)           */}
      {/* ======================================================== */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Grille des cours :
              </span>
              <span className="text-xs font-semibold text-slate-700">Lundi au Samedi</span>
            </div>

            {/* Quick search input */}
            <div className="relative">
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchSubject}
                onChange={(e) => setSearchSubject(e.target.value)}
                placeholder="Filtrer matière, prof, salle..."
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
              />
              {searchSubject && (
                <button
                  onClick={() => setSearchSubject('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[850px]">
              {/* Header row: Days */}
              <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100/80 text-xs font-bold text-slate-700">
                <div className="p-3 text-center border-r border-slate-200 text-slate-400 uppercase text-[11px] flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  Horaires
                </div>
                {JOURS.map((j) => {
                  const isToday = j.key === currentDayName;
                  return (
                    <div
                      key={j.key}
                      className={`p-3 text-center border-r border-slate-200 last:border-r-0 ${
                        isToday ? 'bg-blue-50/80 text-blue-700' : ''
                      }`}
                    >
                      <div className="font-extrabold uppercase tracking-wide text-xs">{j.label}</div>
                      {isToday && (
                        <span className="text-[10px] text-blue-600 font-bold block mt-0.5">
                          • Aujourd'hui •
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Time slots rows */}
              {TIME_SLOTS.map((slot) => {
                // If this is the lunch break slot
                if (slot.isBreak) {
                  return (
                    <div
                      key={slot.label}
                      className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-[11px] text-slate-400 py-2"
                    >
                      <div className="text-center font-mono font-bold text-slate-400 flex items-center justify-center">
                        {slot.start} - {slot.end}
                      </div>
                      <div className="col-span-6 flex items-center justify-center text-slate-400 italic font-medium gap-2">
                        <span>🍽️ Pause Déjeuner & Détente (12h15 - 14h00)</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={slot.label}
                    className="grid grid-cols-7 border-b border-slate-100 last:border-b-0 min-h-[110px]"
                  >
                    {/* Time Slot Column */}
                    <div className="p-3 border-r border-slate-200 bg-slate-50/60 flex flex-col items-center justify-center text-center">
                      <span className="font-bold text-xs font-mono text-slate-700">{slot.start}</span>
                      <span className="text-[10px] text-slate-400 font-medium">à</span>
                      <span className="font-bold text-xs font-mono text-slate-700">{slot.end}</span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 mt-1 font-semibold">
                        {slot.period}
                      </span>
                    </div>

                    {/* Day Cells */}
                    {JOURS.map((j) => {
                      // Find sessions that match this day and slot
                      const cellSeances = filteredSeances.filter((s) => {
                        return s.jour === j.key && s.heure_debut === slot.start;
                      });

                      const isToday = j.key === currentDayName;

                      return (
                        <div
                          key={j.key}
                          className={`p-2 border-r border-slate-100 last:border-r-0 flex flex-col gap-1.5 transition-colors ${
                            isToday ? 'bg-blue-50/20' : ''
                          }`}
                        >
                          {cellSeances.length > 0 ? (
                            cellSeances.map((s) => {
                              const style = getSubjectColorStyles(s.couleur, s.matiere_nom);
                              return (
                                <div
                                  key={s.id}
                                  onClick={() => setSelectedSeance(s)}
                                  className={`p-2.5 rounded-xl border text-xs cursor-pointer shadow-xs transition-all transform hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between h-full ${style.bg} ${style.borderLeft}`}
                                >
                                  <div>
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                      <span
                                        className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${style.badge}`}
                                      >
                                        {s.type || 'COURS'}
                                      </span>
                                      <span className="font-mono text-[10px] text-slate-500 font-bold">
                                        {s.salle}
                                      </span>
                                    </div>
                                    <h4 className="font-extrabold text-xs leading-snug line-clamp-2">
                                      {s.matiere_nom}
                                    </h4>
                                  </div>

                                  <div className="mt-2 pt-1 border-t border-black/5 flex items-center justify-between text-[11px] text-slate-600">
                                    <span className="truncate max-w-[100px] font-medium" title={s.enseignant_nom}>
                                      {s.enseignant_nom}
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="h-full rounded-xl border border-dashed border-slate-200/60 flex items-center justify-center text-[11px] text-slate-300 select-none">
                              {j.key === 'SAMEDI' && slot.start >= '12:00' ? 'Fermé' : 'Libre'}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VUE 2 : VUE PAR JOUR (AGENDA QUOTIDIEN)                  */}
      {/* ======================================================== */}
      {viewMode === 'day' && (
        <div className="space-y-4">
          {(() => {
            const daySessions = filteredSeances
              .filter((s) => s.jour === selectedDay)
              .sort((a, b) => a.heure_debut.localeCompare(b.heure_debut));

            if (daySessions.length === 0) {
              return (
                <div className="bg-white rounded-2xl p-12 border border-slate-200/80 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    Aucun cours programmé le {JOURS.find((j) => j.key === selectedDay)?.label}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Cette journée ne comporte pas de séances obligatoires ou correspond au repos hebdomadaire.
                  </p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {daySessions.map((s, idx) => {
                  const style = getSubjectColorStyles(s.couleur, s.matiere_nom);

                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedSeance(s)}
                      className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${style.borderLeft}`}
                    >
                      <div>
                        {/* Top Meta */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                              {s.heure_debut} - {s.heure_fin}
                            </span>
                            <span
                              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${style.badge}`}
                            >
                              {s.type || 'COURS'}
                            </span>
                          </div>

                          <span className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                            <MapPin className="w-3.5 h-3.5 text-blue-600" />
                            {s.salle}
                          </span>
                        </div>

                        {/* Subject Title */}
                        <h4 className="text-lg font-black text-slate-900 tracking-tight mb-2">
                          {s.matiere_nom}
                        </h4>

                        {s.description && (
                          <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-2">
                            {s.description}
                          </p>
                        )}
                      </div>

                      {/* Bottom Info: Teacher & Requisite */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-blue-600 text-[11px]">
                            {s.enseignant_nom.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800 block text-xs">
                              {s.enseignant_nom}
                            </span>
                            <span className="text-[10px] text-slate-400">Professeur en charge</span>
                          </div>
                        </div>

                        {s.materiel_requis && (
                          <span className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 font-medium">
                            🎒 {s.materiel_requis.slice(0, 25)}...
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* Course Detail Modal */}
      {selectedSeance && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-fadeIn">
            <button
              onClick={() => setSelectedSeance(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                {selectedSeance.jour} • {selectedSeance.type || 'COURS'}
              </span>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                {selectedSeance.classe_nom}
              </span>
            </div>

            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {selectedSeance.matiere_nom}
            </h3>

            <div className="my-5 grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-semibold block text-[11px] mb-1">Horaires</span>
                <span className="font-bold text-slate-900 text-sm font-mono">
                  {selectedSeance.heure_debut} - {selectedSeance.heure_fin}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-semibold block text-[11px] mb-1">Salle de cours</span>
                <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  {selectedSeance.salle}
                </span>
              </div>
              <div className="col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">Enseignant</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedSeance.enseignant_nom}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
              </div>
            </div>

            {selectedSeance.description && (
              <div className="mb-4">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Programme & Thème abordé :
                </h5>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {selectedSeance.description}
                </p>
              </div>
            )}

            {selectedSeance.materiel_requis && (
              <div className="mb-6 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Matériel requis pour cette séance :</strong>
                  <p className="mt-0.5 text-amber-800">{selectedSeance.materiel_requis}</p>
                </div>
              </div>
            )}

            {isParentView && (
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200/70 text-xs text-blue-900 mb-6 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Espace Parents :</span>
                  <p className="text-[11px] text-blue-800 mt-0.5">
                    Présence obligatoire. Vous serez immédiatement notifié par SMS et notification en cas de retard ou absence signalée sur ce créneau.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedSeance(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
