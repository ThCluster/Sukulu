import React, { useState, useEffect } from 'react';
import { educatorService } from '../../services/educatorService';
import { AppelSession, PointageEleve, SuiviObservation, NiveauVigilance, TypeObservation } from '../../types/educator';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';
import {
  CheckCircle2,
  Clock,
  UserX,
  AlertTriangle,
  Users,
  Search,
  Plus,
  Sparkles,
  Calendar,
  Eye,
  FileText,
  Activity,
  UserCheck,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface SuiviPillarProps {
  selectedClass: string;
  onClassChange: (cls: string) => void;
  availableClasses: string[];
}

export const SuiviPillar: React.FC<SuiviPillarProps> = ({
  selectedClass,
  onClassChange,
  availableClasses,
}) => {
  const { showToast } = useToast();
  const [appelSession, setAppelSession] = useState<AppelSession | null>(null);
  const [observations, setObservations] = useState<SuiviObservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<'appel' | 'observations'>('appel');

  // Modal for new observation
  const [isAddObsModalOpen, setIsAddObsModalOpen] = useState(false);
  const [obsForm, setObsForm] = useState({
    eleve_nom: '',
    type: 'PROGRESSION' as TypeObservation,
    niveau_vigilance: 'NORMAL' as NiveauVigilance,
    titre: '',
    commentaire: '',
    actions_recommandees: '',
    partage_equipe: true,
  });

  // Modal for setting retard minutes & motif
  const [retardTarget, setRetardTarget] = useState<PointageEleve | null>(null);
  const [retardMinutes, setRetardMinutes] = useState(10);
  const [retardMotif, setRetardMotif] = useState('Retard transport');

  const loadData = async () => {
    setLoading(true);
    try {
      const [session, obsList] = await Promise.all([
        educatorService.getAppelSession(selectedClass),
        educatorService.getObservations(selectedClass),
      ]);
      setAppelSession(session);
      setObservations(obsList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedClass]);

  const handleUpdateStatus = async (
    eleveId: number,
    statut: PointageEleve['statut'],
    retardMin?: number,
    motif?: string
  ) => {
    try {
      const updated = await educatorService.updatePointage(selectedClass, eleveId, statut, retardMin, motif);
      setAppelSession(updated);
      showToast('Statut de présence mis à jour', 'success');
    } catch {
      showToast('Erreur lors de la mise à jour', 'error');
    }
  };

  const handleMarkAllPresents = async () => {
    try {
      const updated = await educatorService.markAllPresents(selectedClass);
      setAppelSession(updated);
      showToast('Tous les élèves ont été marqués Présents', 'success');
    } catch {
      showToast('Erreur', 'error');
    }
  };

  const handleConfirmRetard = async () => {
    if (!retardTarget) return;
    await handleUpdateStatus(retardTarget.eleve_id, 'RETARD', retardMinutes, retardMotif);
    setRetardTarget(null);
  };

  const handleCreateObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!obsForm.eleve_nom || !obsForm.titre || !obsForm.commentaire) {
      showToast('Veuillez renseigner tous les champs obligatoires', 'error');
      return;
    }

    try {
      await educatorService.addObservation({
        eleve_id: 99,
        eleve_nom: obsForm.eleve_nom,
        classe_nom: selectedClass,
        type: obsForm.type,
        niveau_vigilance: obsForm.niveau_vigilance,
        titre: obsForm.titre,
        commentaire: obsForm.commentaire,
        actions_recommandees: obsForm.actions_recommandees,
        auteur_nom: 'M. Moussa Diop',
        partage_equipe: obsForm.partage_equipe,
      });

      showToast('Observation enregistrée dans le suivi de l’élève', 'success');
      setIsAddObsModalOpen(false);
      setObsForm({
        eleve_nom: '',
        type: 'PROGRESSION',
        niveau_vigilance: 'NORMAL',
        titre: '',
        commentaire: '',
        actions_recommandees: '',
        partage_equipe: true,
      });
      const updatedObs = await educatorService.getObservations(selectedClass);
      setObservations(updatedObs);
    } catch {
      showToast('Erreur lors de l’enregistrement', 'error');
    }
  };

  const counts = {
    total: appelSession?.pointages.length || 0,
    presents: appelSession?.pointages.filter((p) => p.statut === 'PRESENT').length || 0,
    retards: appelSession?.pointages.filter((p) => p.statut === 'RETARD').length || 0,
    absents: appelSession?.pointages.filter((p) => p.statut.startsWith('ABSENT')).length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Pillar Header & Class Selector */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
              Pilier 1 • Le Suivi
            </span>
            <span className="text-xs text-slate-500 font-medium">Assiduité & Vigilance Pédagogique</span>
          </div>
          <h2 className="text-lg font-black text-slate-900 mt-1">
            Suivi quotidien & Appel en direct : {selectedClass}
          </h2>
          <p className="text-xs text-slate-500">
            Émargement en temps réel, alertes de décrochage et fiches de suivi individualisé.
          </p>
        </div>

        {/* Class Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500">Classe :</label>
          <select
            value={selectedClass}
            onChange={(e) => onClassChange(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {availableClasses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mini Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Effectif Pointé</span>
            <span className="text-xl font-black text-slate-900">{counts.total} élèves</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Présents</span>
            <span className="text-xl font-black text-emerald-700">{counts.presents}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Retards</span>
            <span className="text-xl font-black text-amber-700">{counts.retards}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">Absents</span>
            <span className="text-xl font-black text-rose-700">{counts.absents}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <UserX className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Sub Tabs: Appel vs Observations */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSubTab('appel')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            subTab === 'appel'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          Feuille d'Appel en Direct ({counts.total})
        </button>
        <button
          onClick={() => setSubTab('observations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            subTab === 'observations'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          Fiches de Suivi & Observations ({observations.length})
        </button>
      </div>

      {/* VIEW 1: FEUILLE D'APPEL */}
      {subTab === 'appel' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">
                  Séance : {appelSession?.matiere_nom} ({appelSession?.creneau_horaire})
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Taux présence : {appelSession?.taux_presence}%
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Dernière synchro : {appelSession?.derniere_mise_a_jour} • Transmis automatiquement à la Vie Scolaire
              </p>
            </div>

            <button
              onClick={handleMarkAllPresents}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-emerald-200"
            >
              <UserCheck className="w-4 h-4" />
              Tout marquer Présent
            </button>
          </div>

          {/* Student list for attendance */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                  <th className="py-3 px-4">Élève</th>
                  <th className="py-3 px-4">Matricule</th>
                  <th className="py-3 px-4">Statut Actuel</th>
                  <th className="py-3 px-4">Détails / Motif</th>
                  <th className="py-3 px-4 text-right">Pointage Rapide</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appelSession?.pointages.map((p) => (
                  <tr key={p.eleve_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {p.avatar ? (
                          <img src={p.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                            {p.eleve_nom[0]}
                          </div>
                        )}
                        <span className="font-bold text-slate-900">{p.eleve_nom}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">{p.matricule}</td>
                    <td className="py-3 px-4">
                      {p.statut === 'PRESENT' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> Présent
                        </span>
                      )}
                      {p.statut === 'RETARD' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3" /> Retard ({p.retard_minutes || 10} min)
                        </span>
                      )}
                      {p.statut === 'ABSENT_NON_JUSTIFIE' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          <UserX className="w-3 h-3" /> Absent non justifié
                        </span>
                      )}
                      {p.statut === 'ABSENT_JUSTIFIE' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          <CheckCircle2 className="w-3 h-3" /> Absent justifié
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {p.motif || p.remarque || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleUpdateStatus(p.eleve_id, 'PRESENT')}
                          title="Marquer Présent"
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            p.statut === 'PRESENT'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700'
                          }`}
                        >
                          Présent
                        </button>

                        <button
                          onClick={() => {
                            setRetardTarget(p);
                            setRetardMinutes(10);
                          }}
                          title="Signaler Retard"
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            p.statut === 'RETARD'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700'
                          }`}
                        >
                          Retard...
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(p.eleve_id, 'ABSENT_NON_JUSTIFIE')}
                          title="Marquer Absent"
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            p.statut === 'ABSENT_NON_JUSTIFIE'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700'
                          }`}
                        >
                          Absent
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

      {/* VIEW 2: FICHES DE SUIVI & OBSERVATIONS */}
      {subTab === 'observations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Carnet de suivi individuel & Vigilance pédagogique
              </h3>
              <p className="text-xs text-slate-500">
                Historique des remarques comportementales, difficultés et réussites des élèves.
              </p>
            </div>
            <button
              onClick={() => setIsAddObsModalOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Ajouter une observation de suivi
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {observations.map((obs) => {
              const vigilanceBadge = {
                NORMAL: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Suivi Normal' },
                VIGILANCE: { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: '⚠️ Vigilance Requise' },
                ALERTE: { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: '🚨 Alerte Décrochage' },
              }[obs.niveau_vigilance];

              return (
                <div
                  key={obs.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3 hover:border-blue-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{obs.eleve_nom}</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                          {obs.classe_nom}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-blue-700 mt-1">{obs.titre}</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${vigilanceBadge.bg}`}>
                      {vigilanceBadge.label}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    "{obs.commentaire}"
                  </p>

                  {obs.actions_recommandees && (
                    <div className="text-[11px] text-amber-900 bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/60">
                      <strong>Plan d'action :</strong> {obs.actions_recommandees}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                    <span>Par {obs.auteur_nom} • {obs.date}</span>
                    <span className="text-blue-600 font-semibold">
                      {obs.partage_equipe ? 'Partagé équipe pédagogique' : 'Confidentiel'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Retard Modal */}
      {retardTarget && (
        <Modal
          isOpen={!!retardTarget}
          onClose={() => setRetardTarget(null)}
          title={`Enregistrer un retard : ${retardTarget.eleve_nom}`}
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Durée du retard (minutes)</label>
              <input
                type="number"
                min="1"
                max="120"
                value={retardMinutes}
                onChange={(e) => setRetardMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Motif invoqué</label>
              <input
                type="text"
                value={retardMotif}
                onChange={(e) => setRetardMotif(e.target.value)}
                placeholder="Ex : Transport, réveil tardif, passage infirmerie..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setRetardTarget(null)}
                className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmRetard}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl"
              >
                Valider le retard
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Observation Modal */}
      {isAddObsModalOpen && (
        <Modal
          isOpen={isAddObsModalOpen}
          onClose={() => setIsAddObsModalOpen(false)}
          title={`Nouvelle observation de suivi • ${selectedClass}`}
        >
          <form onSubmit={handleCreateObservation} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Nom de l'élève</label>
              <select
                value={obsForm.eleve_nom}
                onChange={(e) => setObsForm({ ...obsForm, eleve_nom: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              >
                <option value="">Sélectionner un élève...</option>
                {appelSession?.pointages.map((p) => (
                  <option key={p.eleve_id} value={p.eleve_nom}>
                    {p.eleve_nom} ({p.matricule})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Domaine</label>
                <select
                  value={obsForm.type}
                  onChange={(e) => setObsForm({ ...obsForm, type: e.target.value as TypeObservation })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="PROGRESSION">Progression Pédagogique</option>
                  <option value="DIFFICULTE">Difficulté Constatée</option>
                  <option value="COMPORTEMENT">Comportement / Discipline</option>
                  <option value="PARTICIPATION">Participation en Classe</option>
                  <option value="ENCOURAGEMENT">Encouragement Particulier</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Niveau de vigilance</label>
                <select
                  value={obsForm.niveau_vigilance}
                  onChange={(e) => setObsForm({ ...obsForm, niveau_vigilance: e.target.value as NiveauVigilance })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="NORMAL">Normal (RAS)</option>
                  <option value="VIGILANCE">Vigilance (À surveiller)</option>
                  <option value="ALERTE">Alerte Décrochage / Risque</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Titre résumé</label>
              <input
                type="text"
                value={obsForm.titre}
                onChange={(e) => setObsForm({ ...obsForm, titre: e.target.value })}
                placeholder="Ex : Progrès notables en calcul, ou oublis réguliers de matériel..."
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Commentaire détaillé de l'éducateur</label>
              <textarea
                rows={3}
                value={obsForm.commentaire}
                onChange={(e) => setObsForm({ ...obsForm, commentaire: e.target.value })}
                placeholder="Précisez les faits observés avec bienveillance et rigueur..."
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Action recommandée / Piste de remédiation</label>
              <input
                type="text"
                value={obsForm.actions_recommandees}
                onChange={(e) => setObsForm({ ...obsForm, actions_recommandees: e.target.value })}
                placeholder="Ex : Soutien personnalisé le mercredi, tutorat par un pair..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setIsAddObsModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Enregistrer l'observation
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
