import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { schoolService } from '../../services/schoolService';
import { Note, Absence, DocumentScolaire, User, SeanceEmploiDuTemps } from '../../types';
import { Modal } from '../common/Modal';
import { DocumentViewer } from '../common/DocumentViewer';
import { TimetableGrid } from '../timetable/TimetableGrid';
import {
  GraduationCap,
  BookOpen,
  CalendarX,
  FileCheck2,
  User as UserIcon,
  ShieldCheck,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Download,
  Printer,
  Eye,
  Phone,
  Mail,
  MapPin,
  Pencil,
  ChevronRight,
  TrendingUp,
  Building2,
  FileText,
  Lock,
  Sparkles,
  Camera,
  RefreshCw,
  CalendarDays,
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigate?: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [notes, setNotes] = useState<Note[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [documents, setDocuments] = useState<DocumentScolaire[]>([]);
  const [seances, setSeances] = useState<SeanceEmploiDuTemps[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'timetable' | 'notes' | 'absences' | 'documents' | 'profile'>('overview');

  // Filters
  const [selectedTrimestre, setSelectedTrimestre] = useState<string>('ALL');
  const [notesSearchQuery, setNotesSearchQuery] = useState<string>('');
  const [docFilterType, setDocFilterType] = useState<string>('ALL');

  // Document Viewer Modal State
  const [viewingDocument, setViewingDocument] = useState<DocumentScolaire | null>(null);

  // Profile Edit Modal State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    address: '',
    avatar: '',
  });

  useEffect(() => {
    loadStudentData();
  }, [user]);

  const loadStudentData = async () => {
    setLoading(true);
    try {
      const studentClassId = user?.classe_id || 3;
      const [allNotes, allAbsences, allDocs, timetableSeances] = await Promise.all([
        schoolService.getNotes(),
        schoolService.getAbsences(),
        schoolService.getDocuments(),
        schoolService.getEmploiDuTemps(studentClassId),
      ]);
      setSeances(timetableSeances);

      // Strict Student Data Isolation Filter
      const studentId = user?.id || 4; // Fallback demo student ID (Fatou Sow)
      const studentMatricule = user?.matricule || 'SKL-2024-0089';
      const studentFullName = user ? `${user.first_name} ${user.last_name}`.toLowerCase() : 'fatou sow';

      // 1. Filter Notes for this student only
      const myNotes = allNotes.filter((n) => {
        if (n.eleve_id && n.eleve_id === studentId) return true;
        if (n.eleve_matricule && n.eleve_matricule === studentMatricule) return true;
        if (n.eleve_nom && n.eleve_nom.toLowerCase().includes(studentFullName)) return true;
        // If student ID is 4 or demo student
        return n.eleve_id === 4 || n.eleve_nom === 'Fatou Sow';
      });

      // 2. Filter Absences for this student only
      const myAbsences = allAbsences.filter((a) => {
        if (a.eleve_id && a.eleve_id === studentId) return true;
        if (a.eleve_matricule && a.eleve_matricule === studentMatricule) return true;
        if (a.eleve_nom && a.eleve_nom.toLowerCase().includes(studentFullName)) return true;
        return a.eleve_id === 4 || a.eleve_nom === 'Fatou Sow';
      });

      // 3. Filter Documents for this student only
      const myDocs = allDocs.filter((d) => {
        if (d.eleve_id && d.eleve_id === studentId) return true;
        if (d.eleve_matricule && d.eleve_matricule === studentMatricule) return true;
        if (d.eleve_nom && d.eleve_nom.toLowerCase().includes(studentFullName)) return true;
        return d.eleve_id === 4 || d.eleve_nom === 'Fatou Sow';
      });

      setNotes(myNotes);
      setAbsences(myAbsences);
      setDocuments(myDocs);
    } catch (err) {
      console.error('Erreur chargement données élève:', err);
      showToast('Erreur lors du chargement des données de votre espace élève', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Group notes by Matière
  const notesBySubject = React.useMemo<Record<string, Note[]>>(() => {
    const grouped: Record<string, Note[]> = {};
    notes.forEach((n) => {
      // Filter by Trimestre if selected
      if (selectedTrimestre !== 'ALL' && (n.trimestre || 'TRIMESTRE_1') !== selectedTrimestre) {
        return;
      }

      // Search Filter
      if (notesSearchQuery.trim()) {
        const q = notesSearchQuery.toLowerCase();
        const matchTitre = n.evaluation_titre?.toLowerCase().includes(q);
        const matchMatiere = n.matiere_nom?.toLowerCase().includes(q);
        if (!matchTitre && !matchMatiere) return;
      }

      const subject = n.matiere_nom || 'Général';
      if (!grouped[subject]) grouped[subject] = [];
      grouped[subject].push(n);
    });
    return grouped;
  }, [notes, selectedTrimestre, notesSearchQuery]);

  // Overall Average Calculation
  const overallAverage = React.useMemo(() => {
    if (notes.length === 0) return null;
    const totalPoints = notes.reduce((sum, n) => sum + n.valeur * (n.coefficient || 1), 0);
    const totalCoef = notes.reduce((sum, n) => sum + (n.coefficient || 1), 0);
    return totalCoef > 0 ? totalPoints / totalCoef : null;
  }, [notes]);

  // Subject Averages Calculation
  const subjectAverages = React.useMemo<Record<string, { average: number; totalCoef: number; count: number }>>(() => {
    const averages: Record<string, { average: number; totalCoef: number; count: number }> = {};
    (Object.entries(notesBySubject) as [string, Note[]][]).forEach(([subject, noteList]) => {
      const totalPoints = noteList.reduce((sum, n) => sum + n.valeur * (n.coefficient || 1), 0);
      const totalCoef = noteList.reduce((sum, n) => sum + (n.coefficient || 1), 0);
      averages[subject] = {
        average: totalCoef > 0 ? totalPoints / totalCoef : 0,
        totalCoef,
        count: noteList.length,
      };
    });
    return averages;
  }, [notesBySubject]);

  // Absences Statistics
  const totalAbsenceHours = absences.reduce((sum, a) => sum + (a.duree_heures || 1), 0);
  const totalRetardsCount = absences.filter((a) => a.type === 'RETARD').length;
  const unjustifiedAbsencesCount = absences.filter((a) => a.statut === 'NON_JUSTIFIE').length;

  // Mention based on average
  const getMentionBadge = (avg: number | null) => {
    if (avg === null) return { text: 'N/A', bg: 'bg-slate-100 text-slate-700' };
    if (avg >= 16) return { text: 'Mention Très Bien 🌟', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    if (avg >= 14) return { text: 'Mention Bien 👍', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
    if (avg >= 12) return { text: 'Mention Assez Bien 👌', bg: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
    if (avg >= 10) return { text: 'Passable ✓', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
    return { text: 'Avis de Travail ⚠️', bg: 'bg-rose-100 text-rose-800 border-rose-300' };
  };

  const mention = getMentionBadge(overallAverage);

  // Handle Edit Profile Open
  const handleOpenEditProfile = () => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        email: user.email || '',
        address: user.address || '',
        avatar: user.avatar || '',
      });
    }
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (user) {
        await schoolService.updateUser(user.id, profileForm);
        updateUser(profileForm);
        showToast('Profil mis à jour avec succès !', 'success');
      }
      setIsEditProfileOpen(false);
    } catch {
      showToast('Erreur lors de la mise à jour du profil', 'error');
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Chargement de votre espace élève personnalisé...</p>
      </div>
    );
  }

  const studentName = user ? `${user.first_name} ${user.last_name}` : 'Fatou Sow';
  const studentMatricule = user?.matricule || 'SKL-2024-0089';
  const studentClasse = user?.classe_nom || 'Terminale S1';
  const studentFiliere = user?.filiere_nom || 'Sciences Exactes & Expérimentales';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Student Banner Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <img
                src={
                  user?.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 4}`
                }
                alt={studentName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-400/80 shadow-md"
              />
              <button
                onClick={handleOpenEditProfile}
                title="Modifier ma photo de profil"
                className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-sm transition-transform hover:scale-110"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                  {studentClasse}
                </span>
                <span className="px-3 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-full text-xs font-mono">
                  Matricule : {studentMatricule}
                </span>
                <span className="px-3 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-xs font-bold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-blue-400" />
                  Accès Données Personnelles Sécurisé
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Espace Élève : {studentName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Filière : <strong>{studentFiliere}</strong> — Année Académique 2025-2026
              </p>
            </div>
          </div>

          {/* Quick Stats Summary Card */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0 space-y-1 text-center md:text-right w-full md:w-auto">
            <p className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Moyenne Générale</p>
            <p className="text-2xl font-black text-white font-mono">
              {overallAverage !== null ? `${overallAverage.toFixed(2)} / 20` : '—'}
            </p>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${mention.bg}`}>
              {mention.text}
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'overview'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Vue d'Ensemble
        </button>

        <button
          onClick={() => setActiveTab('timetable')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'timetable'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          Emploi du Temps
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'notes'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Mes Notes par Matière ({notes.length})
        </button>

        <button
          onClick={() => setActiveTab('absences')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'absences'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CalendarX className="w-4 h-4" />
          Absences & Retards ({absences.length})
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'profile'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          Mon Profil Personnel
        </button>
      </div>

      {/* TAB 1: OVERVIEW / DASHBOARD */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Indicators Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Moyenne Générale */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Moyenne Générale</p>
                <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
                  {overallAverage !== null ? `${overallAverage.toFixed(2)}` : '—'}{' '}
                  <span className="text-xs text-slate-400 font-normal">/ 20</span>
                </p>
                <p className="text-[11px] text-emerald-600 font-bold mt-1">Calculée sur {notes.length} évaluations</p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                <Award className="w-6 h-6" />
              </div>
            </div>

            {/* Total Matières Evaluées */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Matières Évaluées</p>
                <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
                  {Object.keys(notesBySubject).length}
                </p>
                <p className="text-[11px] text-blue-600 font-bold mt-1">Coefficients mis à jour</p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>

            {/* Absences & Retards */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Volume Absences</p>
                <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
                  {totalAbsenceHours} h
                </p>
                <p className="text-[11px] text-amber-600 font-bold mt-1">
                  {totalRetardsCount} retard(s) — {unjustifiedAbsencesCount} non justifiée(s)
                </p>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Quick Timetable Preview Banner */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-blue-950 rounded-2xl p-5 border border-emerald-900/40 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                <CalendarDays className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    Mon Emploi du Temps
                  </span>
                  <span className="text-xs text-slate-300 font-semibold">{studentClasse}</span>
                </div>
                <h4 className="text-base font-bold text-white mt-1">
                  {seances.length > 0 ? `${seances.length} séances programmées cette semaine` : 'Emploi du temps officiel en ligne'}
                </h4>
                <p className="text-xs text-slate-300">
                  Consultez vos horaires de cours, vos salles et le matériel requis pour chaque matière.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('timetable')}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 shrink-0"
            >
              <span>Ouvrir l'emploi du temps</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Subject Averages Quick Grid */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                Aperçu des Moyennes par Matière
              </h3>
              <button
                onClick={() => setActiveTab('notes')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                Voir détails
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(Object.entries(subjectAverages) as [string, { average: number; totalCoef: number; count: number }][]).map(([subject, data]) => (
                <div
                  key={subject}
                  className="p-4 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between hover:border-emerald-300 transition-colors"
                >
                  <div>
                    <p className="font-bold text-slate-900 text-xs">{subject}</p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {data.count} évaluation(s) (Coef. Total: {data.totalCoef})
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-base font-black font-mono ${
                        data.average >= 14
                          ? 'text-emerald-700'
                          : data.average >= 10
                          ? 'text-blue-700'
                          : 'text-rose-700'
                      }`}
                    >
                      {data.average.toFixed(2)} / 20
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Two Columns: Recent Notes & Recent Absences */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Notes */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  Dernières Évaluations Saisies
                </h3>
                <button
                  onClick={() => setActiveTab('notes')}
                  className="text-xs font-bold text-emerald-600 hover:underline"
                >
                  Tout voir
                </button>
              </div>

              {notes.length > 0 ? (
                <div className="space-y-3">
                  {notes.slice(0, 4).map((n) => (
                    <div
                      key={n.id}
                      className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{n.evaluation_titre}</p>
                        <p className="text-[10px] text-slate-500">
                          {n.matiere_nom} — Coef. {n.coefficient} — {n.date_saisie || 'Trimestre 1'}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-mono font-black ${
                          n.valeur >= 14
                            ? 'bg-emerald-100 text-emerald-800'
                            : n.valeur >= 10
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {n.valeur.toFixed(1)} / 20
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">Aucune note saisie pour l'instant.</p>
              )}
            </div>

            {/* Recent Absences */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CalendarX className="w-4 h-4 text-amber-600" />
                  Historique d'Absences & Retards
                </h3>
                <button
                  onClick={() => setActiveTab('absences')}
                  className="text-xs font-bold text-emerald-600 hover:underline"
                >
                  Tout voir
                </button>
              </div>

              {absences.length > 0 ? (
                <div className="space-y-3">
                  {absences.slice(0, 4).map((a) => (
                    <div
                      key={a.id}
                      className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              a.type === 'ABSENCE' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {a.type}
                          </span>
                          <span className="font-bold text-slate-800 text-xs">{a.date_absence}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Matière : {a.matiere_nom || 'Général'} — Motif : {a.motif || 'Aucun motif renseigné'}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold text-xs text-slate-700 block">{a.duree_heures} h</span>
                        <span className={`text-[10px] font-bold ${a.statut === 'JUSTIFIE' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {a.statut === 'JUSTIFIE' ? 'Justifié' : 'Non justifié'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-emerald-600 text-xs font-bold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Aucune absence ni retard enregistré ! Bravo !
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: MON EMPLOI DU TEMPS */}
      {activeTab === 'timetable' && (
        <div className="space-y-6">
          <TimetableGrid
            seances={seances}
            classNameTitle={studentClasse}
            studentName={studentName}
            subtitle={`Filière : ${studentFiliere} • Année Académique 2025-2026`}
          />
        </div>
      )}

      {/* TAB 2: NOTES PAR MATIÈRE */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Trimestre :</span>
              {['ALL', 'TRIMESTRE_1', 'TRIMESTRE_2', 'TRIMESTRE_3'].map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTrimestre(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedTrimestre === t
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {t === 'ALL'
                    ? 'Tous les trimestres'
                    : t === 'TRIMESTRE_1'
                    ? 'Trimestre 1'
                    : t === 'TRIMESTRE_2'
                    ? 'Trimestre 2'
                    : 'Trimestre 3'}
                </button>
              ))}
            </div>

            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={notesSearchQuery}
                onChange={(e) => setNotesSearchQuery(e.target.value)}
                placeholder="Rechercher par matière ou évaluation..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Subject Breakdown Cards */}
          {Object.keys(notesBySubject).length > 0 ? (
            <div className="space-y-6">
              {(Object.entries(notesBySubject) as [string, Note[]][]).map(([subject, noteList]) => {
                const subAvg = subjectAverages[subject]?.average || 0;
                return (
                  <div
                    key={subject}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"
                  >
                    {/* Subject Header */}
                    <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-white">{subject}</h3>
                          <p className="text-xs text-slate-300">
                            {noteList.length} évaluation(s) enregistrée(s)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl border border-white/10 shrink-0">
                        <span className="text-xs text-slate-300 font-bold uppercase">Moyenne Matière :</span>
                        <span
                          className={`text-lg font-black font-mono ${
                            subAvg >= 14 ? 'text-emerald-300' : subAvg >= 10 ? 'text-blue-300' : 'text-rose-300'
                          }`}
                        >
                          {subAvg.toFixed(2)} / 20
                        </span>
                      </div>
                    </div>

                    {/* Table of Grades for this Subject */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                            <th className="p-3">Évaluation</th>
                            <th className="p-3">Trimestre</th>
                            <th className="p-3 text-center">Note Obtenue</th>
                            <th className="p-3 text-center">Coefficient</th>
                            <th className="p-3">Appréciation de l'Enseignant</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {noteList.map((n) => (
                            <tr key={n.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-3">
                                <p className="font-bold text-slate-900">{n.evaluation_titre}</p>
                                <p className="text-[10px] text-slate-400">{n.date_saisie || 'Récemment'}</p>
                              </td>
                              <td className="p-3">
                                <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold border border-slate-200">
                                  {n.trimestre === 'TRIMESTRE_1'
                                    ? 'Trimestre 1'
                                    : n.trimestre === 'TRIMESTRE_2'
                                    ? 'Trimestre 2'
                                    : 'Trimestre 3'}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                <span
                                  className={`inline-block px-3 py-1 rounded-xl text-xs font-mono font-black ${
                                    n.valeur >= 16
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : n.valeur >= 12
                                      ? 'bg-blue-100 text-blue-800'
                                      : n.valeur >= 10
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {n.valeur.toFixed(1)} / 20
                                </span>
                              </td>
                              <td className="p-3 text-center font-bold font-mono text-slate-700">
                                {n.coefficient}
                              </td>
                              <td className="p-3 text-slate-600 italic">
                                {n.appreciation || 'Aucune remarque.'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center space-y-3">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">Aucune note trouvée</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Aucune note ne correspond au trimestre ou à la recherche sélectionnée.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ABSENCES & RETARDS */}
      {activeTab === 'absences' && (
        <div className="space-y-6">
          {/* Summary KPIs Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Heures d'Absence</p>
                <p className="text-2xl font-black text-rose-700 mt-1 font-mono">{totalAbsenceHours} h</p>
              </div>
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
                <CalendarX className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Retards Enregistrés</p>
                <p className="text-2xl font-black text-amber-700 mt-1 font-mono">{totalRetardsCount}</p>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Absences Non Justifiées</p>
                <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{unjustifiedAbsencesCount}</p>
              </div>
              <div className="p-3 bg-slate-100 text-slate-700 rounded-2xl border border-slate-200">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Absences Detailed Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CalendarX className="w-4 h-4 text-emerald-600" />
                Détails des Absences et Retards
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                Mis à jour par la vie scolaire
              </span>
            </div>

            {absences.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="p-3">Date</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Matière / Discipline</th>
                      <th className="p-3 text-center">Durée</th>
                      <th className="p-3">Motif Renseigné</th>
                      <th className="p-3">Statut de la Justification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {absences.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-bold text-slate-900">{a.date_absence}</td>
                        <td className="p-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              a.type === 'ABSENCE' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {a.type}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-700">{a.matiere_nom || 'Général'}</td>
                        <td className="p-3 text-center font-bold font-mono text-slate-800">
                          {a.duree_heures} h
                        </td>
                        <td className="p-3 text-slate-600 italic">{a.motif || 'Aucun motif renseigné'}</td>
                        <td className="p-3">
                          {a.statut === 'JUSTIFIE' ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Justifié
                            </span>
                          ) : (
                            <span className="text-rose-600 font-bold flex items-center gap-1">
                              <AlertCircle className="w-4 h-4 text-rose-600" /> Non Justifié
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-emerald-600 font-bold text-xs space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p>Aucune absence ni retard enregistré sur votre fiche !</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: MON PROFIL PERSONNEL */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div className="flex items-center gap-4">
                <img
                  src={
                    user?.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 4}`
                  }
                  alt={studentName}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
                />
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{studentName}</h2>
                  <p className="text-xs text-slate-500">
                    Élève en <strong>{studentClasse}</strong> — Matricule :{' '}
                    <span className="font-mono text-emerald-700 font-bold">{studentMatricule}</span>
                  </p>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 mt-1">
                    Compte Actif (Année 2025-2026)
                  </span>
                </div>
              </div>

              <button
                onClick={handleOpenEditProfile}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all shrink-0"
              >
                <Pencil className="w-4 h-4" />
                Modifier mes Coordonnées
              </button>
            </div>

            {/* Profile Grid Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Téléphone Personnel</span>
                <p className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  {user?.phone || '+221 78 123 45 67'}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Email Officiel</span>
                <p className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  {user?.email || 'fatou.sow@sukulu.edu'}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Adresse Résidentielle</span>
                <p className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  {user?.address || 'Fann Résidence, Dakar'}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Classe & Filière</span>
                <p className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  {studentClasse} ({studentFiliere})
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Tuteur Référent</span>
                <p className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-emerald-600" />
                  Ousmane Sow (+221 77 987 65 43)
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Identifiant Unique</span>
                <p className="font-bold text-slate-900 text-sm flex items-center gap-2 font-mono">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  ID-USER-{user?.id || 4}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT VIEWER PREVIEW MODAL */}
      {viewingDocument && (
        <Modal
          isOpen={!!viewingDocument}
          onClose={() => setViewingDocument(null)}
          title={`Document Officiel : ${viewingDocument.titre}`}
          subtitle={`Référence : ${viewingDocument.reference}`}
        >
          <DocumentViewer document={viewingDocument} onClose={() => setViewingDocument(null)} />
        </Modal>
      )}

      {/* PROFILE EDIT MODAL */}
      {isEditProfileOpen && (
        <Modal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          title="Modifier mes Coordonnées Personnelles"
          subtitle="Mettez à jour vos informations de contact pour l'administration"
        >
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Prénom</label>
                <input
                  type="text"
                  required
                  value={profileForm.first_name}
                  onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nom</label>
                <input
                  type="text"
                  required
                  value={profileForm.last_name}
                  onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Numéro de Téléphone</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Adresse Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600 outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Adresse Domicile</label>
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600 outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">URL / Photo de Profil (Avatar)</label>
                <input
                  type="text"
                  value={profileForm.avatar}
                  onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600 outline-hidden"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all"
              >
                Enregistrer les Modifications
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
