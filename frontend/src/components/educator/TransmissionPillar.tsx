import React, { useState, useEffect } from 'react';
import { educatorService } from '../../services/educatorService';
import { CahierTexteEntry, DevoirTransmission, LiaisonParent } from '../../types/educator';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';
import {
  BookOpen,
  Calendar,
  Send,
  CheckCircle2,
  Clock,
  Plus,
  MessageSquare,
  AlertCircle,
  FileCheck2,
  FileText,
  Users,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface TransmissionPillarProps {
  selectedClass: string;
  onClassChange: (cls: string) => void;
  availableClasses: string[];
}

export const TransmissionPillar: React.FC<TransmissionPillarProps> = ({
  selectedClass,
  onClassChange,
  availableClasses,
}) => {
  const { showToast } = useToast();
  const [cahierList, setCahierList] = useState<CahierTexteEntry[]>([]);
  const [devoirsList, setDevoirsList] = useState<DevoirTransmission[]>([]);
  const [liaisonsList, setLiaisonsList] = useState<LiaisonParent[]>([]);
  const [loading, setLoading] = useState(true);

  // Sub Tab
  const [activeSubTab, setActiveSubTab] = useState<'cahier' | 'devoirs' | 'liaison'>('cahier');

  // Modals
  const [isAddCahierModalOpen, setIsAddCahierModalOpen] = useState(false);
  const [isAddDevoirModalOpen, setIsAddDevoirModalOpen] = useState(false);
  const [isAddLiaisonModalOpen, setIsAddLiaisonModalOpen] = useState(false);

  // Forms
  const [cahierForm, setCahierForm] = useState({
    matiere_nom: 'Mathématiques',
    creneau: '08:00 - 10:00',
    titre_lecon: '',
    contenu_cours: '',
    notions_cles_str: '',
    exercices_faits: '',
  });

  const [devoirForm, setDevoirForm] = useState({
    matiere_nom: 'Mathématiques',
    date_echeance: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    titre: '',
    instructions: '',
    temps_estime_minutes: 30,
    type: 'EXERCICE' as DevoirTransmission['type'],
    est_evalue: true,
    materiel_requis: '',
  });

  const [liaisonForm, setLiaisonForm] = useState({
    destinataire_type: 'INDIVIDUEL' as 'INDIVIDUEL' | 'CLASSE_ENTIERE',
    eleve_nom: '',
    parent_nom: '',
    objet: '',
    message: '',
    type_message: 'INFORMATION' as LiaisonParent['type_message'],
    priorite: 'NORMALE' as LiaisonParent['priorite'],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [cEntries, dEntries, lEntries] = await Promise.all([
        educatorService.getCahierTexte(selectedClass),
        educatorService.getDevoirs(selectedClass),
        educatorService.getLiaisonsParents(selectedClass),
      ]);
      setCahierList(cEntries);
      setDevoirsList(dEntries);
      setLiaisonsList(lEntries);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedClass]);

  const handleCreateCahierEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cahierForm.titre_lecon || !cahierForm.contenu_cours) {
      showToast('Veuillez remplir le titre et le contenu du cours', 'error');
      return;
    }

    try {
      const notions = cahierForm.notions_cles_str
        ? cahierForm.notions_cles_str.split(',').map((s) => s.trim())
        : ['Notion principale'];

      await educatorService.addCahierTexteEntry({
        classe_id: selectedClass.includes('Terminale') ? 3 : 2,
        classe_nom: selectedClass,
        matiere_nom: cahierForm.matiere_nom,
        enseignant_nom: 'M. Moussa Diop',
        date: new Date().toISOString().split('T')[0],
        creneau: cahierForm.creneau,
        titre_lecon: cahierForm.titre_lecon,
        contenu_cours: cahierForm.contenu_cours,
        notions_cles: notions,
        exercices_faits: cahierForm.exercices_faits,
      });

      showToast('Séance enregistrée au cahier de textes', 'success');
      setIsAddCahierModalOpen(false);
      setCahierForm({
        matiere_nom: 'Mathématiques',
        creneau: '08:00 - 10:00',
        titre_lecon: '',
        contenu_cours: '',
        notions_cles_str: '',
        exercices_faits: '',
      });
      loadData();
    } catch {
      showToast('Erreur lors de l’enregistrement', 'error');
    }
  };

  const handleCreateDevoir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devoirForm.titre || !devoirForm.instructions) {
      showToast('Veuillez renseigner le titre et les instructions du devoir', 'error');
      return;
    }

    try {
      await educatorService.addDevoir({
        classe_id: selectedClass.includes('Terminale') ? 3 : 2,
        classe_nom: selectedClass,
        matiere_nom: devoirForm.matiere_nom,
        enseignant_nom: 'M. Moussa Diop',
        date_echeance: devoirForm.date_echeance,
        titre: devoirForm.titre,
        instructions: devoirForm.instructions,
        temps_estime_minutes: Number(devoirForm.temps_estime_minutes),
        type: devoirForm.type,
        est_evalue: devoirForm.est_evalue,
        materiel_requis: devoirForm.materiel_requis,
      });

      showToast('Devoir transmis à la classe et aux familles', 'success');
      setIsAddDevoirModalOpen(false);
      setDevoirForm({
        matiere_nom: 'Mathématiques',
        date_echeance: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        titre: '',
        instructions: '',
        temps_estime_minutes: 30,
        type: 'EXERCICE',
        est_evalue: true,
        materiel_requis: '',
      });
      loadData();
    } catch {
      showToast('Erreur lors de la transmission du devoir', 'error');
    }
  };

  const handleCreateLiaison = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liaisonForm.objet || !liaisonForm.message) {
      showToast('Veuillez renseigner l’objet et le message', 'error');
      return;
    }

    try {
      await educatorService.addLiaisonParent({
        eleve_id: liaisonForm.destinataire_type === 'CLASSE_ENTIERE' ? 0 : 7,
        eleve_nom: liaisonForm.destinataire_type === 'CLASSE_ENTIERE' ? `Classe ${selectedClass}` : (liaisonForm.eleve_nom || 'Mamadou Sow'),
        classe_nom: selectedClass,
        parent_nom: liaisonForm.destinataire_type === 'CLASSE_ENTIERE' ? 'Tous les parents' : (liaisonForm.parent_nom || 'Famille de l’élève'),
        destinataire_type: liaisonForm.destinataire_type,
        objet: liaisonForm.objet,
        message: liaisonForm.message,
        type_message: liaisonForm.type_message,
        priorite: liaisonForm.priorite,
      });

      showToast('Transmission envoyée aux parents avec accusé de réception', 'success');
      setIsAddLiaisonModalOpen(false);
      setLiaisonForm({
        destinataire_type: 'INDIVIDUEL',
        eleve_nom: '',
        parent_nom: '',
        objet: '',
        message: '',
        type_message: 'INFORMATION',
        priorite: 'NORMALE',
      });
      loadData();
    } catch {
      showToast('Erreur lors de l’envoi', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Pillar Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
              Pilier 2 • La Transmission
            </span>
            <span className="text-xs text-slate-500 font-medium">Pédagogie, Devoirs & Liaison Familles</span>
          </div>
          <h2 className="text-lg font-black text-slate-900 mt-1">
            Transmission du savoir & Relations éducatives : {selectedClass}
          </h2>
          <p className="text-xs text-slate-500">
            Journal de bord des cours assurés, devoirs programmés et carnet de liaison avec signature des parents.
          </p>
        </div>

        {/* Class Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500">Classe :</label>
          <select
            value={selectedClass}
            onChange={(e) => onClassChange(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {availableClasses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('cahier')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'cahier'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Cahier de Texte ({cahierList.length} séances)
        </button>

        <button
          onClick={() => setActiveSubTab('devoirs')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'devoirs'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          Devoirs & Travail à faire ({devoirsList.length})
        </button>

        <button
          onClick={() => setActiveSubTab('liaison')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'liaison'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Carnet de Liaison Familles ({liaisonsList.length})
        </button>
      </div>

      {/* SUB-VIEW 1: CAHIER DE TEXTE */}
      {activeSubTab === 'cahier' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Journal de classe officiel de {selectedClass}
              </h3>
              <p className="text-xs text-slate-500">
                Traçabilité des cours dispensés, notions clés acquises et exercices traités.
              </p>
            </div>
            <button
              onClick={() => setIsAddCahierModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Renseigner une séance au cahier de textes
            </button>
          </div>

          <div className="space-y-4">
            {cahierList.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3 hover:border-emerald-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      {entry.matiere_nom.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{entry.titre_lecon}</h4>
                      <p className="text-[11px] text-slate-500">
                        {entry.matiere_nom} • Par {entry.enseignant_nom}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px]">
                      {entry.date}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[11px]">
                      {entry.creneau}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 space-y-2">
                  <p className="font-medium">{entry.contenu_cours}</p>
                  {entry.exercices_faits && (
                    <div className="text-[11px] text-slate-600 border-t border-slate-200/60 pt-2">
                      <strong className="text-slate-800">Exercices effectués en classe :</strong> {entry.exercices_faits}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">Notions abordées :</span>
                  {entry.notions_cles.map((notion, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                    >
                      {notion}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: DEVOIRS */}
      {activeSubTab === 'devoirs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Devoirs & Travail à faire pour {selectedClass}
              </h3>
              <p className="text-xs text-slate-500">
                Planning des travaux donnés aux élèves et synchronisés avec l'espace parent.
              </p>
            </div>
            <button
              onClick={() => setIsAddDevoirModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Programmer un nouveau devoir
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {devoirsList.map((dev) => (
              <div
                key={dev.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3 hover:border-emerald-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {dev.type}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Pour le {dev.date_echeance}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900">{dev.titre}</h4>
                  <p className="text-[11px] text-slate-500">{dev.matiere_nom} • Donné le {dev.date_donnee}</p>

                  <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {dev.instructions}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Temps estimé : <strong>~{dev.temps_estime_minutes} min</strong></span>
                  <span className={`font-bold ${dev.est_evalue ? 'text-blue-600' : 'text-slate-400'}`}>
                    {dev.est_evalue ? '★ Noté / Évalué' : 'Non noté'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: CARNET DE LIAISON FAMILLES */}
      {activeSubTab === 'liaison' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Carnet de liaison & Transmissions aux Familles
              </h3>
              <p className="text-xs text-slate-500">
                Communications officielles avec signature et accusé de réception parental en temps réel.
              </p>
            </div>
            <button
              onClick={() => setIsAddLiaisonModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Send className="w-4 h-4" />
              Transmettre un mot aux parents
            </button>
          </div>

          <div className="space-y-3">
            {liaisonsList.map((liaison) => {
              const typeBadge = {
                FELICITATIONS: { bg: 'bg-emerald-100 text-emerald-800', label: 'Félicitations' },
                VIGILANCE_TRAVAIL: { bg: 'bg-amber-100 text-amber-800', label: 'Vigilance Travail' },
                OUBLI_MATERIEL: { bg: 'bg-orange-100 text-orange-800', label: 'Oubli de Matériel' },
                CONVOCATION: { bg: 'bg-rose-100 text-rose-800', label: 'Convocation Rendez-vous' },
                INFORMATION: { bg: 'bg-blue-100 text-blue-800', label: 'Information Générale' },
              }[liaison.type_message];

              return (
                <div
                  key={liaison.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3 hover:border-emerald-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${typeBadge.bg}`}>
                        {typeBadge.label}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">{liaison.objet}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      {liaison.accuse_reception ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Lu & Signé ({liaison.date_accuse})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          En attente de signature parentale
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    "{liaison.message}"
                  </p>

                  {liaison.reponse_parent && (
                    <div className="text-xs text-blue-900 bg-blue-50/70 p-3 rounded-xl border border-blue-200/60 space-y-1">
                      <div className="flex items-center gap-1 font-bold text-[11px] text-blue-800">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Réponse de la famille ({liaison.parent_nom}) :
                      </div>
                      <p className="italic">"{liaison.reponse_parent}"</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2">
                    <span>
                      Destinataire : <strong className="text-slate-700">{liaison.eleve_nom}</strong> ({liaison.parent_nom})
                    </span>
                    <span>Envoyé le {liaison.date_envoi}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Cahier Entry Modal */}
      {isAddCahierModalOpen && (
        <Modal
          isOpen={isAddCahierModalOpen}
          onClose={() => setIsAddCahierModalOpen(false)}
          title={`Enregistrer une séance au Cahier de Texte • ${selectedClass}`}
        >
          <form onSubmit={handleCreateCahierEntry} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Matière</label>
                <input
                  type="text"
                  value={cahierForm.matiere_nom}
                  onChange={(e) => setCahierForm({ ...cahierForm, matiere_nom: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Créneau horaire</label>
                <input
                  type="text"
                  value={cahierForm.creneau}
                  onChange={(e) => setCahierForm({ ...cahierForm, creneau: e.target.value })}
                  placeholder="Ex : 08:00 - 10:00"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Titre de la leçon / Chapitre</label>
              <input
                type="text"
                value={cahierForm.titre_lecon}
                onChange={(e) => setCahierForm({ ...cahierForm, titre_lecon: e.target.value })}
                placeholder="Ex : Chapitre 4 : Fonctions affines et résolution graphique"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Contenu dispensé & Activités menées</label>
              <textarea
                rows={3}
                value={cahierForm.contenu_cours}
                onChange={(e) => setCahierForm({ ...cahierForm, contenu_cours: e.target.value })}
                placeholder="Détaillez le déroulement du cours dispensé aujourd'hui..."
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Notions clés abordées (séparées par une virgule)</label>
              <input
                type="text"
                value={cahierForm.notions_cles_str}
                onChange={(e) => setCahierForm({ ...cahierForm, notions_cles_str: e.target.value })}
                placeholder="Ex : Coefficient directeur, Ordonnée à l'origine, Droites sécantes"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Exercices traités en classe</label>
              <input
                type="text"
                value={cahierForm.exercices_faits}
                onChange={(e) => setCahierForm({ ...cahierForm, exercices_faits: e.target.value })}
                placeholder="Ex : Exercices 18, 19 et 21 page 62"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setIsAddCahierModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Enregistrer au cahier de textes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Devoir Modal */}
      {isAddDevoirModalOpen && (
        <Modal
          isOpen={isAddDevoirModalOpen}
          onClose={() => setIsAddDevoirModalOpen(false)}
          title={`Donner un nouveau devoir • ${selectedClass}`}
        >
          <form onSubmit={handleCreateDevoir} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Matière</label>
                <input
                  type="text"
                  value={devoirForm.matiere_nom}
                  onChange={(e) => setDevoirForm({ ...devoirForm, matiere_nom: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Date d'échéance (Pour le)</label>
                <input
                  type="date"
                  value={devoirForm.date_echeance}
                  onChange={(e) => setDevoirForm({ ...devoirForm, date_echeance: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Titre du travail</label>
              <input
                type="text"
                value={devoirForm.titre}
                onChange={(e) => setDevoirForm({ ...devoirForm, titre: e.target.value })}
                placeholder="Ex : Exercices d'entraînement N° 12 et 14 p. 34"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Consignes précises pour l'élève</label>
              <textarea
                rows={3}
                value={devoirForm.instructions}
                onChange={(e) => setDevoirForm({ ...devoirForm, instructions: e.target.value })}
                placeholder="Expliquez ce qui est attendu, la méthode de justification..."
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Type de devoir</label>
                <select
                  value={devoirForm.type}
                  onChange={(e) => setDevoirForm({ ...devoirForm, type: e.target.value as DevoirTransmission['type'] })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="EXERCICE">Exercice écrit</option>
                  <option value="REVISION">Révision évaluation</option>
                  <option value="PROJET">Projet / Exposé</option>
                  <option value="LECTURE">Lecture</option>
                  <option value="DM">Devoir Maison noté</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Temps estimé</label>
                <select
                  value={devoirForm.temps_estime_minutes}
                  onChange={(e) => setDevoirForm({ ...devoirForm, temps_estime_minutes: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 heure</option>
                  <option value={90}>1h30</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Évaluation</label>
                <select
                  value={devoirForm.est_evalue ? 'OUI' : 'NON'}
                  onChange={(e) => setDevoirForm({ ...devoirForm, est_evalue: e.target.value === 'OUI' })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="OUI">Oui (Devoir noté)</option>
                  <option value="NON">Non (Formatif)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Matériel obligatoire requis</label>
              <input
                type="text"
                value={devoirForm.materiel_requis}
                onChange={(e) => setDevoirForm({ ...devoirForm, materiel_requis: e.target.value })}
                placeholder="Ex : Compas, règle, calculatrice scientifique..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setIsAddDevoirModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Transmettre le devoir
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Liaison Modal */}
      {isAddLiaisonModalOpen && (
        <Modal
          isOpen={isAddLiaisonModalOpen}
          onClose={() => setIsAddLiaisonModalOpen(false)}
          title={`Nouveau mot de liaison aux familles • ${selectedClass}`}
        >
          <form onSubmit={handleCreateLiaison} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Portée du message</label>
                <select
                  value={liaisonForm.destinataire_type}
                  onChange={(e) => setLiaisonForm({ ...liaisonForm, destinataire_type: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="INDIVIDUEL">Élève en particulier</option>
                  <option value="CLASSE_ENTIERE">Toute la classe ({selectedClass})</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Type de transmission</label>
                <select
                  value={liaisonForm.type_message}
                  onChange={(e) => setLiaisonForm({ ...liaisonForm, type_message: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="INFORMATION">Information générale</option>
                  <option value="FELICITATIONS">Félicitations & encouragement</option>
                  <option value="OUBLI_MATERIEL">Signalement oubli matériel</option>
                  <option value="VIGILANCE_TRAVAIL">Vigilance travail personnel</option>
                  <option value="CONVOCATION">Demande de rendez-vous</option>
                </select>
              </div>
            </div>

            {liaisonForm.destinataire_type === 'INDIVIDUEL' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nom de l'élève</label>
                  <input
                    type="text"
                    value={liaisonForm.eleve_nom}
                    onChange={(e) => setLiaisonForm({ ...liaisonForm, eleve_nom: e.target.value })}
                    placeholder="Ex : Mamadou Sow"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nom du parent / tuteur</label>
                  <input
                    type="text"
                    value={liaisonForm.parent_nom}
                    onChange={(e) => setLiaisonForm({ ...liaisonForm, parent_nom: e.target.value })}
                    placeholder="Ex : M. Ibrahima Sow"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Objet de la communication</label>
              <input
                type="text"
                value={liaisonForm.objet}
                onChange={(e) => setLiaisonForm({ ...liaisonForm, objet: e.target.value })}
                placeholder="Ex : Félicitations pour la progression en géométrie"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Texte de la transmission</label>
              <textarea
                rows={4}
                value={liaisonForm.message}
                onChange={(e) => setLiaisonForm({ ...liaisonForm, message: e.target.value })}
                placeholder="Rédigez le message destiné aux parents..."
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <p className="text-[11px] text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
              ℹ️ Ce mot apparaîtra instantanément sur l'espace numérique du parent, qui devra cliquer sur "Émarger / Signer" pour accuser réception.
            </p>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setIsAddLiaisonModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Envoyer avec accusé de réception
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
