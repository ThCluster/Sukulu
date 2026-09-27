// Types dedicated to the 3 Indispensable Pillars of the Educator:
// 1. LE SUIVI (Suivi pédagogique, assiduité, observations)
// 2. LA TRANSMISSION (Cahier de texte, devoirs, carnet de liaison parents)
// 3. LA SÉCURITÉ (Fiches PAI & santé, autorisations de sortie, main courante incidents)

export type StatutPointage = 'PRESENT' | 'RETARD' | 'ABSENT_NON_JUSTIFIE' | 'ABSENT_JUSTIFIE';

export interface PointageEleve {
  eleve_id: number;
  eleve_nom: string;
  matricule: string;
  avatar?: string;
  statut: StatutPointage;
  retard_minutes?: number;
  motif?: string;
  remarque?: string;
}

export interface AppelSession {
  id: string;
  classe_id: number;
  classe_nom: string;
  matiere_nom: string;
  enseignant_nom: string;
  date: string;
  creneau_horaire: string; // e.g. "08:00 - 10:00"
  statut: 'EN_COURS' | 'VALIDE';
  taux_presence: number; // percentage e.g. 95.5
  derniere_mise_a_jour: string;
  pointages: PointageEleve[];
}

export type NiveauVigilance = 'NORMAL' | 'VIGILANCE' | 'ALERTE';
export type TypeObservation = 'COMPORTEMENT' | 'PROGRESSION' | 'DIFFICULTE' | 'PARTICIPATION' | 'ENCOURAGEMENT';

export interface SuiviObservation {
  id: string;
  eleve_id: number;
  eleve_nom: string;
  classe_nom: string;
  date: string;
  type: TypeObservation;
  niveau_vigilance: NiveauVigilance;
  titre: string;
  commentaire: string;
  actions_recommandees?: string;
  auteur_nom: string;
  partage_equipe: boolean;
}

// === PILIER 2 : LA TRANSMISSION ===
export interface CahierTexteEntry {
  id: string;
  classe_id: number;
  classe_nom: string;
  matiere_nom: string;
  enseignant_nom: string;
  date: string;
  creneau: string;
  titre_lecon: string;
  contenu_cours: string;
  notions_cles: string[];
  exercices_faits: string;
  pieces_jointes?: string[];
}

export interface DevoirTransmission {
  id: string;
  classe_id: number;
  classe_nom: string;
  matiere_nom: string;
  enseignant_nom: string;
  date_donnee: string;
  date_echeance: string;
  titre: string;
  instructions: string;
  temps_estime_minutes: number;
  type: 'EXERCICE' | 'REVISION' | 'PROJET' | 'LECTURE' | 'DM';
  est_evalue: boolean;
  materiel_requis?: string;
  statut: 'ACTIF' | 'PASSE';
}

export interface LiaisonParent {
  id: string;
  eleve_id: number;
  eleve_nom: string;
  classe_nom: string;
  parent_nom: string;
  destinataire_type: 'INDIVIDUEL' | 'CLASSE_ENTIERE';
  date_envoi: string;
  objet: string;
  message: string;
  type_message: 'FELICITATIONS' | 'VIGILANCE_TRAVAIL' | 'OUBLI_MATERIEL' | 'CONVOCATION' | 'INFORMATION';
  priorite: 'NORMALE' | 'IMPORTANTE' | 'URGENTE';
  accuse_reception: boolean;
  date_accuse?: string;
  reponse_parent?: string;
}

// === PILIER 3 : LA SÉCURITÉ ===
export interface FicheUrgenceSante {
  eleve_id: number;
  eleve_nom: string;
  classe_nom: string;
  avatar?: string;
  date_naissance?: string;
  groupe_sanguin?: string;
  pai_actif: boolean;
  allergies: string[];
  conditions_medicales: string[];
  traitement_urgence: string; // e.g. "Ventoline 2 bouffées si crise d'asthme"
  conduite_a_tenir: string;
  contact_urgence_principal: {
    nom: string;
    lien_parente: string;
    telephone: string;
  };
  contact_urgence_secondaire?: {
    nom: string;
    lien_parente: string;
    telephone: string;
  };
  medecin_traitant?: {
    nom: string;
    telephone: string;
  };
}

export interface PersonneAutorisee {
  nom: string;
  lien: string;
  telephone: string;
  piece_identite_requise: boolean;
}

export interface AutorisationSortie {
  eleve_id: number;
  eleve_nom: string;
  classe_nom: string;
  avatar?: string;
  regime: 'EXTERNE_LIBRE' | 'SORTIE_ACCOMPAGNEE' | 'INTERDICTION_SORTIE_SEUL';
  horaire_autorisation?: string; // e.g. "Autorisé à partir de 16h30"
  personnes_autorisees: PersonneAutorisee[];
  restrictions_particulieres?: string;
  statut_depart_aujourdhui?: 'PRESENT_ETABLISSEMENT' | 'PARTI_AVEC_ACCOMPAGNATEUR' | 'SORTIE_AUTONOME';
  heure_depart_constatee?: string;
  accompagne_par?: string;
}

export interface IncidentSecurite {
  id: string;
  date: string;
  heure: string;
  lieu: 'CLASSE' | 'COUR_RECREATION' | 'COULOIR' | 'CANTINE' | 'ENTREE_PORTAIL' | 'INFIRMERIE' | 'SPORT';
  gravite: 'BENIN' | 'MODERE' | 'GRAVE' | 'URGENCE_ABSOLUE';
  titre: string;
  description_faits: string;
  eleves_impliques: string[];
  temoins?: string;
  mesures_immediates_prises: string;
  passage_infirmerie: boolean;
  notification_direction: boolean;
  notification_familles: boolean;
  statut: 'EN_COURS' | 'TRAITE' | 'CLOTURE';
  rapporteur_nom: string;
}
