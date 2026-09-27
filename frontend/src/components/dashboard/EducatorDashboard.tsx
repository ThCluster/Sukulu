import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { schoolService } from '../../services/schoolService';
import { educatorService } from '../../services/educatorService';
import { Classe, User, Absence } from '../../types';
import { EducatorPillarsConsole } from '../educator/EducatorPillarsConsole';
import { SuiviPillar } from '../educator/SuiviPillar';
import { TransmissionPillar } from '../educator/TransmissionPillar';
import { SecuritePillar } from '../educator/SecuritePillar';
import {
  Activity,
  BookOpen,
  ShieldCheck,
  ShieldAlert,
  Users,
  Building2,
  Phone,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Sparkles,
  CalendarDays,
  FileText,
  Search,
  ChevronRight,
  HeartPulse,
  LogOut,
  Send,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface EducatorDashboardProps {
  onNavigate: (tab: string) => void;
}

export const EducatorDashboard: React.FC<EducatorDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [classes, setClasses] = useState<Classe[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);

  // Active view tab inside Educator Dashboard
  const [activeTab, setActiveTab] = useState<'three-pillars' | 'suivi' | 'transmission' | 'securite' | 'students'>('three-pillars');

  // Selected class
  const [selectedClassName, setSelectedClassName] = useState<string>('3ème B');
  const [studentSearch, setStudentSearch] = useState('');

  // 3 Pillars Metrics
  const [metrics, setMetrics] = useState({
    tauxPresence: 94,
    vigilanceAlertes: 2,
    cahierCount: 2,
    devoirsActifs: 3,
    liaisonsAttente: 1,
    paiActifs: 2,
    sortiesSousControle: 3,
    incidentsCount: 2,
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [clsList, stList, absList, obsList, devList, fichesSante, incList] = await Promise.all([
          schoolService.getClasses(),
          schoolService.getUsers('ELEVE'),
          schoolService.getAbsences(),
          educatorService.getObservations(),
          educatorService.getDevoirs(),
          educatorService.getFichesSante(),
          educatorService.getIncidents(),
        ]);

        setClasses(clsList);
        setStudents(stList);
        setAbsences(absList);

        const vigCount = obsList.filter((o) => o.niveau_vigilance !== 'NORMAL').length;
        const paiCount = fichesSante.filter((f) => f.pai_actif).length;

        setMetrics({
          tauxPresence: 94.2,
          vigilanceAlertes: vigCount,
          cahierCount: 2,
          devoirsActifs: devList.length,
          liaisonsAttente: 1,
          paiActifs: paiCount,
          sortiesSousControle: 3,
          incidentsCount: incList.length,
        });
      } catch (err) {
        console.error('Error loading educator dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.first_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.last_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.matricule?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.classe_nom?.toLowerCase().includes(studentSearch.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Educator Dedicated Hero */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/20 text-rose-300 text-xs font-semibold rounded-full border border-rose-500/30">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Espace Éducateur • Vie Scolaire & Encadrement</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Bonjour, {user?.first_name} {user?.last_name} 👋
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Votre tableau de bord opérationnel est structuré autour des{' '}
              <strong className="text-white">trois piliers indispensables de votre quotidien d'éducateur</strong> :{' '}
              <span className="text-blue-300 font-semibold">Le Suivi</span>,{' '}
              <span className="text-emerald-300 font-semibold">La Transmission</span> et{' '}
              <span className="text-rose-300 font-semibold">La Sécurité</span>.
            </p>
          </div>

          {/* Direct Quick Action Pillar Buttons */}
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={() => setActiveTab('suivi')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md shadow-blue-600/30 transition-all"
            >
              <Activity className="w-4 h-4" />
              1. Lancer l'Appel
            </button>
            <button
              onClick={() => setActiveTab('transmission')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md shadow-emerald-600/30 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              2. Cahier & Devoirs
            </button>
            <button
              onClick={() => setActiveTab('securite')}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md shadow-rose-600/30 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              3. Fiches PAI & Sorties
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Crisis Hotline Ribbon */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-slate-950 text-white p-4 rounded-2xl border border-rose-900/60 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600/30 border border-rose-500/40 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white px-2.5 py-0.5 rounded-full">
                Liaison Sécurité Établissement
              </span>
              <span className="text-xs text-rose-200 font-semibold">Postes d'appel direct éducateur</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Infirmerie scolaire : <strong>Poste 104</strong> • CPE / Vie Scolaire : <strong>Poste 102</strong> • Direction : <strong>Poste 101</strong> • SAMU : <strong>15</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => showToast('Alerte transmise au poste central de la Vie Scolaire', 'info')}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-rose-600/30"
          >
            <Phone className="w-4 h-4" />
            <span>Appel d'Urgence Vie Scolaire</span>
          </button>
        </div>
      </div>

      {/* THE 3 INDISPENSABLE PILLARS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* PILIER 1 : LE SUIVI */}
        <div
          onClick={() => setActiveTab('suivi')}
          className={`cursor-pointer bg-white p-6 rounded-2xl border transition-all relative overflow-hidden group hover:shadow-md ${
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

          <div className="mt-4">
            <h3 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1">
              <span>Assiduité, Pointage & Vigilance</span>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Feuille d'émargement en direct, saisie rapide des retards/absences et carnet d'observations comportementales.
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{metrics.tauxPresence}% assiduité</span>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              {metrics.vigilanceAlertes} vigilances actives
            </span>
          </div>
        </div>

        {/* PILIER 2 : LA TRANSMISSION */}
        <div
          onClick={() => setActiveTab('transmission')}
          className={`cursor-pointer bg-white p-6 rounded-2xl border transition-all relative overflow-hidden group hover:shadow-md ${
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

          <div className="mt-4">
            <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center gap-1">
              <span>Cahier, Devoirs & Familles</span>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Cahier de texte officiel, consignes de travail et carnet de liaison avec signature numérique des parents.
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-blue-700 font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>{metrics.devoirsActifs} devoirs actifs</span>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Signatures en direct
            </span>
          </div>
        </div>

        {/* PILIER 3 : LA SÉCURITÉ */}
        <div
          onClick={() => setActiveTab('securite')}
          className={`cursor-pointer bg-white p-6 rounded-2xl border transition-all relative overflow-hidden group hover:shadow-md ${
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

          <div className="mt-4">
            <h3 className="text-base font-black text-slate-900 group-hover:text-rose-600 transition-colors flex items-center gap-1">
              <span>Santé PAI, Sorties & Incidents</span>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Fiches d'urgence médicale, vérification des personnes mandatées aux sorties et main courante officielle.
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-rose-700 font-bold">
              <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
              <span>{metrics.paiActifs} protocoles PAI</span>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
              {metrics.sortiesSousControle} sorties encadrées
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
          Registre des Élèves ({students.length})
        </button>
      </div>

      {/* VIEW: CONSOLE DES 3 PILIERS */}
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

      {/* VIEW: STUDENTS REGISTRY */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-rose-600" />
                Registre des Élèves sous Surveillance Éducative
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Consultez les effectifs, coordonnées et affectations des élèves pour le suivi et la sécurité
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Rechercher par nom, matricule, classe..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-hidden"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase text-[10px] font-bold">
                  <th className="py-3 px-4">Élève</th>
                  <th className="py-3 px-4">Matricule</th>
                  <th className="py-3 px-4">Classe</th>
                  <th className="py-3 px-4">Contact Tuteur</th>
                  <th className="py-3 px-4 text-right">Actions Éducateur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {s.avatar ? (
                          <img src={s.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs">
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
                        <Building2 className="w-3 h-3 text-rose-600" />
                        {s.classe_nom || 'Non affecté'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {s.phone || 'Non renseigné'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (s.classe_nom) setSelectedClassName(s.classe_nom);
                            setActiveTab('suivi');
                          }}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px] rounded-lg transition-colors border border-blue-200/60"
                        >
                          Suivi
                        </button>
                        <button
                          onClick={() => {
                            if (s.classe_nom) setSelectedClassName(s.classe_nom);
                            setActiveTab('securite');
                          }}
                          className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[11px] rounded-lg transition-colors border border-rose-200/60"
                        >
                          Sécurité
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
