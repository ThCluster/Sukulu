import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Server, Key, Settings, Database, Shield, Check, Copy, Code2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { apiBaseUrl, setApiBaseUrl, tokens, user } = useAuth();
  const { showToast } = useToast();
  const [urlInput, setUrlInput] = useState(apiBaseUrl);

  const handleSaveApiUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setApiBaseUrl(urlInput);
    showToast(`URL d'API mise à jour avec succès: ${urlInput}`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600" />
          Paramètres du Système & Configuration API DRF
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Liaison du frontend React avec le serveur Django REST Framework, PostgreSQL & authentification JWT SimpleJWT
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backend API Settings Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Server className="w-5 h-5 text-blue-600" />
            <span>Adresse du Serveur DRF Backend</span>
          </div>

          <form onSubmit={handleSaveApiUrl} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700">URL Racine API REST (baseURL)</label>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="http://localhost:8000/api/v1"
                className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
            >
              Sauvegarder l'URL
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
            <p className="font-bold text-slate-900">Variables d'environnement supportées :</p>
            <p className="bg-slate-100 p-2 rounded-lg font-mono text-[11px]">
              VITE_API_URL={apiBaseUrl}
            </p>
          </div>
        </div>

        {/* Current JWT Tokens Info Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Key className="w-5 h-5 text-amber-500" />
            <span>Authentification JWT SimpleJWT (Bearer)</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 font-semibold">Utilisateur connecté :</span>
              <p className="font-bold text-slate-900">{user?.first_name} {user?.last_name} ({user?.email})</p>
            </div>

            <div>
              <span className="text-slate-500 font-semibold">Access Token (Inclus dans Axios) :</span>
              <div className="mt-1 p-2 bg-slate-100 rounded-lg font-mono text-[10px] text-slate-700 break-all border border-slate-200">
                {tokens?.access}
              </div>
            </div>

            <div>
              <span className="text-slate-500 font-semibold">Refresh Token :</span>
              <div className="mt-1 p-2 bg-slate-100 rounded-lg font-mono text-[10px] text-slate-700 break-all border border-slate-200">
                {tokens?.refresh}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
