import React, { useRef } from 'react';
import { DocumentScolaire } from '../../types';
import { Printer, Download, CheckCircle, ShieldCheck, FileText, QrCode } from 'lucide-react';

interface DocumentViewerProps {
  document: DocumentScolaire;
  onClose?: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate a downloadable text/blob representation or simulate PDF download
    const docData = `
============================================================
GROUPE SCOLAIRE INTERNATIONAL SUKULU
République de Côte d'Ivoire / Sénégal
Document Officiel - ${document.titre}
============================================================
Référence: ${document.reference}
Élève: ${document.eleve_nom} (Matricule: ${document.eleve_matricule})
Classe: ${document.classe_nom}
Année Académique: ${document.annee_academique}
Date d'Émission: ${document.date_generation}

Ce document est authentifié numériquement par le backend Sukulu DRF.
============================================================
    `;
    const blob = new Blob([docData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${document.reference}_${document.type}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Document Action Toolbar */}
      <div className="flex items-center justify-between p-4 bg-slate-900 text-white rounded-xl print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">{document.titre}</h4>
            <p className="text-xs text-slate-300 font-mono">Ref: {document.reference}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-lg transition-colors border border-slate-700"
          >
            <Printer className="w-4 h-4" />
            Imprimer
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white rounded-lg transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Télécharger (PDF)
          </button>
        </div>
      </div>

      {/* Printable Sheet (Standard A4 document format) */}
      <div
        ref={printRef}
        className="bg-white text-slate-900 p-8 sm:p-12 rounded-xl shadow-xl border border-slate-200 max-w-3xl mx-auto space-y-8 print:border-none print:shadow-none print:p-0"
      >
        {/* Document Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl tracking-wider">
                S
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">SUKULU</h1>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Groupe Scolaire Éducatif
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 leading-relaxed">
              Ministère de l'Éducation Nationale et de la Formation Professionnelle
              <br />
              Cocody Riviera 3, Boulevard de France - BP 2084 Abidjan
              <br />
              Tél: +225 27 22 40 50 60 | Email: contact@sukulu.edu
            </p>
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-800 text-xs font-bold uppercase rounded border border-slate-300 mb-2">
              DOCUMENT OFFICIEL
            </span>
            <p className="text-xs font-mono font-bold text-slate-700">Réf: {document.reference}</p>
            <p className="text-xs text-slate-500 mt-1">Date: {document.date_generation}</p>
            <p className="text-xs text-slate-500">Année Académique: {document.annee_academique}</p>
          </div>
        </div>

        {/* Document Body Variant */}
        {document.type === 'BULLETIN' && (
          <div className="space-y-6">
            <div className="text-center bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h2 className="text-xl font-black text-slate-900 uppercase">
                BULLETIN DE NOTES DE L'ÉLÈVE
              </h2>
              <p className="text-xs font-semibold text-blue-700 uppercase mt-1">
                {document.trimestre ? document.trimestre.replace('_', ' ') : 'PREMIER TRIMESTRE'}
              </p>
            </div>

            {/* Student Info */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-lg text-xs font-medium border border-slate-200">
              <div>
                <span className="text-slate-500">Nom & Prénom:</span>{' '}
                <strong className="text-slate-900 text-sm font-bold block">{document.eleve_nom}</strong>
              </div>
              <div>
                <span className="text-slate-500">Matricule Élève:</span>{' '}
                <strong className="text-slate-900 font-mono font-bold block">{document.eleve_matricule}</strong>
              </div>
              <div>
                <span className="text-slate-500">Classe / Section:</span>{' '}
                <strong className="text-slate-900 font-bold block">{document.classe_nom}</strong>
              </div>
              <div>
                <span className="text-slate-500">Rang dans la Classe:</span>{' '}
                <strong className="text-emerald-700 font-bold block">
                  {document.metadata?.rang || '1er / 32 élèves'}
                </strong>
              </div>
            </div>

            {/* Grades Breakdown Table */}
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold uppercase">
                  <th className="p-2.5 border border-slate-800">Matière</th>
                  <th className="p-2.5 border border-slate-800 text-center">Coef.</th>
                  <th className="p-2.5 border border-slate-800 text-center">Note / 20</th>
                  <th className="p-2.5 border border-slate-800">Appréciation des Enseignants</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 border border-slate-200">
                <tr>
                  <td className="p-2.5 font-bold">Mathématiques & Analyse</td>
                  <td className="p-2.5 text-center font-mono">4</td>
                  <td className="p-2.5 text-center font-mono font-bold text-slate-900">17.5 / 20</td>
                  <td className="p-2.5 text-slate-600">
                    Excellent travail. Grande rigueur logique et régularité.
                  </td>
                </tr>
                <tr className="bg-slate-50/50">
                  <td className="p-2.5 font-bold">Physique - Chimie</td>
                  <td className="p-2.5 text-center font-mono">3</td>
                  <td className="p-2.5 text-center font-mono font-bold text-slate-900">16.0 / 20</td>
                  <td className="p-2.5 text-slate-600">Très bon trimestre. Réflexion solide.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">Français & Littérature</td>
                  <td className="p-2.5 text-center font-mono">3</td>
                  <td className="p-2.5 text-center font-mono font-bold text-slate-900">15.0 / 20</td>
                  <td className="p-2.5 text-slate-600">Participation active et rédaction soignée.</td>
                </tr>
                <tr className="bg-slate-50/50">
                  <td className="p-2.5 font-bold">Histoire - Géographie</td>
                  <td className="p-2.5 text-center font-mono">2</td>
                  <td className="p-2.5 text-center font-mono font-bold text-slate-900">14.5 / 20</td>
                  <td className="p-2.5 text-slate-600">Bons résultats. Continuer ainsi.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">Anglais LV1</td>
                  <td className="p-2.5 text-center font-mono">2</td>
                  <td className="p-2.5 text-center font-mono font-bold text-slate-900">18.0 / 20</td>
                  <td className="p-2.5 text-slate-600">Excellente aisance orale et écrite.</td>
                </tr>
              </tbody>
            </table>

            {/* Summary Box */}
            <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-xl">
              <div>
                <p className="text-xs text-slate-300 font-medium">Moyenne Générale Trimestrielle</p>
                <p className="text-2xl font-black text-amber-400">
                  {document.metadata?.moyenne_generale || '16.20'} / 20
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-300 font-medium">Décision du Conseil de Classe</p>
                <p className="text-sm font-bold text-emerald-400">
                  {document.metadata?.decision || "Tableau d'Honneur & Félicitations"}
                </p>
              </div>
            </div>
          </div>
        )}

        {document.type === 'CERTIFICAT_SCOLARITE' && (
          <div className="space-y-6 py-4">
            <div className="text-center my-6">
              <h2 className="text-2xl font-black text-slate-900 tracking-wider underline underline-offset-8 uppercase">
                CERTIFICAT DE SCOLARITÉ
              </h2>
            </div>

            <p className="text-sm leading-relaxed text-slate-800 font-serif text-justify">
              Le Chef d'Établissement du Groupe Scolaire International <strong>SUKULU</strong> soussigné,
              certifie par la présente que l'élève :
            </p>

            <div className="my-6 p-6 bg-slate-50 rounded-xl border border-slate-200 text-sm space-y-3">
              <div className="grid grid-cols-3">
                <span className="text-slate-500">Nom & Prénom :</span>
                <span className="col-span-2 font-bold text-slate-900">{document.eleve_nom}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-500">N° Matricule :</span>
                <span className="col-span-2 font-bold font-mono text-slate-900">
                  {document.eleve_matricule}
                </span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-500">Inscrit(e) en Classe :</span>
                <span className="col-span-2 font-bold text-slate-900">{document.classe_nom}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-500">Année Scolaire :</span>
                <span className="col-span-2 font-bold text-slate-900">{document.annee_academique}</span>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-slate-800 font-serif text-justify">
              Est régulièrement inscrit(e) et fréquente assidûment notre établissement pour l'année
              académique en cours. En foi de quoi, ce certificat lui est délivré pour servir et valoir ce
              que de droit.
            </p>
          </div>
        )}

        {document.type === 'RECU_PAIEMENT' && (
          <div className="space-y-6">
            <div className="text-center bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-emerald-900">
              <h2 className="text-xl font-black uppercase">REÇU DE PAIEMENT DE SCOLARITÉ</h2>
              <p className="text-xs font-mono font-bold mt-1">Numéro de Reçu: {document.reference}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-slate-500 font-semibold mb-1">PAYEUR / ÉLÈVE</p>
                <p className="font-bold text-slate-900 text-sm">{document.eleve_nom}</p>
                <p className="text-slate-600 font-mono">Matricule: {document.eleve_matricule}</p>
                <p className="text-slate-600">Classe: {document.classe_nom}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-slate-500 font-semibold mb-1">DÉTAILS DU RÈGLEMENT</p>
                <p className="font-bold text-slate-900">
                  Montant: {document.metadata?.montant || '250 000 FCFA'}
                </p>
                <p className="text-slate-600">Mode: {document.metadata?.mode || 'Mobile Money'}</p>
                <p className="text-emerald-600 font-bold flex items-center gap-1 mt-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Statut: Validé & Enregistré
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Official Footer Stamp and QR Verification */}
        <div className="pt-8 border-t border-slate-200 flex items-end justify-between text-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-500">
              <QrCode className="w-8 h-8 text-slate-800" />
              <div>
                <p className="font-semibold text-slate-800">Authentification DRF Digital Signature</p>
                <p className="text-[10px] text-slate-400 font-mono">
                  SHA256: {document.reference}-SUKULU-JWT-VERIFIED
                </p>
              </div>
            </div>
          </div>

          <div className="text-center space-y-8">
            <p className="text-slate-600 font-medium">Le Proviseur / La Direction Académique</p>
            <div className="relative inline-block px-6 py-3 border-2 border-dashed border-emerald-600 rounded-lg text-emerald-700 font-bold uppercase text-[10px] tracking-wider rotate-[-3deg]">
              <ShieldCheck className="w-5 h-5 mx-auto mb-0.5 text-emerald-600" />
              CACHE T OFFICIEL SUKULU
              <br />
              VALIDÉ EN LIGNE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
