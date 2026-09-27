import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  KeyRound,
  Camera,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  Lock,
  UserCheck,
  Building,
  GraduationCap,
  Award,
  Calendar,
} from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=250',
];

export const ProfilePage: React.FC = () => {
  const { user, updateUser, activeRole } = useAuth();
  const { showToast } = useToast();

  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '+221 77 000 00 00');
  const [address, setAddress] = useState(user?.address || 'Dakar, Sénégal');
  const [specialite, setSpecialite] = useState(user?.specialite || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || PRESET_AVATARS[0]);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      showToast('Veuillez remplir tous les champs obligatoires.', 'error');
      return;
    }

    updateUser({
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
      address: address,
      specialite: specialite,
      avatar: avatarUrl,
    });

    showToast('Profil mis à jour avec succès !', 'success');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Veuillez saisir votre mot de passe actuel.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Le nouveau mot de passe doit contenir au moins 6 caractères.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Les mots de passe ne correspondent pas.', 'error');
      return;
    }

    setIsChangingPassword(true);
    setTimeout(() => {
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Mot de passe modifié avec succès !', 'success');
    }, 600);
  };

  const getRoleBadge = () => {
    switch (activeRole) {
      case 'ADMIN':
        return <span className="px-3 py-1 bg-purple-100 text-purple-800 border border-purple-200 rounded-full text-xs font-bold">Administrateur Système</span>;
      case 'ENSEIGNANT':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 border border-blue-200 rounded-full text-xs font-bold">Enseignant / Professeur</span>;
      case 'ELEVE':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold">Élève Récurant</span>;
      case 'PARENT':
        return <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-xs font-bold">Parent d'élève Tuteur</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <UserIcon className="w-6 h-6 text-blue-600" />
          Mon Profil Utilisateur
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Consultez et modifiez vos informations personnelles, votre photo de profil et votre mot de passe.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card: Summary & Avatar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-4">
            <div className="relative inline-block mx-auto">
              <img
                src={avatarUrl}
                alt={firstName}
                className="w-28 h-28 rounded-full object-cover border-4 border-slate-100 shadow-md mx-auto"
              />
              <div className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg border-2 border-white">
                <Camera className="w-4 h-4" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">
                {firstName} {lastName}
              </h3>
              <p className="text-xs font-mono text-slate-500 mt-0.5">@{user?.username}</p>
              <div className="mt-2 flex justify-center">{getRoleBadge()}</div>
            </div>

            {/* Quick Stats / Info */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-left text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-emerald-700 font-semibold">Compte Actif & Vérifié</span>
              </div>
            </div>
          </div>

          {/* Preset Avatar Selector */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Choisir une photo de profil
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_AVATARS.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatarUrl(url)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                    avatarUrl === url ? 'border-blue-600 scale-105 shadow-sm' : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`Avatar ${idx + 1}`} className="w-full h-16 object-cover" />
                  {avatarUrl === url && (
                    <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="pt-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Ou URL d'image personnalisée :
              </label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Right Forms: Personal Info + Password */}
        <div className="lg:col-span-2 space-y-6">
          {/* Form 1: Informations Personnelles */}
          <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  Informations Personnelles
                </h3>
                <p className="text-[11px] text-slate-500">Mettez à jour vos coordonnés identitaires</p>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all"
              >
                <Save className="w-4 h-4" />
                Enregistrer les modifications
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Prénom *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nom de famille *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Adresse Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Numéro de Téléphone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium text-slate-800"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Adresse Domiciliaire</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium text-slate-800"
                />
              </div>

              {activeRole === 'ENSEIGNANT' && (
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Spécialité Enseignée</label>
                  <input
                    type="text"
                    value={specialite}
                    onChange={(e) => setSpecialite(e.target.value)}
                    placeholder="e.g. Mathématiques, Physique-Chimie, Français"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium text-slate-800"
                  />
                </div>
              )}
            </div>
          </form>

          {/* Form 2: Changer le Mot de Passe */}
          <form onSubmit={handleChangePassword} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-600" />
                  Sécurité & Mot de Passe
                </h3>
                <p className="text-[11px] text-slate-500">Changer votre mot de passe d'accès au portail</p>
              </div>
              <button
                type="submit"
                disabled={isChangingPassword}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <KeyRound className="w-4 h-4" />
                {isChangingPassword ? 'Changement...' : 'Changer le mot de passe'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Mot de passe actuel *</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-mono text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nouveau mot de passe *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-mono text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Confirmer le mot de passe *</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-mono text-slate-800"
                  required
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
