import React, { useState, useEffect } from 'react';
import { educatorService } from '../../services/educatorService';
import { FicheUrgenceSante, AutorisationSortie, IncidentSecurite } from '../../types/educator';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';
import {
  ShieldAlert,
  HeartPulse,
  LogOut,
  AlertTriangle,
  Phone,
  UserCheck,
  CheckCircle2,
  Clock,
  Plus,
  Building2,
  FileWarning,
  Eye,
  Cross,
  UserX,
  Sparkles,
} from 'lucide-react';

interface SecuritePillarProps {
  selectedClass: string;
  onClassChange: (cls: string) => void;
  availableClasses: string[];
}

export const SecuritePillar: React.FC<SecuritePillarProps> = ({
  selectedClass,
  onClassChange,
  availableClasses,
}) => {
  const { showToast } = useToast();
  const [fichesSante, setFichesSante] = useState<FicheUrgenceSante[]>([]);
  const [sorties, setSorties] = useState<AutorisationSortie[]>([]);
  const [incidents, setIncidents] = useState<IncidentSecurite[]>([]);
  const [loading, setLoading] = useState(true);

  // Sub Tab
  const [activeSubTab, setActiveSubTab] = useState<'sante' | 'sorties' | 'incidents'>('sante');

  // Selected Fiche Sante for full modal
  const [inspectSante, setInspectSante] = useState<FicheUrgenceSante | null>(null);

  // Depart Validation Modal
  const [departTarget, setDepartTarget] = useState<AutorisationSortie | null>(null);
  const [selectedAccompagnateur, setSelectedAccompagnateur] = useState<string>('');

  // Add Incident Modal
  const [isAddIncidentModalOpen, setIsAddIncidentModalOpen] = useState(false);
  const [incidentForm, setIncidentForm] = useState({
    titre: '',
    lieu: 'COUR_RECREATION' as IncidentSecurite['lieu'],
    gravite: 'MODERE' as IncidentSecurite['gravite'],
    eleves_impliques_str: '',
    description_faits: '',
    temoins: '',
    mesures_immediates_prises: '',
    passage_infirmerie: true,
    notification_direction: true,
    notification_familles: true,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [santeList, sortieList, incList] = await Promise.all([
        educatorService.getFichesSante(selectedClass),
        educatorService.getAutorisationsSortie(selectedClass),
        educatorService.getIncidents(),
      ]);
      setFichesSante(santeList);
      setSorties(sortieList);
      setIncidents(incList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedClass]);

  const handleValidateDepart = async (
    eleveId: number,
    statut: 'PARTI_AVEC_ACCOMPAGNATEUR' | 'SORTIE_AUTONOME' | 'PRESENT_ETABLISSEMENT',
    personne?: string
  ) => {
    try {
      const updated = await educatorService.validerDepartEleve(eleveId, statut, personne);
      setSorties(updated);
      setDepartTarget(null);
      showToast('Sortie de l’élève consignée avec succès', 'success');
    } catch {
      showToast('Erreur lors du pointage de sortie', 'error');
    }
  };

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentForm.titre || !incidentForm.description_faits) {
      showToast('Veuillez renseigner le titre et les faits observés', 'error');
      return;
    }

    try {
      const impliques = incidentForm.eleves_impliques_str
        ? incidentForm.eleves_impliques_str.split(',').map((s) => s.trim())
        : [`Élève de ${selectedClass}`];

      await educatorService.addIncident({
        lieu: incidentForm.lieu,
        gravite: incidentForm.gravite,
        titre: incidentForm.titre,
        description_faits: incidentForm.description_faits,
        eleves_impliques: impliques,
        temoins: incidentForm.temoins,
        mesures_immediates_prises: incidentForm.mesures_immediates_prises,
        passage_infirmerie: incidentForm.passage_infirmerie,
        notification_direction: incidentForm.notification_direction,
        notification_familles: incidentForm.notification_familles,
        rapporteur_nom: 'M. Moussa Diop (Éducateur)',
      });

      showToast('Incident consigné dans la main courante officielle', 'success');
      setIsAddIncidentModalOpen(false);
      setIncidentForm({
        titre: '',
        lieu: 'COUR_RECREATION',
        gravite: 'MODERE',
        eleves_impliques_str: '',
        description_faits: '',
        temoins: '',
        mesures_immediates_prises: '',
        passage_infirmerie: true,
        notification_direction: true,
        notification_familles: true,
      });
      loadData();
    } catch {
      showToast('Erreur lors de l’enregistrement de l’incident', 'error');
    }
  };

  const handleCloseIncident = async (id: string) => {
    try {
      await educatorService.cloturerIncident(id);
      showToast('Incident clôturé dans le registre', 'info');
      loadData();
    } catch {
      showToast('Erreur lors de la clôture', 'error');
    }
  };

  const paiCount = fichesSante.filter((f) => f.pai_actif).length;
  const nonDeparted = sorties.filter((s) => s.statut_depart_aujourdhui === 'PRESENT_ETABLISSEMENT').length;

  return (
    <div className="space-y-6">
      {/* Pillar Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
              Pilier 3 • La Sécurité
            </span>
            <span className="text-xs text-slate-500 font-medium">Protection, Santé, Sorties & Main Courante</span>
          </div>
          <h2 className="text-lg font-black text-slate-900 mt-1">
            Sécurité des élèves & Protocoles d'urgence : {selectedClass}
          </h2>
          <p className="text-xs text-slate-500">
            Fiches médicales d'urgence (PAI), contrôle habilité des sorties et registre des incidents scolaires.
          </p>
        </div>

        {/* Class Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500">Classe :</label>
          <select
            value={selectedClass}
            onChange={(e) => onClassChange(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-rose-500/20"
          >
            {availableClasses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Emergency Crisis Hotline Ribbon */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-red-950 text-white p-4 rounded-2xl border border-rose-900/60 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600/30 border border-rose-500/40 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white px-2 py-0.5 rounded-full">
                Urgences Établissement
              </span>
              <span className="text-xs text-rose-200 font-semibold">Postes d'appel direct éducateur</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Infirmerie scolaire : <strong>Poste 104</strong> • Vie Scolaire / CPE : <strong>Poste 102</strong> • Direction : <strong>Poste 101</strong> • SAMU : <strong>15</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            showToast('Alerte transmise au poste central de la Vie Scolaire', 'info');
          }}
          className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md shadow-rose-600/30 shrink-0"
        >
          <Phone className="w-4 h-4" />
          <span>Contacter la Vie Scolaire</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('sante')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'sante'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          Fiches PAI & Santé ({paiCount} PAI actifs)
        </button>

        <button
          onClick={() => setActiveSubTab('sorties')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'sorties'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <LogOut className="w-4 h-4" />
          Autorisations & Départs ({nonDeparted} en établissement)
        </button>

        <button
          onClick={() => setActiveSubTab('incidents')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'incidents'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Main Courante des Incidents ({incidents.length})
        </button>
      </div>

      {/* SUB-VIEW 1: FICHES SANTE & PAI */}
      {activeSubTab === 'sante' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Fiches d'urgence médicale & PAI (Projet d'Accueil Individualisé)
              </h3>
              <p className="text-xs text-slate-500">
                Protocole de secours, allergies vitales et coordonnées des parents à contacter en priorité.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fichesSante.map((fiche) => (
              <div
                key={fiche.eleve_id}
                className={`bg-white rounded-2xl border p-5 shadow-xs space-y-3 transition-all ${
                  fiche.pai_actif
                    ? 'border-rose-300 ring-2 ring-rose-500/10'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    {fiche.avatar ? (
                      <img src={fiche.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-sm">
                        {fiche.eleve_nom[0]}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{fiche.eleve_nom}</h4>
                      <p className="text-[11px] text-slate-500">
                        {fiche.classe_nom} • Groupe : <strong className="text-slate-800">{fiche.groupe_sanguin || 'Inconnu'}</strong>
                      </p>
                    </div>
                  </div>

                  {fiche.pai_actif ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1 animate-pulse">
                      <HeartPulse className="w-3.5 h-3.5 text-rose-600" /> PAI ACTIF
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                      Standard
                    </span>
                  )}
                </div>

                {/* Allergies & Conditions */}
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Allergies déclarées :</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {fiche.allergies.map((all, idx) => (
                        <span
                          key={idx}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            fiche.pai_actif ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {all}
                        </span>
                      ))}
                    </div>
                  </div>

                  {fiche.traitement_urgence && (
                    <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200/60 text-xs text-rose-950 space-y-1">
                      <div className="flex items-center gap-1 font-bold text-rose-800 text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5" /> Conduite d'urgence :
                      </div>
                      <p className="text-[11px] leading-relaxed">{fiche.conduite_a_tenir}</p>
                      <p className="text-[10px] text-rose-700 font-semibold pt-1">
                        Traitement : {fiche.traitement_urgence}
                      </p>
                    </div>
                  )}
                </div>

                {/* Emergency Contact */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-[10px] text-slate-400 block">Contact Urgence :</span>
                    <span className="font-bold text-slate-800">
                      {fiche.contact_urgence_principal.nom} ({fiche.contact_urgence_principal.lien_parente})
                    </span>
                  </div>

                  <a
                    href={`tel:${fiche.contact_urgence_principal.telephone}`}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {fiche.contact_urgence_principal.telephone}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: AUTORISATIONS DE SORTIE */}
      {activeSubTab === 'sorties' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Contrôle des sorties scolaires & Personnes habilitées
              </h3>
              <p className="text-xs text-slate-500">
                Vérification légale des accompagnateurs et pointage de la remise des élèves à la sortie.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {sorties.map((s) => {
              const regimeBadge = {
                EXTERNE_LIBRE: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', label: 'Sortie autonome autorisée' },
                SORTIE_ACCOMPAGNEE: { bg: 'bg-amber-50 text-amber-800 border-amber-200', label: 'Sortie accompagnée obligatoire' },
                INTERDICTION_SORTIE_SEUL: { bg: 'bg-rose-50 text-rose-800 border-rose-200', label: 'Interdiction absolue de sortie seul' },
              }[s.regime];

              return (
                <div
                  key={s.eleve_id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4 hover:border-slate-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      {s.avatar ? (
                        <img src={s.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-sm">
                          {s.eleve_nom[0]}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{s.eleve_nom}</h4>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border mt-0.5 ${regimeBadge.bg}`}>
                          {regimeBadge.label}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      {s.statut_depart_aujourdhui === 'PRESENT_ETABLISSEMENT' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" /> Présent dans l'établissement
                        </span>
                      )}
                      {s.statut_depart_aujourdhui === 'PARTI_AVEC_ACCOMPAGNATEUR' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Parti à {s.heure_depart_constatee} avec {s.accompagne_par}
                        </span>
                      )}
                      {s.statut_depart_aujourdhui === 'SORTIE_AUTONOME' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Sorti seul à {s.heure_depart_constatee}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* List of authorized pick-up persons */}
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-2">
                      Personnes légalement mandatées pour récupérer l'élève :
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {s.personnes_autorisees.map((pers, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{pers.nom}</span>
                            <span className="text-[10px] font-semibold text-slate-500">{pers.lien}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 font-mono">{pers.telephone}</p>
                          {pers.piece_identite_requise && (
                            <span className="inline-block text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              🪪 Pièce d'identité exigée
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Action to validate departure */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 italic">
                      {s.restrictions_particulieres || 'Remise sous la vigilance de l’éducateur.'}
                    </span>

                    <div className="flex items-center gap-2">
                      {s.regime === 'EXTERNE_LIBRE' && (
                        <button
                          onClick={() => handleValidateDepart(s.eleve_id, 'SORTIE_AUTONOME')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors"
                        >
                          Valider départ autonome
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setDepartTarget(s);
                          setSelectedAccompagnateur(s.personnes_autorisees[0]?.nom || '');
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors"
                      >
                        Pointer la remise à un adulte...
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: MAIN COURANTE INCIDENTS */}
      {activeSubTab === 'incidents' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Main courante sécurisée & Registre des incidents
              </h3>
              <p className="text-xs text-slate-500">
                Consignation officielle, horodatée et traçable des incidents survenus dans l'établissement.
              </p>
            </div>
            <button
              onClick={() => setIsAddIncidentModalOpen(true)}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Consigner un incident de sécurité
            </button>
          </div>

          <div className="space-y-3">
            {incidents.map((inc) => {
              const graviteBadge = {
                BENIN: { bg: 'bg-slate-100 text-slate-700 border-slate-200', label: 'Bénin' },
                MODERE: { bg: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Modéré' },
                GRAVE: { bg: 'bg-rose-100 text-rose-800 border-rose-200', label: 'Grave' },
                URGENCE_ABSOLUE: { bg: 'bg-red-600 text-white border-red-700', label: 'URGENCE ABSOLUE' },
              }[inc.gravite];

              return (
                <div
                  key={inc.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3 hover:border-rose-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${graviteBadge.bg}`}>
                        {graviteBadge.label}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">{inc.titre}</h4>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500 font-semibold">{inc.date} à {inc.heure}</span>
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-mono text-[10px]">
                        Lieu: {inc.lieu}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {inc.description_faits}
                  </p>

                  <div className="text-xs text-slate-600 space-y-1">
                    <p><strong>Élèves impliqués :</strong> {inc.eleves_impliques.join(', ')}</p>
                    <p><strong>Mesures immédiates prises :</strong> {inc.mesures_immediates_prises}</p>
                    {inc.temoins && <p className="text-slate-400">Témoins : {inc.temoins}</p>}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
                    <div className="flex items-center gap-3">
                      <span>Rapporteur : <strong>{inc.rapporteur_nom}</strong></span>
                      {inc.passage_infirmerie && (
                        <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          Passage infirmerie effectué
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {inc.statut === 'EN_COURS' ? (
                        <button
                          onClick={() => handleCloseIncident(inc.id)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors"
                        >
                          Clôturer l'incident
                        </button>
                      ) : (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Clôturé
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Pick-up Validation */}
      {departTarget && (
        <Modal
          isOpen={!!departTarget}
          onClose={() => setDepartTarget(null)}
          title={`Remise de l'élève à la sortie : ${departTarget.eleve_nom}`}
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Sélectionnez l'adulte présent pour récupérer l'élève. Vérifiez l'identité si la mention <em>Pièce d'identité exigée</em> est présente.
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Personne présente au portail :</label>
              <select
                value={selectedAccompagnateur}
                onChange={(e) => setSelectedAccompagnateur(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              >
                {departTarget.personnes_autorisees.map((p, idx) => (
                  <option key={idx} value={p.nom}>
                    {p.nom} ({p.lien}) - {p.telephone} {p.piece_identite_requise ? '[ID EXIGÉE]' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setDepartTarget(null)}
                className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => handleValidateDepart(departTarget.eleve_id, 'PARTI_AVEC_ACCOMPAGNATEUR', selectedAccompagnateur)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Confirmer la remise sécurisée
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Consigner Incident */}
      {isAddIncidentModalOpen && (
        <Modal
          isOpen={isAddIncidentModalOpen}
          onClose={() => setIsAddIncidentModalOpen(false)}
          title="Consigner un incident dans la main courante"
        >
          <form onSubmit={handleCreateIncident} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Niveau de gravité</label>
                <select
                  value={incidentForm.gravite}
                  onChange={(e) => setIncidentForm({ ...incidentForm, gravite: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="BENIN">Bénin (Bousculade, dispute verbale)</option>
                  <option value="MODERE">Modéré (Chute, égratignure, dégradation)</option>
                  <option value="GRAVE">Grave (Blessure nécessitant soins, altercation physique)</option>
                  <option value="URGENCE_ABSOLUE">Urgence absolue (Malaise grave, SAMU 15)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Lieu de l'incident</label>
                <select
                  value={incidentForm.lieu}
                  onChange={(e) => setIncidentForm({ ...incidentForm, lieu: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="COUR_RECREATION">Cour de récréation</option>
                  <option value="CLASSE">Salle de classe</option>
                  <option value="COULOIR">Couloir / Escaliers</option>
                  <option value="CANTINE">Cantine / Réfectoire</option>
                  <option value="ENTREE_PORTAIL">Entrée / Portail</option>
                  <option value="SPORT">Gymnase / Terrain de sport</option>
                  <option value="INFIRMERIE">Infirmerie</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Titre de l'incident</label>
              <input
                type="text"
                value={incidentForm.titre}
                onChange={(e) => setIncidentForm({ ...incidentForm, titre: e.target.value })}
                placeholder="Ex : Chute au sol avec plaie superficielle au genou"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Élèves impliqués (séparés par virgule)</label>
              <input
                type="text"
                value={incidentForm.eleves_impliques_str}
                onChange={(e) => setIncidentForm({ ...incidentForm, eleves_impliques_str: e.target.value })}
                placeholder="Ex : Mamadou Sow (3ème B), Kofi Mensah"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Description factuelle et précise des événements</label>
              <textarea
                rows={3}
                value={incidentForm.description_faits}
                onChange={(e) => setIncidentForm({ ...incidentForm, description_faits: e.target.value })}
                placeholder="Décrivez les faits constatés sans jugement de valeur..."
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Mesures immédiates apportées</label>
              <input
                type="text"
                value={incidentForm.mesures_immediates_prises}
                onChange={(e) => setIncidentForm({ ...incidentForm, mesures_immediates_prises: e.target.value })}
                placeholder="Ex : Soins à l'infirmerie, pansement appliqué, appel du parent..."
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center gap-4 text-xs font-bold text-slate-700 pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={incidentForm.passage_infirmerie}
                  onChange={(e) => setIncidentForm({ ...incidentForm, passage_infirmerie: e.target.checked })}
                  className="rounded text-rose-600"
                />
                Passage infirmerie
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={incidentForm.notification_direction}
                  onChange={(e) => setIncidentForm({ ...incidentForm, notification_direction: e.target.checked })}
                  className="rounded text-rose-600"
                />
                Alerter Direction
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={incidentForm.notification_familles}
                  onChange={(e) => setIncidentForm({ ...incidentForm, notification_familles: e.target.checked })}
                  className="rounded text-rose-600"
                />
                Alerter Famille
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setIsAddIncidentModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Consigner l'incident
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
