import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { schoolService } from '../services/schoolService';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Badge } from '../components/common/Badge';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Phone,
  Mail,
  Shield,
  GraduationCap,
  Briefcase,
  Users2,
} from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRoleFilter, setActiveRoleFilter] = useState<string>('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Form states
  const [formData, setFormData] = useState<Partial<User>>({
    first_name: '',
    last_name: '',
    email: '',
    role: 'ELEVE',
    phone: '',
    address: '',
    classe_nom: 'Terminale S1',
    specialite: 'Mathématiques',
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await schoolService.getUsers();
      setUsers(data);
    } catch (err) {
      showToast('Erreur lors du chargement des utilisateurs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      role: 'ELEVE',
      phone: '',
      address: '',
      classe_nom: '3ème B',
      specialite: 'Littérature',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u: User) => {
    setEditingUser(u);
    setFormData({ ...u });
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await schoolService.updateUser(editingUser.id, formData);
        showToast('Utilisateur mis à jour avec succès', 'success');
      } else {
        await schoolService.createUser(formData);
        showToast('Nouvel utilisateur créé avec succès dans Django DRF', 'success');
      }
      setIsModalOpen(false);
      loadUsers();
    } catch {
      showToast('Erreur lors de l\'enregistrement', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    try {
      await schoolService.deleteUser(deletingUser.id);
      showToast('Utilisateur supprimé définitivement', 'success');
      setDeletingUser(null);
      loadUsers();
    } catch {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  // Filtering
  const filteredUsers = users.filter((u) => {
    const matchesRole = activeRoleFilter === 'ALL' || u.role === activeRoleFilter;
    const matchesSearch =
      `${u.first_name} ${u.last_name} ${u.email} ${u.matricule || ''}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Action Header matching screenshot layout */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Gestion des Utilisateurs
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Administrateurs, Enseignants, Élèves & Parents enregistrés dans le système
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          Ajouter un utilisateur
        </button>
      </div>

      {/* Role Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: 'Tous', count: users.length },
              { id: 'ADMIN', label: 'Administrateurs', count: users.filter((u) => u.role === 'ADMIN').length },
              { id: 'EDUCATEUR', label: 'Éducateurs', count: users.filter((u) => u.role === 'EDUCATEUR').length },
              { id: 'ENSEIGNANT', label: 'Enseignants', count: users.filter((u) => u.role === 'ENSEIGNANT').length },
              { id: 'ELEVE', label: 'Élèves', count: users.filter((u) => u.role === 'ELEVE').length },
              { id: 'PARENT', label: 'Parents', count: users.filter((u) => u.role === 'PARENT').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveRoleFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeRoleFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label} <span className="text-[10px] opacity-80">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, matricule..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Users Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-bold uppercase text-[10px]">
                <th className="p-3">Utilisateur</th>
                <th className="p-3">Rôle & Matricule</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Spécialité / Classe</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            u.avatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
                          }
                          alt="Avatar"
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            {u.first_name} {u.last_name}
                          </p>
                          <p className="text-[11px] text-slate-500">{u.username}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="space-y-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            u.role === 'ADMIN'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'EDUCATEUR'
                              ? 'bg-rose-100 text-rose-800'
                              : u.role === 'ENSEIGNANT'
                              ? 'bg-blue-100 text-blue-800'
                              : u.role === 'ELEVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {u.role}
                        </span>
                        <p className="text-[10px] font-mono text-slate-400">
                          {u.matricule || 'N/A'}
                        </p>
                      </div>
                    </td>

                    <td className="p-3 text-slate-600">
                      <p className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {u.email}
                      </p>
                      {u.phone && (
                        <p className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {u.phone}
                        </p>
                      )}
                    </td>

                    <td className="p-3 font-medium text-slate-700">
                      {u.role === 'EDUCATEUR' && (u.specialite || 'Vie Scolaire & Encadrement')}
                      {u.role === 'ENSEIGNANT' && (u.specialite || 'Enseignant polyvalent')}
                      {u.role === 'ELEVE' && (u.classe_nom || 'Non affecté')}
                      {u.role === 'PARENT' && `Parent de (${u.children_ids?.length || 1} élève)`}
                      {u.role === 'ADMIN' && 'Administration générale'}
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Éditer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingUser(u)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Modifier l\'utilisateur' : 'Créer un nouvel utilisateur DRF'}
        subtitle="Renseignez les champs du modèle utilisateur Django REST"
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700">Prénom</label>
              <input
                type="text"
                required
                value={formData.first_name || ''}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Nom</label>
              <input
                type="text"
                required
                value={formData.last_name || ''}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700">Adresse Email</label>
              <input
                type="email"
                required
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Rôle Système</label>
              <select
                value={formData.role || 'ELEVE'}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-600"
              >
                <option value="ADMIN">Administrateur</option>
                <option value="EDUCATEUR">Éducateur (Vie Scolaire)</option>
                <option value="ENSEIGNANT">Enseignant</option>
                <option value="ELEVE">Élève</option>
                <option value="PARENT">Parent d'élève</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700">Téléphone</label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+225 07 00 00 00 00"
                className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">
                {formData.role === 'ENSEIGNANT' ? 'Spécialité' : 'Classe Affectée'}
              </label>
              <input
                type="text"
                value={formData.role === 'ENSEIGNANT' ? formData.specialite || '' : formData.classe_nom || ''}
                onChange={(e) =>
                  formData.role === 'ENSEIGNANT'
                    ? setFormData({ ...formData, specialite: e.target.value })
                    : setFormData({ ...formData, classe_nom: e.target.value })
                }
                placeholder={formData.role === 'ENSEIGNANT' ? 'ex: Mathématiques' : 'ex: Terminale S1'}
                className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal matching screenshot provided in user prompt! */}
      <ConfirmModal
        isOpen={!!deletingUser}
        title="Supprimer cet utilisateur définitivement ?"
        message={`Êtes-vous sûr de vouloir supprimer ${deletingUser?.first_name} ${deletingUser?.last_name} (${deletingUser?.username}) ?`}
        confirmLabel="Confirmer"
        cancelLabel="Annuler"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingUser(null)}
      />
    </div>
  );
};
