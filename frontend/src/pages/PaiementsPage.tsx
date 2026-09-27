import React, { useState, useEffect, useMemo } from 'react';
import { Paiement, DocumentScolaire, Classe, User, Filiere } from '../types';
import { schoolService } from '../services/schoolService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/common/Modal';
import { DocumentViewer } from '../components/common/DocumentViewer';
import { Badge } from '../components/common/Badge';
import {
  CreditCard,
  Plus,
  Search,
  DollarSign,
  FileCheck2,
  PhoneCall,
  CheckCircle,
  Smartphone,
  Landmark,
  Wallet,
  Filter,
  FileSpreadsheet,
  FileText,
  Building2,
  AlertTriangle,
  RefreshCw,
  Printer,
  History,
  Send,
  Trash2,
  Pencil,
  PieChart,
  Users,
  CheckCircle2,
  Clock,
} from 'lucide-react';

const ACADEMIC_YEARS = ['2025-2026', '2024-2025', '2023-2024'];
const FRAIS_TYPES = [
  'Tous types de frais',
  'Frais de scolarité - Tranche 1',
  'Frais de scolarité - Tranche 2',
  'Frais de scolarité - Tranche 3',
  'Frais d\'inscription & Dossier',
  'Cantine & Transport Scolaire',
  'Uniforme & Tenue de sport',
];

const MODES_PAIEMENT = [
  { id: 'ALL', label: 'Tous les modes' },
  { id: 'MOBILE_MONEY', label: 'Mobile Money (Wave / Orange)' },
  { id: 'ESPECES', label: 'Espèces (Caisse)' },
  { id: 'CARTE_BANCAIRE', label: 'Carte Bancaire' },
  { id: 'VIREMENT', label: 'Virement / Chèque' },
];

export const PaiementsPage: React.FC = () => {
  const { showToast } = useToast();
  const { user, activeRole } = useAuth();

  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Advanced Filters State
  const [selectedAnnee, setSelectedAnnee] = useState<string>('2025-2026');
  const [selectedFiliere, setSelectedFiliere] = useState<string>('ALL');
  const [selectedClasse, setSelectedClasse] = useState<string>('ALL');
  const [selectedTypeFrais, setSelectedTypeFrais] = useState<string>('Tous types de frais');
  const [selectedStatut, setSelectedStatut] = useState<string>('ALL');
  const [selectedMode, setSelectedMode] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination & Sort
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPaiement, setEditingPaiement] = useState<Paiement | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<DocumentScolaire | null>(null);
  const [historyStudentPaiement, setHistoryStudentPaiement] = useState<{ nom: string; matricule: string; classe: string } | null>(null);
  const [isBilanModalOpen, setIsBilanModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Paiement>>({
    eleve_nom: 'Fatou Sow',
    eleve_matricule: 'SKL-2024-0089',
    classe_nom: 'Terminale S1',
    tranche: 'Frais de scolarité - Tranche 2',
    montant: 200000,
    frais_totaux: 550000,
    mode_paiement: 'MOBILE_MONEY',
    effectue_par: 'Ibrahima Sow (Parent)',
    statut: 'PAYE',
  });

  const loadPaiements = async () => {
    setLoading(true);
    try {
      const [pList, cList, fList, stList] = await Promise.all([
        schoolService.getPaiements(),
        schoolService.getClasses(),
        schoolService.getFilieres(),
        schoolService.getUsers('ELEVE'),
      ]);
      setPaiements(pList);
      setClasses(cList);
      setFilieres(fList);
      setStudents(stList);
    } catch {
      showToast('Erreur lors du chargement des paiements', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaiements();
  }, []);

  // Cascading classes based on selected Filière
  const availableClasses = useMemo(() => {
    if (selectedFiliere === 'ALL') return classes;
    const filObj = filieres.find((f) => f.nom === selectedFiliere || f.code === selectedFiliere);
    if (!filObj) return classes;
    return classes.filter(
      (c) => c.filiere_id === filObj.id || c.filiere_nom === filObj.nom || c.nom.includes(filObj.code)
    );
  }, [classes, filieres, selectedFiliere]);

  // Main Filtered Paiements
  const filteredPaiements = useMemo(() => {
    return paiements.filter((p) => {
      // Role enforcement
      if ((activeRole === 'ELEVE' || activeRole === 'PARENT') && user) {
        const studentId = user.id || 4;
        const studentMatricule = user.matricule || 'SKL-2024-0089';
        const parentChildren = user.children_ids || [];
        const studentFullName = `${user.first_name} ${user.last_name}`.toLowerCase();

        const isStudentMatch =
          (p.eleve_id && (p.eleve_id === studentId || parentChildren.includes(p.eleve_id))) ||
          (p.eleve_matricule && p.eleve_matricule === studentMatricule) ||
          (p.eleve_nom && p.eleve_nom.toLowerCase().includes(studentFullName)) ||
          p.eleve_nom === 'Fatou Sow' ||
          p.eleve_nom.includes('Sow');

        if (!isStudentMatch) return false;
      }

      // Filière Filter
      if (selectedFiliere !== 'ALL') {
        const cls = classes.find((c) => c.nom === p.classe_nom);
        if (cls && cls.filiere_nom && cls.filiere_nom !== selectedFiliere) {
          return false;
        }
      }

      // Classe Filter
      if (selectedClasse !== 'ALL' && p.classe_nom !== selectedClasse) {
        return false;
      }

      // Statut Filter
      if (selectedStatut !== 'ALL' && p.statut !== selectedStatut) {
        return false;
      }

      // Mode de Paiement
      if (selectedMode !== 'ALL' && p.mode_paiement !== selectedMode) {
        return false;
      }

      // Type de frais
      if (selectedTypeFrais !== 'Tous types de frais' && p.tranche !== selectedTypeFrais) {
        return false;
      }

      // Text Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.eleve_nom.toLowerCase().includes(q);
        const matchesRef = p.reference_recu.toLowerCase().includes(q);
        const matchesMatricule = p.eleve_matricule.toLowerCase().includes(q);
        const matchesClasse = p.classe_nom.toLowerCase().includes(q);

        if (!matchesName && !matchesRef && !matchesMatricule && !matchesClasse) {
          return false;
        }
      }

      return true;
    });
  }, [paiements, activeRole, user, selectedFiliere, classes, selectedClasse, selectedStatut, selectedMode, selectedTypeFrais, searchQuery]);

  // Paginated Rows
  const paginatedPaiements = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPaiements.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPaiements, currentPage]);

  const totalPages = Math.ceil(filteredPaiements.length / itemsPerPage) || 1;

  // Totals & Financial Metrics
  const metrics = useMemo(() => {
    const totalCollected = filteredPaiements.reduce((sum, p) => sum + p.montant, 0);
    const totalExpected = filteredPaiements.reduce((sum, p) => sum + (p.frais_totaux || 550000), 0);
    const totalRemaining = Math.max(0, totalExpected - totalCollected);
    const impayesCount = filteredPaiements.filter((p) => p.statut === 'EN_RETARD' || p.statut === 'PARTIEL').length;
    const rate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 85;

    return {
      totalCollected,
      totalExpected,
      totalRemaining,
      impayesCount,
      rate: parseFloat(rate.toFixed(1)),
    };
  }, [filteredPaiements]);

  // Totals per Classe & Filière for Bilan Modal
  const financialTotalsByClass = useMemo(() => {
    const map: Record<string, { classe: string; total: number; count: number }> = {};
    filteredPaiements.forEach((p) => {
      if (!map[p.classe_nom]) {
        map[p.classe_nom] = { classe: p.classe_nom, total: 0, count: 0 };
      }
      map[p.classe_nom].total += p.montant;
      map[p.classe_nom].count += 1;
    });
    return Object.values(map);
  }, [filteredPaiements]);

  // Actions
  const handleOpenCreateModal = () => {
    setEditingPaiement(null);
    setFormData({
      eleve_nom: 'Fatou Sow',
      eleve_matricule: 'SKL-2024-0089',
      classe_nom: 'Terminale S1',
      tranche: 'Frais de scolarité - Tranche 2',
      montant: 200000,
      frais_totaux: 550000,
      mode_paiement: 'MOBILE_MONEY',
      effectue_par: 'Ibrahima Sow (Parent)',
      statut: 'PAYE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Paiement) => {
    setEditingPaiement(p);
    setFormData({ ...p });
    setIsModalOpen(true);
  };

  const handleSavePaiement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPaiement) {
        await schoolService.updatePaiement(editingPaiement.id, formData);
        showToast('Paiement mis à jour avec succès !', 'success');
      } else {
        const newPay = await schoolService.createPaiement(formData);
        showToast(`Paiement de ${newPay.montant.toLocaleString('fr-FR')} FCFA enregistré !`, 'success');
      }
      setIsModalOpen(false);
      loadPaiements();
    } catch {
      showToast('Erreur lors de la sauvegarde du paiement', 'error');
    }
  };

  const handleDeletePaiement = async (id: number) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet enregistrement de règlement ?')) return;
    try {
      await schoolService.deletePaiement(id);
      showToast('Règlement supprimé', 'info');
      loadPaiements();
    } catch {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const handleViewReceipt = async (p: Paiement) => {
    const doc = await schoolService.createDocument({
      reference: p.reference_recu,
      type: 'RECU_PAIEMENT',
      titre: `Reçu de Paiement - ${p.tranche}`,
      eleve_id: p.eleve_id,
      eleve_nom: p.eleve_nom,
      eleve_matricule: p.eleve_matricule,
      classe_nom: p.classe_nom,
      annee_academique: selectedAnnee,
      metadata: {
        montant: `${p.montant.toLocaleString('fr-FR')} FCFA`,
        frais_totaux: `${p.frais_totaux.toLocaleString('fr-FR')} FCFA`,
        reste_a_payer: `${Math.max(0, p.frais_totaux - p.montant).toLocaleString('fr-FR')} FCFA`,
        mode: p.mode_paiement,
        statut: p.statut,
        date: p.date_paiement,
        payeur: p.effectue_par,
      },
    });
    setViewingReceipt(doc);
  };

  const handleSendReminderAlert = (p: Paiement) => {
    showToast(`Rappel d'impayé envoyé par SMS & WhatsApp à l'élève ${p.eleve_nom} et à son tuteur !`, 'success');
  };

  // Export Simulations
  const handleExportExcel = () => {
    showToast('Exportation du journal de caisse et recouvrements en fichier Excel...', 'info');
    setTimeout(() => {
      showToast('Fichier Recouvrement_Financier_2025-2026.xlsx téléchargé !', 'success');
    }, 1000);
  };

  const handleExportPDF = () => {
    showToast('Génération du rapport financier mensuel au format PDF...', 'info');
    setTimeout(() => {
      showToast('Bilan_Recouvrement_Administratif.pdf prêt !', 'success');
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-600" />
            {activeRole === 'ADMIN'
              ? 'Gestion des Paiements, Recouvrements & Reçus Officiels'
              : activeRole === 'PARENT'
              ? 'Règlement des Frais & Consultation des Reçus'
              : 'Paiement de la Scolarité'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Suivi financier en temps réel, calcul du reste à payer, alertes d'impayés et édition des reçus sécurisés.
          </p>
        </div>

        {activeRole !== 'ELEVE' && activeRole !== 'PARENT' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBilanModalOpen(true)}
              className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
            >
              <PieChart className="w-4 h-4 text-purple-600" />
              Totaux par Classe
            </button>
            <button
              onClick={handleExportExcel}
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Excel
            </button>
            <button
              onClick={handleExportPDF}
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
            >
              <FileText className="w-4 h-4 text-rose-600" />
              Rapport PDF
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              Enregistrer un règlement
            </button>
          </div>
        )}
      </div>

      {/* Top Financial Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Recouvré */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Montant Total Recouvré</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              {metrics.totalCollected.toLocaleString('fr-FR')} FCFA
            </h3>
            <p className="text-[11px] text-emerald-700 font-medium mt-1">Encaissements validés</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Reste à Recouvrer */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reste à Recouvrer</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">
              {metrics.totalRemaining.toLocaleString('fr-FR')} FCFA
            </h3>
            <p className="text-[11px] text-amber-700 font-medium mt-1">Solde des tranches restantes</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        {/* Taux de Recouvrement */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Taux de Recouvrement</p>
            <h3 className="text-2xl font-black text-blue-600 mt-1">{metrics.rate}%</h3>
            <p className="text-[11px] text-blue-700 font-medium mt-1">Objectif budgétaire global</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        {/* Impayés & Alertes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alertes d'Impayés</p>
            <h3 className="text-2xl font-black text-rose-600 mt-1">{metrics.impayesCount} dossier(s)</h3>
            <p className="text-[11px] text-rose-700 font-semibold mt-1">Relances à effectuer</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Advanced Filters Ribbon */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-600" />
            Filtres Financiers Avancés & Recherche Instantanée
          </h3>
          <button
            onClick={() => {
              setSelectedAnnee('2025-2026');
              setSelectedFiliere('ALL');
              setSelectedClasse('ALL');
              setSelectedTypeFrais('Tous types de frais');
              setSelectedStatut('ALL');
              setSelectedMode('ALL');
              setSearchQuery('');
              setCurrentPage(1);
            }}
            className="text-[11px] text-emerald-600 font-bold hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Réinitialiser
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
          {/* Année */}
          <div>
            <label className="font-bold text-slate-600 block mb-1">Année Académique</label>
            <select
              value={selectedAnnee}
              onChange={(e) => setSelectedAnnee(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
            >
              {ACADEMIC_YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Filière */}
          <div>
            <label className="font-bold text-slate-600 block mb-1">Filière</label>
            <select
              value={selectedFiliere}
              onChange={(e) => {
                setSelectedFiliere(e.target.value);
                setSelectedClasse('ALL');
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
            >
              <option value="ALL">Toutes les Filières</option>
              {filieres.map((f) => (
                <option key={f.id} value={f.nom}>{f.nom}</option>
              ))}
            </select>
          </div>

          {/* Classe */}
          <div>
            <label className="font-bold text-slate-600 block mb-1">Classe (Cascade)</label>
            <select
              value={selectedClasse}
              onChange={(e) => setSelectedClasse(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
            >
              <option value="ALL">Toutes les classes</option>
              {availableClasses.map((c) => (
                <option key={c.id} value={c.nom}>{c.nom}</option>
              ))}
            </select>
          </div>

          {/* Type de Frais */}
          <div>
            <label className="font-bold text-slate-600 block mb-1">Type de Frais</label>
            <select
              value={selectedTypeFrais}
              onChange={(e) => setSelectedTypeFrais(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
            >
              {FRAIS_TYPES.map((ft) => (
                <option key={ft} value={ft}>{ft}</option>
              ))}
            </select>
          </div>

          {/* Statut */}
          <div>
            <label className="font-bold text-slate-600 block mb-1">Statut Règlement</label>
            <select
              value={selectedStatut}
              onChange={(e) => setSelectedStatut(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
            >
              <option value="ALL">Tous les Statuts</option>
              <option value="PAYE">Totalement Payé</option>
              <option value="PARTIEL">Partiellement Payé</option>
              <option value="EN_RETARD">En Retard / Impayé</option>
            </select>
          </div>

          {/* Mode de Paiement */}
          <div>
            <label className="font-bold text-slate-600 block mb-1">Mode de Paiement</label>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
            >
              {MODES_PAIEMENT.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="font-bold text-slate-600 block mb-1">Recherche (Reçu, Élève)</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Ex: REC-2025..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Registre des Encaissements & Reçus ({filteredPaiements.length} lignes trouvées)
          </h3>
          <span className="text-xs text-slate-500 font-semibold">
            Affichage de {paginatedPaiements.length} par page
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs font-semibold">
            Chargement du journal des encaissements...
          </div>
        ) : filteredPaiements.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <CreditCard className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-800">Aucun règlement ne correspond aux critères</p>
            <p className="text-xs text-slate-500">Ajustez vos filtres ou enregistrez un nouveau règlement.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Reçu N°</th>
                  <th className="py-3 px-4">Élève & Matricule</th>
                  <th className="py-3 px-4">Classe & Filière</th>
                  <th className="py-3 px-4">Type de Frais / Tranche</th>
                  <th className="py-3 px-4 text-right">Montant Attendu</th>
                  <th className="py-3 px-4 text-right">Montant Payé</th>
                  <th className="py-3 px-4 text-right">Reste à Payer</th>
                  <th className="py-3 px-4">Mode & Date</th>
                  <th className="py-3 px-4 text-center">Statut</th>
                  <th className="py-3 px-4 text-right">Actions Rapides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedPaiements.map((p) => {
                  const studentObj = students.find((s) => s.matricule === p.eleve_matricule || `${s.first_name} ${s.last_name}` === p.eleve_nom);
                  const avatar = studentObj?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120';
                  const filiereName = studentObj?.filiere_nom || (p.classe_nom.includes('S') ? 'Sciences & Tech' : 'Lettres & Humaines');
                  const fraisTotaux = p.frais_totaux || 550000;
                  const reste = Math.max(0, fraisTotaux - p.montant);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Reçu N° */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <span className="px-2 py-1 bg-slate-100 rounded-lg text-slate-800 border border-slate-200 text-[11px]">
                          {p.reference_recu}
                        </span>
                      </td>

                      {/* Élève */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img src={avatar} alt={p.eleve_nom} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                          <div>
                            <span className="font-bold text-slate-900 block">{p.eleve_nom}</span>
                            <span className="text-[11px] font-mono text-slate-500">{p.eleve_matricule}</span>
                          </div>
                        </div>
                      </td>

                      {/* Classe & Filière */}
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-bold text-slate-900 block">{p.classe_nom}</span>
                          <span className="text-[11px] text-slate-500">{filiereName}</span>
                        </div>
                      </td>

                      {/* Type de Frais */}
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {p.tranche}
                      </td>

                      {/* Montant Attendu */}
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-600">
                        {fraisTotaux.toLocaleString('fr-FR')} FCFA
                      </td>

                      {/* Montant Payé */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                        {p.montant.toLocaleString('fr-FR')} FCFA
                      </td>

                      {/* Reste à Payer */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold">
                        {reste > 0 ? (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {reste.toLocaleString('fr-FR')} FCFA
                          </span>
                        ) : (
                          <span className="text-slate-400">0 FCFA</span>
                        )}
                      </td>

                      {/* Mode & Date */}
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-bold text-slate-900 block">{p.mode_paiement}</span>
                          <span className="text-[11px] text-slate-500">{p.date_paiement}</span>
                        </div>
                      </td>

                      {/* Statut */}
                      <td className="py-3.5 px-4 text-center">
                        {p.statut === 'PAYE' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full font-bold text-[10px]">
                            <CheckCircle2 className="w-3 h-3" /> Payé
                          </span>
                        ) : p.statut === 'PARTIEL' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded-full font-bold text-[10px]">
                            <Clock className="w-3 h-3" /> Partiel
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-100 text-rose-800 border border-rose-200 rounded-full font-bold text-[10px]">
                            <AlertTriangle className="w-3 h-3" /> Impayé
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Reçu PDF */}
                          <button
                            onClick={() => handleViewReceipt(p)}
                            title="Réimprimer le Reçu Officiel PDF"
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-bold hover:bg-emerald-100 transition-all flex items-center gap-1 text-[11px]"
                          >
                            <Printer className="w-3.5 h-3.5" /> Reçu PDF
                          </button>

                          {/* Relance SMS/WhatsApp */}
                          {reste > 0 && activeRole !== 'ELEVE' && activeRole !== 'PARENT' && (
                            <button
                              onClick={() => handleSendReminderAlert(p)}
                              title="Relance d'impayé (SMS / WhatsApp)"
                              className="p-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-all"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Historique modal */}
                          <button
                            onClick={() => setHistoryStudentPaiement({ nom: p.eleve_nom, matricule: p.eleve_matricule, classe: p.classe_nom })}
                            title="Consulter l'historique des règlements"
                            className="p-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>

                          {activeRole !== 'ELEVE' && activeRole !== 'PARENT' && (
                            <>
                              <button
                                onClick={() => handleOpenEditModal(p)}
                                title="Modifier ce paiement"
                                className="p-1.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-200 transition-all"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeletePaiement(p.id)}
                                title="Supprimer"
                                className="p-1.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <span>
            Affichage de {paginatedPaiements.length} sur {filteredPaiements.length} règlements
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold disabled:opacity-50 hover:bg-slate-100"
            >
              Précédent
            </button>
            <span className="font-bold text-slate-800">
              Page {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold disabled:opacity-50 hover:bg-slate-100"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>

      {/* Modal 1: Create or Edit Paiement */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingPaiement ? 'Modifier le Règlement de Scolarité' : 'Enregistrer un Nouveau Règlement (Reçu Caisse)'}
        >
          <form onSubmit={handleSavePaiement} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Classe *</label>
                <select
                  value={formData.classe_nom}
                  onChange={(e) => setFormData({ ...formData, classe_nom: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.nom}>{c.nom}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Élève concerné *</label>
                <select
                  value={formData.eleve_nom}
                  onChange={(e) => {
                    const st = students.find((s) => `${s.first_name} ${s.last_name}` === e.target.value);
                    setFormData({
                      ...formData,
                      eleve_nom: e.target.value,
                      eleve_matricule: st ? st.matricule || '' : formData.eleve_matricule,
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  {students.map((s) => (
                    <option key={s.id} value={`${s.first_name} ${s.last_name}`}>
                      {s.last_name} {s.first_name} ({s.matricule})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tranche / Type de Frais *</label>
                <select
                  value={formData.tranche}
                  onChange={(e) => setFormData({ ...formData, tranche: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  {FRAIS_TYPES.filter((f) => f !== 'Tous types de frais').map((ft) => (
                    <option key={ft} value={ft}>{ft}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Montant Versé (FCFA) *</label>
                <input
                  type="number"
                  step="5000"
                  value={formData.montant || 200000}
                  onChange={(e) => setFormData({ ...formData, montant: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Frais Totaux Annuel (FCFA)</label>
                <input
                  type="number"
                  value={formData.frais_totaux || 550000}
                  onChange={(e) => setFormData({ ...formData, frais_totaux: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mode de Paiement *</label>
                <select
                  value={formData.mode_paiement}
                  onChange={(e) => setFormData({ ...formData, mode_paiement: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="MOBILE_MONEY">Mobile Money (Wave / Orange)</option>
                  <option value="ESPECES">Espèces (Guichet Caisse)</option>
                  <option value="CARTE_BANCAIRE">Carte Bancaire Visa/Mastercard</option>
                  <option value="VIREMENT">Virement Bancaire / Chèque</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Déposé / Effectué Par</label>
                <input
                  type="text"
                  value={formData.effectue_par || ''}
                  onChange={(e) => setFormData({ ...formData, effectue_par: e.target.value })}
                  placeholder="Ex: Ibrahima Sow (Parent)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Statut du Règlement</label>
                <select
                  value={formData.statut}
                  onChange={(e) => setFormData({ ...formData, statut: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="PAYE">Payé Integralement</option>
                  <option value="PARTIEL">Acompte / Payé Partiellement</option>
                  <option value="EN_RETARD">En Retard / Impayé</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
              >
                {editingPaiement ? 'Mettre à jour' : 'Générer le reçus & valider'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal 2: Totaux par Classe / Filière */}
      {isBilanModalOpen && (
        <Modal
          isOpen={isBilanModalOpen}
          onClose={() => setIsBilanModalOpen(false)}
          title="Bilan Financier Synthétique - Totaux par Classe & Filière"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {financialTotalsByClass.map((item) => (
                <div key={item.classe} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900">{item.classe}</h4>
                    <p className="text-[11px] text-slate-500">{item.count} versement(s) enregistrés</p>
                  </div>
                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    {item.total.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsBilanModalOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs"
              >
                Fermer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal 3: History of Payments */}
      {historyStudentPaiement && (
        <Modal
          isOpen={!!historyStudentPaiement}
          onClose={() => setHistoryStudentPaiement(null)}
          title={`Historique des Règlements - ${historyStudentPaiement.nom}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900">{historyStudentPaiement.nom}</h4>
                <p className="text-slate-500 font-mono text-[11px]">{historyStudentPaiement.matricule} - {historyStudentPaiement.classe}</p>
              </div>
              <span className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-full text-[11px]">
                {paiements.filter((p) => p.eleve_nom === historyStudentPaiement.nom).length} tranches réglées
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {paiements
                .filter((p) => p.eleve_nom === historyStudentPaiement.nom)
                .map((p) => (
                  <div key={p.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">{p.tranche} ({p.reference_recu})</span>
                      <span className="text-[11px] text-slate-500">{p.date_paiement} via {p.mode_paiement}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-700 text-xs">
                      {p.montant.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setHistoryStudentPaiement(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs"
              >
                Fermer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Viewing Receipt PDF Viewer */}
      {viewingReceipt && (
        <DocumentViewer
          document={viewingReceipt}
          onClose={() => setViewingReceipt(null)}
        />
      )}
    </div>
  );
};
