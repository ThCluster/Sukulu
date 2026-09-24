import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { schoolService } from '../services/schoolService';
import { User, Classe, Note, Absence } from '../types';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import {
  UserCheck,
  Search,
  Users,
  BookOpen,
  CalendarX,
  Building2,
  ShieldCheck,
  Lock,
  Plus,
  ChevronRight,
  Award,
  Clock,
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  Pencil,
  Trash2,
  Filter,
  Sparkles,
} from 'lucide-react';

export const TeacherStudentsPage: React.FC = () => {
  const { user, activeRole } = useAuth();
  const { showToast } = useToast();

  const [classes, setClasses] = useState<Classe[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [allAbsences, setAllAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Student for detailed profile
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'notes' | 'absences' | 'info'>('notes');

  // Quick Saisie Note Modal from Student Profile
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [noteForm, setNoteForm] = useState<Partial<Note>>({
    evaluation_titre: '',
    valeur: 15,
    coefficient: 3,
    appreciation: '',
    trimestre: 'TRIMESTRE_1',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [clsList, stList, ntList, absList] = await Promise.all([
        schoolService.getClasses(),
        schoolService.getUsers('ELEVE'),
        schoolService.getNotes(),
        schoolService.getAbsences(),
      ]);

      setClasses(clsList);
      setStudents(stList);
      setAllNotes(ntList);
      setAllAbsences(absList);
    } catch (err) {
      console.error('Erreur de chargement des élèves:', err);
      showToast('Erreur lors du chargement des données des élèves', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Determine teacher subject name from user profile
  const getTeacherSubject = (): string => {
    if (!user) return 'Mathématiques';
    if (user.specialite) {
      // e.g. "Mathématiques & Physique" -> extract primary or full
      if (user.specialite.toLowerCase().includes('math')) return 'Mathématiques';
      if (user.specialite.toLowerCase().includes('français') || user.specialite.toLowerCase().includes('littérature')) return 'Français';
      if (user.specialite.toLowerCase().includes('anglais')) return 'Anglais';
      if (user.specialite.toLowerCase().includes('histoire')) return 'Histoire-Géographie';
      if (user.specialite.toLowerCase().includes('svt') || user.specialite.toLowerCase().includes('biologie')) return 'SVT';
      return user.specialite;
    }
    return 'Mathématiques';
  };

  const teacherSubject = getTeacherSubject();

  // Determine classes assigned to current teacher or educator
  const teacherClasses = classes.filter((c) => {
    if (activeRole === 'ADMIN' || activeRole === 'EDUCATEUR') return true;
    if (!user) return true;
    if (c.enseignant_titulaire_id === user.id) return true;
    if (user.last_name && c.enseignant_titulaire_nom.toLowerCase().includes(user.last_name.toLowerCase())) return true;
    // Default fallback assignment for demo teacher (e.g. M. Moussa Diop -> 3ème B and Terminale S1)
    if (user.first_name === 'Moussa' || user.username === 'prof_diop') {
      return c.nom === '3ème B' || c.nom === 'Terminale S1';
    }
    if (user.first_name === 'Awa' || user.username === 'prof_kone') {
      return c.nom === '6ème A' || c.nom === 'Terminale L1';
    }
    return c.nom === '3ème B' || c.nom === 'Terminale S1';
  });

  const teacherClassNames = teacherClasses.map((c) => c.nom);

  // Filter students:
  // For ENSEIGNANT: only students in teacher's assigned classes, for EDUCATEUR & ADMIN: all students
  const assignedStudents = students.filter((s) => {
    if (activeRole === 'ADMIN' || activeRole === 'EDUCATEUR') return true;
    return s.classe_nom && teacherClassNames.includes(s.classe_nom);
  });

  // Apply search query and class filter
  const filteredStudents = assignedStudents.filter((s) => {
    // Class filter
    if (selectedClassFilter !== 'ALL' && s.classe_nom !== selectedClassFilter) {
      return false;
    }

    // Search query by first_name, last_name or matricule
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const fullName = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase();
      const matricule = (s.matricule || '').toLowerCase();
      const classe = (s.classe_nom || '').toLowerCase();
      return fullName.includes(q) || matricule.includes(q) || classe.includes(q);
    }

    return true;
  });

  // Calculate student subject specific stats (Notes, Absences, Average)
  const getStudentSubjectStats = (studentId: number) => {
    // 1. Notes in teacher's subject
    const notesInSubject = allNotes.filter((n) => {
      const isStudentMatch = n.eleve_id === studentId;
      if (!isStudentMatch) return false;

      // Subject match
      if (!n.matiere_nom) return true;
      const mat = n.matiere_nom.toLowerCase();
      const subj = teacherSubject.toLowerCase();
      return mat.includes(subj) || subj.includes(mat) || (subj.includes('math') && mat.includes('math'));
    });

    // Subject average
    let subjectAverage: number | null = null;
    if (notesInSubject.length > 0) {
      const totalPoints = notesInSubject.reduce((sum, n) => sum + n.valeur * (n.coefficient || 1), 0);
      const totalCoef = notesInSubject.reduce((sum, n) => sum + (n.coefficient || 1), 0);
      subjectAverage = totalCoef > 0 ? totalPoints / totalCoef : null;
    }

    // 2. Absences & retards in teacher's subject
    const absencesInSubject = allAbsences.filter((a) => {
      const isStudentMatch = a.eleve_id === studentId;
      if (!isStudentMatch) return false;

      // Subject match
      if (!a.matiere_nom || a.matiere_nom === 'Général') return true;
      const mat = a.matiere_nom.toLowerCase();
      const subj = teacherSubject.toLowerCase();
      return mat.includes(subj) || subj.includes(mat) || (subj.includes('math') && mat.includes('math'));
    });

    const totalAbsenceHours = absencesInSubject.reduce((sum, a) => sum + (a.duree_heures || 1), 0);
    const unjustifiedAbsencesCount = absencesInSubject.filter((a) => a.statut === 'NON_JUSTIFIE').length;

    return {
      notesInSubject,
      subjectAverage,
      absencesInSubject,
      totalAbsenceHours,
      unjustifiedAbsencesCount,
    };
  };

  const handleOpenAddNote = () => {
    if (!selectedStudent) return;
    setNoteForm({
      eleve_id: selectedStudent.id,
      eleve_nom: `${selectedStudent.first_name} ${selectedStudent.last_name}`,
      eleve_matricule: selectedStudent.matricule,
      classe_nom: selectedStudent.classe_nom || teacherClassNames[0] || 'Terminale S1',
      matiere_nom: teacherSubject,
      evaluation_titre: `Devoir - ${teacherSubject}`,
      valeur: 15,
      coefficient: 3,
      appreciation: 'Bonne participation.',
      trimestre: 'TRIMESTRE_1',
    });
    setIsAddNoteModalOpen(true);
  };

  const handleSaveAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      await schoolService.saveNote(noteForm);
      showToast(`Note enregistrée pour ${selectedStudent.first_name} !`, 'success');
      setIsAddNoteModalOpen(false);
      loadData();
    } catch {
      showToast('Erreur lors de la création de la note', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-xs font-bold flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                Espace Enseignant
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Accès Sécurisé par Classe
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Consultation des Élèves ({assignedStudents.length})
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Gérez le suivi pédagogique individuel de vos élèves. Consultez les notes, heures d'absence et moyennes uniquement dans votre matière enseignée (<strong>{teacherSubject}</strong>).
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0 space-y-1">
            <p className="text-[11px] uppercase font-bold text-slate-300 tracking-wider">Enseignant Connecté</p>
            <p className="font-bold text-white text-base">
              {user ? `${user.first_name} ${user.last_name}` : 'M. Moussa Diop'}
            </p>
            <p className="text-xs text-blue-300 font-medium flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              Matière : {teacherSubject}
            </p>
          </div>
        </div>
      </div>

      {/* Security Scope Isolation Banner */}
      <div className="bg-blue-50 border border-blue-200/80 p-4 rounded-2xl flex items-start gap-3">
        <div className="p-2 bg-blue-100 text-blue-700 rounded-xl shrink-0 mt-0.5">
          <Lock className="w-4 h-4" />
        </div>
        <div className="text-xs text-blue-900 space-y-0.5">
          <p className="font-bold">Confidentialité & Périmètre Pédagogique Enseignant</p>
          <p className="text-blue-700 leading-relaxed">
            Conformément à la politique de gestion, vous accédez uniquement aux élèves inscrits dans vos classes attribuées (<strong>{teacherClassNames.join(', ') || 'Vos classes'}</strong>). Les données de notes et d'absences affichées sont strictement filtrées sur votre matière (<strong>{teacherSubject}</strong>).
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un élève par nom, prénom ou matricule..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Class Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mr-1">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              Classe :
            </span>
            <button
              onClick={() => setSelectedClassFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedClassFilter === 'ALL'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Toutes mes classes ({assignedStudents.length})
            </button>
            {teacherClasses.map((cls) => {
              const countInClass = assignedStudents.filter((s) => s.classe_nom === cls.nom).length;
              return (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClassFilter(cls.nom)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedClassFilter === cls.nom
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {cls.nom} ({countInClass})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Student List Cards Grid */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Chargement des élèves attribués...</p>
        </div>
      ) : filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => {
            const stats = getStudentSubjectStats(student.id);
            return (
              <div
                key={student.id}
                onClick={() => {
                  setSelectedStudent(student);
                  setActiveTab('notes');
                }}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between relative"
              >
                <div className="space-y-4">
                  {/* Top Student Header */}
                  <div className="flex items-start gap-3">
                    <img
                      src={
                        student.avatar ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.id}`
                      }
                      alt={`${student.first_name} ${student.last_name}`}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors truncate">
                        {student.first_name} {student.last_name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="font-bold text-[10px] text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                          {student.classe_nom || 'Terminale S1'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {student.matricule || 'SKL-2024-001'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Subject specific KPI Badges */}
                  <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                    {/* Moyenne dans la matière */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Moy. {teacherSubject}
                      </p>
                      <p className="text-sm font-black text-slate-900 mt-0.5 font-mono">
                        {stats.subjectAverage !== null ? (
                          <span
                            className={
                              stats.subjectAverage >= 14
                                ? 'text-emerald-700'
                                : stats.subjectAverage >= 10
                                ? 'text-blue-700'
                                : 'text-rose-700'
                            }
                          >
                            {stats.subjectAverage.toFixed(2)} / 20
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Pas encore de note</span>
                        )}
                      </p>
                    </div>

                    {/* Absences / Retards dans la matière */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Abs. / Retards
                      </p>
                      <p className="text-sm font-black text-slate-900 mt-0.5">
                        {stats.totalAbsenceHours > 0 ? (
                          <span className="text-amber-700 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            {stats.totalAbsenceHours}h
                          </span>
                        ) : (
                          <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            0 absence
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Action Link */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                  <span>Consulter la fiche élève</span>
                  <ChevronRight className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Aucun élève trouvé</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Aucun élève ne correspond à votre recherche ou filtre de classe.
          </p>
        </div>
      )}

      {/* STUDENT DETAILED PROFILE MODAL */}
      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={`Profil Pédagogique : ${selectedStudent.first_name} ${selectedStudent.last_name}`}
          subtitle={`Élève en ${selectedStudent.classe_nom || 'Classe'} — Suivi restreint à la matière : ${teacherSubject}`}
        >
          <div className="space-y-6">
            {/* Student Overview Header */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={
                    selectedStudent.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStudent.id}`
                  }
                  alt={selectedStudent.first_name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-500 shrink-0"
                />
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {selectedStudent.first_name} {selectedStudent.last_name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {selectedStudent.classe_nom || 'Terminale S1'}
                    </span>
                    <span className="text-xs font-mono text-slate-300">
                      Matricule : {selectedStudent.matricule || 'SKL-2024-001'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Add Grade Action */}
              <button
                onClick={handleOpenAddNote}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                Saisir une Note
              </button>
            </div>

            {/* Subject KPIs Summary Row */}
            {(() => {
              const stats = getStudentSubjectStats(selectedStudent.id);
              return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-blue-50/80 border border-blue-200/80 p-4 rounded-xl text-center">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                      Moyenne en {teacherSubject}
                    </p>
                    <p className="text-2xl font-black text-blue-950 mt-1 font-mono">
                      {stats.subjectAverage !== null ? `${stats.subjectAverage.toFixed(2)} / 20` : '—'}
                    </p>
                  </div>

                  <div className="bg-emerald-50/80 border border-emerald-200/80 p-4 rounded-xl text-center">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                      Évaluations Dans Votre Matière
                    </p>
                    <p className="text-2xl font-black text-emerald-950 mt-1 font-mono">
                      {stats.notesInSubject.length}
                    </p>
                  </div>

                  <div className="bg-amber-50/80 border border-amber-200/80 p-4 rounded-xl text-center">
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                      Total Heures Abs. / Retard
                    </p>
                    <p className="text-2xl font-black text-amber-950 mt-1 font-mono">
                      {stats.totalAbsenceHours} h
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Tabs for Navigation */}
            <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
              <button
                onClick={() => setActiveTab('notes')}
                className={`pb-2.5 flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'notes'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Notes dans {teacherSubject}
              </button>

              <button
                onClick={() => setActiveTab('absences')}
                className={`pb-2.5 flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'absences'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <CalendarX className="w-4 h-4" />
                Absences dans {teacherSubject}
              </button>

              <button
                onClick={() => setActiveTab('info')}
                className={`pb-2.5 flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'info'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Users className="w-4 h-4" />
                Fiche Élève & Contact
              </button>
            </div>

            {/* Tab 1: Notes List in Subject */}
            {activeTab === 'notes' && (
              <div className="space-y-3">
                {(() => {
                  const stats = getStudentSubjectStats(selectedStudent.id);
                  if (stats.notesInSubject.length === 0) {
                    return (
                      <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200/80">
                        Aucune note enregistrée pour cet élève dans la matière {teacherSubject}.
                      </div>
                    );
                  }

                  return (
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                            <th className="p-3">Évaluation</th>
                            <th className="p-3">Trimestre</th>
                            <th className="p-3 text-center">Note / 20</th>
                            <th className="p-3 text-center">Coef.</th>
                            <th className="p-3">Appréciation Pédagogique</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {stats.notesInSubject.map((n) => (
                            <tr key={n.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-3">
                                <p className="font-bold text-slate-900">{n.evaluation_titre}</p>
                                <p className="text-[10px] text-slate-400">{n.date_saisie || 'Récemment'}</p>
                              </td>
                              <td className="p-3">
                                <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold border border-slate-200">
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
                              <td className="p-3 text-center font-bold text-slate-700 font-mono">
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
                  );
                })()}
              </div>
            )}

            {/* Tab 2: Absences in Subject */}
            {activeTab === 'absences' && (
              <div className="space-y-3">
                {(() => {
                  const stats = getStudentSubjectStats(selectedStudent.id);
                  if (stats.absencesInSubject.length === 0) {
                    return (
                      <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200/80">
                        Aucune absence ou retard enregistré pour cet élève en {teacherSubject}.
                      </div>
                    );
                  }

                  return (
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                            <th className="p-3">Date</th>
                            <th className="p-3">Type</th>
                            <th className="p-3 text-center">Durée</th>
                            <th className="p-3">Statut & Motif</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {stats.absencesInSubject.map((a) => (
                            <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-3 font-bold text-slate-800">{a.date_absence}</td>
                              <td className="p-3">
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    a.type === 'ABSENCE'
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {a.type}
                                </span>
                              </td>
                              <td className="p-3 text-center font-bold text-slate-700 font-mono">
                                {a.duree_heures} h
                              </td>
                              <td className="p-3">
                                <p className="font-semibold text-slate-800">
                                  {a.statut === 'JUSTIFIE' ? (
                                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                                      <CheckCircle2 className="w-3.5 h-3.5" /> Justifié
                                    </span>
                                  ) : (
                                    <span className="text-rose-600 font-bold flex items-center gap-1">
                                      <AlertCircle className="w-3.5 h-3.5" /> Non Justifié
                                    </span>
                                  )}
                                </p>
                                <p className="text-[11px] text-slate-500 mt-0.5">{a.motif || '—'}</p>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Tab 3: Personal Info & Contact */}
            {activeTab === 'info' && (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Adresse Téléphonique :</span>
                    <p className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      {selectedStudent.phone || '+221 78 123 45 67'}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium">Email Officiel :</span>
                    <p className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      {selectedStudent.email || 'eleve@sukulu.edu'}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium">Filière / Spécialité :</span>
                    <p className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                      {selectedStudent.filiere_nom || 'Sciences Exactes & Expérimentales'}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium">Domicile / Adresse :</span>
                    <p className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      {selectedStudent.address || 'Fann Résidence, Dakar'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* QUICK ADD GRADE MODAL FROM PROFILE */}
      {selectedStudent && isAddNoteModalOpen && (
        <Modal
          isOpen={isAddNoteModalOpen}
          onClose={() => setIsAddNoteModalOpen(false)}
          title={`Saisie d'une Note : ${selectedStudent.first_name} ${selectedStudent.last_name}`}
          subtitle={`Discipline : ${teacherSubject} — Classe : ${selectedStudent.classe_nom || 'Terminale S1'}`}
        >
          <form onSubmit={handleSaveAddNote} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Matière</label>
                <input
                  type="text"
                  disabled
                  value={teacherSubject}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Trimestre</label>
                <select
                  value={noteForm.trimestre || 'TRIMESTRE_1'}
                  onChange={(e) => setNoteForm({ ...noteForm, trimestre: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-hidden"
                >
                  <option value="TRIMESTRE_1">Trimestre 1</option>
                  <option value="TRIMESTRE_2">Trimestre 2</option>
                  <option value="TRIMESTRE_3">Trimestre 3</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Titre de l'Évaluation</label>
                <input
                  type="text"
                  required
                  value={noteForm.evaluation_titre || ''}
                  onChange={(e) => setNoteForm({ ...noteForm, evaluation_titre: e.target.value })}
                  placeholder="ex: Devoir Surveillé - Algèbre Lineaire"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Note Obtenue (/20)</label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  max="20"
                  required
                  value={noteForm.valeur !== undefined ? noteForm.valeur : 15}
                  onChange={(e) => setNoteForm({ ...noteForm, valeur: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Coefficient</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={noteForm.coefficient || 3}
                  onChange={(e) => setNoteForm({ ...noteForm, coefficient: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Appréciation Pédagogique</label>
                <textarea
                  rows={2}
                  value={noteForm.appreciation || ''}
                  onChange={(e) => setNoteForm({ ...noteForm, appreciation: e.target.value })}
                  placeholder="Remarques et appréciation sur le travail fourni..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 outline-hidden"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddNoteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
              >
                Enregistrer la Note
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
