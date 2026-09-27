import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { schoolService } from '../../services/schoolService';
import { educatorService } from '../../services/educatorService';
import { Classe, User, Absence, Note } from '../../types';
import { Badge } from '../common/Badge';
import { EducatorPillarsConsole } from '../educator/EducatorPillarsConsole';
import { SuiviPillar } from '../educator/SuiviPillar';
import { TransmissionPillar } from '../educator/TransmissionPillar';
import { SecuritePillar } from '../educator/SecuritePillar';
import {
  Building2,
  Users,
  CalendarX,
  BookOpen,
  GraduationCap,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  Filter,
  Activity,
  ShieldCheck,
  ShieldAlert,
  Send,
  HeartPulse,
  LogOut,
  FileText,
  AlertTriangle,
} from 'lucide-react';

interface TeacherDashboardProps {
  onNavigate: (tab: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Classe[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // Active view tab inside Educator Dashboard
  const [activeTab, setActiveTab] = useState<'three-pillars' | 'suivi' | 'transmission' | 'securite' | 'students' | 'evaluations'>('three-pillars');

  // Selected class for educator pillars & student filtering
  const [selectedClassName, setSelectedClassName] = useState<string>('3ème B');
  const [selectedClasseId, setSelectedClasseId] = useState<number | 'ALL'>('ALL');
  const [studentSearch, setStudentSearch] = useState('');

  // Pillar Quick Stats
  const [pillarStats, setPillarStats] = useState({
    tauxPresence: 92.5,
    alertesVigilance: 2,
    seancesCahier: 2,
    devoirsActifs: 3,
    liaisonsAttente: 1,
    paiActifs: 2,
    incidentsRecents: 2,
  });

  useEffect(() => {
    const loadTeacherData = async () => {
      setLoading(true);
      try {
        const [clsList, stList, absList, noteList, obsList, devList, fichesSante, incList] = await Promise.all([
          schoolService.getClasses(),
          schoolService.getUsers('ELEVE'),
          schoolService.getAbsences(),
          schoolService.getNotes(),
          educatorService.getObservations(),
          educatorService.getDevoirs(),
          educatorService.getFichesSante(),
          educatorService.getIncidents(),
        ]);

        setClasses(clsList);
        setStudents(stList);
        setAbsences(absList);
        setNotes(noteList);

        const vigCount = obsList.filter((o) => o.niveau_vigilance !== 'NORMAL').length;
        const paiCount = fichesSante.filter((f) => f.pai_actif).length;

        setPillarStats({
          tauxPresence: 94,
          alertesVigilance: vigCount,
          seancesCahier: 2,
          devoirsActifs: devList.length,
          liaisonsAttente: 1,
          paiActifs: paiCount,
          incidentsRecents: incList.length,
        });
      } catch (err) {
        console.error('Error loading teacher dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTeacherData();
  }, []);

  const teacherClasses = classes.filter((c) => {
    if (!user) return true;
    if (c.enseignant_titulaire_id === user.id) return true;
    if (c.enseignant_titulaire_nom.toLowerCase().includes(user.last_name.toLowerCase())) return true;
    return c.nom === '3ème B' || c.nom === 'Terminale S1';
  });

  const teacherClassNames = teacherClasses.map((c) => c.nom);

  const teacherStudents = students.filter(
    (s) => s.classe_nom && teacherClassNames.includes(s.classe_nom)
  );

  const teacherAbsences = absences.filter((a) => teacherClassNames.includes(a.classe_nom));

  const teacherNotes = notes.filter((n) => {
    const student = students.find((s) => s.id === n.eleve_id || s.matricule === n.eleve_matricule);
    return student ? teacherClassNames.includes(student.classe_nom || '') : true;
  });

  const classStats = teacherClasses.map((cls) => {
    const clsStudents = students.filter((s) => s.classe_nom === cls.nom);
    const clsAbsences = absences.filter((a) => a.classe_nom === cls.nom && a.type === 'ABSENCE');
    const clsRetards = absences.filter((a) => a.classe_nom === cls.nom && a.type === 'RETARD');

    return {
      classe: cls,
      studentCount: clsStudents.length || cls.effectif_actuel || 35,
      absenceCount: clsAbsences.length,
      retardCount: clsRetards.length,
      totalIncidentCount: clsAbsences.length + clsRetards.length,
    };
  });

  const totalAssignedStudents = classStats.reduce((acc, curr) => acc + curr.studentCount, 0);

  const filteredStudents = teacherStudents.filter((s) => {
    const matchesClasse =
      selectedClasseId === 'ALL'
        ? true
        : teacherClasses.find((c) => c.id === selectedClasseId)?.nom === s.classe_nom;

    const matchesSearch =
      s.first_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.last_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.matricule?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase());

    return matchesClasse && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Teacher Hero: 3 Pillars Highlight */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded-full border border-blue-500/30">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Console de l'Éducateur • Les 3 Piliers Indispensables</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Bonjour, {user?.first_name} {user?.last_name} 👋
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm">
              Votre quotidien professionnel structuré autour de l'essentiel :{' '}
              <strong className="text-blue-300">Le Suivi</strong> pédagogique & l'émargement,{' '}
              <strong className="text-emerald-300">La Transmission</strong> du savoir & devoirs, et{' '}
              <strong className="text-rose-300">La Sécurité</strong> médicale & autorisations de sortie.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('suivi')}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all"
            >
              <Activity className="w-4 h-4" />
              1. Faire l'Appel
            </button>
            <button
              onClick={() => setActiveTab('transmission')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              2. Cahier & Devoirs
            </button>
            <button
              onClick={() => setActiveTab('securite')}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              3. Sécurité & PAI
            </button>
          </div>
        </div>
      </div>

      {/* 3 INDISPENSABLE PILLARS INTERACTIVE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* PILIER 1 : LE SUIVI */}
        <div
          onClick={() => setActiveTab('suivi')}
          className={`cursor-pointer bg-white p-5 rounded-2xl border transition-all relative overflow-hidden group hover:shadow-md ${
            activeTab === 'suivi'
              ? 'border-blue-500 ring-2 ring-blue-500/20'
              : 'border-slate-200/80 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              Pilier 1 • Le Suivi
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3">
            <h3 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1">
              <span>Assiduité & Vigilance</span>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Appel en direct de la séance, pointage en 1 clic et fiches de suivi individuel.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{pillarStats.tauxPresence}% présence</span>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              {pillarStats.alertesVigilance} vigilances actives
            </span>
          </div>
        </div>

        {/* PILIER 2 : LA TRANSMISSION */}
        <div
          onClick={() => setActiveTab('transmission')}
          className={`cursor-pointer bg-white p-5 rounded-2xl border transition-all relative overflow-hidden group hover:shadow-md ${
            activeTab === 'transmission'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20'
              : 'border-slate-200/80 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Pilier 2 • La Transmission
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3">
            <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center gap-1">
              <span>Cahier, Devoirs & Familles</span>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Journal de classe officiel, programmation des devoirs et carnet de liaison signé.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-blue-700 font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>{pillarStats.devoirsActifs} devoirs programmés</span>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Liaison synchronisée
            </span>
          </div>
        </div>

        {/* PILIER 3 : LA SÉCURITÉ */}
        <div
          onClick={() => setActiveTab('securite')}
          className={`cursor-pointer bg-white p-5 rounded-2xl border transition-all relative overflow-hidden group hover:shadow-md ${
            activeTab === 'securite'
              ? 'border-rose-500 ring-2 ring-rose-500/20'
              : 'border-slate-200/80 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
              Pilier 3 • La Sécurité
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3">
            <h3 className="text-base font-black text-slate-900 group-hover:text-rose-600 transition-colors flex items-center gap-1">
              <span>Santé, Sorties & Incidents</span>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Fiches PAI d'urgence, vérification des personnes mandatées et main courante.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-rose-700 font-bold">
              <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
              <span>{pillarStats.paiActifs} protocoles PAI</span>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
              {pillarStats.incidentsRecents} déclarations
            </span>
          </div>
        </div>
      </div>

      {/* DASHBOARD TAB NAVIGATION BAR */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('three-pillars')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'three-pillars'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          Console des 3 Piliers
        </button>

        <button
          onClick={() => setActiveTab('suivi')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'suivi'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          1. Le Suivi
        </button>

        <button
          onClick={() => setActiveTab('transmission')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'transmission'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          2. La Transmission
        </button>

        <button
          onClick={() => setActiveTab('securite')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'securite'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          3. La Sécurité
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'students'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          Mes Élèves par Classe ({teacherStudents.length})
        </button>

        <button
          onClick={() => setActiveTab('evaluations')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'evaluations'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Évaluations & Absences ({teacherNotes.length})
        </button>
      </div>

      {/* VIEW: CONSOLE COMPLETE DES 3 PILIERS */}
      {activeTab === 'three-pillars' && (
        <EducatorPillarsConsole
          initialPillar="suivi"
          defaultClass={selectedClassName}
          onNavigateTab={onNavigate}
        />
      )}

      {/* VIEW: PILIER 1 LE SUIVI SEUL */}
      {activeTab === 'suivi' && (
        <SuiviPillar
          selectedClass={selectedClassName}
          onClassChange={setSelectedClassName}
          availableClasses={['3ème B', 'Terminale S1']}
        />
      )}

      {/* VIEW: PILIER 2 LA TRANSMISSION SEULE */}
      {activeTab === 'transmission' && (
        <TransmissionPillar
          selectedClass={selectedClassName}
          onClassChange={setSelectedClassName}
          availableClasses={['3ème B', 'Terminale S1']}
        />
      )}

      {/* VIEW: PILIER 3 LA SÉCURITÉ SEULE */}
      {activeTab === 'securite' && (
        <SecuritePillar
          selectedClass={selectedClassName}
          onClassChange={setSelectedClassName}
          availableClasses={['3ème B', 'Terminale S1']}
        />
      )}

      {/* VIEW: STUDENTS LIST PER CLASS */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Liste des Élèves par Classe Enseignée
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Consultez le nombre et la liste nominative des élèves dans chacune de vos classes affectées
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Rechercher un élève..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Breakdown of classes with counts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              onClick={() => setSelectedClasseId('ALL')}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                selectedClasseId === 'ALL'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200/80 text-slate-800'
              }`}
            >
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${selectedClasseId === 'ALL' ? 'text-blue-200' : 'text-slate-400'}`}>
                  Vue Globale
                </span>
                <span className="font-bold text-sm">Toutes vos classes</span>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${selectedClasseId === 'ALL' ? 'bg-white/20 text-white' : 'bg-white border border-slate-200 text-slate-800'}`}>
                {teacherStudents.length} élèves
              </span>
            </button>

            {classStats.map((st) => {
              const isSelected = selectedClasseId === st.classe.id;
              return (
                <button
                  key={st.classe.id}
                  onClick={() => setSelectedClasseId(st.classe.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200/80 text-slate-800'
                  }`}
                >
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                      {st.classe.niveau} • {st.classe.salle}
                    </span>
                    <span className="font-bold text-sm">{st.classe.nom}</span>
                  </div>
                  <div className="text-right">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold block ${isSelected ? 'bg-white/20 text-white' : 'bg-white border border-slate-200 text-blue-700'}`}>
                      {st.studentCount} élèves
                    </span>
                    <span className={`text-[10px] font-medium block mt-1 ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                      Capacité: {st.classe.effectif_max}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Table of Students */}
          <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase text-[10px] font-bold">
                  <th className="py-3 px-4">Élève</th>
                  <th className="py-3 px-4">Matricule</th>
                  <th className="py-3 px-4">Classe Affectée</th>
                  <th className="py-3 px-4">Filière</th>
                  <th className="py-3 px-4 text-right">Actions Éducateur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {s.avatar ? (
                            <img src={s.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                              {s.first_name[0]}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900">{s.first_name} {s.last_name}</p>
                            <p className="text-[10px] text-slate-500">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                        {s.matricule}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md text-[11px]">
                          <Building2 className="w-3 h-3 text-blue-600" />
                          {s.classe_nom}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {s.filiere_nom || 'Enseignement Général'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedClassName(s.classe_nom || '3ème B');
                              setActiveTab('suivi');
                            }}
                            className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px] rounded-lg transition-colors border border-blue-200/60"
                          >
                            Suivi & Appel
                          </button>
                          <button
                            onClick={() => {
                              setSelectedClassName(s.classe_nom || '3ème B');
                              setActiveTab('securite');
                            }}
                            className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[11px] rounded-lg transition-colors border border-rose-200/60"
                          >
                            Sécurité & PAI
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Aucun élève trouvé pour le filtre sélectionné.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: EVALUATIONS & ABSENCES */}
      {activeTab === 'evaluations' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Absences */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CalendarX className="w-5 h-5 text-amber-600" />
                  Absences & Retards par Classe Affectée
                </h3>
                <p className="text-xs text-slate-500">Statistiques et signalements récents</p>
              </div>
              <button
                onClick={() => onNavigate('absences')}
                className="text-xs font-bold text-amber-600 hover:text-amber-800 flex items-center gap-1"
              >
                Gérer les absences <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5 pt-2">
              {teacherAbsences.length > 0 ? (
                teacherAbsences.map((abs) => (
                  <div
                    key={abs.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{abs.eleve_nom}</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-bold text-[10px]">
                          {abs.classe_nom}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {abs.matiere_nom || 'Cours'} • {abs.date_absence} ({abs.duree_heures}h)
                      </p>
                      <p className="text-[10px] text-slate-400 italic mt-0.5">Motif: {abs.motif}</p>
                    </div>
                    <Badge status={abs.statut} />
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">
                  Aucune absence ou retard signalé dans vos classes.
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  Notes & Évaluations Saisies
                </h3>
                <p className="text-xs text-slate-500">Résultats récents de vos classes affectées</p>
              </div>
              <button
                onClick={() => onNavigate('notes')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                Voir les évaluations <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {teacherNotes.length > 0 ? (
                teacherNotes.map((n) => (
                  <div
                    key={n.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4 hover:bg-slate-100/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-mono font-black flex items-center justify-center text-sm shrink-0 shadow-xs">
                        {n.valeur}/20
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{n.eleve_nom}</h4>
                        <p className="text-[11px] text-slate-500">
                          {n.matiere_nom} • <span className="font-semibold text-slate-700">{n.evaluation_titre}</span>
                        </p>
                        {n.appreciation && (
                          <p className="text-[10px] text-slate-400 italic mt-0.5">"{n.appreciation}"</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-md">
                        Coef. {n.coefficient}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">{n.date_saisie}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">
                  Aucune note saisie récemment pour vos classes.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
