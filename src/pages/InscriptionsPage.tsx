import React, { useState, useEffect } from 'react';
import { Inscription, StatutInscription, DocumentScolaire } from '../types';
import { schoolService } from '../services/schoolService';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/common/Modal';
import { DocumentViewer } from '../components/common/DocumentViewer';
import { Badge } from '../components/common/Badge';
import {
  GraduationCap,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  FileCheck,
  FileText,
  UserCheck,
  Phone,
  ShieldAlert,
} from 'lucide-react';

export const InscriptionsPage: React.FC = () => {
  const { showToast } = useToast();
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  // Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<DocumentScolaire | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Inscription>>({
    eleve_nom: '',
    eleve_prenom: '',
    eleve_email: '',
    classe_nom: '3ème B',
    filiere_nom: 'Enseignement Général',
    frais_totaux: 420000,
    frais_payes: 200000,
    parent_nom: '',
    parent_telephone: '',
    documents_fournis: {
      acte_naissance: true,
      bulletin_anterieur: true,
      photo_identite: true,
    },
  });

  const loadInscriptions = async () => {
    setLoading(true);
    try {
      const data = await schoolService.getInscriptions();
      setInscriptions(data);
    } catch {
      showToast('Erreur lors du chargement des inscriptions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInscriptions();
  }, []);

  const handleCreateInscription = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await schoolService.createInscription({
        ...formData,
        statut: 'EN_ATTENTE',
      });
      showToast('Nouvelle demande d\'inscription enregistrée avec succès !', 'success');
      setIsNewModalOpen(false);
      loadInscriptions();
    } catch {
      showToast('Erreur lors de l\'enregistrement', 'error');
    }
  };

  const handleUpdateStatus = async (id: number, status: StatutInscription) => {
    try {
      await schoolService.updateInscriptionStatus(id, status);
      showToast(
        `Statut d'inscription mis à jour : ${status === 'VALIDE' ? 'Validé' : 'Rejeté'}`,
        'success'
      );
      loadInscriptions();
    } catch {
      showToast('Erreur lors de la mise à jour du statut', 'error');
    }
  };

  const handleGenerateCertificat = async (inst: Inscription) => {
    const doc = await schoolService.createDocument({
      reference: `CERT-2025-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'CERTIFICAT_SCOLARITE',
      titre: 'Certificat de Scolarité Officiel',
      eleve_id: inst.eleve_id,
      eleve_nom: `${inst.eleve_prenom} ${inst.eleve_nom}`,
      eleve_matricule: inst.matricule,
      classe_nom: inst.classe_nom,
      annee_academique: inst.annee_academique,
    });
    setViewingDoc(doc);
  };

  const filtered = inscriptions.filter((i) => {
    const matchesStatus = activeFilter === 'ALL' || i.statut === activeFilter;
    const matchesSearch = `${i.eleve_nom} ${i.eleve_prenom} ${i.matricule} ${i.classe_nom}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-600" />
            Gestion des Inscriptions & Réinscriptions
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Validation des dossiers, pièces justificatives et certificats de scolarité
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          Inscrire un nouvel élève
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: 'Toutes les inscriptions' },
              { id: 'VALIDE', label: 'Validées' },
              { id: 'EN_ATTENTE', label: 'En attente' },
              { id: 'REJETE', label: 'Rejetées' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher élève, classe..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-bold uppercase text-[10px]">
                <th className="p-3">Matricule & Élève</th>
                <th className="p-3">Classe & Filière</th>
                <th className="p-3">Parent / Tuteur</th>
                <th className="p-3">Pièces fournies</th>
                <th className="p-3">Statut</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((inst) => (
                <tr key={inst.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3">
                    <p className="font-bold text-slate-900 text-sm">
                      {inst.eleve_prenom} {inst.eleve_nom}
                    </p>
                    <p className="text-[10px] font-mono font-bold text-slate-500">{inst.matricule}</p>
                  </td>

                  <td className="p-3">
                    <p className="font-bold text-slate-800">{inst.classe_nom}</p>
                    <p className="text-[11px] text-slate-500">{inst.filiere_nom}</p>
                  </td>

                  <td className="p-3 text-slate-700">
                    <p className="font-semibold">{inst.parent_nom || 'Non renseigné'}</p>
                    <p className="text-[11px] text-slate-500">{inst.parent_telephone}</p>
                  </td>

                  <td className="p-3">
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold ${
                          inst.documents_fournis.acte_naissance
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        Acte Naissance
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold ${
                          inst.documents_fournis.bulletin_anterieur
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        Bulletin
                      </span>
                    </div>
                  </td>

                  <td className="p-3">
                    <Badge status={inst.statut} />
                  </td>

                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {inst.statut === 'EN_ATTENTE' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(inst.id, 'VALIDE')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition-colors shadow-xs"
                          >
                            Valider
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(inst.id, 'REJETE')}
                            className="px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 font-semibold text-[11px] rounded-lg transition-colors"
                          >
                            Rejeter
                          </button>
                        </>
                      )}

                      {inst.statut === 'VALIDE' && (
                        <button
                          onClick={() => handleGenerateCertificat(inst)}
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-400" />
                          Certificat
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Inscription Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Formulaire d'Inscription Élève"
        subtitle="Enregistrement d'un nouvel élève dans l'établissement"
      >
        <form onSubmit={handleCreateInscription} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700">Prénom de l'Élève</label>
              <input
                type="text"
                required
                value={formData.eleve_prenom || ''}
                onChange={(e) => setFormData({ ...formData, eleve_prenom: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Nom de l'Élève</label>
              <input
                type="text"
                required
                value={formData.eleve_nom || ''}
                onChange={(e) => setFormData({ ...formData, eleve_nom: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700">Classe Demandée</label>
              <select
                value={formData.classe_nom || '3ème B'}
                onChange={(e) => setFormData({ ...formData, classe_nom: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="6ème A">6ème A</option>
                <option value="3ème B">3ème B</option>
                <option value="Terminale S1">Terminale S1</option>
                <option value="Terminale L1">Terminale L1</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Email Élève (Optionnel)</label>
              <input
                type="email"
                value={formData.eleve_email || ''}
                onChange={(e) => setFormData({ ...formData, eleve_email: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700">Nom du Parent / Tuteur</label>
              <input
                type="text"
                required
                value={formData.parent_nom || ''}
                onChange={(e) => setFormData({ ...formData, parent_nom: e.target.value })}
                placeholder="ex: M. Ibrahima Sow"
                className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Téléphone Parent</label>
              <input
                type="text"
                required
                value={formData.parent_telephone || ''}
                onChange={(e) => setFormData({ ...formData, parent_telephone: e.target.value })}
                placeholder="+221 77 000 00 00"
                className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <p className="text-xs font-bold text-slate-800">Documents / Pièces Fournies</p>
            <div className="flex items-center gap-4 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.documents_fournis?.acte_naissance}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      documents_fournis: {
                        ...formData.documents_fournis!,
                        acte_naissance: e.target.checked,
                      },
                    })
                  }
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Acte de Naissance</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.documents_fournis?.bulletin_anterieur}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      documents_fournis: {
                        ...formData.documents_fournis!,
                        bulletin_anterieur: e.target.checked,
                      },
                    })
                  }
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Bulletin Antérieur</span>
              </label>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNewModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-sm"
            >
              Soumettre l'inscription
            </button>
          </div>
        </form>
      </Modal>

      {/* Document Viewer Modal */}
      {viewingDoc && (
        <Modal
          isOpen={!!viewingDoc}
          onClose={() => setViewingDoc(null)}
          title="Document Officiel Généré"
          subtitle="Impression et téléchargement du certificat"
          maxWidth="3xl"
        >
          <DocumentViewer document={viewingDoc} onClose={() => setViewingDoc(null)} />
        </Modal>
      )}
    </div>
  );
};
