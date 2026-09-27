import apiClient from './api';
import {
  User,
  Filiere,
  Classe,
  Inscription,
  Evaluation,
  Note,
  Absence,
  Paiement,
  DocumentScolaire,
  DashboardStats,
  SeanceEmploiDuTemps,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_FILIERES,
  INITIAL_CLASSES,
  INITIAL_INSCRIPTIONS,
  INITIAL_EVALUATIONS,
  INITIAL_NOTES,
  INITIAL_ABSENCES,
  INITIAL_PAIEMENTS,
  INITIAL_DOCUMENTS,
  DASHBOARD_STATS,
} from './mockData';
import { INITIAL_SEANCES } from './mockTimetable';

// Storage Helper
const getStored = <T,>(key: string, defaultData: T): T => {
  const data = localStorage.getItem(`sukulu_${key}`);
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
  localStorage.setItem(`sukulu_${key}`, JSON.stringify(data));
};

export const schoolService = {
  // === DASHBOARD STATS ===
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const response = await apiClient.get('/dashboard/stats/');
      return response.data;
    } catch {
      // Return local calculated stats
      const users = getStored<User[]>('users', INITIAL_USERS);
      const classes = getStored<Classe[]>('classes', INITIAL_CLASSES);
      const filieres = getStored<Filiere[]>('filieres', INITIAL_FILIERES);
      const paiements = getStored<Paiement[]>('paiements', INITIAL_PAIEMENTS);
      const absences = getStored<Absence[]>('absences', INITIAL_ABSENCES);

      const totalEleves = users.filter((u) => u.role === 'ELEVE').length;
      const totalEnseignants = users.filter((u) => u.role === 'ENSEIGNANT').length;
      const totalRecouvre = paiements.reduce((sum, p) => sum + p.montant, 0);

      return {
        ...DASHBOARD_STATS,
        total_eleves: totalEleves || 485,
        total_enseignants: totalEnseignants || 34,
        total_classes: classes.length || 16,
        total_filieres: filieres.length || 4,
        montant_total_recouvre: totalRecouvre || 184500000,
        absences_aujourdhui: absences.length,
      };
    }
  },

  // === USERS (ADMIN, ENSEIGNANTS, ELEVES, PARENTS) ===
  getUsers: async (role?: string): Promise<User[]> => {
    try {
      const response = await apiClient.get('/users/', { params: { role } });
      return response.data;
    } catch {
      let users = getStored<User[]>('users', INITIAL_USERS);
      if (role) {
        users = users.filter((u) => u.role === role);
      }
      return users;
    }
  },

  createUser: async (userData: Partial<User>): Promise<User> => {
    try {
      const response = await apiClient.post('/users/', userData);
      return response.data;
    } catch {
      const users = getStored<User[]>('users', INITIAL_USERS);
      const newUser: User = {
        id: Date.now(),
        username: userData.username || `${userData.first_name?.toLowerCase()}.${userData.last_name?.toLowerCase()}`,
        email: userData.email || '',
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        role: userData.role || 'ELEVE',
        phone: userData.phone || '',
        address: userData.address || '',
        matricule: userData.matricule || `SKL-2025-${Math.floor(1000 + Math.random() * 9000)}`,
        is_active: true,
        date_joined: new Date().toISOString().split('T')[0],
        classe_nom: userData.classe_nom,
        specialite: userData.specialite,
      };
      const updated = [newUser, ...users];
      setStored('users', updated);
      return newUser;
    }
  },

  updateUser: async (id: number, userData: Partial<User>): Promise<User> => {
    try {
      const response = await apiClient.patch(`/users/${id}/`, userData);
      return response.data;
    } catch {
      const users = getStored<User[]>('users', INITIAL_USERS);
      const index = users.findIndex((u) => u.id === id);
      if (index !== -1) {
        users[index] = { ...users[index], ...userData };
        setStored('users', users);
        return users[index];
      }
      throw new Error('User not found');
    }
  },

  deleteUser: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/users/${id}/`);
    } catch {
      const users = getStored<User[]>('users', INITIAL_USERS);
      const filtered = users.filter((u) => u.id !== id);
      setStored('users', filtered);
    }
  },

  // === FILIERES & CLASSES ===
  getFilieres: async (): Promise<Filiere[]> => {
    try {
      const response = await apiClient.get('/filieres/');
      return response.data;
    } catch {
      return getStored<Filiere[]>('filieres', INITIAL_FILIERES);
    }
  },

  createFiliere: async (data: Partial<Filiere>): Promise<Filiere> => {
    try {
      const response = await apiClient.post('/filieres/', data);
      return response.data;
    } catch {
      const list = getStored<Filiere[]>('filieres', INITIAL_FILIERES);
      const newItem: Filiere = {
        id: Date.now(),
        code: data.code || 'FIL',
        nom: data.nom || 'Nouvelle Filière',
        description: data.description || '',
        created_at: new Date().toISOString().split('T')[0],
      };
      setStored('filieres', [newItem, ...list]);
      return newItem;
    }
  },

  getClasses: async (): Promise<Classe[]> => {
    try {
      const response = await apiClient.get('/classes/');
      return response.data;
    } catch {
      return getStored<Classe[]>('classes', INITIAL_CLASSES);
    }
  },

  createClasse: async (data: Partial<Classe>): Promise<Classe> => {
    try {
      const response = await apiClient.post('/classes/', data);
      return response.data;
    } catch {
      const list = getStored<Classe[]>('classes', INITIAL_CLASSES);
      const newItem: Classe = {
        id: Date.now(),
        code: data.code || 'CLS',
        nom: data.nom || 'Nouvelle Classe',
        niveau: data.niveau || 'Collège',
        filiere_nom: data.filiere_nom || 'Enseignement Général',
        enseignant_titulaire_nom: data.enseignant_titulaire_nom || 'Non attribué',
        salle: data.salle || 'Salle B-01',
        effectif_max: data.effectif_max || 40,
        effectif_actuel: 0,
        frais_scolarite: data.frais_scolarite || 400000,
      };
      setStored('classes', [newItem, ...list]);
      return newItem;
    }
  },

  // === INSCRIPTIONS ===
  getInscriptions: async (): Promise<Inscription[]> => {
    try {
      const response = await apiClient.get('/inscriptions/');
      return response.data;
    } catch {
      return getStored<Inscription[]>('inscriptions', INITIAL_INSCRIPTIONS);
    }
  },

  createInscription: async (data: Partial<Inscription>): Promise<Inscription> => {
    try {
      const response = await apiClient.post('/inscriptions/', data);
      return response.data;
    } catch {
      const list = getStored<Inscription[]>('inscriptions', INITIAL_INSCRIPTIONS);
      const newInst: Inscription = {
        id: Date.now(),
        matricule: `SKL-2025-${Math.floor(1000 + Math.random() * 9000)}`,
        eleve_id: data.eleve_id || Date.now(),
        eleve_nom: data.eleve_nom || 'Nouvel',
        eleve_prenom: data.eleve_prenom || 'Élève',
        eleve_email: data.eleve_email || 'eleve@sukulu.edu',
        classe_id: data.classe_id || 1,
        classe_nom: data.classe_nom || '6ème A',
        filiere_nom: data.filiere_nom || 'Enseignement Général',
        annee_academique: '2025-2026',
        date_inscription: new Date().toISOString().split('T')[0],
        statut: data.statut || 'EN_ATTENTE',
        frais_totaux: data.frais_totaux || 420000,
        frais_payes: data.frais_payes || 0,
        parent_nom: data.parent_nom || '',
        parent_telephone: data.parent_telephone || '',
        documents_fournis: data.documents_fournis || {
          acte_naissance: true,
          bulletin_anterieur: true,
          photo_identite: true,
        },
      };
      setStored('inscriptions', [newInst, ...list]);
      return newInst;
    }
  },

  updateInscriptionStatus: async (id: number, statut: Inscription['statut']): Promise<Inscription> => {
    try {
      const response = await apiClient.patch(`/inscriptions/${id}/`, { statut });
      return response.data;
    } catch {
      const list = getStored<Inscription[]>('inscriptions', INITIAL_INSCRIPTIONS);
      const idx = list.findIndex((i) => i.id === id);
      if (idx !== -1) {
        list[idx].statut = statut;
        setStored('inscriptions', list);
        return list[idx];
      }
      throw new Error('Inscription non trouvée');
    }
  },

  // === EVALUATIONS & NOTES ===
  getEvaluations: async (): Promise<Evaluation[]> => {
    try {
      const response = await apiClient.get('/evaluations/');
      return response.data;
    } catch {
      return getStored<Evaluation[]>('evaluations', INITIAL_EVALUATIONS);
    }
  },

  getNotes: async (eleve_id?: number, classe_id?: number): Promise<Note[]> => {
    try {
      const response = await apiClient.get('/notes/', { params: { eleve_id, classe_id } });
      return response.data;
    } catch {
      let notes = getStored<Note[]>('notes', INITIAL_NOTES);
      if (eleve_id) notes = notes.filter((n) => n.eleve_id === eleve_id);
      return notes;
    }
  },

  saveNote: async (noteData: Partial<Note>): Promise<Note> => {
    try {
      const response = await apiClient.post('/notes/', noteData);
      return response.data;
    } catch {
      const notes = getStored<Note[]>('notes', INITIAL_NOTES);
      const newNote: Note = {
        id: Date.now(),
        evaluation_id: noteData.evaluation_id || 1,
        evaluation_titre: noteData.evaluation_titre || 'Devoir',
        eleve_id: noteData.eleve_id || 4,
        eleve_nom: noteData.eleve_nom || 'Fatou Sow',
        eleve_matricule: noteData.eleve_matricule || 'SKL-2024-0089',
        classe_nom: noteData.classe_nom || 'Terminale S1',
        matiere_nom: noteData.matiere_nom || 'Mathématiques',
        valeur: noteData.valeur !== undefined ? noteData.valeur : 15,
        coefficient: noteData.coefficient || 3,
        appreciation: noteData.appreciation || 'Résultats satisfaisants.',
        trimestre: noteData.trimestre || 'TRIMESTRE_1',
        date_saisie: new Date().toISOString().split('T')[0],
      };
      setStored('notes', [newNote, ...notes]);
      return newNote;
    }
  },

  updateNote: async (id: number, noteData: Partial<Note>): Promise<Note> => {
    try {
      const response = await apiClient.patch(`/notes/${id}/`, noteData);
      return response.data;
    } catch {
      const notes = getStored<Note[]>('notes', INITIAL_NOTES);
      const index = notes.findIndex((n) => n.id === id);
      if (index !== -1) {
        notes[index] = { ...notes[index], ...noteData };
        setStored('notes', notes);
        return notes[index];
      }
      throw new Error('Note non trouvée');
    }
  },

  deleteNote: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/notes/${id}/`);
    } catch {
      const notes = getStored<Note[]>('notes', INITIAL_NOTES);
      const filtered = notes.filter((n) => n.id !== id);
      setStored('notes', filtered);
    }
  },

  // === ABSENCES ===
  getAbsences: async (): Promise<Absence[]> => {
    try {
      const response = await apiClient.get('/absences/');
      return response.data;
    } catch {
      return getStored<Absence[]>('absences', INITIAL_ABSENCES);
    }
  },

  createAbsence: async (data: Partial<Absence>): Promise<Absence> => {
    try {
      const response = await apiClient.post('/absences/', data);
      return response.data;
    } catch {
      const list = getStored<Absence[]>('absences', INITIAL_ABSENCES);
      const newItem: Absence = {
        id: Date.now(),
        eleve_id: data.eleve_id || 4,
        eleve_nom: data.eleve_nom || 'Élève',
        eleve_matricule: data.eleve_matricule || 'SKL-2024-0089',
        classe_id: data.classe_id || 1,
        classe_nom: data.classe_nom || 'Terminale S1',
        date_absence: data.date_absence || new Date().toISOString().split('T')[0],
        type: data.type || 'ABSENCE',
        duree_heures: data.duree_heures || 1,
        matiere_nom: data.matiere_nom || 'Général',
        statut: data.statut || 'NON_JUSTIFIE',
        motif: data.motif || '',
      };
      setStored('absences', [newItem, ...list]);
      return newItem;
    }
  },

  updateAbsence: async (id: number, data: Partial<Absence>): Promise<Absence> => {
    try {
      const response = await apiClient.patch(`/absences/${id}/`, data);
      return response.data;
    } catch {
      const list = getStored<Absence[]>('absences', INITIAL_ABSENCES);
      const idx = list.findIndex((a) => a.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...data };
        setStored('absences', list);
        return list[idx];
      }
      throw new Error('Absence non trouvée');
    }
  },

  deleteAbsence: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/absences/${id}/`);
    } catch {
      const list = getStored<Absence[]>('absences', INITIAL_ABSENCES);
      const filtered = list.filter((a) => a.id !== id);
      setStored('absences', filtered);
    }
  },

  // === PAIEMENTS ===
  getPaiements: async (): Promise<Paiement[]> => {
    try {
      const response = await apiClient.get('/paiements/');
      return response.data;
    } catch {
      return getStored<Paiement[]>('paiements', INITIAL_PAIEMENTS);
    }
  },

  createPaiement: async (data: Partial<Paiement>): Promise<Paiement> => {
    try {
      const response = await apiClient.post('/paiements/', data);
      return response.data;
    } catch {
      const list = getStored<Paiement[]>('paiements', INITIAL_PAIEMENTS);
      const refRecu = `REC-2025-${Math.floor(1000 + Math.random() * 9000)}`;
      const newPay: Paiement = {
        id: Date.now(),
        reference_recu: refRecu,
        eleve_id: data.eleve_id || 4,
        eleve_nom: data.eleve_nom || 'Fatou Sow',
        eleve_matricule: data.eleve_matricule || 'SKL-2024-0089',
        classe_nom: data.classe_nom || 'Terminale S1',
        tranche: data.tranche || 'Frais de scolarité',
        montant: data.montant || 200000,
        frais_totaux: data.frais_totaux || 550000,
        mode_paiement: data.mode_paiement || 'MOBILE_MONEY',
        statut: data.statut || 'PAYE',
        date_paiement: new Date().toISOString().split('T')[0],
        annee_academique: '2025-2026',
        effectue_par: data.effectue_par || 'Parent / Tuteur',
      };
      setStored('paiements', [newPay, ...list]);

      // Automatically generate a document receipt as well
      schoolService.createDocument({
        reference: refRecu,
        type: 'RECU_PAIEMENT',
        titre: `Reçu de Paiement - ${data.tranche || 'Scolarité'}`,
        eleve_id: newPay.eleve_id,
        eleve_nom: newPay.eleve_nom,
        eleve_matricule: newPay.eleve_matricule,
        classe_nom: newPay.classe_nom,
        annee_academique: '2025-2026',
        metadata: {
          montant: `${newPay.montant.toLocaleString('fr-FR')} FCFA`,
          mode: newPay.mode_paiement,
          statut: newPay.statut,
        },
      });

      return newPay;
    }
  },

  updatePaiement: async (id: number, data: Partial<Paiement>): Promise<Paiement> => {
    try {
      const response = await apiClient.patch(`/paiements/${id}/`, data);
      return response.data;
    } catch {
      const list = getStored<Paiement[]>('paiements', INITIAL_PAIEMENTS);
      const idx = list.findIndex((p) => p.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...data };
        setStored('paiements', list);
        return list[idx];
      }
      throw new Error('Paiement non trouvé');
    }
  },

  deletePaiement: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/paiements/${id}/`);
    } catch {
      const list = getStored<Paiement[]>('paiements', INITIAL_PAIEMENTS);
      const filtered = list.filter((p) => p.id !== id);
      setStored('paiements', filtered);
    }
  },

  // === DOCUMENTS SCOL AIRES (BULLETINS, CERTIFICATS, RECUS) ===
  getDocuments: async (): Promise<DocumentScolaire[]> => {
    try {
      const response = await apiClient.get('/documents/');
      return response.data;
    } catch {
      return getStored<DocumentScolaire[]>('documents', INITIAL_DOCUMENTS);
    }
  },

  createDocument: async (data: Partial<DocumentScolaire>): Promise<DocumentScolaire> => {
    try {
      const response = await apiClient.post('/documents/', data);
      return response.data;
    } catch {
      const list = getStored<DocumentScolaire[]>('documents', INITIAL_DOCUMENTS);
      const newDoc: DocumentScolaire = {
        id: Date.now(),
        reference: data.reference || `DOC-2025-${Math.floor(1000 + Math.random() * 9000)}`,
        type: data.type || 'CERTIFICAT_SCOLARITE',
        titre: data.titre || 'Document Officiel Sukulu',
        eleve_id: data.eleve_id || 4,
        eleve_nom: data.eleve_nom || 'Fatou Sow',
        eleve_matricule: data.eleve_matricule || 'SKL-2024-0089',
        classe_nom: data.classe_nom || 'Terminale S1',
        annee_academique: '2025-2026',
        date_generation: new Date().toISOString().split('T')[0],
        trimestre: data.trimestre,
        metadata: data.metadata || {},
      };
      setStored('documents', [newDoc, ...list]);
      return newDoc;
    }
  },

  // === EMPLOI DU TEMPS (SEANCES & PLANNING) ===
  getEmploiDuTemps: async (classeId?: number): Promise<SeanceEmploiDuTemps[]> => {
    try {
      const response = await apiClient.get('/timetable/', { params: { classe_id: classeId } });
      return response.data;
    } catch {
      const seances = getStored<SeanceEmploiDuTemps[]>('seances_emploi_du_temps', INITIAL_SEANCES);
      if (classeId) {
        return seances.filter((s) => s.classe_id === classeId);
      }
      return seances;
    }
  },

  createSeance: async (data: Partial<SeanceEmploiDuTemps>): Promise<SeanceEmploiDuTemps> => {
    try {
      const response = await apiClient.post('/timetable/', data);
      return response.data;
    } catch {
      const list = getStored<SeanceEmploiDuTemps[]>('seances_emploi_du_temps', INITIAL_SEANCES);
      const newSeance: SeanceEmploiDuTemps = {
        id: Date.now(),
        classe_id: data.classe_id || 3,
        classe_nom: data.classe_nom || 'Terminale S1',
        jour: data.jour || 'LUNDI',
        heure_debut: data.heure_debut || '08:00',
        heure_fin: data.heure_fin || '10:00',
        matiere_nom: data.matiere_nom || 'Matière',
        enseignant_nom: data.enseignant_nom || 'Enseignant',
        salle: data.salle || 'Salle C-201',
        couleur: data.couleur || 'blue',
        type: data.type || 'COURS',
        description: data.description || '',
        materiel_requis: data.materiel_requis || '',
      };
      setStored('seances_emploi_du_temps', [newSeance, ...list]);
      return newSeance;
    }
  },

  updateSeance: async (id: number, data: Partial<SeanceEmploiDuTemps>): Promise<SeanceEmploiDuTemps> => {
    try {
      const response = await apiClient.patch(`/timetable/${id}/`, data);
      return response.data;
    } catch {
      const list = getStored<SeanceEmploiDuTemps[]>('seances_emploi_du_temps', INITIAL_SEANCES);
      const idx = list.findIndex((s) => s.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...data };
        setStored('seances_emploi_du_temps', list);
        return list[idx];
      }
      throw new Error('Séance non trouvée');
    }
  },

  deleteSeance: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/timetable/${id}/`);
    } catch {
      const list = getStored<SeanceEmploiDuTemps[]>('seances_emploi_du_temps', INITIAL_SEANCES);
      const filtered = list.filter((s) => s.id !== id);
      setStored('seances_emploi_du_temps', filtered);
    }
  },
};
