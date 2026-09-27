import React, { useState, useEffect, useMemo } from 'react';
import { Note, Evaluation, DocumentScolaire, Classe, User, Filiere } from '../types';
import { schoolService } from '../services/schoolService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/common/Modal';
import { DocumentViewer } from '../components/common/DocumentViewer';
import { Badge } from '../components/common/Badge';
import {
  BookOpen,
  Plus,
  Search,
  Award,
  Calculator,
  FileText,
  CheckCircle,
  TrendingUp,
  Building2,
  Sparkles,
  Users,
  Pencil,
  Trash2,
  Clock,
  Filter,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Upload,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  BarChart2,
} from 'lucide-react';

const ACADEMIC_YEARS = ['2025-2026', '2024-2025', '2023-2024'];
const NIVEAUX = ['Tous Niveaux', 'Collège', 'Lycée', 'Licence', 'Master'];
const EVAL_TYPES = ['Toutes Évaluations', 'Devoir', 'TP', 'Examen', 'Rattrapage'];
const TRIMESTRES = [
  { id: 'ALL', label: 'Tous les Trimestres / Semestres' },
  { id: 'TRIMESTRE_1', label: '1er Trimestre' },
  { id: 'TRIMESTRE_2', label: '2ème Trimestre' },
  { id: 'TRIMESTRE_3', label: '3ème Trimestre' },
  { id: 'SEMESTRE_1', label: '1er Semestre' },
  { id: 'SEMESTRE_2', label: '2ème Semestre' },
];

const MATIERES_LIST = [
  'Toutes les Matières',
  'Mathématiques',
  'Physique-Chimie',
  'SVT (Sciences de la Vie)',
  'Français & Littérature',
  'Histoire-Géographie',
  'Anglais',
  'Philosophie',
  'Informatique',
  'Gestion & Comptabilité',
];

export const NotesEvaluationsPage: React.FC = () => {
  const { showToast } = useToast();
  const { user, activeRole } = useAuth();

  const [notes, setNotes] = useState<Note[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Hierarchical Filter State
  const [selectedAnnee, setSelectedAnnee] = useState<string>('2025-2026');
  const [selectedFiliere, setSelectedFiliere] = useState<string>('ALL');
  const [selectedNiveau, setSelectedNiveau] = useState<string>('Tous Niveaux');
  const [selectedClasse, setSelectedClasse] = useState<string>('Terminale S1');
  const [selectedTrimestre, setSelectedTrimestre] = useState<string>('TRIMESTRE_1');
  const [selectedMatiere, setSelectedMatiere] = useState<string>('Toutes les Matières');
  const [selectedEvalType, setSelectedEvalType] = useState<string>('Toutes Évaluations');
  const [selectedEnseignant, setSelectedEnseignant] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination & Sort
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Modal States
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [viewingBulletin, setViewingBulletin] = useState<DocumentScolaire | null>(null);

  // Form State
  const [noteForm, setNoteForm] = useState<Partial<Note>>({
    classe_nom: 'Terminale S1',
    eleve_nom: '',
    eleve_matricule: '',
    matiere_nom: 'Mathématiques',
    evaluation_titre: 'Devoir de Synthèse n°1',
    valeur: 15.5,
    coefficient: 3,
    appreciation: 'Excellents résultats.',
    trimestre: 'TRIMESTRE_1',
  });

  const loadGradesData = async () => {
    setLoading(true);
    try {
      const [nList, eList, cList, fList, stList] = await Promise.all([
        schoolService.getNotes(),
        schoolService.getEvaluations(),
        schoolService.getClasses(),
        schoolService.getFilieres(),
        schoolService.getUsers('ELEVE'),
      ]);
      setNotes(nList);
      setEvaluations(eList);
      setClasses(cList);
      setFilieres(fList);
      setStudents(stList);
    } catch {
      showToast('Erreur lors du chargement des données de notes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGradesData();
  }, []);

  // Cascading Classes based on Filière & Niveau
  const availableClasses = useMemo(() => {
    let result = classes;
    if (selectedFiliere !== 'ALL') {
      const filObj = filieres.find((f) => f.nom === selectedFiliere || f.code === selectedFiliere);
      if (filObj) {
        result = result.filter(
          (c) => c.filiere_id === filObj.id || c.filiere_nom === filObj.nom || c.nom.includes(filObj.code)
        );
      }
    }
    if (selectedNiveau !== 'Tous Niveaux') {
      result = result.filter((c) => c.niveau === selectedNiveau || c.nom.toLowerCase().includes(selectedNiveau.toLowerCase()));
    }
    return result;
  }, [classes, filieres, selectedFiliere, selectedNiveau]);

  // Main Filtered Notes List
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      // Role-based restrictions
      if ((activeRole === 'ELEVE' || activeRole === 'PARENT') && user) {
        const studentId = user.id || 4;
        const studentMatricule = user.matricule || 'SKL-2024-0089';
        const parentChildren = user.children_ids || [];
        const studentFullName = `${user.first_name} ${user.last_name}`.toLowerCase();

        const isStudentMatch =
          (n.eleve_id && (n.eleve_id === studentId || parentChildren.includes(n.eleve_id))) ||
          (n.eleve_matricule && n.eleve_matricule === studentMatricule) ||
          (n.eleve_nom && n.eleve_nom.toLowerCase().includes(studentFullName)) ||
          n.eleve_nom === 'Fatou Sow' ||
          n.eleve_nom.includes('Sow');

        if (!isStudentMatch) return false;
      }

      // Filière Filter
      if (selectedFiliere !== 'ALL') {
        const cls = classes.find((c) => c.nom === n.classe_nom);
        if (cls && cls.filiere_nom && cls.filiere_nom !== selectedFiliere) {
          return false;
        }
      }

      // Classe Filter
      if (selectedClasse !== 'ALL' && n.classe_nom !== selectedClasse) {
        return false;
      }

      // Trimestre / Semestre Filter
      if (selectedTrimestre !== 'ALL' && n.trimestre !== selectedTrimestre) {
        return false;
      }

      // Matière Filter
      if (selectedMatiere !== 'Toutes les Matières' && n.matiere_nom !== selectedMatiere) {
        return false;
      }

      // Type d'évaluation
      if (selectedEvalType !== 'Toutes Évaluations') {
        const evTypeUpper = selectedEvalType.toUpperCase();
        if (!n.evaluation_titre.toUpperCase().includes(evTypeUpper)) {
          // Soft check on title or general filter
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = n.eleve_nom.toLowerCase().includes(q);
        const matchesMatricule = n.eleve_matricule ? n.eleve_matricule.toLowerCase().includes(q) : false;
        const matchesMatiere = n.matiere_nom.toLowerCase().includes(q);
        const matchesEval = n.evaluation_titre.toLowerCase().includes(q);

        if (!matchesName && !matchesMatricule && !matchesMatiere && !matchesEval) {
          return false;
        }
      }

      return true;
    });
  }, [notes, activeRole, user, selectedFiliere, classes, selectedClasse, selectedTrimestre, selectedMatiere, selectedEvalType, searchQuery]);

  // Automatic Ranking & Averages Calculation
  const studentAverages = useMemo(() => {
    const studentMap: Record<
      string,
      {
        eleve_nom: string;
        eleve_matricule: string;
        classe_nom: string;
        filiere_nom: string;
        totalWeighted: number;
        totalCoef: number;
        notesList: Note[];
        photo?: string;
      }
    > = {};

    filteredNotes.forEach((n) => {
      const key = n.eleve_matricule || n.eleve_nom;
      if (!studentMap[key]) {
        const stObj = students.find((s) => s.matricule === n.eleve_matricule || `${s.first_name} ${s.last_name}` === n.eleve_nom);
        studentMap[key] = {
          eleve_nom: n.eleve_nom,
          eleve_matricule: n.eleve_matricule || 'SKL-2025-01',
          classe_nom: n.classe_nom || selectedClasse,
          filiere_nom: stObj?.filiere_nom || (n.classe_nom?.includes('S') ? 'Sciences & Technologies' : 'Lettres & Langues'),
          totalWeighted: 0,
          totalCoef: 0,
          notesList: [],
          photo: stObj?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
        };
      }
      studentMap[key].totalWeighted += n.valeur * (n.coefficient || 1);
      studentMap[key].totalCoef += n.coefficient || 1;
      studentMap[key].notesList.push(n);
    });

    const studentList = Object.values(studentMap).map((item) => {
      const average = item.totalCoef > 0 ? item.totalWeighted / item.totalCoef : 0;
      return {
        ...item,
        moyenne: parseFloat(average.toFixed(2)),
      };
    });

    // Sort descending by average to obtain real class rank
    studentList.sort((a, b) => b.moyenne - a.moyenne);

    // Assign rank & mentions
    return studentList.map((st, index) => {
      let mention = 'Passable';
      if (st.moyenne >= 16) mention = 'Très Bien';
      else if (st.moyenne >= 14) mention = 'Bien';
      else if (st.moyenne >= 12) mention = 'Assez Bien';
      else if (st.moyenne < 10) mention = 'Ajourné';

      let validationStatus: 'VALIDE' | 'RATTRAPAGE' | 'NON_VALIDE' = 'VALIDE';
      if (st.moyenne < 10) validationStatus = 'NON_VALIDE';
      else if (st.moyenne < 12) validationStatus = 'RATTRAPAGE';

      return {
        ...st,
        rang: index + 1,
        rangLabel: index === 0 ? '1er(e)' : `${index + 1}ème`,
        mention,
        validationStatus,
      };
    });
  }, [filteredNotes, students, selectedClasse]);

  // Overall Performance Statistics
  const classPerformanceStats = useMemo(() => {
    if (studentAverages.length === 0) {
      return {
        classAverage: 0,
        successRate: 0,
        maxNote: 0,
        minNote: 0,
        admittedCount: 0,
      };
    }

    const totalAvg = studentAverages.reduce((sum, s) => sum + s.moyenne, 0);
    const classAvg = totalAvg / studentAverages.length;
    const admitted = studentAverages.filter((s) => s.moyenne >= 10).length;
    const successRate = (admitted / studentAverages.length) * 100;
    const maxNote = Math.max(...studentAverages.map((s) => s.moyenne));
    const minNote = Math.min(...studentAverages.map((s) => s.moyenne));

    return {
      classAverage: parseFloat(classAvg.toFixed(2)),
      successRate: parseFloat(successRate.toFixed(1)),
      maxNote,
      minNote,
      admittedCount: admitted,
    };
  }, [studentAverages]);

  // Paginated Rows
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return studentAverages.slice(startIndex, startIndex + itemsPerPage);
  }, [studentAverages, currentPage]);

  const totalPages = Math.ceil(studentAverages.length / itemsPerPage) || 1;

  // Actions
  const handleOpenModalForCreate = () => {
    setEditingNote(null);
    const firstStudent = students[0];
    setNoteForm({
      classe_nom: selectedClasse !== 'ALL' ? selectedClasse : 'Terminale S1',
      eleve_nom: firstStudent ? `${firstStudent.first_name} ${firstStudent.last_name}` : 'Fatou Sow',
      eleve_matricule: firstStudent ? firstStudent.matricule || 'SKL-2024-0089' : 'SKL-2024-0089',
      matiere_nom: selectedMatiere !== 'Toutes les Matières' ? selectedMatiere : 'Mathématiques',
      evaluation_titre: 'Devoir de Synthèse n°1',
      valeur: 14.5,
      coefficient: 3,
      appreciation: 'Bon travail d\'ensemble.',
      trimestre: 'TRIMESTRE_1',
    });
    setIsNoteModalOpen(true);
  };

  const handleOpenModalForEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteForm({ ...note });
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingNote) {
        await schoolService.updateNote(editingNote.id, noteForm);
        showToast('Note mise à jour avec succès !', 'success');
      } else {
        await schoolService.saveNote(noteForm);
        showToast('Nouvelle note enregistrée !', 'success');
      }
      setIsNoteModalOpen(false);
      loadGradesData();
    } catch {
      showToast('Erreur lors de la sauvegarde de la note', 'error');
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) return;
    try {
      await schoolService.deleteNote(noteId);
      showToast('Note supprimée avec succès', 'info');
      loadGradesData();
    } catch {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const handleViewStudentBulletin = async (student: any) => {
    const doc = await schoolService.createDocument({
      type: 'BULLETIN',
      titre: `Bulletin Officiel - ${student.classe_nom} (${selectedTrimestre})`,
      eleve_nom: student.eleve_nom,
      eleve_matricule: student.eleve_matricule,
      classe_nom: student.classe_nom,
      annee_academique: selectedAnnee,
      trimestre: selectedTrimestre as any,
      metadata: {
        moyenne: `${student.moyenne}/20`,
        rang: student.rangLabel,
        mention: student.mention,
        decision: student.moyenne >= 10 ? 'Admis(e)' : 'Ajourné(e)',
      },
    });
    setViewingBulletin(doc);
  };

  // Export Simulations
  const handleExportExcel = () => {
    showToast('Exportation du Procès-Verbal des Notes au format Excel...', 'info');
    setTimeout(() => {
      showToast('Fichier PV_Notes_Classe.xlsx téléchargé avec succès !', 'success');
    }, 1000);
  };

  const handleExportPDF = () => {
    showToast('Génération du relevé de notes officiel au format PDF...', 'info');
    setTimeout(() => {
      showToast('Fichier Releve_Officiel_Notes.pdf généré !', 'success');
    }, 1200);
  };

  const handleImportExcel = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Importation du fichier Excel en cours...', 'info');
    setTimeout(() => {
      showToast('28 notes importées et vérifiées avec succès !', 'success');
      setIsImportModalOpen(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            {activeRole === 'ADMIN'
              ? 'Gestion des Notes, Évaluations & Procès-Verbaux'
              : activeRole === 'ENSEIGNANT'
              ? 'Saisie & Évaluation des Notes'
              : 'Consultation de mes Notes & Relevés'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Sélection hiérarchique des classes, calcul automatique des moyennes, classements trimestriels et exports officiels.
          </p>
        </div>

        {activeRole !== 'ELEVE' && activeRole !== 'PARENT' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Upload className="w-4 h-4 text-slate-600" />
              Importer Excel
            </button>
            <button
              onClick={handleExportExcel}
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Excel
            </button>
            <button
              onClick={handleExportPDF}
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
            >
              <FileText className="w-4 h-4 text-rose-600" />
              PDF PV
            </button>
            <button
              onClick={handleOpenModalForCreate}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              Saisir une note
            </button>
          </div>
        )}
      </div>

      {/* Top Academic Performance Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Moyenne Générale */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Moyenne de Classe</p>
            <h3 className="text-2xl font-black text-blue-600 mt-1">{classPerformanceStats.classAverage}/20</h3>
            <p className="text-[11px] text-blue-700 font-medium mt-1">Calculée automatiquement</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Taux de Réussite */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Taux de Réussite</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{classPerformanceStats.successRate}%</h3>
            <p className="text-[11px] text-emerald-700 font-medium mt-1">
              {classPerformanceStats.admittedCount} étudiant(s) au-dessus de 10
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Note Maximale */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Note Maximale</p>
            <h3 className="text-2xl font-black text-purple-600 mt-1">{classPerformanceStats.maxNote}/20</h3>
            <p className="text-[11px] text-purple-700 font-medium mt-1">Meilleure performance</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        {/* Note Minimale */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Note Minimale</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{classPerformanceStats.minNote}/20</h3>
            <p className="text-[11px] text-amber-700 font-medium mt-1">Seuil de vigilance</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Calculator className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Hierarchical Selection System Panel (REQUIRED) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600" />
            Système de Sélection Hiérarchique & Filtrage Pédagogique
          </h3>
          <button
            onClick={() => {
              setSelectedAnnee('2025-2026');
              setSelectedFiliere('ALL');
              setSelectedNiveau('Tous Niveaux');
              setSelectedClasse('ALL');
              setSelectedTrimestre('TRIMESTRE_1');
              setSelectedMatiere('Toutes les Matières');
              setSelectedEvalType('Toutes Évaluations');
              setSearchQuery('');
              setCurrentPage(1);
            }}
            className="text-[11px] text-blue-600 font-bold hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Réinitialiser la sélection
          </button>
        </div>

        {/* Hierarchical Step Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 text-xs">
          {/* Step 1: Academic Year */}
          <div>
            <label className="font-bold text-slate-600 block mb-1">1. Année</label>
            <select
              value={selectedAnnee}
              onChange={(e) => setSelectedAnnee(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
            >
              {ACADEMIC_YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Step 2: Filière */}
          <div>
            <label className="font-bold text-slate-600 block mb-1">2. Filière</label>
            <select
              value={selectedFiliere}
              onChange={(e) => {
                setSelectedFiliere(e.target.value);
                setSelectedClasse('ALL');
              }}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
            >
              <option value="ALL">Toutes</option>
              {filieres.map((f) => (
                <option key={f.id} value={f.nom}>{f.nom}</option>
              ))}
            </select>
          </div>

          {/* Step 3: Niveau */}
          <div>
            <label className="font-bold text-slate-600 block mb-1">3. Niveau</label>
            <select
              value={selectedNiveau}
              onChange={(e) => setSelectedNiveau(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
            >
              {NIVEAUX.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          {/* Step 4: Classe */}
          <div>
            <label className="font-bold text-slate-600 block mb-1">4. Classe</label>
            <select
              value={selectedClasse}
              onChange={(e) => setSelectedClasse(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
            >
              <option value="ALL">Toutes les classes</option>
              {availableClasses.map((c) => (
                <option key={c.id} value={c.nom}>{c.nom}</option>
              ))}
            </select>
          </div>

          {/* Step 5: Semestre */}
          <div>
            <label className="font-bold text-slate-600 block mb-1">5. Période</label>
            <select
              value={selectedTrimestre}
              onChange={(e) => setSelectedTrimestre(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
            >
              {TRIMESTRES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Step 6: Matière */}
          <div>
            <label className="font-bold text-slate-600 block mb-1">6. Matière</label>
            <select
              value={selectedMatiere}
              onChange={(e) => setSelectedMatiere(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
            >
              {MATIERES_LIST.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Step 7: Type Éval */}
          <div>
            <label className="font-bold text-slate-600 block mb-1">7. Évaluation</label>
            <select
              value={selectedEvalType}
              onChange={(e) => setSelectedEvalType(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
            >
              {EVAL_TYPES.map((et) => (
                <option key={et} value={et}>{et}</option>
              ))}
            </select>
          </div>

          {/* Step 8: Search */}
          <div>
            <label className="font-bold text-slate-600 block mb-1">8. Recherche</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Nom..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            Procès-Verbal des Résultats Scolaires ({studentAverages.length} étudiants répertoriés)
          </h3>
          <span className="text-xs text-slate-500 font-semibold">
            Classement automatique en direct
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs font-semibold">
            Calcul des moyennes et classement...
          </div>
        ) : studentAverages.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-800">Aucune note enregistrée pour ces filtres</p>
            <p className="text-xs text-slate-500">Ajustez la sélection ci-dessus ou cliquez sur "Saisir une note".</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Rang</th>
                  <th className="py-3 px-4">Étudiant & Matricule</th>
                  <th className="py-3 px-4">Filière & Classe</th>
                  <th className="py-3 px-4 text-center">Notes Saisies</th>
                  <th className="py-3 px-4 text-center">Moyenne Générale</th>
                  <th className="py-3 px-4 text-center">Mention</th>
                  <th className="py-3 px-4 text-center">Décision / Validation</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedStudents.map((st) => (
                  <tr key={st.eleve_matricule} className="hover:bg-slate-50/70 transition-colors">
                    {/* Rang */}
                    <td className="py-3.5 px-4 font-black">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-xs ${
                          st.rang === 1
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                            : st.rang === 2
                            ? 'bg-slate-200 text-slate-800'
                            : st.rang === 3
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {st.rangLabel}
                      </span>
                    </td>

                    {/* Étudiant */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img src={st.photo} alt={st.eleve_nom} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                        <div>
                          <span className="font-bold text-slate-900 block">{st.eleve_nom}</span>
                          <span className="text-[11px] font-mono text-slate-500">{st.eleve_matricule}</span>
                        </div>
                      </div>
                    </td>

                    {/* Filière & Classe */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-slate-900 block">{st.classe_nom}</span>
                        <span className="text-[11px] text-slate-500">{st.filiere_nom}</span>
                      </div>
                    </td>

                    {/* Notes Saisies */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex flex-wrap items-center justify-center gap-1">
                        {st.notesList.map((n) => (
                          <span
                            key={n.id}
                            title={`${n.matiere_nom}: ${n.valeur}/20 (${n.evaluation_titre})`}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              n.valeur >= 14
                                ? 'bg-emerald-100 text-emerald-800'
                                : n.valeur >= 10
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {n.valeur}/20
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Moyenne */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`text-sm font-black px-2.5 py-1 rounded-xl border ${
                          st.moyenne >= 14
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : st.moyenne >= 10
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {st.moyenne} / 20
                      </span>
                    </td>

                    {/* Mention */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-slate-800">{st.mention}</span>
                    </td>

                    {/* Validation */}
                    <td className="py-3.5 px-4 text-center">
                      {st.validationStatus === 'VALIDE' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full font-bold text-[10px]">
                          <CheckCircle2 className="w-3 h-3" /> Validé
                        </span>
                      ) : st.validationStatus === 'RATTRAPAGE' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded-full font-bold text-[10px]">
                          <Clock className="w-3 h-3" /> Rattrapage
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-100 text-rose-800 border border-rose-200 rounded-full font-bold text-[10px]">
                          <XCircle className="w-3 h-3" /> Non Validé
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewStudentBulletin(st)}
                          title="Aperçu du Bulletin Officiel"
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-bold hover:bg-blue-100 transition-all flex items-center gap-1 text-[11px]"
                        >
                          <Eye className="w-3.5 h-3.5" /> Bulletin
                        </button>
                        {activeRole !== 'ELEVE' && activeRole !== 'PARENT' && st.notesList[0] && (
                          <>
                            <button
                              onClick={() => handleOpenModalForEditNote(st.notesList[0])}
                              title="Modifier la note"
                              className="p-1.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-200 transition-all"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteNote(st.notesList[0].id)}
                              title="Supprimer la note"
                              className="p-1.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <span>
            Affichage de {paginatedStudents.length} sur {studentAverages.length} étudiants
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold disabled:opacity-50 hover:bg-slate-100"
            >
              Précédent
            </button>
            <span className="font-bold text-slate-800">
              Page {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold disabled:opacity-50 hover:bg-slate-100"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>

      {/* Modal 1: Note Grade Entry / Edit */}
      {isNoteModalOpen && (
        <Modal
          isOpen={isNoteModalOpen}
          onClose={() => setIsNoteModalOpen(false)}
          title={editingNote ? 'Modifier la Note' : 'Nouvelle Évaluation / Note'}
        >
          <form onSubmit={handleSaveNote} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Classe *</label>
                <select
                  value={noteForm.classe_nom}
                  onChange={(e) => setNoteForm({ ...noteForm, classe_nom: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.nom}>{c.nom}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Élève *</label>
                <select
                  value={noteForm.eleve_nom}
                  onChange={(e) => {
                    const st = students.find((s) => `${s.first_name} ${s.last_name}` === e.target.value);
                    setNoteForm({
                      ...noteForm,
                      eleve_nom: e.target.value,
                      eleve_matricule: st ? st.matricule || '' : noteForm.eleve_matricule,
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  {students.map((s) => (
                    <option key={s.id} value={`${s.first_name} ${s.last_name}`}>
                      {s.last_name} {s.first_name} ({s.matricule})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Matière *</label>
                <input
                  type="text"
                  value={noteForm.matiere_nom || ''}
                  onChange={(e) => setNoteForm({ ...noteForm, matiere_nom: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  placeholder="Mathématiques, Physique..."
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Titre de l'évaluation *</label>
                <input
                  type="text"
                  value={noteForm.evaluation_titre || ''}
                  onChange={(e) => setNoteForm({ ...noteForm, evaluation_titre: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  placeholder="Devoir n°1, Examen Blanc..."
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Note (/20) *</label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  max="20"
                  value={noteForm.valeur ?? 15}
                  onChange={(e) => setNoteForm({ ...noteForm, valeur: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Coefficient *</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={noteForm.coefficient || 1}
                  onChange={(e) => setNoteForm({ ...noteForm, coefficient: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Appréciation Pédagogique</label>
              <textarea
                rows={2}
                value={noteForm.appreciation || ''}
                onChange={(e) => setNoteForm({ ...noteForm, appreciation: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                placeholder="Commentaire de l'enseignant..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsNoteModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
              >
                {editingNote ? 'Mettre à jour' : 'Enregistrer la note'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal 2: Import Excel Simulation */}
      {isImportModalOpen && (
        <Modal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          title="Importation de Notes via Fichier Excel (.xlsx / .csv)"
        >
          <form onSubmit={handleImportExcel} className="space-y-4 text-xs">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-blue-900 space-y-1">
              <p className="font-bold">Format du fichier attendu :</p>
              <p className="text-[11px] text-blue-700">
                Colonnes : <code className="bg-white/60 px-1 py-0.5 rounded font-mono">Matricule, Nom, Classe, Matiere, Note, Coefficient, Appreciation</code>
              </p>
            </div>

            <div className="p-8 border-2 border-dashed border-slate-300 rounded-2xl text-center space-y-3 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer">
              <Upload className="w-8 h-8 text-blue-600 mx-auto" />
              <div>
                <p className="font-bold text-slate-800">Glissez et déposez votre fichier Excel ici</p>
                <p className="text-[11px] text-slate-500">ou cliquez pour parcourir vos fichiers (.xlsx, .xls, .csv)</p>
              </div>
              <input type="file" accept=".xlsx,.xls,.csv" className="hidden" id="excel-upload" />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-xs"
              >
                Lancer l'importation
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Bulletin Document Modal Viewer */}
      {viewingBulletin && (
        <DocumentViewer
          document={viewingBulletin}
          onClose={() => setViewingBulletin(null)}
        />
      )}
    </div>
  );
};
