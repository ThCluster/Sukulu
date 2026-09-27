import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  CalendarX,
  CreditCard,
  FileCheck2,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  UserCheck,
  Building2,
  CalendarDays,
  User as UserIcon,
  Activity,
  ShieldAlert,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
}) => {
  const { user, logout, activeRole } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Nav item definition mapped to roles
  const navCategories = [
    {
      title: 'PRINCIPAL',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'EDUCATEUR', 'ENSEIGNANT', 'ELEVE', 'PARENT'] },
      ],
    },
    {
      title: 'LES 3 PILIERS ÉDUCATEUR',
      items: [
        { id: 'educateur-suivi', label: '1. Le Suivi (Appel & Fiches)', icon: Activity, roles: ['EDUCATEUR', 'ENSEIGNANT'], badge: 'Direct' },
        { id: 'educateur-transmission', label: '2. La Transmission (Cahier & Devoirs)', icon: BookOpen, roles: ['EDUCATEUR', 'ENSEIGNANT'] },
        { id: 'educateur-securite', label: '3. La Sécurité (PAI & Sorties)', icon: ShieldAlert, roles: ['EDUCATEUR', 'ENSEIGNANT'], badge: 'PAI' },
      ],
    },
    {
      title: 'GESTION ACADÉMIQUE',
      items: [
        { id: 'emploi-du-temps', label: 'Emploi du temps', icon: CalendarDays, roles: ['ADMIN', 'EDUCATEUR', 'ENSEIGNANT', 'ELEVE', 'PARENT'], badge: 'Semaine' },
        { id: 'users', label: 'Gestion des utilisateurs', icon: Users, roles: ['ADMIN'] },
        { id: 'classes', label: 'Gestion des classes & filières', icon: Building2, roles: ['ADMIN'] },
        { id: 'inscriptions', label: 'Gestion des inscriptions', icon: GraduationCap, roles: ['ADMIN'], badge: '3 en attente' },
        { id: 'mes-eleves', label: 'Voir mes élèves', icon: UserCheck, roles: ['EDUCATEUR', 'ENSEIGNANT'], badge: 'Mes classes' },
        { id: 'notes', label: 'Gestion des notes & évaluations', icon: BookOpen, roles: ['ADMIN', 'ENSEIGNANT', 'ELEVE'], badge: 'Trimestre 1' },
        { id: 'absences', label: 'Gestion des absences & retards', icon: CalendarX, roles: ['ADMIN', 'EDUCATEUR', 'ENSEIGNANT', 'ELEVE'] },
      ],
    },
    {
      title: 'FINANCES & DOCS',
      items: [
        { id: 'paiements', label: 'Gestion des paiements', icon: CreditCard, roles: ['ADMIN'] },
        { id: 'documents', label: 'Documents', icon: FileCheck2, roles: ['ADMIN', 'ELEVE'] },
      ],
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { id: 'profile', label: 'Profil', icon: UserIcon, roles: ['ADMIN', 'EDUCATEUR', 'ENSEIGNANT', 'ELEVE', 'PARENT'] },
        { id: 'settings', label: 'Paramètres', icon: Settings, roles: ['ADMIN'] },
      ],
    },
  ];

  const roleLabels: Record<UserRole, { name: string; color: string }> = {
    ADMIN: { name: 'Administrateur', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    EDUCATEUR: { name: 'Éducateur', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
    ENSEIGNANT: { name: 'Enseignant', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    ELEVE: { name: 'Élève', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    PARENT: { name: 'Parent d\'élève', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  };

  // Redirect to dashboard if the current activeTab is restricted for the current activeRole
  useEffect(() => {
    const allowedItems = navCategories
      .flatMap((cat) => cat.items)
      .filter((item) => item.roles.includes(activeRole))
      .map((item) => item.id);

    if (!allowedItems.includes(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [activeRole, activeTab, setActiveTab]);

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans antialiased text-slate-800">
      {/* Sidebar Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Dark Sidebar matching reference mockup */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#111827] text-slate-300 flex flex-col transition-transform duration-300 ease-in-out shrink-0 border-r border-slate-800/80 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="p-5 flex items-center justify-between border-b border-slate-800/80 bg-[#0f172a]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/20">
              S
            </div>
            <div>
              <h1 className="font-bold text-white text-lg tracking-tight flex items-center gap-1.5">
                Sukulu
                <span className="text-[10px] font-semibold bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30">
                  DRF
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">Gestion Scolaire</p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Role Indicator Badge */}
        <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Espace actif :</span>
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${roleLabels[activeRole].color}`}>
            {roleLabels[activeRole].name}
          </span>
        </div>

        {/* Navigation Categories */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navCategories.map((cat, idx) => {
            const filteredItems = cat.items.filter((item) => item.roles.includes(activeRole));
            if (filteredItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-1">
                <h3 className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  {cat.title}
                </h3>
                <div className="mt-2 space-y-1">
                  {filteredItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`w-4 h-4 ${
                              isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                            }`}
                          />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* User Sidebar Bottom Profile */}
        <div className="p-3 border-t border-slate-800/80 bg-[#0f172a] flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={
                user?.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
              }
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover border border-slate-700"
            />
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Se déconnecter"
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb / Title */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 capitalize tracking-tight">
                {activeTab === 'dashboard' && 'Tableau de bord'}
                {activeTab === 'educateur-suivi' && "Pilier 1 : Le Suivi (Appel & Fiches d'émargement)"}
                {activeTab === 'educateur-transmission' && 'Pilier 2 : La Transmission (Cahier & Devoirs)'}
                {activeTab === 'educateur-securite' && 'Pilier 3 : La Sécurité (Fiches PAI & Sorties)'}
                {activeTab === 'emploi-du-temps' && 'Emploi du Temps'}
                {activeTab === 'mes-eleves' && 'Mes Élèves'}
                {activeTab === 'users' && 'Gestion des Utilisateurs'}
                {activeTab === 'classes' && 'Classes & Filières'}
                {activeTab === 'inscriptions' && 'Gestion des Inscriptions'}
                {activeTab === 'notes' && 'Notes & Évaluations'}
                {activeTab === 'absences' && 'Absences & Retards'}
                {activeTab === 'paiements' && 'Frais de Scolarité & Paiements'}
                {activeTab === 'documents' && 'Documents Officiels (Bulletins & Certificats)'}
                {activeTab === 'settings' && 'Paramètres du Système & API DRF'}
              </h2>
              <p className="text-xs text-slate-500 hidden sm:block">
                Année Académique 2025-2026 | Groupe Scolaire Sukulu
              </p>
            </div>
          </div>

          {/* Header Controls (Notifications) */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};
