import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from './Modal';
import { Server, Key, Copy, Check, Link2, Database, Code2 } from 'lucide-react';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({ isOpen, onClose }) => {
  const { apiBaseUrl, setApiBaseUrl, tokens } = useAuth();
  const { showToast } = useToast();
  const [urlInput, setUrlInput] = useState(apiBaseUrl);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setApiBaseUrl(urlInput);
    showToast(`URL d'API Backend mise à jour : ${urlInput}`, 'success');
  };

  const drfEndpoints = [
    { method: 'POST', path: '/auth/token/', desc: 'Obtenir les tokens JWT (access & refresh)' },
    { method: 'POST', path: '/auth/token/refresh/', desc: 'Saisir un refresh token pour obtenir un nouvel access token' },
    { method: 'GET', path: '/users/', desc: 'Liste filtrable des utilisateurs (Admin, Enseignant, Élève, Parent)' },
    { method: 'GET/POST', path: '/filieres/', desc: 'Gestion des filières d\'études (Sciences, Lettres, etc.)' },
    { method: 'GET/POST', path: '/classes/', desc: 'Gestion des classes, titulaire, effectif et frais' },
    { method: 'GET/POST', path: '/inscriptions/', desc: 'Gestion des inscriptions & réinscriptions d\'élèves' },
    { method: 'GET/POST', path: '/notes/', desc: 'Saisie et récapitulatif des évaluations et notes par matière' },
    { method: 'GET/POST', path: '/absences/', desc: 'Enregistrement des absences & justifications' },
    { method: 'GET/POST', path: '/paiements/', desc: 'Historique et encaissement des frais de scolarité' },
    { method: 'GET/POST', path: '/documents/', desc: 'Génération & consultation des bulletins, certificats et reçus' },
  ];

  const copySnippet = (endpoint: string, idx: number) => {
    const tokenStr = tokens?.access || 'VOTRE_JWT_ACCESS_TOKEN';
    const curl = `curl -X GET "${apiBaseUrl}${endpoint}" \\
  -H "Authorization: Bearer ${tokenStr}" \\
  -H "Content-Type: application/json"`;

    navigator.clipboard.writeText(curl);
    setCopiedIndex(idx);
    showToast('Commande cURL copiée dans le presse-papier !', 'info');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configuration & Documentation Backend DRF"
      subtitle="Intégration du Frontend React avec Django REST Framework, PostgreSQL & JWT"
      maxWidth="3xl"
    >
      <div className="space-y-6 text-sm text-slate-700">
        {/* Backend Endpoint URL Setting */}
        <form onSubmit={handleSaveUrl} className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <Server className="w-5 h-5 text-amber-400" />
            <span>Adresse du Serveur Backend Django REST Framework</span>
          </div>
          <p className="text-xs text-slate-300">
            Configurez l'URL racine de votre API Django. Les requêtes Axios utiliseront automatiquement les interceptors JWT.
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="http://localhost:8000/api/v1"
                className="w-full pl-9 pr-4 py-2 bg-slate-800 text-white text-xs font-mono rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 font-bold text-slate-900 rounded-lg text-xs transition-colors"
            >
              Enregistrer
            </button>
          </div>
        </form>

        {/* Current JWT Status */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
          <Key className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="flex-1 overflow-hidden">
            <h4 className="font-bold text-slate-900">Jeton JWT Actuel (Bearer Authentication)</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Header inclus dans Axios : <code className="bg-slate-200 px-1 py-0.5 rounded text-blue-800">Authorization: Bearer {'<token>'}</code>
            </p>
            <div className="mt-2 p-2 bg-slate-100 rounded font-mono text-[11px] text-slate-700 truncate border border-slate-200">
              {tokens?.access || 'Aucun jeton actif'}
            </div>
          </div>
        </div>

        {/* Endpoints Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-600" />
              Endpoints REST Fournis par Django DRF
            </h4>
            <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2.5 py-1 rounded-full">
              PostgreSQL Schema
            </span>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
            {drfEndpoints.map((ep, idx) => (
              <div key={idx} className="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      ep.method === 'POST'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ep.method === 'GET'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <code className="font-mono text-xs font-bold text-slate-800">{ep.path}</code>
                  <span className="text-xs text-slate-500 truncate hidden sm:inline">{ep.desc}</span>
                </div>

                <button
                  onClick={() => copySnippet(ep.path, idx)}
                  className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded flex items-center gap-1.5 border border-slate-200 transition-colors shrink-0"
                  title="Copier exemple cURL"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-semibold">Copié</span>
                    </>
                  ) : (
                    <>
                      <Code2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>cURL</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
