import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { schoolService } from '../services/schoolService';
import { SeanceEmploiDuTemps, Classe, User, JourSemaine, TypeSeance } from '../types';
import { TimetableGrid } from '../components/timetable/TimetableGrid';
import { Modal } from '../components/common/Modal';
import {
  CalendarDays,
  Users,
  GraduationCap,
  Building2,
  Plus,
  Clock,
  BookOpen,
  Filter,
  UserCheck,
  CheckCircle2,
  Sparkles,
  MapPin,
  Calendar,
} from 'lucide-react';

interface TimetablePageProps {
  onNavigate?: (tab: string) => void;
}

export const TimetablePage: React.FC<TimetablePageProps> = ({ onNavigate }) => {
  const { user, activeRole } = useAuth();
  const { showToast } = useToast();

  const [seances, setSeances] = useState<SeanceEmploiDuTemps[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [selectedClasseId, setSelectedClasseId] = useState<number>(3); // Default Terminale S1
  const [loading, setLoading] = useState(true);

  // For Parent View: list of children
  const [parentChildren, setParentChildren] = useState<User[]>([]);
  const [selectedChild, setSelectedChild] = useState<User | null>(null);

  // For Admin / Creation modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSeance, setNewSeance] = useState<{
    jour: JourSemaine;
    heure_debut: string;
    heure_fin: string;
    matiere_nom: string;
    enseignant_nom: string;
    salle: string;
    type: TypeSeance;
    description: string;
    materiel_requis: string;
    couleur: string;
  }>({
    jour: 'LUNDI',
    heure_debut: '08:00',
    heure_fin: '10:00',
    matiere_nom: '',
    enseignant_nom: '',
    salle: '',
    type: 'COURS',
    description: '',
    materiel_requis: '',
    couleur: 'blue',
  });

  // 1. Initial Load: Fetch Classes & Sessions & Children (if parent)
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const [allClasses, allSeances] = await Promise.all([
          schoolService.getClasses(),
          schoolService.getEmploiDuTemps(),
        ]);
        setClasses(allClasses);
        setSeances(allSeances);

        // If user is ELEVE: default directly to their class
        if (activeRole === 'ELEVE') {
          const studentClassId = user?.classe_id || 3;
          setSelectedClasseId(studentClassId);
        }

        // If user is PARENT: fetch their children and identify their son/daughter
        if (activeRole === 'PARENT') {
          const allStudents = await schoolService.getUsers('ELEVE');
          let children = allStudents.filter((u) => {
            if (user?.children_ids && user.children_ids.length > 0) {
              return user.children_ids.includes(u.id);
            }
            if (user?.last_name && u.last_name.toLowerCase() === user.last_name.toLowerCase()) {
              return true;
            }
            return u.id === 7 || u.id === 4 || u.last_name === 'Sow';
          });

          if (children.length === 0 && allStudents.length > 0) {
            children = [allStudents[0]];
          }

          setParentChildren(children);

          // Find son (Mamadou Sow id 7 or male student) or first child
          const son = children.find(
            (c) => c.first_name.toLowerCase() === 'mamadou' || c.username.includes('mamadou') || c.id === 7
          );
          const initialChild = son || children[0];
          setSelectedChild(initialChild);

          if (initialChild && initialChild.classe_id) {
            setSelectedClasseId(initialChild.classe_id);
          } else if (initialChild?.classe_nom?.includes('3ème')) {
            setSelectedClasseId(2);
          } else {
            setSelectedClasseId(3);
          }
        }
      } catch (err) {
        console.error('Error loading timetable data:', err);
        showToast('Erreur lors du chargement de l\'emploi du temps', 'error');
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [activeRole, user]);

  // When Parent selects another child (e.g. Son vs Daughter)
  const handleSelectChild = (child: User) => {
    setSelectedChild(child);
    const childClassId = child.classe_id || (child.classe_nom?.includes('3ème') ? 2 : 3);
    setSelectedClasseId(childClassId);
    showToast(
      `Affichage de l'emploi du temps de ${child.first_name} ${child.last_name} (${child.classe_nom || 'Classe'})`,
      'info'
    );
  };

  // Filter sessions for the selected class
  const classSeances = seances.filter((s) => s.classe_id === selectedClasseId);
  const currentClasse = classes.find((c) => c.id === selectedClasseId);

  // Handle Add Seance (Admin)
  const handleSaveSeance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSeance.matiere_nom || !newSeance.enseignant_nom || !newSeance.salle) {
      showToast('Veuillez renseigner tous les champs obligatoires', 'warning');
      return;
    }

    try {
      const created = await schoolService.createSeance({
        ...newSeance,
        classe_id: selectedClasseId,
        classe_nom: currentClasse?.nom || 'Terminale S1',
      });
      setSeances((prev) => [created, ...prev]);
      setIsAddModalOpen(false);
      showToast('Séance ajoutée avec succès à l\'emploi du temps', 'success');
      setNewSeance({
        jour: 'LUNDI',
        heure_debut: '08:00',
        heure_fin: '10:00',
        matiere_nom: '',
        enseignant_nom: '',
        salle: '',
        type: 'COURS',
        description: '',
        materiel_requis: '',
        couleur: 'blue',
      });
    } catch (err) {
      showToast('Erreur lors de l\'ajout de la séance', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Chargement de l'emploi du temps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* BANNER 1 : PARENT VIEW BANNER WITH CHILD SELECTOR       */}
      {/* ======================================================== */}
      {activeRole === 'PARENT' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-full border border-amber-200 mb-2">
                <Users className="w-3.5 h-3.5 text-amber-600" /> Espace Parents d'Élèves
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Emploi du temps de mes enfants
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Consultez en temps réel les horaires de cours, les salles et les professeurs de vos enfants inscrits dans l'établissement.
              </p>
            </div>

            {selectedChild && (
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm overflow-hidden">
                  {selectedChild.avatar ? (
                    <img src={selectedChild.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    `${selectedChild.first_name[0]}${selectedChild.last_name[0]}`
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {selectedChild.first_name} {selectedChild.last_name}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      {selectedChild.first_name.toLowerCase() === 'mamadou' ? 'Fils' : 'Fille'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Classe : {selectedChild.classe_nom || '3ème B'} • Mat: {selectedChild.matricule}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Child Selector Tabs */}
          <div className="mt-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Sélectionnez l'enfant à afficher :
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {parentChildren.map((child) => {
                const isSelected = selectedChild?.id === child.id;
                const isSon =
                  child.first_name.toLowerCase() === 'mamadou' ||
                  child.username.includes('mamadou') ||
                  child.id === 7;

                return (
                  <button
                    key={child.id}
                    onClick={() => handleSelectChild(child)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {child.first_name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black">
                            {child.first_name} {child.last_name}
                          </span>
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : isSon
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-pink-100 text-pink-700'
                            }`}
                          >
                            {isSon ? 'Fils' : 'Fille'}
                          </span>
                        </div>
                        <span
                          className={`text-[11px] block mt-0.5 ${
                            isSelected ? 'text-blue-100' : 'text-slate-500'
                          }`}
                        >
                          {child.classe_nom || '3ème B'} • {child.filiere_nom || 'Général'}
                        </span>
                      </div>
                    </div>

                    {isSelected && <CheckCircle2 className="w-5 h-5 text-white shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* BANNER 2 : ELEVE VIEW BANNER                            */}
      {/* ======================================================== */}
      {activeRole === 'ELEVE' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-500/20">
              <CalendarDays className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Mon Espace Élève
                </span>
                <span className="text-xs text-slate-400 font-medium">Semaine en cours</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                Emploi du temps — {user?.classe_nom || currentClasse?.nom || 'Terminale S1'}
              </h1>
              <p className="text-xs text-slate-500">
                Élève : <strong className="text-slate-700">{user?.first_name} {user?.last_name}</strong> • Matricule : {user?.matricule || 'SKL-2024-0089'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Volume horaire
              </span>
              <span className="text-sm font-black text-slate-900">
                {classSeances.length * 2} heures / semaine
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* BANNER 3 : ADMIN & ENSEIGNANT VIEW BANNER               */}
      {/* ======================================================== */}
      {(activeRole === 'ADMIN' || activeRole === 'ENSEIGNANT') && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200 mb-1.5">
              <Building2 className="w-3.5 h-3.5" /> Gestion Académique
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Emplois du Temps des Classes
            </h1>
            <p className="text-xs text-slate-500">
              Sélectionnez une classe pour consulter son planning ou ajouter une nouvelle séance de cours.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Class Selector Dropdown */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500">Classe :</span>
              <select
                value={selectedClasseId}
                onChange={(e) => setSelectedClasseId(Number(e.target.value))}
                className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom} ({c.code}) - {c.niveau}
                  </option>
                ))}
              </select>
            </div>

            {activeRole === 'ADMIN' && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un cours</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MAIN TIMETABLE GRID                                      */}
      {/* ======================================================== */}
      <TimetableGrid
        seances={classSeances}
        classNameTitle={currentClasse?.nom || 'Terminale S1'}
        subtitle={`Filière : ${currentClasse?.filiere_nom || 'Enseignement Général'} • Salle principale : ${
          currentClasse?.salle || 'Salle C-201'
        }`}
        studentName={
          activeRole === 'PARENT' && selectedChild
            ? `${selectedChild.first_name} ${selectedChild.last_name}`
            : activeRole === 'ELEVE' && user
            ? `${user.first_name} ${user.last_name}`
            : undefined
        }
        isParentView={activeRole === 'PARENT'}
        canEdit={activeRole === 'ADMIN'}
        onAddSeance={() => setIsAddModalOpen(true)}
      />

      {/* Modal: Admin Add Course Session */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={`Ajouter un cours — ${currentClasse?.nom || 'Classe'}`}
      >
        <form onSubmit={handleSaveSeance} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Jour de la semaine *</label>
              <select
                value={newSeance.jour}
                onChange={(e) => setNewSeance({ ...newSeance, jour: e.target.value as JourSemaine })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="LUNDI">Lundi</option>
                <option value="MARDI">Mardi</option>
                <option value="MERCREDI">Mercredi</option>
                <option value="JEUDI">Jeudi</option>
                <option value="VENDREDI">Vendredi</option>
                <option value="SAMEDI">Samedi</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Type de cours</label>
              <select
                value={newSeance.type}
                onChange={(e) => setNewSeance({ ...newSeance, type: e.target.value as TypeSeance })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="COURS">Cours magistral</option>
                <option value="TD">Travaux Dirigés (TD)</option>
                <option value="TP">Travaux Pratiques (TP)</option>
                <option value="EVALUATION">Évaluation / Devoir</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Heure de début *</label>
              <select
                value={newSeance.heure_debut}
                onChange={(e) => setNewSeance({ ...newSeance, heure_debut: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              >
                <option value="08:00">08:00</option>
                <option value="10:15">10:15</option>
                <option value="14:00">14:00</option>
                <option value="16:15">16:15</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Heure de fin *</label>
              <select
                value={newSeance.heure_fin}
                onChange={(e) => setNewSeance({ ...newSeance, heure_fin: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              >
                <option value="10:00">10:00</option>
                <option value="12:15">12:15</option>
                <option value="16:00">16:00</option>
                <option value="18:00">18:00</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Matière *</label>
            <input
              type="text"
              required
              placeholder="Ex: Mathématiques, Physique-Chimie, Français..."
              value={newSeance.matiere_nom}
              onChange={(e) => setNewSeance({ ...newSeance, matiere_nom: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Professeur *</label>
              <input
                type="text"
                required
                placeholder="Ex: M. Moussa Diop"
                value={newSeance.enseignant_nom}
                onChange={(e) => setNewSeance({ ...newSeance, enseignant_nom: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Salle *</label>
              <input
                type="text"
                required
                placeholder="Ex: Salle C-201, Labo L-02"
                value={newSeance.salle}
                onChange={(e) => setNewSeance({ ...newSeance, salle: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description / Chapitre</label>
            <textarea
              rows={2}
              placeholder="Ex: Chapitre 3 - Intégration et primitives..."
              value={newSeance.description}
              onChange={(e) => setNewSeance({ ...newSeance, description: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Matériel requis</label>
            <input
              type="text"
              placeholder="Ex: Blouse blanche, calculatrice, tenue de sport..."
              value={newSeance.materiel_requis}
              onChange={(e) => setNewSeance({ ...newSeance, materiel_requis: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/20"
            >
              Enregistrer le cours
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
