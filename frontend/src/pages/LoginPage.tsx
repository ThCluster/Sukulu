import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserRole } from '../types';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  GraduationCap,
  BookOpen,
  Users,
  CheckCircle2,
  School,
  Sparkles,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const { showToast } = useToast();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      showToast("Veuillez saisir votre nom d'utilisateur ou email", 'warning');
      return;
    }

    const success = await login(username, password, selectedRole);
    if (success) {
      showToast('Connexion réussie ! Bienvenue sur le portail Sukulu.', 'success');
    } else {
      showToast('Échec de la connexion. Vérifiez vos identifiants.', 'error');
    }
  };

  const fillQuickRole = (role: UserRole, userIdent: string) => {
    setSelectedRole(role);
    setUsername(userIdent);
    setPassword('password123');
  };

  const roleConfig: Record<
    UserRole,
    { label: string; sub: string; icon: React.FC<{ className?: string }> }
  > = {
    ADMIN: { label: 'Administrateur', sub: 'Gestion globale & utilisateurs', icon: ShieldCheck },
    EDUCATEUR: { label: 'Éducateur', sub: 'Suivi, transmission & sécurité', icon: ShieldAlert },
    ENSEIGNANT: { label: 'Enseignant', sub: 'Saisie des notes & appels', icon: GraduationCap },
    ELEVE: { label: 'Élève', sub: 'Cahier de texte & bulletins', icon: BookOpen },
    PARENT: { label: 'Parent', sub: 'Suivi des enfants & facturation', icon: Users },
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 lg:p-8 font-sans antialiased text-slate-100">
      {/* Background Subtle Ambient Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-blue-600/15 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-sky-500/5 blur-[140px]" />
      </div>

      {/* Main Container Card */}
      <div className="relative z-10 w-full max-w-5xl bg-slate-900/90 border border-slate-800/80 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Branding & Highlights Panel (Desktop) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 relative overflow-hidden">
          {/* Subtle Graphic Accents */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Brand Info */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                <School className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-wider text-white">SUKULU</h1>
                <p className="text-[11px] font-medium text-blue-300/80 uppercase tracking-widest">
                  Gestion Scolaire Integrée
                </p>
              </div>
            </div>

            <div className="space-y-3 my-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Espace Numérique de Travail
              </span>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight">
                Gérez votre établissement en toute sérénité.
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Retrouvez vos notes, emplois du temps, bulletins et communications sur une plateforme centralisée et moderne.
              </p>
            </div>
          </div>

          {/* Features Checklist */}
          <div className="my-6 space-y-3">
            {[
              "Suivi pédagogique & gestion des notes en temps réel",
              "Portail dédié enseignants, élèves et parents",
              "Bulletins trimestriels & suivi des présences",
              "Paiements de scolarité & reçus numériques",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-xs text-slate-300">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Footer Badge */}
          <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>© {new Date().getFullYear()} Sukulu App</span>
            <span className="text-slate-400 font-mono text-[11px]">v2.4 • Sécurisé</span>
          </div>
        </div>

        {/* Right Authentication Form Panel */}
        <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-between bg-slate-900/60">
          <div>
            {/* Header */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white tracking-tight">Connexion</h3>
              <p className="text-xs text-slate-400 mt-1">
                Choisissez votre rôle et renseignez vos identifiants pour accéder à votre espace.
              </p>
            </div>

            {/* Role Selection Tabs */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                Type de compte :
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {(['ADMIN', 'EDUCATEUR', 'ENSEIGNANT', 'ELEVE', 'PARENT'] as UserRole[]).map((r) => {
                  const cfg = roleConfig[r];
                  const Icon = cfg.icon;
                  const isSelected = selectedRole === r;

                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setSelectedRole(r);
                        // Auto populate suggested username for smooth trial
                        if (r === 'ADMIN') setUsername('admin');
                        else if (r === 'EDUCATEUR') setUsername('educateur_ndiaye');
                        else if (r === 'ENSEIGNANT') setUsername('prof_diop');
                        else if (r === 'ELEVE') setUsername('eleve_fatou');
                        else if (r === 'PARENT') setUsername('parent_sow');
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col items-start gap-1.5 ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20'
                          : 'bg-slate-800/60 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-blue-400'}`} />
                      <span className="text-xs font-bold truncate w-full">{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Identifiant ou adresse email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ex: admin ou m.diop@sukulu.edu"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    Mot de passe
                  </label>
                  <button
                    type="button"
                    onClick={() => showToast('Veuillez contacter l\'administrateur de l\'établissement pour réinitialiser votre mot de passe.', 'info')}
                    className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                  />
                  <span className="text-xs text-slate-400">Se souvenir de moi</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Connexion en cours...</span>
                  </div>
                ) : (
                  <>
                    <span>Accéder à mon espace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Bottom Quick Test Accounts Bar */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
              <span className="font-semibold text-slate-300">Comptes de démonstration :</span>
              <span className="text-slate-400">Mot de passe : <code className="text-blue-400 font-mono">password123</code></span>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px]">
              {[
                { label: 'Admin', role: 'ADMIN' as UserRole, user: 'admin' },
                { label: 'Éducateur', role: 'EDUCATEUR' as UserRole, user: 'educateur_ndiaye' },
                { label: 'Enseignant', role: 'ENSEIGNANT' as UserRole, user: 'prof_diop' },
                { label: 'Élève', role: 'ELEVE' as UserRole, user: 'eleve_fatou' },
                { label: 'Parent', role: 'PARENT' as UserRole, user: 'parent_sow' },
              ].map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => fillQuickRole(item.role, item.user)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                    selectedRole === item.role
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      : 'bg-slate-800/50 text-slate-400 border-slate-700/60 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {item.label} ({item.user})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
