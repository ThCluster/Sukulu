import React, { useState, useEffect, useMemo } from 'react';
import { DocumentScolaire, User, Classe, Filiere } from '../types';
import { schoolService } from '../services/schoolService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { DocumentViewer } from '../components/common/DocumentViewer';
import { Modal } from '../components/common/Modal';
import {
  FileCheck2,
  Search,
  Download,
  Printer,
  FileText,
  Award,
  GraduationCap,
  Sparkles,
  Filter,
  Users,
  Send,
  RefreshCw,
  Mail,
  CheckCircle2,
  FileSpreadsheet,
  Building2,
  Calendar,
  Layers,
  FileCode,
  Eye,
} from 'lucide-react';

const ACADEMIC_YEARS = ['2025-2026', '2024-2025', '2023-2024'];
const NIVEAUX = ['Tous Niveaux', 'Collège', 'Lycée', 'Licence', 'Master'];
const TRIMESTRES = [
  { id: 'ALL', label: 'Tous les Trimestres / Semestres' },
  { id: 'TRIMESTRE_1', label: '1er Trimestre' },
  { id: 'TRIMESTRE_2', label: '2ème Trimestre' },
  { id: 'TRIMESTRE_3', label: '3ème Trimestre' },
  { id: 'SEMESTRE_1', label: '1er Semestre' },
  { id: 'SEMESTRE_2', label: '2ème Semestre' },
];

export const DocumentsPage: React.FC = () => {
  const { showToast } = useToast();
  const { user, activeRole } = useAuth();

  const [documents, setDocuments] = useState<DocumentScolaire[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [loading, setLoading] = useState(true);

  // Hierarchical Filter State
  const [selectedAnnee, setSelectedAnnee] = useState<string>('2025-2026');
  const [selectedFiliere, setSelectedFiliere] = useState<string>('ALL');
  const [selectedNiveau, setSelectedNiveau] = useState<string>('Tous Niveaux');
  const [selectedClasse, setSelectedClasse] = useState<string>('ALL');
  const [selectedTrimestre, setSelectedTrimestre] = useState<string>('TRIMESTRE_1');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination & Sort
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // View & Modal States
  const [viewingDocument, setViewingDocument] = useState<DocumentScolaire | null>(null);
  const [emailModalStudent, setEmailModalStudent] = useState<User | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [docList, stList, cList, fList] = await Promise.all([
        schoolService.getDocuments(),
        schoolService.getUsers('ELEVE'),
        schoolService.getClasses(),
        schoolService.getFilieres(),
      ]);
      setDocuments(docList);
      setStudents(stList);
      setClasses(cList);
      setFilieres(fList);
    } catch {
      showToast('Erreur lors du chargement des documents scolaires', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Cascading classes list based on selected Filière & Niveau
  const availableClasses = useMemo(() => {
    let result = classes;
    if (selectedFiliere !== 'ALL') {
      const filObj = filieres.find((f) => f.nom === selectedFiliere || f.code === selectedFiliere);
      if (filObj) {
        result = result.filter(
          (c) => c.filiere_id === filObj.id || c.filiere_nom === filObj.nom || c.nom.includes(filObj.code)
        );
      }
    }
    if (selectedNiveau !== 'Tous Niveaux') {
      result = result.filter((c) => c.niveau === selectedNiveau || c.nom.toLowerCase().includes(selectedNiveau.toLowerCase()));
    }
    return result;
  }, [classes, filieres, selectedFiliere, selectedNiveau]);

  // Main Students List with calculated grade decision for document generation
  const processedStudents = useMemo(() => {
    return students.map((s) => {
      // Mock or calculated average grade for student
      const rawMoyenne = s.id % 2 === 0 ? 15.2 : 12.8;
      const decision = rawMoyenne >= 10 ? 'Admis(e)' : 'Ajourné(e)';
      const avatar = s.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120';
      const classeName = s.classe_nom || 'Terminale S1';
      const filiereName = s.filiere_nom || (classeName.includes('S') ? 'Sciences & Technologies' : 'Lettres & Humaines');

      return {
        ...s,
        moyenne: rawMoyenne,
        decision,
        avatar,
        classeName,
        filiereName,
      };
    });
  }, [students]);

  // Filtered Students List according to hierarchical selection
  const filteredStudents = useMemo(() => {
    return processedStudents.filter((st) => {
      // Filière Filter
      if (selectedFiliere !== 'ALL' && st.filiereName !== selectedFiliere) {
        return false;
      }

      // Classe Filter
      if (selectedClasse !== 'ALL' && st.classeName !== selectedClasse) {
        return false;
      }

      // Text Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = `${st.first_name} ${st.last_name}`.toLowerCase().includes(q);
        const matchesMatricule = st.matricule ? st.matricule.toLowerCase().includes(q) : false;
        const matchesClasse = st.classeName.toLowerCase().includes(q);

        if (!matchesName && !matchesMatricule && !matchesClasse) {
          return false;
        }
      }

      return true;
    });
  }, [processedStudents, selectedFiliere, selectedClasse, searchQuery]);

  // Paginated Rows
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStudents, currentPage]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;

  // Document Generation Handlers
  const handleGenerateDoc = async (
    type: 'BULLETIN' | 'CERTIFICAT_SCOLARITE' | 'ATTESTATION_INSCRIPTION' | 'RELEVE_NOTES',
    st: any
  ) => {
    // If student role, suppress bulletin generation as per rule
    if (activeRole === 'ELEVE' && type === 'BULLETIN') {
      showToast('La consultation directe des bulletins de notes est restreinte dans votre espace.', 'warning');
      return;
    }

    let title = '';
    if (type === 'BULLETIN') title = `Bulletin Officiel - ${selectedTrimestre}`;
    else if (type === 'CERTIFICAT_SCOLARITE') title = 'Certificat de Scolarité Officiel';
    else if (type === 'ATTESTATION_INSCRIPTION') title = 'Attestation d\'Inscription et de Présence';
    else title = 'Relevé de Notes Certifié';

    const newDoc = await schoolService.createDocument({
      type: type as any,
      titre: title,
      eleve_id: st.id,
      eleve_nom: `${st.first_name} ${st.last_name}`,
      eleve_matricule: st.matricule || 'SKL-2025-01',
      classe_nom: st.classeName,
      annee_academique: selectedAnnee,
      trimestre: selectedTrimestre as any,
      metadata: {
        moyenne: `${st.moyenne}/20`,
        decision: st.decision,
        filiere: st.filiereName,
      },
    });

    setViewingDocument(newDoc);
    showToast(`${title} généré avec succès pour ${st.first_name} ${st.last_name} !`, 'success');
  };

  // Email Dialog Open
  const handleOpenEmailModal = (st: User) => {
    setEmailModalStudent(st);
    setEmailSubject(`Sukulu App - Document Officiel pour ${st.first_name} ${st.last_name}`);
    setEmailBody(
      `Madame, Monsieur,\n\nVeuillez trouver ci-joint les documents officiels relatifs à la scolarité de ${st.first_name} ${st.last_name} (${st.matricule}) au titre de l'année académique ${selectedAnnee}.\n\nCordialement,\nDirection de l'Administration Scolaire.`
    );
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Email avec documents PDF transmis à ${emailModalStudent?.email || 'l\'étudiant'} !`, 'success');
    setEmailModalStudent(null);
  };

  // Print simulation
  const handlePrintDocument = (st: any) => {
    showToast(`Impression directe lancée sur l'imprimante réseau pour ${st.first_name} ${st.last_name}...`, 'info');
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-indigo-600" />
            Centre Générateur de Documents Officiels
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Filtres hiérarchiques par classe et génération instantanée des Bulletins, Certificats de scolarité, Attestations & Relevés de notes.
          </p>
        </div>
      </div>

      {/* Top Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Documents Générés</p>
            <h3 className="text-2xl font-black text-indigo-600 mt-1">{documents.length + 142}</h3>
            <p className="text-[11px] text-indigo-700 font-medium mt-1">Empreinte numérique certifiée</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FileCheck2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Certificats Délivrés</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">98</h3>
            <p className="text-[11px] text-emerald-700 font-medium mt-1">Attestations de scolarité</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bulletins de Notes</p>
            <h3 className="text-2xl font-black text-blue-600 mt-1">384</h3>
            <p className="text-[11px] text-blue-700 font-medium mt-1">Trimestre 1 & 2 validés</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Envois par Email</p>
            <h3 className="text-2xl font-black text-purple-600 mt-1">210</h3>
            <p className="text-[11px] text-purple-700 font-medium mt-1">Transmis aux tuteurs légaux</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Mail className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Hierarchical Filter Ribbon (Année -> Filière -> Niveau -> Classe -> Semestre -> Étudiant) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600" />
            Sélection Hiérarchique Préalable à la Génération
          </h3>
          <button
            onClick={() => {
              setSelectedAnnee('2025-2026');
              setSelectedFiliere('ALL');
              setSelectedNiveau('Tous Niveaux');
              setSelectedClasse('ALL');
              setSelectedTrimestre('TRIMESTRE_1');
              setSearchQuery('');
              setCurrentPage(1);
            }}
            className="text-[11px] text-indigo-600 font-bold hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Réinitialiser
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
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
              <option value="ALL">Toutes les filières</option>
              {filieres.map((f) => (
                <option key={f.id} value={f.nom}>{f.nom}</option>
              ))}
            </select>
          </div>

          {/* Niveau */}
          <div>
            <label className="font-bold text-slate-600 block mb-1">Niveau</label>
            <select
              value={selectedNiveau}
              onChange={(e) => setSelectedNiveau(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
            >
              {NIVEAUX.map((n) => (
                <option key={n} value={n}>{n}</option>
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

          {/* Semestre */}
          <div>
            <label className="font-bold text-slate-600 block mb-1">Période / Semestre</label>
            <select
              value={selectedTrimestre}
              onChange={(e) => setSelectedTrimestre(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
            >
              {TRIMESTRES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Recherche Étudiant */}
          <div>
            <label className="font-bold text-slate-600 block mb-1">Recherche Étudiant</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Nom ou matricule..."
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
            <Users className="w-4 h-4 text-indigo-600" />
            Liste des Étudiants Eligibles aux Documents Officiels ({filteredStudents.length} étudiants)
          </h3>
          <span className="text-xs text-slate-500 font-semibold">
            Sélectionnez une action de génération ci-dessous
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs font-semibold">
            Chargement de la liste des étudiants...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-800">Aucun étudiant ne correspond à cette sélection</p>
            <p className="text-xs text-slate-500">Veuillez ajuster les filtres de la barre hiérarchique ci-dessus.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Photo & Étudiant</th>
                  <th className="py-3 px-4">Matricule</th>
                  <th className="py-3 px-4">Classe & Filière</th>
                  <th className="py-3 px-4 text-center">Moyenne Générale</th>
                  <th className="py-3 px-4 text-center">Décision Jury</th>
                  <th className="py-3 px-4 text-right">Actions de Génération Officielle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Photo & Nom */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img src={st.avatar} alt={st.first_name} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                        <div>
                          <span className="font-bold text-slate-900 block">{st.first_name} {st.last_name}</span>
                          <span className="text-[11px] text-slate-500">{st.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Matricule */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {st.matricule || 'SKL-2025-01'}
                    </td>

                    {/* Classe & Filière */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-slate-900 block">{st.classeName}</span>
                        <span className="text-[11px] text-slate-500">{st.filiereName}</span>
                      </div>
                    </td>

                    {/* Moyenne */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`font-black px-2.5 py-1 rounded-xl border ${
                          st.moyenne >= 14
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : st.moyenne >= 10
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {st.moyenne} / 20
                      </span>
                    </td>

                    {/* Décision */}
                    <td className="py-3.5 px-4 text-center">
                      {st.decision === 'Admis(e)' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full font-bold text-[10px]">
                          <CheckCircle2 className="w-3 h-3" /> Admis(e)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-100 text-rose-800 border border-rose-200 rounded-full font-bold text-[10px]">
                          Ajourné(e)
                        </span>
                      )}
                    </td>

                    {/* Actions de Génération */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        {/* Bulletin (Hidden for ELEVE) */}
                        {activeRole !== 'ELEVE' && (
                          <button
                            onClick={() => handleGenerateDoc('BULLETIN', st)}
                            title="Générer le Bulletin de Notes PDF"
                            className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-bold hover:bg-blue-100 transition-all flex items-center gap-1 text-[11px]"
                          >
                            <Award className="w-3.5 h-3.5 text-blue-600" /> Bulletin
                          </button>
                        )}

                        {/* Certificat Scolarité */}
                        <button
                          onClick={() => handleGenerateDoc('CERTIFICAT_SCOLARITE', st)}
                          title="Générer le Certificat de Scolarité"
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-bold hover:bg-emerald-100 transition-all flex items-center gap-1 text-[11px]"
                        >
                          <GraduationCap className="w-3.5 h-3.5 text-emerald-600" /> Certificat
                        </button>

                        {/* Attestation */}
                        <button
                          onClick={() => handleGenerateDoc('ATTESTATION_INSCRIPTION', st)}
                          title="Générer l'Attestation d'Inscription"
                          className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg font-bold hover:bg-purple-100 transition-all flex items-center gap-1 text-[11px]"
                        >
                          <FileText className="w-3.5 h-3.5 text-purple-600" /> Attestation
                        </button>

                        {/* Relevé de notes */}
                        <button
                          onClick={() => handleGenerateDoc('RELEVE_NOTES' as any, st)}
                          title="Générer le Relevé de Notes"
                          className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg font-bold hover:bg-amber-100 transition-all flex items-center gap-1 text-[11px]"
                        >
                          Relevé
                        </button>

                        {/* Imprimer */}
                        <button
                          onClick={() => handlePrintDocument(st)}
                          title="Imprimer directement"
                          className="p-1.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-200 transition-all"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Envoyer par Email */}
                        <button
                          onClick={() => handleOpenEmailModal(st)}
                          title="Transmettre par Email"
                          className="p-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-all"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <span>
            Affichage de {paginatedStudents.length} sur {filteredStudents.length} étudiants
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

      {/* Modal: Email Composition Dialog */}
      {emailModalStudent && (
        <Modal
          isOpen={!!emailModalStudent}
          onClose={() => setEmailModalStudent(null)}
          title={`Envoi de Documents par Email à ${emailModalStudent.first_name} ${emailModalStudent.last_name}`}
        >
          <form onSubmit={handleSendEmail} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Destinataire *</label>
              <input
                type="email"
                readOnly
                value={emailModalStudent.email || 'eleve@sukulu.edu'}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-700"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Objet du Message *</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Corps du Message *</label>
              <textarea
                rows={5}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 text-[11px] flex items-center justify-between">
              <span className="font-bold">Pièces Jointes Sécurisées PDF :</span>
              <span>Bulletin, Certificat, Relevé (Inclus)</span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEmailModalStudent(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Envoyer l'email
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <DocumentViewer
          document={viewingDocument}
          onClose={() => setViewingDocument(null)}
        />
      )}
    </div>
  );
};
