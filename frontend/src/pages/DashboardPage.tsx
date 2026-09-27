import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { schoolService } from '../services/schoolService';
import { DashboardStats, Inscription, Note, Absence, Paiement } from '../types';
import { Badge } from '../components/common/Badge';
import { TeacherDashboard } from '../components/dashboard/TeacherDashboard';
import { StudentDashboard } from '../components/dashboard/StudentDashboard';
import { ParentDashboard } from '../components/dashboard/ParentDashboard';
import { EducatorDashboard } from '../components/dashboard/EducatorDashboard';
import {
  Users,
  GraduationCap,
  Building2,
  CreditCard,
  CalendarX,
  TrendingUp,
  ArrowUpRight,
  Plus,
  BookOpen,
  FileText,
  Award,
  CheckCircle2,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, activeRole } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentInscriptions, setRecentInscriptions] = useState<Inscription[]>([]);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [recentAbsences, setRecentAbsences] = useState<Absence[]>([]);
  const [recentPaiements, setRecentPaiements] = useState<Paiement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeRole === 'EDUCATEUR' || activeRole === 'ENSEIGNANT' || activeRole === 'ELEVE' || activeRole === 'PARENT') {
      return;
    }

    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [st, insc, nt, abs, pay] = await Promise.all([
          schoolService.getDashboardStats(),
          schoolService.getInscriptions(),
          schoolService.getNotes(),
          schoolService.getAbsences(),
          schoolService.getPaiements(),
        ]);
        setStats(st);
        setRecentInscriptions(insc.slice(0, 5));
        setRecentNotes(nt.slice(0, 5));
        setRecentAbsences(abs.slice(0, 5));
        setRecentPaiements(pay.slice(0, 5));
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [activeRole]);

  // Return specialized role dashboards after hooks are declared
  if (activeRole === 'EDUCATEUR') {
    return <EducatorDashboard onNavigate={onNavigate} />;
  }

  if (activeRole === 'ENSEIGNANT') {
    return <TeacherDashboard onNavigate={onNavigate} />;
  }

  if (activeRole === 'ELEVE') {
    return <StudentDashboard onNavigate={onNavigate} />;
  }

  if (activeRole === 'PARENT') {
    return <ParentDashboard onNavigate={onNavigate} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/30 text-blue-300 text-xs font-semibold rounded-full border border-blue-500/30 mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>Session {user?.first_name} ({activeRole})</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Bonjour, {user?.first_name} {user?.last_name} 👋
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
              Bienvenue sur Sukulu. Vous consultez la plateforme en tant que{' '}
              <strong className="text-white">{activeRole}</strong> pour l'année académique 2025-2026.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {activeRole === 'ADMIN' && (
              <button
                onClick={() => onNavigate('inscriptions')}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                Nouvelle Inscription
              </button>
            )}

            {activeRole === 'ENSEIGNANT' && (
              <button
                onClick={() => onNavigate('notes')}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                Saisir des Notes
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Top Stat Metric Cards displaying all key indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Élèves */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Élèves
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {stats?.total_eleves || 485}
            </h3>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              +12% par rapport à l'an dernier
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Total Enseignants */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Enseignants
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {stats?.total_enseignants || 34}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Professeurs titulaires
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Total Parents */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Parents
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              192
            </h3>
            <p className="text-[11px] text-blue-600 font-semibold mt-1">
              Tuteurs légaux enregistrés
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Classes & Filières */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Classes & Filières
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {stats?.total_classes || 16} <span className="text-sm font-normal text-slate-500">Classes</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Réparties dans <strong className="text-slate-800">6 Filières</strong>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 5: Inscriptions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Inscriptions
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              488 <span className="text-xs font-semibold text-slate-500">Dossiers</span>
            </h3>
            <p className="text-[11px] text-amber-600 font-bold mt-1">
              3 En attente de validation
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Card 6: Recouvrement Scolarité */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Statistiques Paiements
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {stats?.taux_recouvrement || 84.5}%
            </h3>
            <p className="text-[11px] text-emerald-600 font-bold mt-1">
              {(stats?.montant_total_recouvre || 184500000).toLocaleString('fr-FR')} FCFA
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        {/* Card 7: Absences & Taux de Présence */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Statistiques Absences
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {stats?.absences_aujourdhui || 6} <span className="text-xs font-semibold text-slate-500">Aujourd'hui</span>
            </h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              98.2% Taux d'assiduité globale
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <CalendarX className="w-6 h-6" />
          </div>
        </div>

        {/* Card 8: Moyenne Générale */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Moyenne Générale École
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {stats?.moyenne_generale_ecole || 14.2}/20
            </h3>
            <p className="text-[11px] text-blue-600 font-semibold mt-1">
              Trimestre 1 En cours
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Data Tables & Quick Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Inscriptions et Dernières Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Table 1: Inscriptions Récentes */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Inscriptions & Réinscriptions Récentes</h3>
                <p className="text-xs text-slate-500">Statut des dossiers d'élèves enregistrés</p>
              </div>
              <button
                onClick={() => onNavigate('inscriptions')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                Voir tout <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                    <th className="pb-2">Élève</th>
                    <th className="pb-2">Classe</th>
                    <th className="pb-2">Frais Reglés</th>
                    <th className="pb-2">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentInscriptions.map((inst) => (
                    <tr key={inst.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 font-semibold text-slate-900">
                        {inst.eleve_prenom} {inst.eleve_nom}
                        <span className="block text-[10px] font-mono text-slate-400">{inst.matricule}</span>
                      </td>
                      <td className="py-3 font-medium text-slate-700">{inst.classe_nom}</td>
                      <td className="py-3 font-mono font-bold text-slate-800">
                        {inst.frais_payes.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="py-3">
                        <Badge status={inst.statut} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2: Dernières Évaluations / Notes Saisies */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Notes & Évaluations Récentes</h3>
                <p className="text-xs text-slate-500">Saisie des résultats du 1er Trimestre</p>
              </div>
              <button
                onClick={() => onNavigate('notes')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                Consulter <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {recentNotes.map((note) => (
                <div key={note.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 font-bold text-slate-800 flex items-center justify-center text-sm font-mono shrink-0">
                      {note.valeur}/20
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{note.eleve_nom}</h4>
                      <p className="text-[11px] text-slate-500">
                        {note.matiere_nom} ({note.evaluation_titre})
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                      Coef. {note.coefficient}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">{note.date_saisie}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Paiements & Absences Widget */}
        <div className="space-y-6">
          {/* Recent Payments Widget */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Derniers Encaissements</h3>
              <button
                onClick={() => onNavigate('paiements')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                Paiements
              </button>
            </div>

            <div className="space-y-3">
              {recentPaiements.map((p) => (
                <div key={p.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900">{p.eleve_nom}</span>
                    <span className="font-mono font-bold text-emerald-600">
                      +{p.montant.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span>{p.mode_paiement}</span>
                    <Badge status={p.statut} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Absences Widget */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Absences & Retards</h3>
              <button
                onClick={() => onNavigate('absences')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                Gérer
              </button>
            </div>

            <div className="space-y-3">
              {recentAbsences.map((a) => (
                <div key={a.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs text-slate-900">{a.eleve_nom}</p>
                    <p className="text-[10px] text-slate-500">{a.classe_nom} • {a.date_absence}</p>
                  </div>
                  <Badge status={a.statut} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
