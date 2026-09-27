import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { schoolService } from '../../services/schoolService';
import { User, Note, Absence, Paiement, DocumentScolaire, SeanceEmploiDuTemps } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { DocumentViewer } from '../common/DocumentViewer';
import { TimetableGrid } from '../timetable/TimetableGrid';
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarX,
  CreditCard,
  FileCheck2,
  TrendingUp,
  Clock,
  Eye,
  Printer,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Award,
  ChevronRight,
  Download,
  CalendarDays,
} from 'lucide-react';

interface ParentDashboardProps {
  onNavigate: (tab: string) => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [childrenList, setChildrenList] = useState<User[]>([]);
  const [selectedChild, setSelectedChild] = useState<User | null>(null);

  const [notes, setNotes] = useState<Note[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [documents, setDocuments] = useState<DocumentScolaire[]>([]);
  const [childSeances, setChildSeances] = useState<SeanceEmploiDuTemps[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Tab inside Parent Dashboard
  const [activeTab, setActiveTab] = useState<'overview' | 'timetable' | 'notes' | 'absences' | 'paiements' | 'documents'>('overview');
  const [selectedTrimestre, setSelectedTrimestre] = useState<string>('ALL');
  const [docFilterType, setDocFilterType] = useState<string>('ALL');
  const [viewingDocument, setViewingDocument] = useState<DocumentScolaire | null>(null);

  // 1. Fetch children connected to this parent
  useEffect(() => {
    const fetchChildren = async () => {
      setLoading(true);
      try {
        const allUsers = await schoolService.getUsers('ELEVE');
        // Match children by children_ids or matching last_name or default to Fatou Sow (id: 4)
        let parentChildren = allUsers.filter((u) => {
          if (user?.children_ids && user.children_ids.length > 0) {
            return user.children_ids.includes(u.id);
          }
          if (user?.last_name && u.last_name.toLowerCase() === user.last_name.toLowerCase()) {
            return true;
          }
          return u.id === 4 || u.last_name === 'Sow';
        });

        if (parentChildren.length === 0 && allUsers.length > 0) {
          parentChildren = [allUsers[0]];
        }

        setChildrenList(parentChildren);
        setSelectedChild(parentChildren[0] || null);
      } catch (err) {
        console.error('Error fetching children for parent:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, [user]);

  // 2. Fetch data for selected child
  useEffect(() => {
    if (!selectedChild) return;

    const fetchChildData = async () => {
      try {
        const childClassId = selectedChild.classe_id || (selectedChild.classe_nom?.includes('3ème') ? 2 : 3);
        const [allNotes, allAbsences, allPaiements, allDocs, timetableSeances] = await Promise.all([
          schoolService.getNotes(selectedChild.id),
          schoolService.getAbsences(),
          schoolService.getPaiements(),
          schoolService.getDocuments(),
          schoolService.getEmploiDuTemps(childClassId),
        ]);
        setChildSeances(timetableSeances);

        // Filter for this child specifically
        const childNotes = allNotes.filter(
          (n) =>
            n.eleve_id === selectedChild.id ||
            n.eleve_matricule === selectedChild.matricule ||
            n.eleve_nom.toLowerCase().includes(selectedChild.last_name.toLowerCase())
        );

        const childAbsences = allAbsences.filter(
          (a) =>
            a.eleve_id === selectedChild.id ||
            a.eleve_matricule === selectedChild.matricule ||
            a.eleve_nom.toLowerCase().includes(selectedChild.last_name.toLowerCase())
        );

        const childPaiements = allPaiements.filter(
          (p) =>
            p.eleve_id === selectedChild.id ||
            p.eleve_matricule === selectedChild.matricule ||
            p.eleve_nom.toLowerCase().includes(selectedChild.last_name.toLowerCase())
        );

        const childDocs = allDocs.filter(
          (d) =>
            d.eleve_id === selectedChild.id ||
            d.eleve_matricule === selectedChild.matricule ||
            d.eleve_nom.toLowerCase().includes(selectedChild.last_name.toLowerCase())
        );

        setNotes(childNotes);
        setAbsences(childAbsences);
        setPaiements(childPaiements);
        setDocuments(childDocs);
      } catch (err) {
        console.error('Error loading child data:', err);
      }
    };

    fetchChildData();
  }, [selectedChild]);

  // Group notes by subject
  const notesBySubject = useMemo<Record<string, Note[]>>(() => {
    const grouped: Record<string, Note[]> = {};
    notes.forEach((n) => {
      if (selectedTrimestre !== 'ALL' && n.trimestre !== selectedTrimestre) return;
      if (!grouped[n.matiere_nom]) {
        grouped[n.matiere_nom] = [];
      }
      grouped[n.matiere_nom].push(n);
    });
    return grouped;
  }, [notes, selectedTrimestre]);

  // Subject Averages
  const subjectAverages = useMemo<Record<string, { average: number; totalCoef: number; count: number }>>(() => {
    const averages: Record<string, { average: number; totalCoef: number; count: number }> = {};
    (Object.entries(notesBySubject) as [string, Note[]][]).forEach(([subject, noteList]) => {
      const totalPoints = noteList.reduce((sum, n) => sum + n.valeur * (n.coefficient || 1), 0);
      const totalCoef = noteList.reduce((sum, n) => sum + (n.coefficient || 1), 0);
      averages[subject] = {
        average: totalCoef > 0 ? parseFloat((totalPoints / totalCoef).toFixed(2)) : 0,
        totalCoef,
        count: noteList.length,
      };
    });
    return averages;
  }, [notesBySubject]);

  // General Average Calculation
  const overallAverage = useMemo(() => {
    const entries = Object.values(subjectAverages) as Array<{ average: number; totalCoef: number; count: number }>;
    if (entries.length === 0) return 0;
    const totalWeightedAvg = entries.reduce((sum, item) => sum + item.average * item.totalCoef, 0);
    const totalCoefs = entries.reduce((sum, item) => sum + item.totalCoef, 0);
    return totalCoefs > 0 ? parseFloat((totalWeightedAvg / totalCoefs).toFixed(2)) : 0;
  }, [subjectAverages]);

  // Payment totals for child
  const totalPaid = useMemo(() => {
    return paiements.reduce((sum, p) => sum + p.montant, 0);
  }, [paiements]);

  const totalFeesRequired = paiements[0]?.frais_totaux || 550000;
  const remainingBalance = Math.max(0, totalFeesRequired - totalPaid);

  // Absences and retards totals
  const totalAbsencesCount = useMemo(() => {
    return absences.filter((a) => a.type === 'ABSENCE').length;
  }, [absences]);

  const totalRetardsCount = useMemo(() => {
    return absences.filter((a) => a.type === 'RETARD').length;
  }, [absences]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner for Espace Parent */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full border border-amber-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Espace Parent • Mode Consultation Exclusive</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Bienvenue, {user?.first_name} {user?.last_name} 👋
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
              Suivi scolaire, notes, assiduité, reçus de scolarité et documents officiels des enfants rattachés à votre compte.
            </p>
          </div>

          {/* Child Selector Dropdown if multiple children */}
          {childrenList.length > 0 && (
            <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700 space-y-1.5 shrink-0">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Enfant rattaché :
              </label>
              <select
                value={selectedChild?.id || ''}
                onChange={(e) => {
                  const found = childrenList.find((c) => c.id === parseInt(e.target.value));
                  if (found) setSelectedChild(found);
                }}
                className="bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg border border-slate-700 outline-none focus:border-amber-500 w-full"
              >
                {childrenList.map((c) => {
                  const isSon =
                    c.first_name.toLowerCase() === 'mamadou' ||
                    c.username.includes('mamadou') ||
                    c.id === 7;
                  return (
                    <option key={c.id} value={c.id}>
                      {c.first_name} {c.last_name} ({isSon ? 'Fils' : 'Fille'} • {c.classe_nom || 'Élève'})
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Selected Child Info Card */}
      {selectedChild && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={selectedChild.avatar || 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=250'}
              alt={selectedChild.first_name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500/30 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">
                  {selectedChild.first_name} {selectedChild.last_name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  {selectedChild.matricule}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Classe : <strong className="text-slate-800">{selectedChild.classe_nom || 'Terminale S1'}</strong> • Filière : {selectedChild.filiere_nom || 'Sciences Exactes'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200/80 text-center flex-1 md:flex-none">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Année Scolaire</span>
              <span className="text-xs font-bold text-slate-800">2025-2026</span>
            </div>
            <div className="px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-200/80 text-center flex-1 md:flex-none">
              <span className="text-[10px] uppercase font-bold text-emerald-600 block">Scolarité</span>
              <span className="text-xs font-black text-emerald-700">
                {remainingBalance === 0 ? 'Réglée' : `Reste: ${remainingBalance.toLocaleString('fr-FR')} F`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Primary Navigation Tabs inside Espace Parent */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-amber-400" />
          Aperçu Général
        </button>

        <button
          onClick={() => setActiveTab('timetable')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'timetable'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          Emploi du Temps ({childSeances.length} cours)
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'notes'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Notes & Évaluations ({notes.length})
        </button>

        <button
          onClick={() => setActiveTab('absences')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'absences'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CalendarX className="w-4 h-4" />
          Absences & Retards ({absences.length})
        </button>

        <button
          onClick={() => setActiveTab('paiements')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'paiements'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Frais & Paiements ({paiements.length})
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'documents'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          Documents Officiels ({documents.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Moyenne Générale */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Moyenne Générale</p>
                <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
                  {overallAverage > 0 ? `${overallAverage}/20` : 'En attente'}
                </p>
                <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Résultats du 1er Trimestre
                </p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                <Award className="w-6 h-6" />
              </div>
            </div>

            {/* Scolarité & Versée */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Frais de Scolarité</p>
                <p className="text-2xl font-black text-emerald-600 mt-1 font-mono">
                  {totalPaid.toLocaleString('fr-FR')} FCFA
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Sur {totalFeesRequired.toLocaleString('fr-FR')} FCFA totaux</p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>

            {/* Absences */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Absences</p>
                <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
                  {totalAbsencesCount} <span className="text-xs font-normal text-slate-500">absence(s)</span>
                </p>
                <p className="text-[11px] text-amber-600 font-bold mt-1">Cumul de l'année</p>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
                <CalendarX className="w-6 h-6" />
              </div>
            </div>

            {/* Retards */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Retards</p>
                <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
                  {totalRetardsCount} <span className="text-xs font-normal text-slate-500">retard(s)</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Signalés en classe</p>
              </div>
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Quick Subject Averages Overview */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Moyennes par Matière</h3>
                <p className="text-xs text-slate-500">Performance académique actuelle de votre enfant</p>
              </div>
              <button
                onClick={() => setActiveTab('notes')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                Détails des devoirs <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(Object.entries(subjectAverages) as [string, { average: number; totalCoef: number; count: number }][]).map(([subject, data]) => (
                <div
                  key={subject}
                  className="p-4 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{subject}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {data.count} évaluation(s) • Coef. {data.totalCoef}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-black font-mono px-2.5 py-1 rounded-lg ${
                      data.average >= 14
                        ? 'bg-emerald-100 text-emerald-800'
                        : data.average >= 10
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {data.average}/20
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Schedule Widget in Overview */}
          {selectedChild && (
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-5 rounded-2xl border border-indigo-900/50 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0">
                  <CalendarDays className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                      {selectedChild.first_name.toLowerCase() === 'mamadou' ? 'Emploi du temps de mon fils' : 'Emploi du temps de ma fille'}
                    </span>
                    <span className="text-xs text-slate-300 font-semibold">{selectedChild.first_name} {selectedChild.last_name}</span>
                    <span className="text-[11px] text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full">{selectedChild.classe_nom || '3ème B'}</span>
                  </div>
                  <h4 className="text-base font-bold text-white mt-1">
                    {childSeances.length > 0 ? `${childSeances.length} séances de cours au programme hebdomadaire` : 'Planning académique officiel'}
                  </h4>
                  <p className="text-xs text-slate-300">
                    Consultez l'agenda complet de la semaine, les heures d'entrée et de sortie, les salles et les professeurs.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('timetable')}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md shadow-amber-500/20 shrink-0"
              >
                <span>Voir l'emploi du temps complet</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB: EMPLOI DU TEMPS DE L'ENFANT */}
      {activeTab === 'timetable' && selectedChild && (
        <div className="space-y-6">
          <TimetableGrid
            seances={childSeances}
            classNameTitle={selectedChild.classe_nom || '3ème B'}
            studentName={`${selectedChild.first_name} ${selectedChild.last_name}`}
            isParentView={true}
            subtitle={`Emploi du temps de ${
              selectedChild.first_name.toLowerCase() === 'mamadou' ? 'votre fils' : 'votre fille'
            } ${selectedChild.first_name} ${selectedChild.last_name} (${selectedChild.classe_nom || '3ème B'}) • Année Académique 2025-2026`}
          />
        </div>
      )}

      {/* TAB 2: NOTES & EVALUATIONS (LECTURE SEULE) */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          {/* Trimestre Filter & Summary */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1 overflow-x-auto">
              {[
                { id: 'ALL', label: 'Tous les Trimestres' },
                { id: 'TRIMESTRE_1', label: '1er Trimestre' },
                { id: 'TRIMESTRE_2', label: '2ème Trimestre' },
                { id: 'TRIMESTRE_3', label: '3ème Trimestre' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTrimestre(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedTrimestre === tab.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-slate-500 block">Moyenne Générale :</span>
              <span className="text-lg font-black text-blue-600 font-mono">{overallAverage}/20</span>
            </div>
          </div>

          {/* Notes breakdown by subject */}
          {(Object.entries(notesBySubject) as [string, Note[]][]).map(([subject, noteList]) => {
            const subAvg = subjectAverages[subject]?.average || 0;
            return (
              <div key={subject} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      {subject}
                    </h3>
                    <p className="text-[11px] text-slate-500">{noteList.length} évaluation(s) enregistrée(s)</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Moyenne Matière</span>
                    <span
                      className={`text-base font-black font-mono ${
                        subAvg >= 14 ? 'text-emerald-600' : subAvg >= 10 ? 'text-blue-600' : 'text-rose-600'
                      }`}
                    >
                      {subAvg}/20
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                        <th className="pb-2">Évaluation / Intitulé</th>
                        <th className="pb-2 text-center">Type</th>
                        <th className="pb-2 text-center">Coefficient</th>
                        <th className="pb-2 text-center">Note / 20</th>
                        <th className="pb-2">Appréciation Enseignant</th>
                        <th className="pb-2 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {noteList.map((n) => (
                        <tr key={n.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 font-bold text-slate-900">{n.evaluation_titre}</td>
                          <td className="py-2.5 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                              {n.evaluation_id ? 'Devoir/Examen' : 'Évaluation'}
                            </span>
                          </td>
                          <td className="py-2.5 text-center font-bold text-slate-700">Coef. {n.coefficient}</td>
                          <td className="py-2.5 text-center">
                            <span className="px-2.5 py-1 bg-slate-900 text-white font-mono font-bold text-xs rounded-lg">
                              {n.valeur}/20
                            </span>
                          </td>
                          <td className="py-2.5 text-slate-600 italic">{n.appreciation || 'Aucun commentaire'}</td>
                          <td className="py-2.5 text-right font-mono text-slate-400 text-[11px]">{n.date_saisie}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: ABSENCES & RETARDS (LECTURE SEULE) */}
      {activeTab === 'absences' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Absences</p>
                <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{totalAbsencesCount}</p>
                <p className="text-[11px] text-slate-500 mt-1">Heures manquées en classe</p>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
                <CalendarX className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Retards</p>
                <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{totalRetardsCount}</p>
                <p className="text-[11px] text-slate-500 mt-1">Arrivées tardives signalées</p>
              </div>
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Historique complet des assiduités</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="p-3">Type</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Matière</th>
                    <th className="p-3">Durée</th>
                    <th className="p-3">Motif & Justificatif</th>
                    <th className="p-3 text-right">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {absences.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            a.type === 'ABSENCE'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {a.type}
                        </span>
                      </td>

                      <td className="p-3 font-mono font-bold text-slate-900">{a.date_absence}</td>
                      <td className="p-3 font-semibold text-slate-700">{a.matiere_nom || 'Général'}</td>
                      <td className="p-3 font-mono font-bold text-slate-800">{a.duree_heures}h</td>
                      <td className="p-3 text-slate-600 italic">{a.motif || 'Aucun motif renseigné'}</td>

                      <td className="p-3 text-right">
                        <Badge status={a.statut} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PAIEMENTS & FRAIS DE SCOLARITE (LECTURE SEULE) */}
      {activeTab === 'paiements' && (
        <div className="space-y-6">
          <div className="p-5 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800 shadow-xl">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Total Versé par la Famille
              </p>
              <h3 className="text-3xl font-black text-emerald-400 mt-1">
                {totalPaid.toLocaleString('fr-FR')} FCFA
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-bold">Reste à payer :</span>
              <span className="text-xl font-bold font-mono text-amber-400">
                {remainingBalance.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Historique des Règlement & Reçus de Scolarité</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="p-3">N° Reçu & Date</th>
                    <th className="p-3">Tranche / Intitulé</th>
                    <th className="p-3">Montant Versé</th>
                    <th className="p-3">Mode de Règlement</th>
                    <th className="p-3">Statut</th>
                    <th className="p-3 text-right">Reçu PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paiements.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {p.reference_recu}
                        <span className="block text-[10px] font-sans font-normal text-slate-400">{p.date_paiement}</span>
                      </td>

                      <td className="p-3 font-medium text-slate-700">{p.tranche}</td>

                      <td className="p-3 font-mono font-bold text-emerald-700 text-sm">
                        {p.montant.toLocaleString('fr-FR')} FCFA
                      </td>

                      <td className="p-3">
                        <span className="px-2.5 py-1 bg-slate-100 rounded text-[11px] font-semibold text-slate-700">
                          {p.mode_paiement}
                        </span>
                      </td>

                      <td className="p-3">
                        <Badge status={p.statut} />
                      </td>

                      <td className="p-3 text-right">
                        <button
                          onClick={async () => {
                            const doc = await schoolService.createDocument({
                              reference: p.reference_recu,
                              type: 'RECU_PAIEMENT',
                              titre: `Reçu de Paiement - ${p.tranche}`,
                              eleve_id: p.eleve_id,
                              eleve_nom: p.eleve_nom,
                              eleve_matricule: p.eleve_matricule,
                              classe_nom: p.classe_nom,
                              annee_academique: '2025-2026',
                              metadata: {
                                montant: `${p.montant.toLocaleString('fr-FR')} FCFA`,
                                mode: p.mode_paiement,
                                statut: p.statut,
                              },
                            });
                            setViewingDocument(doc);
                          }}
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] rounded-lg transition-colors shadow-xs"
                        >
                          Télécharger Reçu
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DOCUMENTS OFFICIELS */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1 overflow-x-auto">
              {[
                { id: 'ALL', label: 'Tous les Documents' },
                { id: 'BULLETIN', label: 'Bulletins de Notes' },
                { id: 'CERTIFICAT_SCOLARITE', label: 'Certificats de Scolarité' },
                { id: 'RECU_PAIEMENT', label: 'Reçus de Paiement' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDocFilterType(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    docFilterType === tab.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-400 font-medium">
              {documents.filter((d) => docFilterType === 'ALL' || d.type === docFilterType).length} document(s) prêt(s)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents
              .filter((d) => docFilterType === 'ALL' || d.type === docFilterType)
              .map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                        Ref: {doc.reference}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                        {doc.titre}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1">Émis le {doc.date_generation || 'Année 2025-2026'}</p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setViewingDocument(doc)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all flex-1 justify-center"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Aperçu PDF
                    </button>
                    <button
                      onClick={() => setViewingDocument(doc)}
                      title="Imprimer"
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors border border-slate-200"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Viewing Document Modal */}
      {viewingDocument && (
        <Modal
          isOpen={!!viewingDocument}
          onClose={() => setViewingDocument(null)}
          title="Document Officiel"
          subtitle="Consultation, impression et téléchargement PDF"
          maxWidth="3xl"
        >
          <DocumentViewer document={viewingDocument} onClose={() => setViewingDocument(null)} />
        </Modal>
      )}
    </div>
  );
};
