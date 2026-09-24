import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/UsersPage';
import { ClassesFilieresPage } from './pages/ClassesFilieresPage';
import { TeacherStudentsPage } from './pages/TeacherStudentsPage';
import { InscriptionsPage } from './pages/InscriptionsPage';
import { NotesEvaluationsPage } from './pages/NotesEvaluationsPage';
import { AbsencesPage } from './pages/AbsencesPage';
import { PaiementsPage } from './pages/PaiementsPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { TimetablePage } from './pages/TimetablePage';
import { EducatorPillarsPage } from './pages/EducatorPillarsPage';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-300">Chargement de l'application Sukulu...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && <DashboardPage onNavigate={setActiveTab} />}
      {activeTab === 'educateur-suivi' && (
        <EducatorPillarsPage initialPillar="suivi" onNavigate={setActiveTab} />
      )}
      {activeTab === 'educateur-transmission' && (
        <EducatorPillarsPage initialPillar="transmission" onNavigate={setActiveTab} />
      )}
      {activeTab === 'educateur-securite' && (
        <EducatorPillarsPage initialPillar="securite" onNavigate={setActiveTab} />
      )}
      {activeTab === 'emploi-du-temps' && <TimetablePage onNavigate={setActiveTab} />}
      {activeTab === 'users' && <UsersPage />}
      {activeTab === 'classes' && <ClassesFilieresPage />}
      {activeTab === 'mes-eleves' && <TeacherStudentsPage />}
      {activeTab === 'inscriptions' && <InscriptionsPage />}
      {activeTab === 'notes' && <NotesEvaluationsPage />}
      {activeTab === 'absences' && <AbsencesPage />}
      {activeTab === 'paiements' && <PaiementsPage />}
      {activeTab === 'documents' && <DocumentsPage />}
      {activeTab === 'profile' && <ProfilePage />}
      {activeTab === 'settings' && <SettingsPage />}
    </DashboardLayout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainAppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
