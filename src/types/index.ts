// Data Types for Sukulu - School Management Application (DRF Compatible)

export type UserRole = 'ADMIN' | 'ENSEIGNANT' | 'EDUCATEUR' | 'ELEVE' | 'PARENT';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  avatar?: string;
  is_active: boolean;
  date_joined: string;
  // Role specific references
  matricule?: string;
  specialite?: string; // Teacher
  classe_id?: number; // Student
  classe_nom?: string; // Student
  filiere_nom?: string; // Student
  children_ids?: number[]; // Parent
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface Filiere {
  id: number;
  code: string; // e.g. S, L, STG
  nom: string; // e.g. Sciences, Lettres, Gestion
  description: string;
  created_at: string;
}

export interface Classe {
  id: number;
  code: string; // e.g. 6A, 3B, TS1
  nom: string; // e.g. 6ème A, Terminale S1
  niveau: string; // e.g. Collège, Lycée
  filiere_id?: number;
  filiere_nom?: string;
  enseignant_titulaire_id?: number;
  enseignant_titulaire_nom?: string;
  salle?: string;
  effectif_max: number;
  effectif_actuel: number;
  frais_scolarite: number;
}

export type StatutInscription = 'EN_ATTENTE' | 'VALIDE' | 'REJETE' | 'EN_COURS';

export interface Inscription {
  id: number;
  matricule: string;
  eleve_id: number;
  eleve_nom: string;
  eleve_prenom: string;
  eleve_email: string;
  classe_id: number;
  classe_nom: string;
  filiere_nom: string;
  annee_academique: string;
  date_inscription: string;
  statut: StatutInscription;
  frais_totaux: number;
  frais_payes: number;
  mode_paiement?: string;
  parent_nom?: string;
  parent_telephone?: string;
  documents_fournis: {
    acte_naissance: boolean;
    bulletin_anterieur: boolean;
    photo_identite: boolean;
  };
}

export interface Matiere {
  id: number;
  code: string;
  nom: string;
  coefficient: number;
  enseignant_nom?: string;
}

export type Trimestre = 'TRIMESTRE_1' | 'TRIMESTRE_2' | 'TRIMESTRE_3' | 'SEMESTRE_1' | 'SEMESTRE_2';

export interface Evaluation {
  id: number;
  titre: string;
  type: 'DEVOIR' | 'EXAMEN' | 'INTERROGATION' | 'TP';
  matiere_id: number;
  matiere_nom: string;
  classe_id: number;
  classe_nom: string;
  date_eval: string;
  coefficient: number;
  note_max: number;
  trimestre: Trimestre;
}

export interface Note {
  id: number;
  evaluation_id: number;
  evaluation_titre: string;
  eleve_id: number;
  eleve_nom: string;
  eleve_matricule: string;
  classe_nom?: string;
  matiere_nom: string;
  valeur: number; // /20
  coefficient: number;
  appreciation?: string;
  trimestre: Trimestre;
  date_saisie: string;
}

export type StatutAbsence = 'NON_JUSTIFIE' | 'JUSTIFIE' | 'EN_ATTENTE';

export interface Absence {
  id: number;
  eleve_id: number;
  eleve_nom: string;
  eleve_matricule: string;
  classe_id: number;
  classe_nom: string;
  date_absence: string;
  type: 'ABSENCE' | 'RETARD';
  duree_heures: number;
  matiere_nom?: string;
  statut: StatutAbsence;
  motif?: string;
  justificatif_url?: string;
  trimestre?: Trimestre;
}

export type StatutPaiement = 'PAYE' | 'PARTIEL' | 'EN_RETARD' | 'EN_ATTENTE';

export interface Paiement {
  id: number;
  reference_recu: string;
  eleve_id: number;
  eleve_nom: string;
  eleve_matricule: string;
  classe_nom: string;
  tranche: string; // e.g. "Frais de scolarité - Tranche 1", "Frais d'inscription"
  montant: number;
  frais_totaux: number;
  mode_paiement: 'MOBILE_MONEY' | 'CARTE_BANCAIRE' | 'ESPECES' | 'VIREMENT';
  statut: StatutPaiement;
  date_paiement: string;
  annee_academique: string;
  effectue_par: string;
}

export type TypeDocument = 'BULLETIN' | 'CERTIFICAT_SCOLARITE' | 'RECU_PAIEMENT' | 'ATTESTATION_INSCRIPTION';

export interface DocumentScolaire {
  id: number;
  reference: string;
  type: TypeDocument;
  titre: string;
  eleve_id: number;
  eleve_nom: string;
  eleve_matricule: string;
  classe_nom: string;
  annee_academique: string;
  date_generation: string;
  trimestre?: Trimestre;
  fichier_url?: string;
  metadata?: Record<string, any>;
}

export interface DashboardStats {
  total_eleves: number;
  total_enseignants: number;
  total_classes: number;
  total_filieres: number;
  taux_recouvrement: number;
  montant_total_recouvre: number;
  absences_aujourdhui: number;
  moyenne_generale_ecole: number;
  prochains_examens: number;
}

// === EMPLOI DU TEMPS ===
export type JourSemaine = 'LUNDI' | 'MARDI' | 'MERCREDI' | 'JEUDI' | 'VENDREDI' | 'SAMEDI';

export type TypeSeance = 'COURS' | 'TD' | 'TP' | 'EVALUATION';

export interface SeanceEmploiDuTemps {
  id: number;
  classe_id: number;
  classe_nom: string;
  jour: JourSemaine;
  heure_debut: string; // "08:00"
  heure_fin: string; // "10:00"
  matiere_nom: string;
  enseignant_nom: string;
  salle: string;
  couleur?: string;
  type?: TypeSeance;
  description?: string;
  materiel_requis?: string;
}
