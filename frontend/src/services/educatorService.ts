import {
  AppelSession,
  PointageEleve,
  SuiviObservation,
  CahierTexteEntry,
  DevoirTransmission,
  LiaisonParent,
  FicheUrgenceSante,
  AutorisationSortie,
  IncidentSecurite,
} from '../types/educator';

// Initial Mock Data for the 3 Pillars
const INITIAL_POINTAGES_3B: PointageEleve[] = [
  {
    eleve_id: 7,
    eleve_nom: 'Mamadou Sow',
    matricule: 'SKL-2024-0091',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250',
    statut: 'PRESENT',
  },
  {
    eleve_id: 5,
    eleve_nom: 'Kofi Mensah',
    matricule: 'SKL-2024-0102',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
    statut: 'RETARD',
    retard_minutes: 12,
    motif: 'Embouteillage transport scolaire',
  },
  {
    eleve_id: 8,
    eleve_nom: 'Mariama Cissé',
    matricule: 'SKL-2024-0105',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=250',
    statut: 'PRESENT',
  },
  {
    eleve_id: 9,
    eleve_nom: 'Ousmane Traoré',
    matricule: 'SKL-2024-0108',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=250',
    statut: 'ABSENT_NON_JUSTIFIE',
    remarque: 'Non prévenu ce matin',
  },
];

const INITIAL_POINTAGES_TS1: PointageEleve[] = [
  {
    eleve_id: 4,
    eleve_nom: 'Fatou Sow',
    matricule: 'SKL-2024-0089',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=250',
    statut: 'PRESENT',
  },
  {
    eleve_id: 10,
    eleve_nom: 'Amara Camara',
    matricule: 'SKL-2024-0095',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    statut: 'PRESENT',
  },
  {
    eleve_id: 11,
    eleve_nom: 'Aissatou Diallo',
    matricule: 'SKL-2024-0098',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
    statut: 'ABSENT_JUSTIFIE',
    motif: 'Certificat médical fourni (grippe)',
  },
];

const INITIAL_OBSERVATIONS: SuiviObservation[] = [
  {
    id: 'obs-1',
    eleve_id: 7,
    eleve_nom: 'Mamadou Sow',
    classe_nom: '3ème B',
    date: '2026-09-22',
    type: 'PROGRESSION',
    niveau_vigilance: 'NORMAL',
    titre: 'Excellente participation orale',
    commentaire: 'Mamadou a mené la démonstration au tableau avec rigueur et a aidé ses camarades.',
    actions_recommandees: 'Poursuivre sur cette dynamique pour le prochain contrôle.',
    auteur_nom: 'M. Moussa Diop',
    partage_equipe: true,
  },
  {
    id: 'obs-2',
    eleve_id: 5,
    eleve_nom: 'Kofi Mensah',
    classe_nom: '3ème B',
    date: '2026-09-21',
    type: 'DIFFICULTE',
    niveau_vigilance: 'VIGILANCE',
    titre: 'Difficultés sur la trigonométrie & 2 retards consécutifs',
    commentaire: 'Kofi semble fatigué en première heure et a buté sur les formules de cosinus/sinus.',
    actions_recommandees: 'Soutien pédagogique proposé mercredi 14h + contact avec le parent.',
    auteur_nom: 'M. Moussa Diop',
    partage_equipe: true,
  },
  {
    id: 'obs-3',
    eleve_id: 9,
    eleve_nom: 'Ousmane Traoré',
    classe_nom: '3ème B',
    date: '2026-09-20',
    type: 'COMPORTEMENT',
    niveau_vigilance: 'ALERTE',
    titre: 'Absence récurrente sans justificatif et oubli de matériel',
    commentaire: 'Décrochage constaté sur les deux dernières semaines. Cahier non tenu.',
    actions_recommandees: 'Convocation avec le CPE et la famille.',
    auteur_nom: 'M. Moussa Diop',
    partage_equipe: true,
  },
  {
    id: 'obs-4',
    eleve_id: 4,
    eleve_nom: 'Fatou Sow',
    classe_nom: 'Terminale S1',
    date: '2026-09-23',
    type: 'ENCOURAGEMENT',
    niveau_vigilance: 'NORMAL',
    titre: 'Résultats remarquables en Mathématiques Approfondies',
    commentaire: 'Note de 18.5/20 au premier devoir surveillé. Compréhension conceptuelle exemplaire.',
    actions_recommandees: 'Encouragée à préparer le Concours Général.',
    auteur_nom: 'M. Moussa Diop',
    partage_equipe: true,
  },
];

// === PILIER 2 INITIAL DATA ===
const INITIAL_CAHIER_TEXTE: CahierTexteEntry[] = [
  {
    id: 'ct-1',
    classe_id: 2,
    classe_nom: '3ème B',
    matiere_nom: 'Mathématiques',
    enseignant_nom: 'M. Moussa Diop',
    date: '2026-09-23',
    creneau: '08:00 - 10:00',
    titre_lecon: 'Chapitre 3 : Théorème de Thalès et applications géométriques',
    contenu_cours: 'Rappel des configurations papillon et triangle classique. Démonstration des égalités de rapports. Exercices corrigés au tableau (N° 14, 15 p. 48).',
    notions_cles: ['Rapports de longueurs', 'Droites parallèles', 'Configuration papillon', 'Calcul de quatrième proportionnelle'],
    exercices_faits: 'Exercices 14, 15 et 18 page 48 du manuel Hachette.',
  },
  {
    id: 'ct-2',
    classe_id: 3,
    classe_nom: 'Terminale S1',
    matiere_nom: 'Physique-Chimie',
    enseignant_nom: 'M. Moussa Diop',
    date: '2026-09-22',
    creneau: '10:15 - 12:15',
    titre_lecon: 'Cinématique du point matériel & Équations horaires du mouvement',
    contenu_cours: 'Vecteur position, vitesse et accélération. Résolution d’équations différentielles pour la chute libre sans frottement.',
    notions_cles: ['Vecteur accélération', 'Intégration temporelle', 'Conditions initiales', 'Trajectoire parabolique'],
    exercices_faits: 'Problème type Bac N° 4 sur le tir balistique.',
  },
];

const INITIAL_DEVOIRS: DevoirTransmission[] = [
  {
    id: 'dev-1',
    classe_id: 2,
    classe_nom: '3ème B',
    matiere_nom: 'Mathématiques',
    enseignant_nom: 'M. Moussa Diop',
    date_donnee: '2026-09-23',
    date_echeance: '2026-09-26',
    titre: 'Exercices d’application - Calculs de longueurs avec Thalès',
    instructions: 'Rédiger soigneusement les exercices 21 et 24 page 51 sur feuille double. Justifier chaque égalité par le parallélisme des droites.',
    temps_estime_minutes: 40,
    type: 'EXERCICE',
    est_evalue: true,
    materiel_requis: 'Règle graduée, calculatrice collège',
    statut: 'ACTIF',
  },
  {
    id: 'dev-2',
    classe_id: 2,
    classe_nom: '3ème B',
    matiere_nom: 'Mathématiques',
    enseignant_nom: 'M. Moussa Diop',
    date_donnee: '2026-09-23',
    date_echeance: '2026-09-29',
    titre: 'Préparation Évaluation N°2 : Trigonométrie & Géométrie plane',
    instructions: 'Réviser la fiche méthode N°3 et refaire le devoir blanc N°1 disponible sur l’espace numérique.',
    temps_estime_minutes: 60,
    type: 'REVISION',
    est_evalue: true,
    statut: 'ACTIF',
  },
  {
    id: 'dev-3',
    classe_id: 3,
    classe_nom: 'Terminale S1',
    matiere_nom: 'Physique-Chimie',
    enseignant_nom: 'M. Moussa Diop',
    date_donnee: '2026-09-22',
    date_echeance: '2026-09-27',
    titre: 'Devoir Maison N°1 : Tir balistique et portée maximale',
    instructions: 'Résoudre le problème complet de tir avec angle alpha. Tracer le graphe de la parabole sur papier millimétré.',
    temps_estime_minutes: 90,
    type: 'DM',
    est_evalue: true,
    materiel_requis: 'Papier millimétré, calculatrice programmable',
    statut: 'ACTIF',
  },
];

const INITIAL_LIAISONS: LiaisonParent[] = [
  {
    id: 'liaison-1',
    eleve_id: 7,
    eleve_nom: 'Mamadou Sow',
    classe_nom: '3ème B',
    parent_nom: 'M. Ibrahima Sow (Père)',
    destinataire_type: 'INDIVIDUEL',
    date_envoi: '2026-09-22',
    objet: 'Félicitations pour le sérieux et la participation',
    message: 'Bonjour M. Sow, je tenais à souligner l’attitude remarquable de Mamadou lors des cours de géométrie cette semaine. Son investissement est exemplaire.',
    type_message: 'FELICITATIONS',
    priorite: 'NORMALE',
    accuse_reception: true,
    date_accuse: '2026-09-22 à 19h40',
    reponse_parent: 'Merci professeur, nous l’encourageons à poursuivre ainsi à la maison.',
  },
  {
    id: 'liaison-2',
    eleve_id: 5,
    eleve_nom: 'Kofi Mensah',
    classe_nom: '3ème B',
    parent_nom: 'Mme Mensah (Mère)',
    destinataire_type: 'INDIVIDUEL',
    date_envoi: '2026-09-21',
    objet: 'Vigilance assiduité et oubli de calculatrice',
    message: 'Chère Mme Mensah, Kofi est arrivé avec plus de 10 minutes de retard ce matin et sans sa calculatrice scientifique. Merci de vérifier son sac la veille.',
    type_message: 'OUBLI_MATERIEL',
    priorite: 'IMPORTANTE',
    accuse_reception: true,
    date_accuse: '2026-09-21 à 21h15',
    reponse_parent: 'Bien reçu, je fais le point avec lui ce soir pour son matériel.',
  },
  {
    id: 'liaison-3',
    eleve_id: 9,
    eleve_nom: 'Ousmane Traoré',
    classe_nom: '3ème B',
    parent_nom: 'Famille Traoré',
    destinataire_type: 'INDIVIDUEL',
    date_envoi: '2026-09-23',
    objet: 'Convocation point d’étape éducatif et pédagogique',
    message: 'Madame, Monsieur, suite à des absences répétées non justifiées et une baisse de travail, je vous invite à un rendez-vous le vendredi 26/09 à 16h30.',
    type_message: 'CONVOCATION',
    priorite: 'URGENTE',
    accuse_reception: false,
  },
  {
    id: 'liaison-4',
    eleve_id: 0,
    eleve_nom: 'Classe 3ème B',
    classe_nom: '3ème B',
    parent_nom: 'Tous les parents d’élèves',
    destinataire_type: 'CLASSE_ENTIERE',
    date_envoi: '2026-09-20',
    objet: 'Rappel de sécurité et respect des horaires de ramassage',
    message: 'Chers parents, merci de veiller à ce que les élèves arrivent avant la fermeture des grilles à 07h50 pour débuter les cours à 08h00 dans le calme.',
    type_message: 'INFORMATION',
    priorite: 'NORMALE',
    accuse_reception: true,
    date_accuse: '18 parents ont émargé',
  },
];

// === PILIER 3 INITIAL DATA ===
const INITIAL_FICHES_SANTE: FicheUrgenceSante[] = [
  {
    eleve_id: 7,
    eleve_nom: 'Mamadou Sow',
    classe_nom: '3ème B',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250',
    date_naissance: '2011-05-14',
    groupe_sanguin: 'O+',
    pai_actif: true,
    allergies: ['Allergie sévère aux Arachides', 'Poils de chat'],
    conditions_medicales: ['Terrain asthmatique modéré'],
    traitement_urgence: 'Trousse PAI à l’infirmerie (Stylo auto-injecteur Anapen 300mcg + Ventoline).',
    conduite_a_tenir: 'En cas d’ingestion suspecte d’arachide ou gonflement des lèvres : administrer immédiatement le stylo auto-injecteur et composer le 15 (SAMU).',
    contact_urgence_principal: {
      nom: 'Ibrahima Sow',
      lien_parente: 'Père',
      telephone: '+221 77 123 99 88',
    },
    contact_urgence_secondaire: {
      nom: 'Aminata Sow',
      lien_parente: 'Mère',
      telephone: '+221 77 888 44 22',
    },
    medecin_traitant: {
      nom: 'Dr. Babacar Fall (Pédiatre)',
      telephone: '+221 33 824 11 00',
    },
  },
  {
    eleve_id: 5,
    eleve_nom: 'Kofi Mensah',
    classe_nom: '3ème B',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
    date_naissance: '2011-08-22',
    groupe_sanguin: 'B+',
    pai_actif: false,
    allergies: ['Aucune connue'],
    conditions_medicales: ['Légère myopie (porte des lunettes pour le tableau)'],
    traitement_urgence: 'Aucun traitement d’urgence spécifique requis.',
    conduite_a_tenir: 'Contacter la famille en cas de traumatisme.',
    contact_urgence_principal: {
      nom: 'Akossiwa Mensah',
      lien_parente: 'Mère',
      telephone: '+225 01 22 33 44 55',
    },
  },
  {
    eleve_id: 8,
    eleve_nom: 'Mariama Cissé',
    classe_nom: '3ème B',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=250',
    date_naissance: '2011-03-09',
    groupe_sanguin: 'A+',
    pai_actif: true,
    allergies: ['Pénicilline (antibiotique)'],
    conditions_medicales: ['Asthme d’effort'],
    traitement_urgence: 'Ventoline 100 µg : 2 bouffées avant l’effort physique ou en cas de dyspnée expiratoire.',
    conduite_a_tenir: 'Faire asseoir l’élève calmement, desserrer le col, faire inhaler 2 bouffées de Ventoline.',
    contact_urgence_principal: {
      nom: 'Moussa Cissé',
      lien_parente: 'Père',
      telephone: '+225 07 88 77 66',
    },
    medecin_traitant: {
      nom: 'Dr. Kouamé (Clinique de la Paix)',
      telephone: '+225 22 44 88 90',
    },
  },
  {
    eleve_id: 4,
    eleve_nom: 'Fatou Sow',
    classe_nom: 'Terminale S1',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=250',
    date_naissance: '2008-01-18',
    groupe_sanguin: 'O+',
    pai_actif: false,
    allergies: ['Pollen de graminées'],
    conditions_medicales: ['Migraines ophtalmiques occasionnelles'],
    traitement_urgence: 'Repos en salle sombre et hydratation.',
    conduite_a_tenir: 'Laisser reposer à l’infirmerie 30 minutes.',
    contact_urgence_principal: {
      nom: 'Ibrahima Sow',
      lien_parente: 'Père',
      telephone: '+221 77 123 99 88',
    },
  },
];

const INITIAL_AUTORISATIONS_SORTIE: AutorisationSortie[] = [
  {
    eleve_id: 7,
    eleve_nom: 'Mamadou Sow',
    classe_nom: '3ème B',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250',
    regime: 'SORTIE_ACCOMPAGNEE',
    horaire_autorisation: 'Sortie uniquement à 16h30 ou 17h30',
    restrictions_particulieres: 'Interdiction formelle de quitter l’établissement seul.',
    personnes_autorisees: [
      { nom: 'Ibrahima Sow', lien: 'Père', telephone: '+221 77 123 99 88', piece_identite_requise: false },
      { nom: 'Aminata Sow', lien: 'Mère', telephone: '+221 77 888 44 22', piece_identite_requise: false },
      { nom: 'Oumar Diagne', lien: 'Chauffeur familial accrédité', telephone: '+221 70 555 12 34', piece_identite_requise: true },
    ],
    statut_depart_aujourdhui: 'PRESENT_ETABLISSEMENT',
  },
  {
    eleve_id: 5,
    eleve_nom: 'Kofi Mensah',
    classe_nom: '3ème B',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
    regime: 'EXTERNE_LIBRE',
    horaire_autorisation: 'Autorisé dès la fin des cours inscrits à l’emploi du temps',
    personnes_autorisees: [
      { nom: 'Akossiwa Mensah', lien: 'Mère', telephone: '+225 01 22 33 44 55', piece_identite_requise: false },
    ],
    statut_depart_aujourdhui: 'PRESENT_ETABLISSEMENT',
  },
  {
    eleve_id: 8,
    eleve_nom: 'Mariama Cissé',
    classe_nom: '3ème B',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=250',
    regime: 'SORTIE_ACCOMPAGNEE',
    personnes_autorisees: [
      { nom: 'Moussa Cissé', lien: 'Père', telephone: '+225 07 88 77 66', piece_identite_requise: false },
      { nom: 'Aicha Touré', lien: 'Tante maternelle', telephone: '+225 05 11 22 33', piece_identite_requise: true },
    ],
    statut_depart_aujourdhui: 'PRESENT_ETABLISSEMENT',
  },
  {
    eleve_id: 4,
    eleve_nom: 'Fatou Sow',
    classe_nom: 'Terminale S1',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=250',
    regime: 'EXTERNE_LIBRE',
    horaire_autorisation: 'Sortie autonome autorisée (Lycée)',
    personnes_autorisees: [
      { nom: 'Ibrahima Sow', lien: 'Père', telephone: '+221 77 123 99 88', piece_identite_requise: false },
    ],
    statut_depart_aujourdhui: 'PRESENT_ETABLISSEMENT',
  },
];

const INITIAL_INCIDENTS: IncidentSecurite[] = [
  {
    id: 'inc-1',
    date: '2026-09-23',
    heure: '10:25',
    lieu: 'COUR_RECREATION',
    gravite: 'MODERE',
    titre: 'Chute avec écorchure au genou durant la pause',
    description_faits: 'L’élève a glissé sur le sol humide près du préau lors d’une partie de ballon. Écorchure superficielle au genou droit.',
    eleves_impliques: ['Mamadou Sow (3ème B)'],
    temoins: 'Surveillant M. Ba',
    mesures_immediates_prises: 'Nettoyage à l’eau stérile et pansement par l’infirmière scolaire. Pas de traumatisme osseux.',
    passage_infirmerie: true,
    notification_direction: true,
    notification_familles: true,
    statut: 'TRAITE',
    rapporteur_nom: 'M. Moussa Diop (Éducateur / Enseignant)',
  },
  {
    id: 'inc-2',
    date: '2026-09-22',
    heure: '14:15',
    lieu: 'CLASSE',
    gravite: 'BENIN',
    titre: 'Altercation verbale entre deux élèves pendant un travail de groupe',
    description_faits: 'Échange vif sur le partage des tâches du TP. Aucun contact physique.',
    eleves_impliques: ['Kofi Mensah (3ème B)', 'Ousmane Traoré (3ème B)'],
    mesures_immediates_prises: 'Rappel au règlement intérieur par l’éducateur. Médiation réalisée en fin d’heure avec poignée de main.',
    passage_infirmerie: false,
    notification_direction: false,
    notification_familles: false,
    statut: 'CLOTURE',
    rapporteur_nom: 'M. Moussa Diop',
  },
];

// Storage Helper
const getStored = <T,>(key: string, defaultData: T): T => {
  const data = localStorage.getItem(`sukulu_educ_${key}`);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return defaultData;
    }
  }
  return defaultData;
};

const setStored = <T,>(key: string, data: T) => {
  localStorage.setItem(`sukulu_educ_${key}`, JSON.stringify(data));
};

export const educatorService = {
  // ==========================================
  // PILIER 1 : LE SUIVI
  // ==========================================
  getAppelSession: async (classeNom: string = '3ème B'): Promise<AppelSession> => {
    const key = `appel_${classeNom.replace(/\s+/g, '_')}`;
    const defaultPoints = classeNom.includes('Terminale') ? INITIAL_POINTAGES_TS1 : INITIAL_POINTAGES_3B;
    const defaultSession: AppelSession = {
      id: `session-${classeNom}-20260923`,
      classe_id: classeNom.includes('Terminale') ? 3 : 2,
      classe_nom: classeNom,
      matiere_nom: classeNom.includes('Terminale') ? 'Physique-Chimie' : 'Mathématiques',
      enseignant_nom: 'M. Moussa Diop',
      date: '2026-09-23',
      creneau_horaire: '08:00 - 10:00',
      statut: 'VALIDE',
      taux_presence: 92.5,
      derniere_mise_a_jour: 'Aujourd’hui à 08:15',
      pointages: defaultPoints,
    };

    return getStored<AppelSession>(key, defaultSession);
  },

  updatePointage: async (
    classeNom: string,
    eleveId: number,
    statut: PointageEleve['statut'],
    retardMinutes?: number,
    motif?: string
  ): Promise<AppelSession> => {
    const session = await educatorService.getAppelSession(classeNom);
    const updatedPointages = session.pointages.map((p) => {
      if (p.eleve_id === eleveId) {
        return {
          ...p,
          statut,
          retard_minutes: statut === 'RETARD' ? (retardMinutes || 10) : undefined,
          motif: statut === 'RETARD' || statut.startsWith('ABSENT') ? (motif || p.motif || 'Signalé en classe') : undefined,
        };
      }
      return p;
    });

    const presentsCount = updatedPointages.filter((p) => p.statut === 'PRESENT' || p.statut === 'RETARD').length;
    const rate = Math.round((presentsCount / (updatedPointages.length || 1)) * 100);

    const updatedSession: AppelSession = {
      ...session,
      taux_presence: rate,
      derniere_mise_a_jour: 'À l’instant',
      pointages: updatedPointages,
    };

    const key = `appel_${classeNom.replace(/\s+/g, '_')}`;
    setStored(key, updatedSession);
    return updatedSession;
  },

  markAllPresents: async (classeNom: string): Promise<AppelSession> => {
    const session = await educatorService.getAppelSession(classeNom);
    const updatedPointages = session.pointages.map((p) => ({
      ...p,
      statut: 'PRESENT' as const,
      retard_minutes: undefined,
      motif: undefined,
    }));

    const updatedSession: AppelSession = {
      ...session,
      taux_presence: 100,
      derniere_mise_a_jour: 'À l’instant (Tous présents)',
      pointages: updatedPointages,
    };

    const key = `appel_${classeNom.replace(/\s+/g, '_')}`;
    setStored(key, updatedSession);
    return updatedSession;
  },

  getObservations: async (classeNom?: string): Promise<SuiviObservation[]> => {
    const all = getStored<SuiviObservation[]>('observations', INITIAL_OBSERVATIONS);
    if (!classeNom || classeNom === 'ALL') return all;
    return all.filter((o) => o.classe_nom === classeNom);
  },

  addObservation: async (obs: Omit<SuiviObservation, 'id' | 'date'>): Promise<SuiviObservation> => {
    const all = await educatorService.getObservations();
    const newObs: SuiviObservation = {
      ...obs,
      id: `obs-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    const updated = [newObs, ...all];
    setStored('observations', updated);
    return newObs;
  },

  // ==========================================
  // PILIER 2 : LA TRANSMISSION
  // ==========================================
  getCahierTexte: async (classeNom?: string): Promise<CahierTexteEntry[]> => {
    const list = getStored<CahierTexteEntry[]>('cahier_texte', INITIAL_CAHIER_TEXTE);
    if (!classeNom || classeNom === 'ALL') return list;
    return list.filter((c) => c.classe_nom === classeNom);
  },

  addCahierTexteEntry: async (entry: Omit<CahierTexteEntry, 'id'>): Promise<CahierTexteEntry> => {
    const list = await educatorService.getCahierTexte();
    const newEntry: CahierTexteEntry = {
      ...entry,
      id: `ct-${Date.now()}`,
    };
    const updated = [newEntry, ...list];
    setStored('cahier_texte', updated);
    return newEntry;
  },

  getDevoirs: async (classeNom?: string): Promise<DevoirTransmission[]> => {
    const list = getStored<DevoirTransmission[]>('devoirs', INITIAL_DEVOIRS);
    if (!classeNom || classeNom === 'ALL') return list;
    return list.filter((d) => d.classe_nom === classeNom);
  },

  addDevoir: async (devoir: Omit<DevoirTransmission, 'id' | 'date_donnee' | 'statut'>): Promise<DevoirTransmission> => {
    const list = await educatorService.getDevoirs();
    const newDevoir: DevoirTransmission = {
      ...devoir,
      id: `dev-${Date.now()}`,
      date_donnee: new Date().toISOString().split('T')[0],
      statut: 'ACTIF',
    };
    const updated = [newDevoir, ...list];
    setStored('devoirs', updated);
    return newDevoir;
  },

  getLiaisonsParents: async (classeNom?: string): Promise<LiaisonParent[]> => {
    const list = getStored<LiaisonParent[]>('liaisons', INITIAL_LIAISONS);
    if (!classeNom || classeNom === 'ALL') return list;
    return list.filter((l) => l.classe_nom === classeNom);
  },

  addLiaisonParent: async (liaison: Omit<LiaisonParent, 'id' | 'date_envoi' | 'accuse_reception'>): Promise<LiaisonParent> => {
    const list = await educatorService.getLiaisonsParents();
    const newLiaison: LiaisonParent = {
      ...liaison,
      id: `liaison-${Date.now()}`,
      date_envoi: new Date().toISOString().split('T')[0],
      accuse_reception: false,
    };
    const updated = [newLiaison, ...list];
    setStored('liaisons', updated);
    return newLiaison;
  },

  // ==========================================
  // PILIER 3 : LA SÉCURITÉ
  // ==========================================
  getFichesSante: async (classeNom?: string): Promise<FicheUrgenceSante[]> => {
    const list = getStored<FicheUrgenceSante[]>('fiches_sante', INITIAL_FICHES_SANTE);
    if (!classeNom || classeNom === 'ALL') return list;
    return list.filter((f) => f.classe_nom === classeNom);
  },

  getAutorisationsSortie: async (classeNom?: string): Promise<AutorisationSortie[]> => {
    const list = getStored<AutorisationSortie[]>('autorisations_sortie', INITIAL_AUTORISATIONS_SORTIE);
    if (!classeNom || classeNom === 'ALL') return list;
    return list.filter((a) => a.classe_nom === classeNom);
  },

  validerDepartEleve: async (
    eleveId: number,
    nouveauStatut: 'PARTI_AVEC_ACCOMPAGNATEUR' | 'SORTIE_AUTONOME' | 'PRESENT_ETABLISSEMENT',
    accompagnePar?: string
  ): Promise<AutorisationSortie[]> => {
    const all = await educatorService.getAutorisationsSortie();
    const now = new Date();
    const heure = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const updated = all.map((item) => {
      if (item.eleve_id === eleveId) {
        return {
          ...item,
          statut_depart_aujourdhui: nouveauStatut,
          heure_depart_constatee: nouveauStatut === 'PRESENT_ETABLISSEMENT' ? undefined : heure,
          accompagne_par: accompagnePar,
        };
      }
      return item;
    });

    setStored('autorisations_sortie', updated);
    return updated;
  },

  getIncidents: async (): Promise<IncidentSecurite[]> => {
    return getStored<IncidentSecurite[]>('incidents', INITIAL_INCIDENTS);
  },

  addIncident: async (incident: Omit<IncidentSecurite, 'id' | 'date' | 'heure' | 'statut'>): Promise<IncidentSecurite> => {
    const list = await educatorService.getIncidents();
    const now = new Date();
    const heure = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const date = now.toISOString().split('T')[0];

    const newInc: IncidentSecurite = {
      ...incident,
      id: `inc-${Date.now()}`,
      date,
      heure,
      statut: 'EN_COURS',
    };

    const updated = [newInc, ...list];
    setStored('incidents', updated);
    return newInc;
  },

  cloturerIncident: async (id: string): Promise<IncidentSecurite[]> => {
    const list = await educatorService.getIncidents();
    const updated = list.map((inc) => (inc.id === id ? { ...inc, statut: 'CLOTURE' as const } : inc));
    setStored('incidents', updated);
    return updated;
  },
};
